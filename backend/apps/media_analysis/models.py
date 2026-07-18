from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


def upload_path(instance, filename):
    return f"uploads/{instance.user_id}/{filename}"


class UploadedMedia(TimeStampedModel):
    class Kind(models.TextChoices):
        SKIN_IMAGE = "skin_image", "Skin photo"
        XRAY = "xray", "X-ray"
        LAB_REPORT = "lab_report", "Lab report"
        PRESCRIPTION = "prescription", "Prescription"
        DISCHARGE_SUMMARY = "discharge_summary", "Discharge summary"

    IMAGE_KINDS = {Kind.SKIN_IMAGE, Kind.XRAY}

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="uploaded_media")
    file = models.FileField(upload_to=upload_path)
    kind = models.CharField(max_length=20, choices=Kind.choices)
    content_type = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_image(self):
        return self.kind in self.IMAGE_KINDS


class AnalysisResult(TimeStampedModel):
    media = models.OneToOneField(UploadedMedia, on_delete=models.CASCADE, related_name="analysis")
    summary = models.TextField(blank=True)
    structured_findings = models.JSONField(default=list)
    confidence = models.CharField(max_length=20, blank=True)
    flagged_for_clinician = models.BooleanField(default=False)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)
