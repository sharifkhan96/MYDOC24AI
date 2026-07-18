import base64
import logging

import requests
from django.conf import settings

from ai.schemas import ImageAnalysisResult, TextResult

from .base import TextProvider, VisionProvider
from .mock_data import MOCK_IMAGE_FINDINGS, MOCK_TEXT_RESPONSE

logger = logging.getLogger(__name__)

MODEL = "gemini-2.0-flash"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


class GeminiProvider(TextProvider, VisionProvider):
    name = "gemini"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.mock = not bool(self.api_key)

    def generate_text(self, system_prompt: str, user_prompt: str, **kwargs) -> TextResult:
        if self.mock:
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)
        try:
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            }
            resp = requests.post(f"{API_URL}?key={self.api_key}", json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return TextResult(text=text, provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("Gemini generate_text failed, falling back to mock")
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)

    def analyze_image(self, system_prompt: str, user_prompt: str, image_bytes: bytes, mime_type: str, **kwargs) -> ImageAnalysisResult:
        if self.mock:
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)
        try:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": user_prompt},
                            {"inline_data": {"mime_type": mime_type, "data": b64}},
                        ],
                    }
                ],
            }
            resp = requests.post(f"{API_URL}?key={self.api_key}", json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return ImageAnalysisResult(summary=text, findings=[], provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("Gemini analyze_image failed, falling back to mock")
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)
