import base64
import logging
import uuid

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from ai.schemas import ImageAnalysisResult, ImageGenerationResult, TextResult

from .base import ImageGenerationProvider, TextProvider, VisionProvider
from .mock_data import MOCK_IMAGE_FINDINGS, MOCK_TEXT_RESPONSE

logger = logging.getLogger(__name__)

API_URL = "https://api.openai.com/v1/chat/completions"
IMAGES_API_URL = "https://api.openai.com/v1/images/generations"
MODEL = "gpt-4o-mini"
IMAGE_MODEL = "dall-e-3"


class OpenAIProvider(TextProvider, VisionProvider, ImageGenerationProvider):
    name = "openai"

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.mock = not bool(self.api_key)

    def _headers(self):
        return {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}

    def generate_text(self, system_prompt: str, user_prompt: str, **kwargs) -> TextResult:
        if self.mock:
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)
        try:
            payload = {
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
            }
            resp = requests.post(API_URL, headers=self._headers(), json=payload, timeout=30)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            return TextResult(text=text, provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("OpenAI generate_text failed, falling back to mock")
            return TextResult(text=MOCK_TEXT_RESPONSE, provider=self.name, is_mock=True)

    def analyze_image(self, system_prompt: str, user_prompt: str, image_bytes: bytes, mime_type: str, **kwargs) -> ImageAnalysisResult:
        if self.mock:
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)
        try:
            b64 = base64.b64encode(image_bytes).decode("utf-8")
            payload = {
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_prompt},
                            {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{b64}"}},
                        ],
                    },
                ],
                "temperature": 0.3,
            }
            resp = requests.post(API_URL, headers=self._headers(), json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            text = data["choices"][0]["message"]["content"]
            return ImageAnalysisResult(summary=text, findings=[], provider=self.name, is_mock=False, raw=data)
        except Exception:
            logger.exception("OpenAI analyze_image failed, falling back to mock")
            return ImageAnalysisResult(summary=MOCK_TEXT_RESPONSE, findings=MOCK_IMAGE_FINDINGS, provider=self.name, is_mock=True)

    def generate_portrait(self, prompt: str, **kwargs) -> ImageGenerationResult:
        if self.mock:
            return ImageGenerationResult(image_url=None, provider=self.name, is_mock=True)
        try:
            payload = {
                "model": IMAGE_MODEL,
                "prompt": prompt,
                "n": 1,
                "size": "1024x1024",
                "quality": "standard",
                "response_format": "b64_json",
            }
            resp = requests.post(IMAGES_API_URL, headers=self._headers(), json=payload, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            image_bytes = base64.b64decode(data["data"][0]["b64_json"])
            filename = f"portraits/{uuid.uuid4()}.png"
            saved_path = default_storage.save(filename, ContentFile(image_bytes))
            image_url = default_storage.url(saved_path)
            return ImageGenerationResult(image_url=image_url, provider=self.name, is_mock=False, raw={"revised_prompt": data["data"][0].get("revised_prompt", "")})
        except Exception:
            logger.exception("OpenAI generate_portrait failed, falling back to mock")
            return ImageGenerationResult(image_url=None, provider=self.name, is_mock=True)
