from datetime import timedelta

from django.utils import timezone

from .base import ProviderClient

_APPOINTMENT_TEMPLATES = {
    "nhs": [
        {"title": "GP check-up", "clinician_name": "Dr. Fiona Marsh", "location": "Riverside Medical Practice", "days_from_now": 12},
        {"title": "Blood test follow-up", "clinician_name": "Nurse Kevin Adeyemi", "location": "Riverside Medical Practice", "days_from_now": -20},
    ],
    "medicaid": [
        {"title": "Annual physical", "clinician_name": "Dr. Laura Bennett", "location": "Lakeside Family Health Center", "days_from_now": 9},
        {"title": "Dental cleaning", "clinician_name": "Dr. Omar Haddad", "location": "Bright Smile Dental", "days_from_now": -35},
    ],
}

_RECORD_TEMPLATES = {
    "nhs": [
        {"title": "Blood test results", "record_type": "Lab result", "summary": "Routine panel, all values within normal range.", "days_ago": 20},
        {"title": "Flu vaccination", "record_type": "Immunization", "summary": "Seasonal flu vaccine administered.", "days_ago": 95},
    ],
    "medicaid": [
        {"title": "Annual physical summary", "record_type": "Visit summary", "summary": "General check-up, no concerns noted.", "days_ago": 100},
        {"title": "Prescription: Lisinopril 10mg", "record_type": "Prescription", "summary": "30-day supply, one refill remaining.", "days_ago": 40},
    ],
}


class MockProviderClient(ProviderClient):
    """Fully working stand-in for a real NHS/Medicaid OAuth integration.

    Generates realistic-looking sample appointments and records so the
    connect -> consent -> dashboard flow is genuinely demoable end to end.
    """

    def initiate_oauth(self, link_account) -> dict:
        return {"requires_mock_consent": True, "consent_url": None}

    def handle_callback(self, link_account) -> None:
        from apps.integrations.models import MockAppointment, MockRecord

        now = timezone.now()
        for tmpl in _APPOINTMENT_TEMPLATES.get(link_account.provider, []):
            MockAppointment.objects.create(
                link_account=link_account,
                title=tmpl["title"],
                clinician_name=tmpl["clinician_name"],
                location=tmpl["location"],
                scheduled_at=now + timedelta(days=tmpl["days_from_now"]),
                status=MockAppointment.Status.UPCOMING if tmpl["days_from_now"] >= 0 else MockAppointment.Status.COMPLETED,
            )
        for tmpl in _RECORD_TEMPLATES.get(link_account.provider, []):
            MockRecord.objects.create(
                link_account=link_account,
                title=tmpl["title"],
                record_type=tmpl["record_type"],
                summary=tmpl["summary"],
                record_date=(now - timedelta(days=tmpl["days_ago"])).date(),
            )

    def fetch_appointments(self, link_account) -> list[dict]:
        return list(link_account.appointments.values())

    def fetch_records(self, link_account) -> list[dict]:
        return list(link_account.records.values())
