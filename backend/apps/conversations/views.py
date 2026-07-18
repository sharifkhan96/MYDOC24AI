from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import OwnedByUserQuerySetMixin
from apps.patient_memory.serializers import PatientMemorySerializer

from .models import Conversation
from .serializers import (
    ConversationDetailSerializer,
    ConversationListSerializer,
    EphemeralMessageSerializer,
    MessageSerializer,
    SendMessageSerializer,
)
from .services import send_ephemeral_message, send_message


class ConversationViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Conversation.objects.prefetch_related("messages").all()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        return ConversationListSerializer

    @action(detail=True, methods=["post"])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_message, assistant_message, memories = send_message(conversation, serializer.validated_data["content"])
        return Response(
            {
                "user_message": MessageSerializer(user_message).data,
                "assistant_message": MessageSerializer(assistant_message).data,
                "memory_used": PatientMemorySerializer(memories, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EphemeralMessageView(APIView):
    def post(self, request):
        serializer = EphemeralMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = send_ephemeral_message(serializer.validated_data["history"], serializer.validated_data["message"])
        return Response(result)
