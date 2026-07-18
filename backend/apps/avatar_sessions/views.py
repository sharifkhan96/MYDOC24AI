from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import AvatarSession, AvatarTurn, Persona
from .serializers import AvatarSessionSerializer, AvatarTurnSerializer, CreateTurnSerializer, PersonaSerializer
from .services import create_turn, refresh_turn_video


class PersonaListView(generics.ListAPIView):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    pagination_class = None


class AvatarSessionViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = AvatarSession.objects.select_related("persona").prefetch_related("turns").all()
    serializer_class = AvatarSessionSerializer

    @action(detail=True, methods=["post"])
    def turns(self, request, pk=None):
        session = self.get_object()
        serializer = CreateTurnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        turn = create_turn(session, serializer.validated_data["user_text"])
        return Response(AvatarTurnSerializer(turn).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="end")
    def end_session(self, request, pk=None):
        session = self.get_object()
        session.status = AvatarSession.Status.ENDED
        session.save(update_fields=["status", "updated_at"])
        return Response(AvatarSessionSerializer(session).data)


class AvatarTurnDetailView(generics.RetrieveAPIView):
    serializer_class = AvatarTurnSerializer

    def get_queryset(self):
        return AvatarTurn.objects.filter(session_id=self.kwargs["session_id"], session__user=self.request.user)

    def get_object(self):
        turn = super().get_object()
        return refresh_turn_video(turn)
