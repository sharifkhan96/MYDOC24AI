from django.contrib import admin

from .models import DiseaseEntry, RoleModelQuery, WellbeingRecommendationQuery


@admin.register(DiseaseEntry)
class DiseaseEntryAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "is_published"]
    list_filter = ["category", "is_published"]
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(RoleModelQuery)
admin.site.register(WellbeingRecommendationQuery)
