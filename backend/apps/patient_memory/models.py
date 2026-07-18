from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class PatientMemory(TimeStampedModel):
    """A patient-controlled fact the assistant may use as conversational context."""

    class Kind(models.TextChoices):
        ALLERGY = "allergy", "Allergy or sensitivity"
        MEDICATION = "medication", "Medication"
        CONDITION = "condition", "Condition"
        SYMPTOM = "symptom", "Symptom or event"
        PREFERENCE = "preference", "Care preference"
        CARE_PLAN = "care_plan", "Care plan"

    class Source(models.TextChoices):
        PATIENT = "patient_reported", "Patient reported"
        PROFILE = "health_profile", "Health profile"
        CHAT = "saved_chat", "Saved chat"
        CLINICIAN = "clinician_note", "Clinician note"
        DEMO = "demo_seed", "Demo patient profile"

    class Confidence(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        REPORTED = "patient_reported", "Patient reported"
        NEEDS_REVIEW = "needs_review", "Needs review"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="patient_memories")
    kind = models.CharField(max_length=20, choices=Kind.choices)
    title = models.CharField(max_length=160)
    content = models.TextField()
    source = models.CharField(max_length=30, choices=Source.choices, default=Source.PATIENT)
    confidence = models.CharField(max_length=20, choices=Confidence.choices, default=Confidence.REPORTED)
    occurred_on = models.DateField(null=True, blank=True)
    is_pinned = models.BooleanField(default=False, help_text="Always provide this to the assistant when relevant.")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-is_pinned", "-occurred_on", "-updated_at"]

    def __str__(self):
        return f"{self.user.email}: {self.title}"
