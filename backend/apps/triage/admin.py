from django.contrib import admin

from .models import TriageResult, TriageSession

admin.site.register(TriageSession)
admin.site.register(TriageResult)
