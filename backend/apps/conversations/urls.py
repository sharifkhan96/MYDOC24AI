from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, EphemeralMessageView

router = DefaultRouter()
router.register("", ConversationViewSet, basename="conversation")

urlpatterns = [
    path("ephemeral-message/", EphemeralMessageView.as_view(), name="ephemeral-message"),
] + router.urls
