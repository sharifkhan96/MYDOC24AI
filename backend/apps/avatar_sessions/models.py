from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Persona(TimeStampedModel):
    class Role(models.TextChoices):
        DOCTOR = "doctor", "Doctor"
        NURSE = "nurse", "Nurse"

    class Gender(models.TextChoices):
        FEMALE = "female", "Female"
        MALE = "male", "Male"

    name = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=Role.choices)
    gender = models.CharField(max_length=10, choices=Gender.choices)
    voice_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ElevenLabs voice id. Leave blank until you have a real ElevenLabs account and pick a voice.",
    )
    avatar_image_url = models.URLField(
        blank=True,
        help_text="A hosted portrait photo used as the D-ID source image. Leave blank to fall back to the illustrated avatar.",
    )
    tagline = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ["role", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"


class AvatarSession(TimeStampedModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="avatar_sessions")
    persona = models.ForeignKey(Persona, on_delete=models.PROTECT, related_name="sessions")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ["-created_at"]


class AvatarTurn(TimeStampedModel):
    class VideoStatus(models.TextChoices):
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    session = models.ForeignKey(AvatarSession, on_delete=models.CASCADE, related_name="turns")
    user_text = models.TextField()
    assistant_text = models.TextField(blank=True)
    tts_audio_url = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)
    video_status = models.CharField(max_length=15, choices=VideoStatus.choices, default=VideoStatus.SKIPPED)
    provider_job_id = models.CharField(max_length=200, blank=True)
    text_provider_used = models.CharField(max_length=30, blank=True)
    tts_provider_used = models.CharField(max_length=30, blank=True)
    avatar_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)

    class Meta:
        ordering = ["created_at"]
