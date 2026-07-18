from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CheckInReportView,
    LifestyleAssessmentViewSet,
    NotificationPreferenceView,
    PushSubscriptionView,
    TodayCheckInView,
    VapidPublicKeyView,
)

router = DefaultRouter()
router.register("assessments", LifestyleAssessmentViewSet, basename="lifestyle-assessment")

urlpatterns = [
    path("checkins/today/", TodayCheckInView.as_view(), name="checkin-today"),
    path("checkins/report/", CheckInReportView.as_view(), name="checkin-report"),
    path("vapid-public-key/", VapidPublicKeyView.as_view(), name="vapid-public-key"),
    path("notification-preference/", NotificationPreferenceView.as_view(), name="notification-preference"),
    path("push-subscription/", PushSubscriptionView.as_view(), name="push-subscription"),
] + router.urls
