from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class TriageSession(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="triage_sessions")
    intake_data = models.JSONField(default=dict)

    class Meta:
        ordering = ["-created_at"]


class TriageResult(TimeStampedModel):
    class Urgency(models.TextChoices):
        HOME_CARE = "home_care", "Home care"
        SEE_DOCTOR_SOON = "see_doctor_soon", "See a doctor soon"
        EMERGENCY = "emergency", "Emergency"

    session = models.OneToOneField(TriageSession, on_delete=models.CASCADE, related_name="result")
    likely_causes = models.JSONField(default=list)
    urgency_level = models.CharField(max_length=20, choices=Urgency.choices)
    next_steps = models.TextField(blank=True)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)
