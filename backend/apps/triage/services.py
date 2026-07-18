import json
import logging

from ai.providers.mock_data import MOCK_TRIAGE_RESULT
from ai.prompts.triage import TRIAGE_SYSTEM_PROMPT, build_triage_prompt
from ai.router import TaskType, get_text_provider

from .models import TriageResult, TriageSession

logger = logging.getLogger(__name__)


def build_health_context(user) -> str:
    conditions = list(user.conditions.values_list("name", flat=True))
    allergies = list(user.allergies.values_list("allergen", flat=True))
    medications = list(user.medications.filter(is_active=True).values_list("name", flat=True))

    parts = []
    if conditions:
        parts.append(f"conditions: {', '.join(conditions)}")
    if allergies:
        parts.append(f"allergies: {', '.join(allergies)}")
    if medications:
        parts.append(f"current medications: {', '.join(medications)}")
    return "; ".join(parts)


def run_triage(session: TriageSession) -> TriageResult:
    health_context = build_health_context(session.user)
    provider = get_text_provider(TaskType.TRIAGE_REASONING)
    result = provider.generate_text(TRIAGE_SYSTEM_PROMPT, build_triage_prompt(session.intake_data, health_context))

    if result.is_mock:
        data = MOCK_TRIAGE_RESULT
    else:
        try:
            data = json.loads(result.text)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Triage session %s returned non-JSON, falling back to a conservative default", session.id)
            data = {
                "likely_causes": [],
                "urgency_level": TriageResult.Urgency.SEE_DOCTOR_SOON,
                "next_steps": result.text,
            }

    return TriageResult.objects.create(
        session=session,
        likely_causes=data.get("likely_causes", []),
        urgency_level=data.get("urgency_level", TriageResult.Urgency.SEE_DOCTOR_SOON),
        next_steps=data.get("next_steps", ""),
        ai_provider_used=result.provider,
        is_mock=result.is_mock,
    )
