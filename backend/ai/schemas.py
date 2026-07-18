from dataclasses import dataclass, field
from typing import Any


@dataclass
class TextResult:
    text: str
    provider: str
    is_mock: bool
    raw: dict = field(default_factory=dict)


@dataclass
class ImageAnalysisResult:
    summary: str
    findings: list
    provider: str
    is_mock: bool
    raw: dict = field(default_factory=dict)


@dataclass
class SpeechResult:
    audio_url: str | None
    provider: str
    is_mock: bool
    raw: dict = field(default_factory=dict)


@dataclass
class AvatarVideoResult:
    video_url: str | None
    status: str  # "processing" | "ready" | "failed" | "skipped"
    provider: str
    is_mock: bool
    provider_job_id: str | None = None
    raw: dict = field(default_factory=dict)


@dataclass
class ImageGenerationResult:
    image_url: str | None
    provider: str
    is_mock: bool
    raw: dict = field(default_factory=dict)
