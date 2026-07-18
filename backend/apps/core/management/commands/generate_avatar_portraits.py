from django.core.management.base import BaseCommand

from ai.router import get_image_provider


class Command(BaseCommand):
    help = (
        "Generates a realistic portrait for every Persona and MeditationGuide missing one, "
        "using the configured image-generation provider. Idempotent: skips rows that already "
        "have an avatar_image_url. No-ops cleanly (leaves the illustrated fallback in place) "
        "when no image-generation key is configured."
    )

    def handle(self, *args, **options):
        provider = get_image_provider()

        from apps.avatar_sessions.models import Persona

        for persona in Persona.objects.filter(avatar_image_url=""):
            prompt = (
                f"A warm, professional, photorealistic portrait photo of a {persona.gender} "
                f"{persona.get_role_display().lower()}, kind and approachable expression, soft "
                "studio lighting, plain neutral background, medical scrubs or a white coat, "
                "shot like a modern healthcare website headshot."
            )
            result = provider.generate_portrait(prompt)
            if result.is_mock or not result.image_url:
                self.stdout.write(f"Skipped {persona.name} (no image-generation key configured).")
                continue
            persona.avatar_image_url = result.image_url
            persona.save(update_fields=["avatar_image_url", "updated_at"])
            self.stdout.write(self.style.SUCCESS(f"Generated portrait for {persona.name}."))

        try:
            from apps.meditation.models import MeditationGuide
        except ImportError:
            return

        for guide in MeditationGuide.objects.filter(avatar_image_url=""):
            prompt = (
                f"A warm, professional, photorealistic portrait photo of a meditation guide with "
                f"a {guide.tone} demeanor, gentle and approachable expression, soft natural "
                "lighting, plain calming neutral background, shot like a modern wellness app "
                "headshot."
            )
            result = provider.generate_portrait(prompt)
            if result.is_mock or not result.image_url:
                self.stdout.write(f"Skipped {guide.name} (no image-generation key configured).")
                continue
            guide.avatar_image_url = result.image_url
            guide.save(update_fields=["avatar_image_url", "updated_at"])
            self.stdout.write(self.style.SUCCESS(f"Generated portrait for {guide.name}."))
