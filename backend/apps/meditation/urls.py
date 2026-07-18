from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import MeditationGuideListView, MeditationSessionViewSet

router = DefaultRouter()
router.register("sessions", MeditationSessionViewSet, basename="meditation-session")

urlpatterns = [
    path("guides/", MeditationGuideListView.as_view(), name="meditation-guide-list"),
] + router.urls
