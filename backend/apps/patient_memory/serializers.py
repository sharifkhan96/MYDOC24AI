from rest_framework import serializers

from .models import PatientMemory


class PatientMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientMemory
        fields = [
            "id",
            "kind",
            "title",
            "content",
            "source",
            "confidence",
            "occurred_on",
            "is_pinned",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
