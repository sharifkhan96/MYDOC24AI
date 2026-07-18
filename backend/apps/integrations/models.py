from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ProviderLinkAccount(TimeStampedModel):
    class Provider(models.TextChoices):
        NHS = "nhs", "NHS"
        MEDICAID = "medicaid", "Medicaid"

    class Status(models.TextChoices):
        NOT_CONNECTED = "not_connected", "Not connected"
        PENDING_CONSENT = "pending_consent", "Pending consent"
        CONNECTED = "connected", "Connected"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="provider_links")
    provider = models.CharField(max_length=10, choices=Provider.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_CONNECTED)
    consent_scopes = models.JSONField(default=list, blank=True)
    mock_mode = models.BooleanField(default=True)
    connected_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [["user", "provider"]]

    def __str__(self):
        return f"{self.user.email} - {self.provider} ({self.status})"


class MockAppointment(TimeStampedModel):
    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    link_account = models.ForeignKey(ProviderLinkAccount, on_delete=models.CASCADE, related_name="appointments")
    title = models.CharField(max_length=200)
    clinician_name = models.CharField(max_length=150, blank=True)
    location = models.CharField(max_length=200, blank=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UPCOMING)

    class Meta:
        ordering = ["scheduled_at"]


class MockRecord(TimeStampedModel):
    link_account = models.ForeignKey(ProviderLinkAccount, on_delete=models.CASCADE, related_name="records")
    title = models.CharField(max_length=200)
    record_type = models.CharField(max_length=100, blank=True)
    summary = models.TextField(blank=True)
    record_date = models.DateField()

    class Meta:
        ordering = ["-record_date"]
