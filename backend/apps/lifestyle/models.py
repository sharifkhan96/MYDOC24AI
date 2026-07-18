from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class LifestyleAssessment(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="lifestyle_assessments")
    answers = models.JSONField(default=dict)

    class Meta:
        ordering = ["-created_at"]


class LifestyleReport(TimeStampedModel):
    assessment = models.OneToOneField(LifestyleAssessment, on_delete=models.CASCADE, related_name="report")
    summary = models.TextField(blank=True)
    strengths = models.JSONField(default=list)
    improvement_areas = models.JSONField(default=list)
    suggestions = models.JSONField(default=list)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)


SCALE_CHOICES = [(i, str(i)) for i in range(1, 6)]


class DailyCheckIn(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="daily_checkins")
    date = models.DateField()
    mood = models.PositiveSmallIntegerField(choices=SCALE_CHOICES)
    energy = models.PositiveSmallIntegerField(choices=SCALE_CHOICES)
    sleep_quality = models.PositiveSmallIntegerField(choices=SCALE_CHOICES)
    stress = models.PositiveSmallIntegerField(choices=SCALE_CHOICES)

    class Meta:
        ordering = ["-date"]
        unique_together = [["user", "date"]]

    def __str__(self):
        return f"{self.user.email} check-in {self.date}"


class NotificationPreference(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notification_preference")
    daily_checkin_enabled = models.BooleanField(default=False)
    reminder_hour = models.PositiveSmallIntegerField(default=9, help_text="Hour of day (UTC, 0-23) to send the reminder.")
    last_notified_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Notification preference for {self.user.email}"


class PushSubscription(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="push_subscriptions")
    endpoint = models.URLField(max_length=500, unique=True)
    p256dh = models.CharField(max_length=200)
    auth = models.CharField(max_length=200)

    def __str__(self):
        return f"Push subscription for {self.user.email}"
