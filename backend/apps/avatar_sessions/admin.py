from django.contrib import admin

from .models import AvatarSession, AvatarTurn, Persona

admin.site.register(Persona)
admin.site.register(AvatarSession)
admin.site.register(AvatarTurn)
