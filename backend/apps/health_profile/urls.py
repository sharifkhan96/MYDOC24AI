from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AllergyViewSet, ConditionViewSet, FamilyHistoryEntryViewSet, MedicationViewSet, MyHealthProfileView

router = DefaultRouter()
router.register("conditions", ConditionViewSet, basename="condition")
router.register("allergies", AllergyViewSet, basename="allergy")
router.register("medications", MedicationViewSet, basename="personal-medication")
router.register("family-history", FamilyHistoryEntryViewSet, basename="family-history")

urlpatterns = [
    path("me/", MyHealthProfileView.as_view(), name="my-health-profile"),
] + router.urls
