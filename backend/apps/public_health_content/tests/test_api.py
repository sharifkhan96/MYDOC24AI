import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.public_health_content.models import TravelAdvisoryQuery


@pytest.fixture
def user_a(db):
    return User.objects.create_user(email="alice@example.com", password="pass12345")


@pytest.fixture
def user_b(db):
    return User.objects.create_user(email="bob@example.com", password="pass12345")


def _client_for(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.mark.django_db
def test_travel_advisory_create_returns_mock_advice(user_a):
    client = _client_for(user_a)
    resp = client.post(
        "/api/public-health/travel-advisory/",
        {"destination_type": "beach_tropical", "destination_name": "Bali"},
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["is_mock"] is True
    assert resp.data["advice"]
    assert TravelAdvisoryQuery.objects.count() == 1


@pytest.mark.django_db
def test_travel_advisory_requires_auth():
    resp = APIClient().post(
        "/api/public-health/travel-advisory/",
        {"destination_type": "cold"},
        format="json",
    )
    assert resp.status_code == 401


@pytest.mark.django_db
def test_travel_advisory_scoped_per_user(user_a, user_b):
    client_a = _client_for(user_a)
    client_b = _client_for(user_b)
    client_a.post("/api/public-health/travel-advisory/", {"destination_type": "cruise"}, format="json")

    resp = client_b.get("/api/public-health/travel-advisory/")
    assert resp.status_code == 200
    results = resp.data if isinstance(resp.data, list) else resp.data["results"]
    assert len(results) == 0


@pytest.mark.django_db
def test_bulletins_are_publicly_readable():
    resp = APIClient().get("/api/public-health/bulletins/")
    assert resp.status_code == 200
