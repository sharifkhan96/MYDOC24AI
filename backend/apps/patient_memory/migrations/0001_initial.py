from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PatientMemory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("kind", models.CharField(choices=[("allergy", "Allergy or sensitivity"), ("medication", "Medication"), ("condition", "Condition"), ("symptom", "Symptom or event"), ("preference", "Care preference"), ("care_plan", "Care plan")], max_length=20)),
                ("title", models.CharField(max_length=160)),
                ("content", models.TextField()),
                ("source", models.CharField(choices=[("patient_reported", "Patient reported"), ("health_profile", "Health profile"), ("saved_chat", "Saved chat"), ("clinician_note", "Clinician note"), ("demo_seed", "Demo patient profile")], default="patient_reported", max_length=30)),
                ("confidence", models.CharField(choices=[("confirmed", "Confirmed"), ("patient_reported", "Patient reported"), ("needs_review", "Needs review")], default="patient_reported", max_length=20)),
                ("occurred_on", models.DateField(blank=True, null=True)),
                ("is_pinned", models.BooleanField(default=False, help_text="Always provide this to the assistant when relevant.")),
                ("is_active", models.BooleanField(default=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="patient_memories", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-is_pinned", "-occurred_on", "-updated_at"]},
        ),
    ]
