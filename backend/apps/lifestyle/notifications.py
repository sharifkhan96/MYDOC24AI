import json
import logging
from datetime import date, timezone as dt_timezone, datetime

from django.conf import settings

from .models import NotificationPreference, PushSubscription

logger = logging.getLogger(__name__)


def send_due_reminders() -> int:
    """Sends the daily check-in reminder to every user whose preferred hour (UTC)
    matches now and who hasn't already been notified today. Returns how many
    users were notified. No-ops cleanly if VAPID keys aren't configured.
    """
    if not settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
        logger.info("VAPID keys not configured, skipping push reminders.")
        return 0

    from pywebpush import WebPushException, webpush

    now = datetime.now(dt_timezone.utc)
    today = date.today()
    notified = 0

    due = NotificationPreference.objects.filter(
        daily_checkin_enabled=True,
        reminder_hour=now.hour,
    ).exclude(last_notified_date=today)

    for preference in due:
        subscriptions = PushSubscription.objects.filter(user=preference.user)
        sent_any = False
        for sub in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": sub.endpoint,
                        "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                    },
                    data=json.dumps(
                        {
                            "title": "Time for your daily check-in",
                            "body": "A few quick taps on mood, energy, sleep, and stress.",
                            "url": "/app/lifestyle",
                        }
                    ),
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"},
                )
                sent_any = True
            except WebPushException as exc:
                status_code = getattr(exc.response, "status_code", None)
                if status_code in (404, 410):
                    sub.delete()
                else:
                    logger.exception("Push send failed for subscription %s", sub.id)

        if sent_any:
            preference.last_notified_date = today
            preference.save(update_fields=["last_notified_date", "updated_at"])
            notified += 1

    return notified
