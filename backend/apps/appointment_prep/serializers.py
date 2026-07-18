from rest_framework import serializers


class AppointmentBriefRequestSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=1000)
