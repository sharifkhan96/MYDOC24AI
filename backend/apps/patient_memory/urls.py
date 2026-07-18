from rest_framework.routers import DefaultRouter

from .views import PatientMemoryViewSet

router = DefaultRouter()
router.register("", PatientMemoryViewSet, basename="patient-memory")

urlpatterns = router.urls
