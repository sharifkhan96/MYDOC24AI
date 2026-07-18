import base64

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Generates a VAPID keypair for Web Push and prints the .env lines to add."

    def handle(self, *args, **options):
        private_key = ec.generate_private_key(ec.SECP256R1())
        public_key = private_key.public_key()

        private_raw = private_key.private_numbers().private_value.to_bytes(32, "big")
        private_b64 = base64.urlsafe_b64encode(private_raw).rstrip(b"=").decode()

        public_bytes = public_key.public_bytes(
            serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint
        )
        public_b64 = base64.urlsafe_b64encode(public_bytes).rstrip(b"=").decode()

        self.stdout.write("Add these to your .env file:\n")
        self.stdout.write(f"VAPID_PUBLIC_KEY={public_b64}")
        self.stdout.write(f"VAPID_PRIVATE_KEY={private_b64}")
