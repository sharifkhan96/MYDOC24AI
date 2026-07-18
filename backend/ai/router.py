from enum import Enum

from .providers.anthropic_provider import AnthropicProvider
from .providers.did_provider import DIDProvider
from .providers.elevenlabs_provider import ElevenLabsProvider
from .providers.gemini_provider import GeminiProvider
from .providers.openai_provider import OpenAIProvider


class TaskType(str, Enum):
    TRIAGE_REASONING = "triage_reasoning"
    IMAGE_ANALYSIS = "image_analysis"
    DOCUMENT_ANALYSIS = "document_analysis"
    MEDICATION_LOOKUP = "medication_lookup"
    LIFESTYLE_REPORT = "lifestyle_report"
    CONVERSATIONAL_VOICE = "conversational_voice"
    PUBLIC_HEALTH_SUMMARY = "public_health_summary"
    MEDITATION_GUIDANCE = "meditation_guidance"
    WELLBEING_PERSONALIZATION = "wellbeing_personalization"


_TEXT_PROVIDERS = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "gemini": GeminiProvider,
}

# Default provider per task. Careful medical reasoning goes to Anthropic,
# multimodal image/document reading goes to OpenAI, and fast conversational
# turns for the live avatar go to Gemini. All three implement the same
# TextProvider/VisionProvider interface so this mapping is the only place
# that needs to change to rebalance load between vendors.
TASK_PROVIDER_MAP = {
    TaskType.TRIAGE_REASONING: "anthropic",
    TaskType.IMAGE_ANALYSIS: "openai",
    TaskType.DOCUMENT_ANALYSIS: "openai",
    TaskType.MEDICATION_LOOKUP: "anthropic",
    TaskType.LIFESTYLE_REPORT: "anthropic",
    TaskType.CONVERSATIONAL_VOICE: "gemini",
    TaskType.PUBLIC_HEALTH_SUMMARY: "openai",
    TaskType.MEDITATION_GUIDANCE: "anthropic",
    TaskType.WELLBEING_PERSONALIZATION: "anthropic",
}


def get_text_provider(task_type: TaskType):
    provider_name = TASK_PROVIDER_MAP[task_type]
    return _TEXT_PROVIDERS[provider_name]()


def get_vision_provider(task_type: TaskType):
    provider_name = TASK_PROVIDER_MAP[task_type]
    return _TEXT_PROVIDERS[provider_name]()


def get_speech_provider():
    return ElevenLabsProvider()


def get_avatar_provider():
    return DIDProvider()


def get_image_provider():
    return OpenAIProvider()
