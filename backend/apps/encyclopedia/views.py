from rest_framework import generics, mixins, viewsets
from rest_framework.permissions import AllowAny

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import DiseaseEntry, RoleModelQuery, WellbeingRecommendationQuery
from .serializers import (
    DiseaseEntryDetailSerializer,
    DiseaseEntryListSerializer,
    RoleModelQuerySerializer,
    WellbeingRecommendationQuerySerializer,
)
from .services import run_role_model_query, run_wellbeing_recommendation_query


class DiseaseEntryListView(generics.ListAPIView):
    serializer_class = DiseaseEntryListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        qs = DiseaseEntry.objects.filter(is_published=True)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs


class DiseaseEntryDetailView(generics.RetrieveAPIView):
    queryset = DiseaseEntry.objects.filter(is_published=True)
    serializer_class = DiseaseEntryDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


class RoleModelQueryViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = RoleModelQuery.objects.all()
    serializer_class = RoleModelQuerySerializer

    def perform_create(self, serializer):
        query = serializer.save(user=self.request.user)
        run_role_model_query(query)


class WellbeingRecommendationQueryViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    queryset = WellbeingRecommendationQuery.objects.all()
    serializer_class = WellbeingRecommendationQuerySerializer

    def perform_create(self, serializer):
        query = serializer.save(user=self.request.user)
        run_wellbeing_recommendation_query(query)
