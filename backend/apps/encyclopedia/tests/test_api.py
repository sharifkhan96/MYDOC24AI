import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.encyclopedia.models import RoleModelQuery, WellbeingRecommendationQuery


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
def test_role_model_query_returns_mock_content_with_disclaimer_data(user_a):
    client = _client_for(user_a)
    resp = client.post("/api/encyclopedia/role-model/", {"name": "Serena Williams"}, format="json")
    assert resp.status_code == 201
    assert resp.data["is_mock"] is True
    assert "routine" in resp.data["content"]
    assert RoleModelQuery.objects.count() == 1


@pytest.mark.django_db
def test_wellbeing_recommendation_query_returns_mock_content(user_a):
    client = _client_for(user_a)
    resp = client.post("/api/encyclopedia/recommendations/", {"goal": "clearer skin"}, format="json")
    assert resp.status_code == 201
    assert resp.data["is_mock"] is True
    assert isinstance(resp.data["content"].get("recommendations"), list)
    assert WellbeingRecommendationQuery.objects.count() == 1


@pytest.mark.django_db
def test_role_model_queries_scoped_per_user(user_a, user_b):
    client_a = _client_for(user_a)
    client_b = _client_for(user_b)
    client_a.post("/api/encyclopedia/role-model/", {"name": "Anyone"}, format="json")

    resp = client_b.get("/api/encyclopedia/role-model/")
    results = resp.data if isinstance(resp.data, list) else resp.data["results"]
    assert len(results) == 0


@pytest.mark.django_db
def test_disease_entries_are_publicly_readable():
    resp = APIClient().get("/api/encyclopedia/entries/")
    assert resp.status_code == 200
