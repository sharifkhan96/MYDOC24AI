from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import BulletinDetailView, BulletinListView, TravelAdvisoryQueryViewSet

router = DefaultRouter()
router.register("travel-advisory", TravelAdvisoryQueryViewSet, basename="travel-advisory")

urlpatterns = [
    path("bulletins/", BulletinListView.as_view(), name="bulletin-list"),
    path("bulletins/<int:pk>/", BulletinDetailView.as_view(), name="bulletin-detail"),
] + router.urls
