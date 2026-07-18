from rest_framework import generics, viewsets

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import Allergy, Condition, FamilyHistoryEntry, HealthProfile, Medication
from .serializers import (
    AllergySerializer,
    ConditionSerializer,
    FamilyHistoryEntrySerializer,
    HealthProfileSerializer,
    MedicationSerializer,
)


class MyHealthProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = HealthProfileSerializer

    def get_object(self):
        profile, _ = HealthProfile.objects.get_or_create(user=self.request.user)
        return profile


class ConditionViewSet(OwnedByUserQuerySetMixin, viewsets.ModelViewSet):
    queryset = Condition.objects.all()
    serializer_class = ConditionSerializer


class AllergyViewSet(OwnedByUserQuerySetMixin, viewsets.ModelViewSet):
    queryset = Allergy.objects.all()
    serializer_class = AllergySerializer


class MedicationViewSet(OwnedByUserQuerySetMixin, viewsets.ModelViewSet):
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer


class FamilyHistoryEntryViewSet(OwnedByUserQuerySetMixin, viewsets.ModelViewSet):
    queryset = FamilyHistoryEntry.objects.all()
    serializer_class = FamilyHistoryEntrySerializer
