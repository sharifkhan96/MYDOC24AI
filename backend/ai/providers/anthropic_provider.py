import base64
import logging

import requests
from django.conf import settings

from ai.schemas import ImageAnalysisResult, TextResult

from .base import TextProvider, VisionProvider
from .mock_data import MOCK_IMAGE_FINDINGS, MOCK_TEXT_RESPONSE

logger = logging.getLogger(__name__)

API_URL = "https://api.anthropic.com/v1/messages"
MODEL = "claude-sonnet-5"
ANTHROPIC_VERSION = "2023-06-01"


class AnthropicProvider(TextProvider, VisionProvider):
    name = "anthropic"

    def __init__(self):
        self.api_key = settings.ANTHROPIC_API_KEY
        self.mock = not bool(self.api_key)

    def _headers(self):
        return {
            "x-api-key": self.api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "Content-Type": "application/json",
        }

    def generate_text(self, system_prompt: str, user_prompt: str, **kwargs) -> TextResult:
        if self.mock:
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)
        try:
            payload = {
                "model": MODEL,
                "max_tokens": 1024,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
            }
            resp = requests.post(API_URL, headers=self._headers(), json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            text = "".join(block.get("text", "") for block in data.get("content", []))
            return TextResult(text=text, provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("Anthropic generate_text failed, falling back to mock")
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)

    def analyze_image(self, system_prompt: str, user_prompt: str, image_bytes: bytes, mime_type: str, **kwargs) -> ImageAnalysisResult:
        if self.mock:
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)
        try:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "model": MODEL,
                "max_tokens": 1024,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "image", "source": {"type": "base64", "media_type": mime_type, "data": b64}},
                            {"type": "text", "text": user_prompt},
                        ],
                    }
                ],
            }
            resp = requests.post(API_URL, headers=self._headers(), json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            text = "".join(block.get("text", "") for block in data.get("content", []))
            return ImageAnalysisResult(summary=text, findings=[], provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("Anthropic analyze_image failed, falling back to mock")
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)
