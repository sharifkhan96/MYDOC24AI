import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.medications.models import MedicationReference


@pytest.fixture
def authed_client(db):
    user = User.objects.create_user(email="alice@example.com", password="pass12345")
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_seeded_medication_lookup_is_not_mock(authed_client):
    MedicationReference.objects.create(
        name="Ibuprofen",
        adult_dosing="200 to 400 mg every 4 to 6 hours.",
        is_seeded=True,
        generated_as_mock=False,
    )

    resp = authed_client.get("/api/medications/lookup/", {"name": "Ibuprofen"})
    assert resp.status_code == 200
    assert resp.data["is_mock"] is False
    assert "200 to 400 mg" in resp.data["adult_dosing"]


@pytest.mark.django_db
def test_unseeded_medication_lookup_falls_back_to_mock_with_no_api_keys(authed_client, settings):
    settings.OPENAI_API_KEY = ""
    settings.ANTHROPIC_API_KEY = ""
    settings.GEMINI_API_KEY = ""

    resp = authed_client.get("/api/medications/lookup/", {"name": "SomeNewDrug"})
    assert resp.status_code == 200
    assert resp.data["is_mock"] is True

    # A second lookup of the same name should hit the cached DB row, still
    # correctly flagged as mock-generated rather than silently "going real".
    resp2 = authed_client.get("/api/medications/lookup/", {"name": "SomeNewDrug"})
    assert resp2.status_code == 200
    assert resp2.data["is_mock"] is True
    assert resp2.data["id"] == resp.data["id"]
