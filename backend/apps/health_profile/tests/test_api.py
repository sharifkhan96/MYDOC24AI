import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User


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
def test_condition_crud(user_a):
    client = _client_for(user_a)
    resp = client.post("/api/health-profile/conditions/", {"name": "Asthma", "status": "ongoing"})
    assert resp.status_code == 201

    resp = client.get("/api/health-profile/conditions/")
    assert resp.status_code == 200
    results = resp.data if isinstance(resp.data, list) else resp.data["results"]
    assert len(results) == 1
    assert results[0]["name"] == "Asthma"


@pytest.mark.django_db
def test_user_cannot_see_another_users_conditions(user_a, user_b):
    client_a = _client_for(user_a)
    client_b = _client_for(user_b)

    client_a.post("/api/health-profile/conditions/", {"name": "Asthma", "status": "ongoing"})

    resp = client_b.get("/api/health-profile/conditions/")
    results = resp.data if isinstance(resp.data, list) else resp.data["results"]
    assert results == []


@pytest.mark.django_db
def test_user_cannot_delete_another_users_allergy(user_a, user_b):
    client_a = _client_for(user_a)
    client_b = _client_for(user_b)

    create_resp = client_a.post("/api/health-profile/allergies/", {"allergen": "Penicillin", "severity": "severe"})
    allergy_id = create_resp.data["id"]

    delete_resp = client_b.delete(f"/api/health-profile/allergies/{allergy_id}/")
    assert delete_resp.status_code == 404

    still_there = client_a.get("/api/health-profile/allergies/")
    results = still_there.data if isinstance(still_there.data, list) else still_there.data["results"]
    assert len(results) == 1
