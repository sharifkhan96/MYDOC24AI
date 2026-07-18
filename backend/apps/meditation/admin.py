from django.contrib import admin

from .models import MeditationEntry, MeditationGuide, MeditationSession

admin.site.register(MeditationGuide)
admin.site.register(MeditationSession)
admin.site.register(MeditationEntry)
