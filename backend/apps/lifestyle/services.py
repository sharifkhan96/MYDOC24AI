import json
import logging

from ai.prompts.lifestyle import LIFESTYLE_SYSTEM_PROMPT, build_lifestyle_prompt
from ai.providers.mock_data import MOCK_LIFESTYLE_REPORT
from ai.router import TaskType, get_text_provider

from .models import LifestyleAssessment, LifestyleReport

logger = logging.getLogger(__name__)


def run_lifestyle_report(assessment: LifestyleAssessment) -> LifestyleReport:
    provider = get_text_provider(TaskType.LIFESTYLE_REPORT)
    result = provider.generate_text(LIFESTYLE_SYSTEM_PROMPT, build_lifestyle_prompt(assessment.answers))

    if result.is_mock:
        data = MOCK_LIFESTYLE_REPORT
    else:
        try:
            data = json.loads(result.text)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Lifestyle assessment %s returned non-JSON", assessment.id)
            data = {"summary": result.text, "strengths": [], "improvement_areas": [], "suggestions": []}

    return LifestyleReport.objects.create(
        assessment=assessment,
        summary=data.get("summary", ""),
        strengths=data.get("strengths", []),
        improvement_areas=data.get("improvement_areas", []),
        suggestions=data.get("suggestions", []),
        ai_provider_used=result.provider,
        is_mock=result.is_mock,
    )
