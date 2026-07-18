import logging
import uuid

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from ai.schemas import SpeechResult

from .base import SpeechProvider

logger = logging.getLogger(__name__)

API_URL = "https://api.openai.com/v1/audio/speech"


class OpenAISpeechProvider(SpeechProvider):
    """Generate spoken answers with the same OpenAI credential as text and vision."""

    name = "openai"

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.mock = not bool(self.api_key)

    def synthesize_speech(self, text: str, voice_id: str, **kwargs) -> SpeechResult:
        if self.mock:
            return SpeechResult(audio_url=None, provider=self.name, is_mock=True)
        try:
            payload = {
                "model": "gpt-4o-mini-tts",
                "voice": "sage",
                "input": text[:4096],
                "response_format": "mp3",
            }
            response = requests.post(
                API_URL,
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json=payload,
                timeout=60,
            )
            response.raise_for_status()
            filename = f"tts/{uuid.uuid4()}.mp3"
            saved_path = default_storage.save(filename, ContentFile(response.content))
            return SpeechResult(audio_url=default_storage.url(saved_path), provider=self.name, is_mock=False)
        except Exception:
            logger.exception("OpenAI speech generation failed")
            return SpeechResult(audio_url=None, provider=self.name, is_mock=True)
