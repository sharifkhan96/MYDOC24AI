from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AvatarSessionViewSet, AvatarTurnDetailView, PersonaListView

router = DefaultRouter()
router.register("sessions", AvatarSessionViewSet, basename="avatar-session")

urlpatterns = [
    path("personas/", PersonaListView.as_view(), name="persona-list"),
    path("sessions/<int:session_id>/turns/<int:pk>/", AvatarTurnDetailView.as_view(), name="avatar-turn-detail"),
] + router.urls
