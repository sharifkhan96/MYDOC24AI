from rest_framework import serializers

from .models import Allergy, Condition, FamilyHistoryEntry, HealthProfile, Medication


class HealthProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProfile
        fields = ["id", "height_cm", "weight_kg", "blood_type"]


class ConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Condition
        fields = ["id", "name", "status", "diagnosed_date", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = ["id", "allergen", "reaction", "severity", "created_at"]
        read_only_fields = ["id", "created_at"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ["id", "name", "dosage", "frequency", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class FamilyHistoryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyHistoryEntry
        fields = ["id", "relation", "condition", "created_at"]
        read_only_fields = ["id", "created_at"]
