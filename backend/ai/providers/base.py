from abc import ABC, abstractmethod

from ai.schemas import AvatarVideoResult, ImageAnalysisResult, ImageGenerationResult, SpeechResult, TextResult


class TextProvider(ABC):
    @abstractmethod
    def generate_text(self, system_prompt: str, user_prompt: str, **kwargs) -> TextResult:
        ...


class VisionProvider(ABC):
    @abstractmethod
    def analyze_image(self, system_prompt: str, user_prompt: str, image_bytes: bytes, mime_type: str, **kwargs) -> ImageAnalysisResult:
        ...


class SpeechProvider(ABC):
    @abstractmethod
    def synthesize_speech(self, text: str, voice_id: str, **kwargs) -> SpeechResult:
        ...


class AvatarProvider(ABC):
    @abstractmethod
    def generate_avatar_video(self, source_image_url: str, audio_url: str | None, text: str, **kwargs) -> AvatarVideoResult:
        ...

    @abstractmethod
    def check_video_status(self, provider_job_id: str) -> AvatarVideoResult:
        ...


class ImageGenerationProvider(ABC):
    @abstractmethod
    def generate_portrait(self, prompt: str, **kwargs) -> ImageGenerationResult:
        ...
