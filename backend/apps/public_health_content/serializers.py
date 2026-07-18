from rest_framework import serializers

from .models import Bulletin, TravelAdvisoryQuery


class BulletinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bulletin
        fields = ["id", "title", "region", "summary", "body", "severity_level", "source_links", "published_at"]


class TravelAdvisoryQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAdvisoryQuery
        fields = ["id", "destination_type", "destination_name", "advice", "ai_provider_used", "is_mock", "created_at"]
        read_only_fields = ["id", "advice", "ai_provider_used", "is_mock", "created_at"]
