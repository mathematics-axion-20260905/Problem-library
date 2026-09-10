from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("library", "0003_scientificobjecttransfer"),
    ]

    operations = [
        migrations.AddField(
            model_name="problem",
            name="calculations",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="problem",
            name="code_samples",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="problem",
            name="formulas",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="problem",
            name="graphs",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="problem",
            name="notes",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="problemgroup",
            name="is_featured",
            field=models.BooleanField(default=False),
        ),
    ]
