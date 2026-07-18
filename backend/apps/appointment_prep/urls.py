from django.urls import path

from .views import AppointmentBriefView

urlpatterns = [
    path("brief/", AppointmentBriefView.as_view(), name="appointment-brief"),
]
