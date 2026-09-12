from rest_framework import serializers

from .models import Problem, ProblemGroup, Project, ProjectFile


class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = [
            "id",
            "external_id",
            "title",
            "slug",
            "topic",
            "difficulty",
            "duration",
            "summary",
            "tags",
            "formulas",
            "calculations",
            "graphs",
            "code_samples",
            "notes",
        ]


class ProblemGroupListSerializer(serializers.ModelSerializer):
    problems_count = serializers.IntegerField(source="problems.count", read_only=True)
    easy_count = serializers.SerializerMethodField()
    medium_count = serializers.SerializerMethodField()
    hard_count = serializers.SerializerMethodField()

    class Meta:
        model = ProblemGroup
        fields = [
            "id",
            "slug",
            "title",
            "topic",
            "difficulty",
            "description",
            "problems_count",
            "easy_count",
            "medium_count",
            "hard_count",
        ]

    def get_easy_count(self, obj: ProblemGroup) -> int:
        return obj.problems.filter(difficulty="Easy").count()

    def get_medium_count(self, obj: ProblemGroup) -> int:
        return obj.problems.filter(difficulty__icontains="Medium").count()

    def get_hard_count(self, obj: ProblemGroup) -> int:
        return obj.problems.filter(difficulty="Hard").count()


class ProblemGroupDetailSerializer(ProblemGroupListSerializer):
    problems = ProblemSerializer(many=True, read_only=True)

    class Meta(ProblemGroupListSerializer.Meta):
        fields = ProblemGroupListSerializer.Meta.fields + ["problems"]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id",
            "slug",
            "title",
            "topic",
            "difficulty",
            "description",
            "status",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "topic": {"required": False, "default": "General"},
            "difficulty": {"required": False, "default": "Unspecified"},
            "status": {"required": False, "default": "draft"},
        }


class ProjectFileSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="public_id", read_only=True)
    projectId = serializers.CharField(source="project_id", read_only=True)
    originalName = serializers.CharField(source="original_name", read_only=True)
    contentType = serializers.CharField(source="content_type", read_only=True)
    contentHash = serializers.CharField(source="content_hash", read_only=True)
    downloadUrl = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = ProjectFile
        fields = [
            "id",
            "projectId",
            "originalName",
            "size",
            "contentType",
            "contentHash",
            "metadata",
            "downloadUrl",
            "createdAt",
        ]

    def get_downloadUrl(self, obj):
        request = self.context.get("request")
        if request is None:
            return f"/api/ecosystem/files/{obj.public_id}/download/"
        return request.build_absolute_uri(f"/api/ecosystem/files/{obj.public_id}/download/")
