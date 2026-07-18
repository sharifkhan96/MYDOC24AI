from rest_framework import generics, mixins, viewsets
from rest_framework.permissions import AllowAny

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import Bulletin, TravelAdvisoryQuery
from .serializers import BulletinSerializer, TravelAdvisoryQuerySerializer
from .services import run_travel_advisory


class BulletinListView(generics.ListAPIView):
    queryset = Bulletin.objects.filter(is_published=True)
    serializer_class = BulletinSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class BulletinDetailView(generics.RetrieveAPIView):
    queryset = Bulletin.objects.filter(is_published=True)
    serializer_class = BulletinSerializer
    permission_classes = [AllowAny]


class TravelAdvisoryQueryViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = TravelAdvisoryQuery.objects.all()
    serializer_class = TravelAdvisoryQuerySerializer

    def perform_create(self, serializer):
        query = serializer.save(user=self.request.user)
        run_travel_advisory(query)
