from rest_framework import serializers

from .models import DiseaseEntry, RoleModelQuery, WellbeingRecommendationQuery


class DiseaseEntryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseEntry
        fields = ["id", "name", "slug", "category", "overview"]


class RoleModelQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleModelQuery
        fields = ["id", "name", "content", "ai_provider_used", "is_mock", "created_at"]
        read_only_fields = ["id", "content", "ai_provider_used", "is_mock", "created_at"]


class WellbeingRecommendationQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = WellbeingRecommendationQuery
        fields = ["id", "goal", "content", "ai_provider_used", "is_mock", "created_at"]
        read_only_fields = ["id", "content", "ai_provider_used", "is_mock", "created_at"]


class DiseaseEntryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiseaseEntry
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "overview",
            "history",
            "severity_mortality_context",
            "treatment_evolution",
            "current_outlook",
            "sources",
        ]
