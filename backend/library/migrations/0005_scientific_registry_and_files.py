import uuid

import library.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("library", "0004_complete_problem_payload"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScientificObject",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(db_index=True, max_length=255, unique=True)),
                ("project_id", models.CharField(db_index=True, max_length=255)),
                ("kind", models.CharField(max_length=100)),
                ("domain", models.CharField(blank=True, max_length=100)),
                ("schema_version", models.CharField(max_length=50)),
                ("title", models.CharField(max_length=500)),
                ("source_app", models.CharField(max_length=100)),
                ("current_revision", models.PositiveIntegerField(default=1)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("serialized_payload", models.TextField()),
                ("content_hash", models.CharField(max_length=64)),
                ("created_at", models.DateTimeField()),
                ("updated_at", models.DateTimeField()),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.CreateModel(
            name="ProjectFile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("public_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("project_id", models.CharField(db_index=True, max_length=255)),
                ("file", models.FileField(max_length=500, upload_to=library.models.project_file_upload_to)),
                ("original_name", models.CharField(max_length=500)),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("content_type", models.CharField(blank=True, max_length=255)),
                ("content_hash", models.CharField(max_length=64)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="ScientificObjectRevision",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("revision", models.PositiveIntegerField()),
                ("payload", models.JSONField()),
                ("provenance", models.JSONField(default=dict)),
                ("artifacts", models.JSONField(blank=True, default=list)),
                ("content_hash", models.CharField(blank=True, max_length=64)),
                ("serialized_payload", models.TextField()),
                ("created_at", models.DateTimeField()),
                ("scientific_object", models.ForeignKey(on_delete=models.deletion.CASCADE, related_name="revisions", to="library.scientificobject")),
            ],
            options={"ordering": ["revision"]},
        ),
        migrations.AddConstraint(
            model_name="scientificobjectrevision",
            constraint=models.UniqueConstraint(fields=("scientific_object", "revision"), name="unique_scientific_object_revision"),
        ),
    ]
