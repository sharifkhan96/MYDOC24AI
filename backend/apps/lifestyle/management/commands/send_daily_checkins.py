from django.core.management.base import BaseCommand

from apps.lifestyle.notifications import send_due_reminders


class Command(BaseCommand):
    help = "Sends the daily check-in push reminder to every user whose reminder hour matches now."

    def handle(self, *args, **options):
        count = send_due_reminders()
        self.stdout.write(self.style.SUCCESS(f"Notified {count} user(s)."))
