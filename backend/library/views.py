import hashlib
import json
from datetime import timedelta
from urllib.parse import quote

from django.db import connection, transaction
from django.db.models import Count, Q
from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Problem,
    ProblemGroup,
    Project,
    ProjectFile,
    ScientificObject,
    ScientificObjectRevision,
    ScientificObjectTransfer,
)
from .serializers import (
    ProblemGroupDetailSerializer,
    ProblemGroupListSerializer,
    ProblemSerializer,
    ProjectSerializer,
    ProjectFileSerializer,
)


class ProblemGroupViewSet(viewsets.ModelViewSet):
    queryset = ProblemGroup.objects.all().prefetch_related("problems")
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "topic", "description", "problems__title", "problems__tags"]
    ordering_fields = ["title", "difficulty"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProblemGroupDetailSerializer
        return ProblemGroupListSerializer

    @action(detail=False, methods=["get"])
    def stats(self, request):
        queryset = self.get_queryset().annotate(
            total_problems=Count("problems"),
            easy_count=Count("problems", filter=Q(problems__difficulty="Easy")),
            medium_count=Count(
                "problems", filter=Q(problems__difficulty__icontains="Medium")
            ),
            hard_count=Count("problems", filter=Q(problems__difficulty="Hard")),
        )
        payload = {
            "groups": queryset.count(),
            "problems": Problem.objects.count(),
            "easy": sum(item.easy_count for item in queryset),
            "medium": sum(item.medium_count for item in queryset),
            "hard": sum(item.hard_count for item in queryset),
        }
        return Response(payload)


class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Problem.objects.select_related("group").all()
    serializer_class = ProblemSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "topic", "summary", "tags", "group__title"]
    ordering_fields = ["external_id", "title", "difficulty"]

    def get_queryset(self):
        queryset = super().get_queryset()
        group_slug = self.request.query_params.get("group")
        difficulty = self.request.query_params.get("difficulty")
        topic = self.request.query_params.get("topic")

        if group_slug:
            queryset = queryset.filter(group__slug=group_slug)
        if difficulty:
            queryset = queryset.filter(difficulty__icontains=difficulty)
        if topic:
            queryset = queryset.filter(topic__iexact=topic)
        return queryset


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "topic", "description", "status"]
    ordering_fields = ["created_at", "title", "difficulty", "status"]
    lookup_field = "slug"


def overview(request):
    payload = {
        "name": "Problem Library API",
        "status": "ok",
        "models": {
            "groups": ProblemGroup.objects.count(),
            "problems": Problem.objects.count(),
            "projects": Project.objects.count(),
            "scientific_objects": ScientificObject.objects.count(),
            "project_files": ProjectFile.objects.count(),
        },
        "endpoints": [
            "/api/problem-groups/",
            "/api/problem-groups/stats/",
            "/api/problems/",
            "/api/projects/",
            "/api/ecosystem/objects/",
            "/api/ecosystem/files/",
            "/api/ecosystem/transfers/",
        ],
    }
    return JsonResponse(payload)


