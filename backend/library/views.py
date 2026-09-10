import hashlib
import json
from datetime import timedelta

from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Problem, ProblemGroup, Project, ScientificObjectTransfer
from .serializers import (
    ProblemGroupDetailSerializer,
    ProblemGroupListSerializer,
    ProblemSerializer,
    ProjectSerializer,
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
        },
        "endpoints": [
            "/api/problem-groups/",
            "/api/problem-groups/stats/",
            "/api/problems/",
            "/api/projects/",
        ],
    }
    return Response(payload)


MAX_TRANSFER_BYTES = 10 * 1024 * 1024
TRANSFER_TTL = timedelta(hours=6)


def _validate_transfer_payload(payload):
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
