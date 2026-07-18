from django.urls import path

from .views import (
    ProviderAppointmentsView,
    ProviderConnectView,
    ProviderConsentConfirmView,
    ProviderDisconnectView,
    ProviderListView,
    ProviderRecordsView,
    ProviderStatusView,
)

urlpatterns = [
    path("providers/", ProviderListView.as_view(), name="provider-list"),
    path("<str:provider>/connect/", ProviderConnectView.as_view(), name="provider-connect"),
    path("<str:provider>/consent/confirm/", ProviderConsentConfirmView.as_view(), name="provider-consent-confirm"),
    path("<str:provider>/status/", ProviderStatusView.as_view(), name="provider-status"),
    path("<str:provider>/appointments/", ProviderAppointmentsView.as_view(), name="provider-appointments"),
    path("<str:provider>/records/", ProviderRecordsView.as_view(), name="provider-records"),
    path("<str:provider>/disconnect/", ProviderDisconnectView.as_view(), name="provider-disconnect"),
]
