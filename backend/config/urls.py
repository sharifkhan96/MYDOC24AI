from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.urls")),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/health-profile/", include("apps.health_profile.urls")),
    path("api/memory/", include("apps.patient_memory.urls")),
    path("api/appointment-prep/", include("apps.appointment_prep.urls")),
    path("api/conversations/", include("apps.conversations.urls")),
    path("api/triage/", include("apps.triage.urls")),
    path("api/media/", include("apps.media_analysis.urls")),
    path("api/medications/", include("apps.medications.urls")),
    path("api/avatar/", include("apps.avatar_sessions.urls")),
    path("api/public-health/", include("apps.public_health_content.urls")),
    path("api/encyclopedia/", include("apps.encyclopedia.urls")),
    path("api/lifestyle/", include("apps.lifestyle.urls")),
    path("api/integrations/", include("apps.integrations.urls")),
    path("api/meditation/", include("apps.meditation.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
