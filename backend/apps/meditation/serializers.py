from rest_framework import serializers

from .models import MeditationEntry, MeditationGuide, MeditationSession


class MeditationGuideSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationGuide
        fields = ["id", "name", "tone", "avatar_image_url", "tagline"]


class MeditationEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationEntry
        fields = ["id", "user_text", "content", "audio_url", "is_mock", "created_at"]
        read_only_fields = fields


class MeditationSessionSerializer(serializers.ModelSerializer):
    guide = MeditationGuideSerializer(read_only=True)
    guide_id = serializers.PrimaryKeyRelatedField(queryset=MeditationGuide.objects.all(), source="guide", write_only=True)
    entries = MeditationEntrySerializer(many=True, read_only=True)
    user_text = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = MeditationSession
        fields = ["id", "guide", "guide_id", "session_type", "status", "entries", "user_text", "created_at"]
        read_only_fields = ["id", "status", "entries", "created_at"]


class ContinueSessionSerializer(serializers.Serializer):
    user_text = serializers.CharField()
