from django.contrib import admin

from .models import Problem, ProblemGroup, Project, ProjectFile, ScientificObject, ScientificObjectRevision


@admin.register(ProblemGroup)
class ProblemGroupAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "difficulty", "slug")
    search_fields = ("title", "topic", "difficulty", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ("title", "group", "difficulty", "duration", "external_id")
    list_filter = ("difficulty", "group")
    search_fields = ("title", "topic", "summary", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "status", "updated_at")
    list_filter = ("status",)
    search_fields = ("title", "slug", "description")


@admin.register(ScientificObject)
class ScientificObjectAdmin(admin.ModelAdmin):
    list_display = ("title", "external_id", "project_id", "source_app", "current_revision", "updated_at")
    list_filter = ("source_app", "kind")
    search_fields = ("title", "external_id", "project_id")
    readonly_fields = ("serialized_payload", "content_hash")


@admin.register(ScientificObjectRevision)
class ScientificObjectRevisionAdmin(admin.ModelAdmin):
    list_display = ("scientific_object", "revision", "content_hash", "created_at")
    search_fields = ("scientific_object__title", "scientific_object__external_id")
    readonly_fields = ("serialized_payload",)


@admin.register(ProjectFile)
class ProjectFileAdmin(admin.ModelAdmin):
    list_display = ("original_name", "project_id", "size", "content_hash", "created_at")
    search_fields = ("original_name", "project_id", "content_hash")
