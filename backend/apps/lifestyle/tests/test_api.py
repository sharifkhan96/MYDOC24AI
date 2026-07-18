import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.lifestyle.models import DailyCheckIn, NotificationPreference, PushSubscription


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
def test_checkin_today_create_and_idempotent_update(user_a):
    client = _client_for(user_a)

    resp = client.get("/api/lifestyle/checkins/today/")
    assert resp.status_code == 200
    assert resp.data is None

    resp = client.post(
        "/api/lifestyle/checkins/today/",
        {"mood": 4, "energy": 3, "sleep_quality": 5, "stress": 2},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["mood"] == 4
    assert DailyCheckIn.objects.filter(user=user_a).count() == 1

    # posting again the same day updates the existing row rather than creating a second one
    resp = client.post(
        "/api/lifestyle/checkins/today/",
        {"mood": 5, "energy": 3, "sleep_quality": 5, "stress": 1},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["mood"] == 5
    assert DailyCheckIn.objects.filter(user=user_a).count() == 1


@pytest.mark.django_db
def test_checkin_report_week_has_seven_points(user_a):
    client = _client_for(user_a)
    client.post("/api/lifestyle/checkins/today/", {"mood": 4, "energy": 4, "sleep_quality": 4, "stress": 2}, format="json")

    resp = client.get("/api/lifestyle/checkins/report/", {"period": "week"})
    assert resp.status_code == 200
    assert resp.data["period"] == "week"
    assert len(resp.data["data_points"]) == 7
    assert resp.data["entry_count"] == 1
    assert resp.data["averages"]["mood"] == 4.0


@pytest.mark.django_db
def test_checkins_are_scoped_per_user(user_a, user_b):
    client_a = _client_for(user_a)
    client_b = _client_for(user_b)
    client_a.post("/api/lifestyle/checkins/today/", {"mood": 5, "energy": 5, "sleep_quality": 5, "stress": 1}, format="json")

    resp = client_b.get("/api/lifestyle/checkins/today/")
    assert resp.status_code == 200
    assert resp.data is None
    assert DailyCheckIn.objects.filter(user=user_a).count() == 1
    assert DailyCheckIn.objects.filter(user=user_b).count() == 0


@pytest.mark.django_db
def test_notification_preference_get_or_create_and_patch(user_a):
    client = _client_for(user_a)

    resp = client.get("/api/lifestyle/notification-preference/")
    assert resp.status_code == 200
    assert resp.data["daily_checkin_enabled"] is False
    assert NotificationPreference.objects.filter(user=user_a).count() == 1

    resp = client.patch(
        "/api/lifestyle/notification-preference/",
        {"daily_checkin_enabled": True, "reminder_hour": 14},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["daily_checkin_enabled"] is True
    assert resp.data["reminder_hour"] == 14
    assert NotificationPreference.objects.filter(user=user_a).count() == 1


@pytest.mark.django_db
def test_vapid_public_key_endpoint_requires_auth():
    resp = APIClient().get("/api/lifestyle/vapid-public-key/")
    assert resp.status_code == 401


@pytest.mark.django_db
def test_push_subscription_create_and_delete(user_a):
    client = _client_for(user_a)
    payload = {"endpoint": "https://fcm.googleapis.com/fcm/send/abc123", "p256dh": "key1", "auth": "auth1"}

    resp = client.post("/api/lifestyle/push-subscription/", payload, format="json")
    assert resp.status_code == 201
    assert PushSubscription.objects.filter(user=user_a).count() == 1

    # re-subscribing with the same endpoint updates rather than duplicates
    resp = client.post("/api/lifestyle/push-subscription/", payload, format="json")
    assert resp.status_code == 201
    assert PushSubscription.objects.filter(user=user_a).count() == 1

    resp = client.delete("/api/lifestyle/push-subscription/", {"endpoint": payload["endpoint"]}, format="json")
    assert resp.status_code == 204
    assert PushSubscription.objects.filter(user=user_a).count() == 0


@pytest.mark.django_db
def test_send_due_reminders_noop_without_vapid_keys(settings, user_a):
    settings.VAPID_PRIVATE_KEY = ""
    settings.VAPID_PUBLIC_KEY = ""
    NotificationPreference.objects.create(user=user_a, daily_checkin_enabled=True, reminder_hour=9)

    from apps.lifestyle.notifications import send_due_reminders

    assert send_due_reminders() == 0
