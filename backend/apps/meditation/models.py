from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class MeditationGuide(TimeStampedModel):
    class Tone(models.TextChoices):
        FUNNY = "funny", "Funny"
        MODERATE = "moderate", "Moderate"
        SERIOUS = "serious", "Serious"

    name = models.CharField(max_length=100)
    tone = models.CharField(max_length=10, choices=Tone.choices)
    avatar_image_url = models.URLField(blank=True)
    tagline = models.CharField(max_length=200, blank=True)
    voice_id = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["tone", "name"]

    def __str__(self):
        return f"{self.name} ({self.get_tone_display()})"


class MeditationSession(TimeStampedModel):
    class SessionType(models.TextChoices):
        BREATHING = "breathing", "Breathing & posture"
        POEM = "poem", "Poem"
        MOTIVATION = "motivation", "Motivation"
        HARDSHIP = "hardship", "Talk it out"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ENDED = "ended", "Ended"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meditation_sessions")
    guide = models.ForeignKey(MeditationGuide, on_delete=models.PROTECT, related_name="sessions")
    session_type = models.CharField(max_length=15, choices=SessionType.choices)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ["-created_at"]


class MeditationEntry(TimeStampedModel):
    session = models.ForeignKey(MeditationSession, on_delete=models.CASCADE, related_name="entries")
    user_text = models.TextField(blank=True)
    content = models.TextField(blank=True)
    audio_url = models.URLField(blank=True, null=True)
    is_mock = models.BooleanField(default=False)
    text_provider_used = models.CharField(max_length=30, blank=True)
    tts_provider_used = models.CharField(max_length=30, blank=True)

    class Meta:
        ordering = ["created_at"]
