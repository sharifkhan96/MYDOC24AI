from rest_framework import serializers

from .models import MedicationReference


class MedicationReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationReference
        fields = [
            "id",
            "name",
            "generic_name",
            "drug_class",
            "adult_dosing",
            "pediatric_dosing",
            "how_to_take",
            "food_alcohol_interactions",
            "common_side_effects",
            "serious_side_effects",
            "missed_dose_guidance",
            "interaction_warnings",
            "is_seeded",
        ]


class MedicationSearchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicationReference
        fields = ["id", "name", "generic_name", "drug_class"]
