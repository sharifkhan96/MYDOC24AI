from django.contrib import admin

from .models import PatientMemory


@admin.register(PatientMemory)
class PatientMemoryAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "kind", "source", "confidence", "is_pinned", "updated_at")
    list_filter = ("kind", "source", "confidence", "is_pinned")
    search_fields = ("title", "content", "user__email")
