from rest_framework import mixins, viewsets

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import TriageSession
from .serializers import TriageSessionSerializer
from .services import run_triage


class TriageSessionViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TriageSession.objects.select_related("result").all()
    serializer_class = TriageSessionSerializer

    def perform_create(self, serializer):
        session = serializer.save(user=self.request.user)
        run_triage(session)
