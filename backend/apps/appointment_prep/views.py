from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import AppointmentBriefRequestSerializer
from .services import build_appointment_brief


class AppointmentBriefView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AppointmentBriefRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(build_appointment_brief(request.user, serializer.validated_data.get("reason", "")))
