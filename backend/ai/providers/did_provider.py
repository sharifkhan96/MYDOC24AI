import logging

import requests
from django.conf import settings

from ai.schemas import AvatarVideoResult

from .base import AvatarProvider

logger = logging.getLogger(__name__)

API_URL = "https://api.d-id.com/talks"


class DIDProvider(AvatarProvider):
    """Wraps a D-ID-style talking-avatar API.

    Real generation is asynchronous: creating a talk returns a job id, and the
    rendered video is fetched later by polling. Callers should treat
    "processing" as the normal immediate result and poll check_video_status.
    """

    name = "did"

    def __init__(self):
        self.api_key = settings.DID_API_KEY
        self.mock = not bool(self.api_key)

    def generate_avatar_video(self, source_image_url: str, audio_url: str | None, text: str, **kwargs) -> AvatarVideoResult:
        if self.mock or not source_image_url:
            return AvatarVideoResult(video_url=None, status="skipped", provider=self.name, is_mock=True)
        try:
            if audio_url:
                script = {"type": "audio", "audio_url": audio_url}
            else:
                script = {"type": "text", "input": text}
            payload = {"source_url": source_image_url, "script": script}
            resp = requests.post(API_URL, json=payload, auth=(self.api_key, ""), timeout=30)
            resp.raise_for_status()
            data = resp.json()
            job_id = data.get("id")
            return AvatarVideoResult(video_url=None, status="processing", provider=self.name, is_mock=False, provider_job_id=job_id, raw=data)
        except Exception:
            logger.exception("D-ID generate_avatar_video failed, falling back to mock")
            return AvatarVideoResult(video_url=None, status="failed", provider=self.name, is_mock=True)

    def check_video_status(self, provider_job_id: str) -> AvatarVideoResult:
        if self.mock or not provider_job_id:
            return AvatarVideoResult(video_url=None, status="skipped", provider=self.name, is_mock=True)
        try:
            resp = requests.get(f"{API_URL}/{provider_job_id}", auth=(self.api_key, ""), timeout=30)
            resp.raise_for_status()
            data = resp.json()
            did_status = data.get("status")
            if did_status == "done":
                return AvatarVideoResult(video_url=data.get("result_url"), status="ready", provider=self.name, is_mock=False, provider_job_id=provider_job_id, raw=data)
            if did_status == "error":
                return AvatarVideoResult(video_url=None, status="failed", provider=self.name, is_mock=False, provider_job_id=provider_job_id, raw=data)
            return AvatarVideoResult(video_url=None, status="processing", provider=self.name, is_mock=False, provider_job_id=provider_job_id, raw=data)
        except Exception:
            logger.exception("D-ID check_video_status failed")
            return AvatarVideoResult(video_url=None, status="failed", provider=self.name, is_mock=True, provider_job_id=provider_job_id)
