"""Standalone process that periodically sends due daily check-in push
reminders. Runs as its own docker-compose service rather than inside the web
process, deliberately kept dependency-light (APScheduler, no Celery/Redis)
since this is the only recurring job in the app so far.
"""

import logging
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apscheduler.schedulers.blocking import BlockingScheduler  # noqa: E402

from apps.lifestyle.notifications import send_due_reminders  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("scheduler")


def job():
    count = send_due_reminders()
    if count:
        logger.info("Sent daily check-in reminders to %d user(s).", count)


if __name__ == "__main__":
    scheduler = BlockingScheduler(timezone="UTC")
    scheduler.add_job(job, "interval", minutes=15)
    logger.info("Notification scheduler started, checking every 15 minutes.")
    scheduler.start()