def healthz(request):
    """Small unauthenticated probe for the service manager and load balancer."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return JsonResponse({"status": "unhealthy", "service": "problem-library-backend"}, status=503)
    return JsonResponse({"status": "ok", "service": "problem-library-backend"})


MAX_TRANSFER_BYTES = 10 * 1024 * 1024
TRANSFER_TTL = timedelta(hours=6)


def _parse_scientific_object_payload(payload):
    if not isinstance(payload, str) or not payload.strip():
        raise ValueError("payload must be a non-empty serialized Scientific Object envelope")
    if len(payload.encode("utf-8")) > MAX_TRANSFER_BYTES:
        raise ValueError("payload exceeds the 10 MB transfer limit")

    try:
        envelope = json.loads(payload)
    except (TypeError, ValueError) as exc:
        raise ValueError("payload is not valid JSON") from exc

    obj = envelope.get("object") if isinstance(envelope, dict) else None
    revisions = envelope.get("revisions") if isinstance(envelope, dict) else None
    if (
        not isinstance(envelope, dict)
        or envelope.get("transferSchemaVersion") != "1.0"
        or not isinstance(obj, dict)
        or not isinstance(revisions, list)
        or not revisions
        or not obj.get("id")
        or not obj.get("projectId")
        or not isinstance(obj.get("kind"), str)
        or not isinstance(obj.get("schemaVersion"), str)
        or not isinstance(obj.get("title"), str)
        or not isinstance(obj.get("sourceApp"), str)
        or not isinstance(obj.get("currentRevision"), int)
        or obj["currentRevision"] < 1
    ):
        raise ValueError("payload is not a valid Scientific Object transfer envelope")

    revision_numbers = set()
    for revision in revisions:
        if (
            not isinstance(revision, dict)
            or revision.get("objectId") != obj["id"]
            or not isinstance(revision.get("revision"), int)
            or revision["revision"] < 1
            or revision["revision"] in revision_numbers
            or not isinstance(revision.get("provenance"), dict)
        ):
            raise ValueError("payload contains invalid Scientific Object revisions")
        revision_numbers.add(revision["revision"])

    if obj["currentRevision"] not in revision_numbers:
        raise ValueError("payload does not contain the current Scientific Object revision")

    return envelope


def _validate_transfer_payload(payload):
    _parse_scientific_object_payload(payload)


def _cleanup_expired_transfers():
    ScientificObjectTransfer.objects.filter(expires_at__lte=timezone.now()).delete()


class ScientificObjectTransferView(APIView):
    """Anonymous short-lived relay used when ecosystem apps have different origins."""

    permission_classes = [AllowAny]

    def post(self, request):
        try:
            payload = request.data.get("payload")
            _validate_transfer_payload(payload)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        _cleanup_expired_transfers()
        transfer = ScientificObjectTransfer.objects.create(
            payload=payload,
            content_hash=hashlib.sha256(payload.encode("utf-8")).hexdigest(),
            expires_at=timezone.now() + TRANSFER_TTL,
        )
        return Response(
            {
                "transferId": str(transfer.public_id),
                "contentHash": transfer.content_hash,
                "createdAt": transfer.created_at,
                "expiresAt": transfer.expires_at,
            },
            status=status.HTTP_201_CREATED,
        )

    def get(self, request, transfer_id):
        transfer = get_object_or_404(ScientificObjectTransfer, public_id=transfer_id)
        if transfer.expires_at <= timezone.now():
            transfer.delete()
            return Response({"detail": "Transfer expired."}, status=status.HTTP_410_GONE)
        return Response(
            {
                "transferId": str(transfer.public_id),
                "payload": transfer.payload,
                "contentHash": transfer.content_hash,
                "createdAt": transfer.created_at,
                "expiresAt": transfer.expires_at,
            }
        )

    def delete(self, request, transfer_id):
        transfer = get_object_or_404(ScientificObjectTransfer, public_id=transfer_id)
        transfer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


MAX_OBJECT_BYTES = 10 * 1024 * 1024
MAX_PROJECT_FILE_BYTES = 100 * 1024 * 1024


def _json_fingerprint(value):
    return hashlib.sha256(
        json.dumps(
            value,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode("utf-8")
    ).hexdigest()


def _revision_fingerprint(revision):
    return _json_fingerprint({
        "payload": revision.get("payload"),
        "provenance": revision.get("provenance"),
        "artifacts": revision.get("artifacts") or [],
    })


def _source_datetime(value):
    if isinstance(value, str):
        parsed = parse_datetime(value)
        if parsed is not None:
            return parsed
    return timezone.now()


def _object_revision_response(revision):
    return {
        "objectId": revision.scientific_object.external_id,
        "revision": revision.revision,
        "payload": revision.payload,
        "provenance": revision.provenance,
        "artifacts": revision.artifacts,
        "contentHash": revision.content_hash or None,
        "createdAt": revision.created_at,
    }


def _scientific_object_response(obj):
    current = obj.revisions.filter(revision=obj.current_revision).first()
    return {
        "id": obj.external_id,
        "projectId": obj.project_id,
        "kind": obj.kind,
        "domain": obj.domain or None,
        "schemaVersion": obj.schema_version,
        "title": obj.title,
        "sourceApp": obj.source_app,
        "currentRevision": obj.current_revision,
        "metadata": obj.metadata,
        "createdAt": obj.created_at,
        "updatedAt": obj.updated_at,
        "revision": _object_revision_response(current) if current else None,
        "serializedPayload": obj.serialized_payload,
        "contentHash": obj.content_hash,
    }


class ScientificObjectRegistryView(APIView):
    """Pre-auth durable Object Registry for cross-server ecosystem storage."""

    permission_classes = [AllowAny]

    def get(self, request, object_id=None):
        if object_id:
            obj = get_object_or_404(ScientificObject, external_id=object_id)
            return Response(_scientific_object_response(obj))

        queryset = ScientificObject.objects.prefetch_related("revisions")
        project_id = request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        objects = queryset[:500]
        return Response({
            "results": [_scientific_object_response(obj) for obj in objects],
            "count": queryset.count(),
        })

    @transaction.atomic
    def post(self, request):
        payload = request.data.get("payload")
        if not isinstance(payload, str) or len(payload.encode("utf-8")) > MAX_OBJECT_BYTES:
            return Response(
                {"detail": "payload exceeds the 10 MB registry limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            envelope = _parse_scientific_object_payload(payload)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        source_object = envelope["object"]
        incoming_revisions = envelope["revisions"]
        obj, created = ScientificObject.objects.select_for_update().get_or_create(
            external_id=source_object["id"],
            defaults={
                "project_id": source_object["projectId"],
                "kind": source_object["kind"],
                "domain": source_object.get("domain") or "",
                "schema_version": source_object["schemaVersion"],
                "title": source_object["title"],
                "source_app": source_object["sourceApp"],
                "current_revision": source_object["currentRevision"],
                "metadata": source_object.get("metadata") or {},
                "serialized_payload": payload,
                "content_hash": hashlib.sha256(payload.encode("utf-8")).hexdigest(),
                "created_at": _source_datetime(source_object.get("createdAt")),
                "updated_at": _source_datetime(source_object.get("updatedAt")),
            },
        )

        if not created:
            if obj.project_id != source_object["projectId"]:
                return Response(
                    {"detail": "Scientific Object project cannot change."},
                    status=status.HTTP_409_CONFLICT,
                )
            for incoming in incoming_revisions:
                existing = obj.revisions.filter(revision=incoming["revision"]).first()
                if existing and _revision_fingerprint({
                    "payload": existing.payload,
                    "provenance": existing.provenance,
                    "artifacts": existing.artifacts,
                }) != _revision_fingerprint(incoming):
                    return Response(
                        {"detail": f"Scientific Object revision {incoming['revision']} conflicts with the stored revision."},
                        status=status.HTTP_409_CONFLICT,
                    )
            if source_object["currentRevision"] >= obj.current_revision:
                obj.kind = source_object["kind"]
                obj.domain = source_object.get("domain") or ""
                obj.schema_version = source_object["schemaVersion"]
                obj.title = source_object["title"]
                obj.source_app = source_object["sourceApp"]
                obj.current_revision = source_object["currentRevision"]
                obj.metadata = source_object.get("metadata") or {}
                obj.serialized_payload = payload
                obj.content_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
                obj.updated_at = _source_datetime(source_object.get("updatedAt"))
                obj.save()

        for incoming in incoming_revisions:
            revision, revision_created = ScientificObjectRevision.objects.get_or_create(
                scientific_object=obj,
                revision=incoming["revision"],
                defaults={
                    "payload": incoming.get("payload"),
                    "provenance": incoming["provenance"],
                    "artifacts": incoming.get("artifacts") or [],
                    "content_hash": incoming.get("contentHash") or _json_fingerprint(incoming.get("payload")),
                    "serialized_payload": payload,
                    "created_at": _source_datetime(incoming.get("createdAt")),
                },
            )
            if not revision_created and revision.serialized_payload != payload and source_object["currentRevision"] >= obj.current_revision:
                revision.serialized_payload = payload
                revision.save(update_fields=["serialized_payload"])

        return Response(
            _scientific_object_response(obj),
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class ProjectFileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, file_id=None):
        if file_id:
            project_file = get_object_or_404(ProjectFile, public_id=file_id)
            return Response(ProjectFileSerializer(project_file, context={"request": request}).data)
        queryset = ProjectFile.objects.all()
        project_id = request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return Response({
            "results": ProjectFileSerializer(
                queryset[:500],
                many=True,
                context={"request": request},
            ).data,
            "count": queryset.count(),
        })

    def post(self, request):
        upload = request.FILES.get("file")
        project_id = (request.data.get("projectId") or request.data.get("project") or "").strip()
        if not upload or not project_id:
            return Response(
                {"detail": "projectId and file are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if upload.size > MAX_PROJECT_FILE_BYTES:
            return Response(
                {"detail": "file exceeds the 100 MB limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        metadata = request.data.get("metadata") or {}
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except ValueError:
                return Response({"detail": "metadata must be valid JSON."}, status=status.HTTP_400_BAD_REQUEST)
        if not isinstance(metadata, dict):
            return Response({"detail": "metadata must be an object."}, status=status.HTTP_400_BAD_REQUEST)

        digest = hashlib.sha256()
        for chunk in upload.chunks():
            digest.update(chunk)
        upload.seek(0)
        project_file = ProjectFile.objects.create(
            project_id=project_id,
            file=upload,
            original_name=upload.name,
            size=upload.size,
            content_type=upload.content_type or "application/octet-stream",
            content_hash=digest.hexdigest(),
            metadata=metadata,
        )
        return Response(
            ProjectFileSerializer(project_file, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, file_id):
        project_file = get_object_or_404(ProjectFile, public_id=file_id)
        project_file.file.delete(save=False)
        project_file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectFileDownloadView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, file_id):
        project_file = get_object_or_404(ProjectFile, public_id=file_id)
        response = FileResponse(
            project_file.file.open("rb"),
            content_type=project_file.content_type or "application/octet-stream",
        )
        response["Content-Disposition"] = f"attachment; filename*=UTF-8''{quote(project_file.original_name)}"
        response["Content-Length"] = str(project_file.size)
        return response
