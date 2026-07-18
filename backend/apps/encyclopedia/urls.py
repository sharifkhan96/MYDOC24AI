from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import DiseaseEntryDetailView, DiseaseEntryListView, RoleModelQueryViewSet, WellbeingRecommendationQueryViewSet

router = DefaultRouter()
router.register("role-model", RoleModelQueryViewSet, basename="role-model")
router.register("recommendations", WellbeingRecommendationQueryViewSet, basename="wellbeing-recommendation")

urlpatterns = [
    path("entries/", DiseaseEntryListView.as_view(), name="disease-entry-list"),
    path("entries/<slug:slug>/", DiseaseEntryDetailView.as_view(), name="disease-entry-detail"),
] + router.urls
