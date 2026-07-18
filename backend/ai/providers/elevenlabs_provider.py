import logging
import uuid

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from ai.schemas import SpeechResult

from .base import SpeechProvider

logger = logging.getLogger(__name__)

API_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


class ElevenLabsProvider(SpeechProvider):
    name = "elevenlabs"

    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.mock = not bool(self.api_key)

    def synthesize_speech(self, text: str, voice_id: str, **kwargs) -> SpeechResult:
        if self.mock:
            # No audio_url: the frontend falls back to the browser's native
            # speechSynthesis API, which is a genuine degrade, not a dead end.
            return SpeechResult(audio_url=None, provider=self.name, is_mock=True)
        try:
            headers = {"xi-api-key": self.api_key, "Content-Type": "application/json"}
            payload = {
                "text": text,
                "model_id": "eleven_turbo_v2_5",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            }
            resp = requests.post(API_URL.format(voice_id=voice_id), headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            filename = f"tts/{uuid.uuid4()}.mp3"
            saved_path = default_storage.save(filename, ContentFile(resp.content))
            audio_url = default_storage.url(saved_path)
            return SpeechResult(audio_url=audio_url, provider=self.name, is_mock=False)
        except Exception:
            logger.exception("ElevenLabs synthesize_speech failed, falling back to mock")
            return SpeechResult(audio_url=None, provider=self.name, is_mock=True)
