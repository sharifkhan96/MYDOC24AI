from ai.prompts.travel import build_travel_advisory_prompt
from ai.router import TaskType, get_text_provider

from .models import TravelAdvisoryQuery


def run_travel_advisory(query: TravelAdvisoryQuery) -> TravelAdvisoryQuery:
    system_prompt, user_prompt = build_travel_advisory_prompt(query.destination_type, query.destination_name)
    provider = get_text_provider(TaskType.PUBLIC_HEALTH_SUMMARY)
    result = provider.generate_text(system_prompt, user_prompt)

    query.advice = result.text
    query.ai_provider_used = result.provider
    query.is_mock = result.is_mock
    query.save(update_fields=["advice", "ai_provider_used", "is_mock", "updated_at"])
    return query
