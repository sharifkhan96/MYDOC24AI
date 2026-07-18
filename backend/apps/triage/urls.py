from rest_framework.routers import DefaultRouter

from .views import TriageSessionViewSet

router = DefaultRouter()
router.register("sessions", TriageSessionViewSet, basename="triage-session")

urlpatterns = router.urls
