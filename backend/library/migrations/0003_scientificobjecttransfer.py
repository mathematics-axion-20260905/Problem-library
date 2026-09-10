from django.db import migrations, models
import uuid


class Migration(migrations.Migration):
    dependencies = [
        ("library", "0002_project"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScientificObjectTransfer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("public_id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, unique=True)),
                ("payload", models.TextField()),
                ("content_hash", models.CharField(max_length=64)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("expires_at", models.DateTimeField(db_index=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
