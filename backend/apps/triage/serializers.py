from rest_framework import serializers

from .models import TriageResult, TriageSession


class TriageResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TriageResult
        fields = ["id", "likely_causes", "urgency_level", "next_steps", "ai_provider_used", "is_mock", "created_at"]


class TriageSessionSerializer(serializers.ModelSerializer):
    result = TriageResultSerializer(read_only=True)

    class Meta:
        model = TriageSession
        fields = ["id", "intake_data", "result", "created_at"]
        read_only_fields = ["id", "created_at"]
