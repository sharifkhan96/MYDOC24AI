from django.contrib import admin

from .models import Allergy, Condition, FamilyHistoryEntry, HealthProfile, Medication

admin.site.register(HealthProfile)
admin.site.register(Condition)
admin.site.register(Allergy)
admin.site.register(Medication)
admin.site.register(FamilyHistoryEntry)
