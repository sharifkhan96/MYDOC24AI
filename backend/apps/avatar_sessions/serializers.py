from rest_framework import serializers

from .models import AvatarSession, AvatarTurn, Persona


class PersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ["id", "name", "role", "gender", "tagline", "avatar_image_url"]


class AvatarTurnSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarTurn
        fields = [
            "id",
            "user_text",
            "assistant_text",
            "tts_audio_url",
            "video_url",
            "video_status",
            "is_mock",
            "created_at",
        ]
        read_only_fields = fields


class AvatarSessionSerializer(serializers.ModelSerializer):
    persona = PersonaSerializer(read_only=True)
    persona_id = serializers.PrimaryKeyRelatedField(queryset=Persona.objects.all(), source="persona", write_only=True)
    turns = AvatarTurnSerializer(many=True, read_only=True)

    class Meta:
        model = AvatarSession
        fields = ["id", "persona", "persona_id", "status", "turns", "created_at"]
        read_only_fields = ["id", "status", "turns", "created_at"]


class CreateTurnSerializer(serializers.Serializer):
    user_text = serializers.CharField()
