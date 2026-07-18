from django.contrib import admin

from .models import DailyCheckIn, LifestyleAssessment, LifestyleReport, NotificationPreference, PushSubscription

admin.site.register(LifestyleAssessment)
admin.site.register(LifestyleReport)
admin.site.register(DailyCheckIn)
admin.site.register(NotificationPreference)
admin.site.register(PushSubscription)
