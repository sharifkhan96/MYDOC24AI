from django.contrib import admin

from .models import MedicationReference


@admin.register(MedicationReference)
class MedicationReferenceAdmin(admin.ModelAdmin):
    list_display = ["name", "generic_name", "drug_class", "is_seeded", "generated_as_mock"]
    search_fields = ["name", "generic_name"]
