import base64

from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from django.core.management.base import BaseCommand
from py_vapid import Vapid02


def _b64url(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()


class Command(BaseCommand):
    help = "Generates a VAPID keypair for Web Push and prints it in .env format."

    def handle(self, *args, **options):
        vapid = Vapid02()
        vapid.generate_keys()

        private_raw = vapid.private_key.private_numbers().private_value.to_bytes(32, "big")
        public_raw = vapid.public_key.public_bytes(
            encoding=Encoding.X962,
            format=PublicFormat.UncompressedPoint,
        )

        self.stdout.write(f"VAPID_PUBLIC_KEY={_b64url(public_raw)}")
        self.stdout.write(f"VAPID_PRIVATE_KEY={_b64url(private_raw)}")
