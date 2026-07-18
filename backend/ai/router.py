from enum import Enum

from .providers.anthropic_provider import AnthropicProvider
from .providers.did_provider import DIDProvider
from .providers.openai_speech_provider import OpenAISpeechProvider
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

# MyDoc24 is currently configured around one provider credential.  Keeping
# every task on OpenAI prevents individual pages silently falling back to a
# mock because a second vendor key was not supplied.
TASK_PROVIDER_MAP = {
    TaskType.TRIAGE_REASONING: "openai",
    TaskType.IMAGE_ANALYSIS: "openai",
    TaskType.DOCUMENT_ANALYSIS: "openai",
    TaskType.MEDICATION_LOOKUP: "openai",
    TaskType.LIFESTYLE_REPORT: "openai",
    TaskType.CONVERSATIONAL_VOICE: "openai",
    TaskType.PUBLIC_HEALTH_SUMMARY: "openai",
    TaskType.MEDITATION_GUIDANCE: "openai",
    TaskType.WELLBEING_PERSONALIZATION: "openai",
}


def get_text_provider(task_type: TaskType):
    provider_name = TASK_PROVIDER_MAP[task_type]
    return _TEXT_PROVIDERS[provider_name]()


def get_vision_provider(task_type: TaskType):
    provider_name = TASK_PROVIDER_MAP[task_type]
    return _TEXT_PROVIDERS[provider_name]()


def get_speech_provider():
    return OpenAISpeechProvider()


def get_avatar_provider():
    return DIDProvider()


def get_image_provider():
    return OpenAIProvider()
