from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import PatientMemory
from .serializers import PatientMemorySerializer
from .services import retrieve_memory


class PatientMemoryViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = PatientMemory.objects.all()
    serializer_class = PatientMemorySerializer

    @action(detail=False, methods=["get"])
    def context(self, request):
        always, relevant = retrieve_memory(request.user, request.query_params.get("q", ""))
        serializer = self.get_serializer
        return Response(
            {
                "always": serializer(always, many=True).data,
                "relevant": serializer(relevant, many=True).data,
                "note": "Pinned safety facts are always considered. The remaining facts are selected from the current question.",
            }
        )
