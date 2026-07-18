from django.contrib import admin

from .models import MockAppointment, MockRecord, ProviderLinkAccount

admin.site.register(ProviderLinkAccount)
admin.site.register(MockAppointment)
admin.site.register(MockRecord)
