from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import MeditationGuide, MeditationSession
from .serializers import (
    ContinueSessionSerializer,
    MeditationEntrySerializer,
    MeditationGuideSerializer,
    MeditationSessionSerializer,
)
from .services import continue_meditation_session, start_meditation_session


class MeditationGuideListView(generics.ListAPIView):
    queryset = MeditationGuide.objects.all()
    serializer_class = MeditationGuideSerializer
    pagination_class = None


class MeditationSessionViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = MeditationSession.objects.select_related("guide").prefetch_related("entries").all()
    serializer_class = MeditationSessionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = start_meditation_session(
            user=request.user,
            guide=serializer.validated_data["guide"],
            session_type=serializer.validated_data["session_type"],
            user_text=serializer.validated_data.get("user_text", ""),
        )
        return Response(MeditationSessionSerializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def entries(self, request, pk=None):
        session = self.get_object()
        serializer = ContinueSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        entry = continue_meditation_session(session, serializer.validated_data["user_text"])
        return Response(MeditationEntrySerializer(entry).data, status=status.HTTP_201_CREATED)
