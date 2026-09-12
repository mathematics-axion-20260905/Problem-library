import uuid

from django.db import models
from django.utils.text import slugify


class ProblemGroup(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=100)
    description = models.TextField()
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["title"]

    def __str__(self) -> str:
        return self.title


class Problem(models.Model):
    group = models.ForeignKey(
        ProblemGroup,
        on_delete=models.CASCADE,
        related_name="problems",
    )
    external_id = models.PositiveIntegerField(unique=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=100)
    duration = models.CharField(max_length=50)
    summary = models.TextField()
    tags = models.JSONField(default=list)
    formulas = models.JSONField(default=list)
    calculations = models.JSONField(default=list)
    graphs = models.JSONField(default=dict)
    code_samples = models.JSONField(default=list)
    notes = models.JSONField(default=list)

    class Meta:
        ordering = ["external_id"]

    def __str__(self) -> str:
        return self.title


class Project(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=255)
    topic = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=50, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class ScientificObjectTransfer(models.Model):
    """Short-lived, origin-independent transfer envelope for ecosystem handoffs.

    The payload is intentionally stored as the exact serialized envelope. The
    relay does not rewrite scientific data; target applications validate and
    import it using their local Scientific Object contract.
    """

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    payload = models.TextField()
    content_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return str(self.public_id)


class ScientificObject(models.Model):
    """Durable registry row for a cross-application Scientific Object."""

    external_id = models.CharField(max_length=255, unique=True, db_index=True)
    project_id = models.CharField(max_length=255, db_index=True)
    kind = models.CharField(max_length=100)
    domain = models.CharField(max_length=100, blank=True)
    schema_version = models.CharField(max_length=50)
    title = models.CharField(max_length=500)
    source_app = models.CharField(max_length=100)
    current_revision = models.PositiveIntegerField(default=1)
    metadata = models.JSONField(default=dict, blank=True)
    # Keep the exact envelope so the registry never has to re-serialize it.
    serialized_payload = models.TextField()
    content_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self) -> str:
        return f"{self.title} ({self.external_id})"


class ScientificObjectRevision(models.Model):
    scientific_object = models.ForeignKey(
        ScientificObject,
        on_delete=models.CASCADE,
        related_name="revisions",
    )
    revision = models.PositiveIntegerField()
    payload = models.JSONField()
    provenance = models.JSONField(default=dict)
    artifacts = models.JSONField(default=list, blank=True)
    content_hash = models.CharField(max_length=64, blank=True)
    serialized_payload = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        ordering = ["revision"]
        constraints = [
            models.UniqueConstraint(
                fields=["scientific_object", "revision"],
                name="unique_scientific_object_revision",
            )
        ]

    def __str__(self) -> str:
        return f"{self.scientific_object_id} · r{self.revision}"


def project_file_upload_to(instance, filename):
    safe_project = slugify(instance.project_id)[:80] or "unassigned"
    safe_name = slugify(filename.rsplit("/", 1)[-1])[:100] or "file"
    return f"project-files/{safe_project}/{uuid.uuid4().hex}-{safe_name}"


class ProjectFile(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    project_id = models.CharField(max_length=255, db_index=True)
    file = models.FileField(upload_to=project_file_upload_to, max_length=500)
    original_name = models.CharField(max_length=500)
    size = models.PositiveBigIntegerField(default=0)
    content_type = models.CharField(max_length=255, blank=True)
    content_hash = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.original_name
