from datetime import date

from django.conf import settings
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import OwnedByUserQuerySetMixin

from .checkin_reports import build_report
from .models import DailyCheckIn, LifestyleAssessment, NotificationPreference, PushSubscription
from .serializers import (
    DailyCheckInSerializer,
    LifestyleAssessmentSerializer,
    NotificationPreferenceSerializer,
    PushSubscriptionSerializer,
)
from .services import run_lifestyle_report


class LifestyleAssessmentViewSet(
    OwnedByUserQuerySetMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    queryset = LifestyleAssessment.objects.select_related("report").all()
    serializer_class = LifestyleAssessmentSerializer

    def perform_create(self, serializer):
        assessment = serializer.save(user=self.request.user)
        run_lifestyle_report(assessment)


class TodayCheckInView(APIView):
    def get(self, request):
        checkin = DailyCheckIn.objects.filter(user=request.user, date=date.today()).first()
        if not checkin:
            return Response(None)
        return Response(DailyCheckInSerializer(checkin).data)

    def post(self, request):
        serializer = DailyCheckInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        checkin, _ = DailyCheckIn.objects.update_or_create(
            user=request.user,
            date=date.today(),
            defaults=serializer.validated_data,
        )
        return Response(DailyCheckInSerializer(checkin).data, status=status.HTTP_200_OK)


class CheckInReportView(APIView):
    def get(self, request):
        period = request.query_params.get("period", "week")
        if period not in ("week", "month", "year"):
            return Response({"detail": "period must be one of week, month, year."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(build_report(request.user, period))


class VapidPublicKeyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"public_key": settings.VAPID_PUBLIC_KEY})


class NotificationPreferenceView(APIView):
    def get(self, request):
        preference, _ = NotificationPreference.objects.get_or_create(user=request.user)
        return Response(NotificationPreferenceSerializer(preference).data)

    def patch(self, request):
        preference, _ = NotificationPreference.objects.get_or_create(user=request.user)
        serializer = NotificationPreferenceSerializer(preference, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PushSubscriptionView(APIView):
    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        PushSubscription.objects.update_or_create(
            endpoint=serializer.validated_data["endpoint"],
            defaults={"user": request.user, **serializer.validated_data},
        )
        return Response(status=status.HTTP_201_CREATED)

    def delete(self, request):
        endpoint = request.data.get("endpoint")
        PushSubscription.objects.filter(user=request.user, endpoint=endpoint).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
