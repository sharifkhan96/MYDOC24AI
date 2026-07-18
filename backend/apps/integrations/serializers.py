from rest_framework import serializers

from .models import MockAppointment, MockRecord, ProviderLinkAccount


class ProviderLinkAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderLinkAccount
        fields = ["id", "provider", "status", "consent_scopes", "mock_mode", "connected_at"]


class MockAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockAppointment
        fields = ["id", "title", "clinician_name", "location", "scheduled_at", "status"]


class MockRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockRecord
        fields = ["id", "title", "record_type", "summary", "record_date"]
