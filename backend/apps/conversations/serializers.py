from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "content", "ai_provider_used", "is_mock", "created_at"]


class ConversationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at", "updated_at"]


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "title", "messages", "created_at", "updated_at"]


class SendMessageSerializer(serializers.Serializer):
    content = serializers.CharField()


class EphemeralMessageSerializer(serializers.Serializer):
    message = serializers.CharField()
    history = serializers.ListField(child=serializers.DictField(), required=False, default=list)
