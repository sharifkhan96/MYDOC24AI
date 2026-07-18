from django.contrib import admin

from .models import Bulletin, TravelAdvisoryQuery


@admin.register(Bulletin)
class BulletinAdmin(admin.ModelAdmin):
    list_display = ["title", "region", "severity_level", "is_published", "published_at"]
    list_filter = ["severity_level", "is_published"]


admin.site.register(TravelAdvisoryQuery)
