from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ProviderLinkAccount
from .providers.registry import get_provider_client
from .serializers import MockAppointmentSerializer, MockRecordSerializer, ProviderLinkAccountSerializer

CONSENT_SCOPES = ["appointments", "records"]


def _get_or_create_link(user, provider):
    account, _ = ProviderLinkAccount.objects.get_or_create(user=user, provider=provider)
    return account


class ProviderListView(APIView):
    def get(self, request):
        accounts = [_get_or_create_link(request.user, code) for code, _ in ProviderLinkAccount.Provider.choices]
        return Response(ProviderLinkAccountSerializer(accounts, many=True).data)


class ProviderConnectView(APIView):
    def post(self, request, provider):
        account = get_object_or_404(ProviderLinkAccount, user=request.user, provider=provider)
        client = get_provider_client(provider)
        client.initiate_oauth(account)
        account.status = ProviderLinkAccount.Status.PENDING_CONSENT
        account.save(update_fields=["status", "updated_at"])
        return Response({"account": ProviderLinkAccountSerializer(account).data, "consent_scopes": CONSENT_SCOPES})


class ProviderConsentConfirmView(APIView):
    def post(self, request, provider):
        account = get_object_or_404(ProviderLinkAccount, user=request.user, provider=provider)
        client = get_provider_client(provider)
        client.handle_callback(account)
        account.status = ProviderLinkAccount.Status.CONNECTED
        account.connected_at = timezone.now()
        account.consent_scopes = CONSENT_SCOPES
        account.save(update_fields=["status", "connected_at", "consent_scopes", "updated_at"])
        return Response(ProviderLinkAccountSerializer(account).data)


class ProviderStatusView(APIView):
    def get(self, request, provider):
        account = _get_or_create_link(request.user, provider)
        return Response(ProviderLinkAccountSerializer(account).data)


class ProviderAppointmentsView(APIView):
    def get(self, request, provider):
        account = get_object_or_404(ProviderLinkAccount, user=request.user, provider=provider)
        if account.status != ProviderLinkAccount.Status.CONNECTED:
            return Response([])
        return Response(MockAppointmentSerializer(account.appointments.all(), many=True).data)


class ProviderRecordsView(APIView):
    def get(self, request, provider):
        account = get_object_or_404(ProviderLinkAccount, user=request.user, provider=provider)
        if account.status != ProviderLinkAccount.Status.CONNECTED:
            return Response([])
        return Response(MockRecordSerializer(account.records.all(), many=True).data)


class ProviderDisconnectView(APIView):
    def post(self, request, provider):
        account = get_object_or_404(ProviderLinkAccount, user=request.user, provider=provider)
        account.appointments.all().delete()
        account.records.all().delete()
        account.status = ProviderLinkAccount.Status.NOT_CONNECTED
        account.connected_at = None
        account.consent_scopes = []
        account.save(update_fields=["status", "connected_at", "consent_scopes", "updated_at"])
        return Response(ProviderLinkAccountSerializer(account).data)
