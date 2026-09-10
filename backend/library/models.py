import uuid

from django.db import models


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
