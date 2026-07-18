from rest_framework import serializers

from .models import DailyCheckIn, LifestyleAssessment, LifestyleReport, NotificationPreference, PushSubscription


class LifestyleReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifestyleReport
        fields = ["id", "summary", "strengths", "improvement_areas", "suggestions", "ai_provider_used", "is_mock"]


class LifestyleAssessmentSerializer(serializers.ModelSerializer):
    report = LifestyleReportSerializer(read_only=True)

    class Meta:
        model = LifestyleAssessment
        fields = ["id", "answers", "report", "created_at"]
        read_only_fields = ["id", "created_at"]


class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = ["id", "date", "mood", "energy", "sleep_quality", "stress"]
        read_only_fields = ["id", "date"]


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ["daily_checkin_enabled", "reminder_hour"]


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ["endpoint", "p256dh", "auth"]
        # The view's update_or_create() intentionally re-subscribes an existing
        # endpoint (a browser re-registering after e.g. clearing its push
        # subscription). DRF auto-adds a UniqueValidator for unique=True model
        # fields, which would reject that second POST before the view logic
        # ever runs, so it's disabled here in favor of the view's upsert.
        extra_kwargs = {"endpoint": {"validators": []}}
