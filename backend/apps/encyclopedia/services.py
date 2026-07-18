import json
import logging

from ai.prompts.wellbeing import (
    ROLE_MODEL_SYSTEM_PROMPT,
    WELLBEING_RECOMMENDATION_SYSTEM_PROMPT,
    build_role_model_prompt,
    build_wellbeing_recommendation_prompt,
)
from ai.providers.mock_data import MOCK_ROLE_MODEL_RESULT, MOCK_WELLBEING_RECOMMENDATION_RESULT
from ai.router import TaskType, get_text_provider

from .models import RoleModelQuery, WellbeingRecommendationQuery

logger = logging.getLogger(__name__)


def run_role_model_query(query: RoleModelQuery) -> RoleModelQuery:
    provider = get_text_provider(TaskType.WELLBEING_PERSONALIZATION)
    result = provider.generate_text(ROLE_MODEL_SYSTEM_PROMPT, build_role_model_prompt(query.name))

    if result.is_mock:
        data = MOCK_ROLE_MODEL_RESULT
    else:
        try:
            data = json.loads(result.text)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Role model query %s returned non-JSON", query.id)
            data = {"routine": result.text, "habits": [], "philosophy": ""}

    query.content = data
    query.ai_provider_used = result.provider
    query.is_mock = result.is_mock
    query.save(update_fields=["content", "ai_provider_used", "is_mock", "updated_at"])
    return query


def run_wellbeing_recommendation_query(query: WellbeingRecommendationQuery) -> WellbeingRecommendationQuery:
    provider = get_text_provider(TaskType.WELLBEING_PERSONALIZATION)
    result = provider.generate_text(WELLBEING_RECOMMENDATION_SYSTEM_PROMPT, build_wellbeing_recommendation_prompt(query.goal))

    if result.is_mock:
        data = MOCK_WELLBEING_RECOMMENDATION_RESULT
    else:
        try:
            data = json.loads(result.text)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Wellbeing recommendation query %s returned non-JSON", query.id)
            data = {"recommendations": [result.text]}

    query.content = data
    query.ai_provider_used = result.provider
    query.is_mock = result.is_mock
    query.save(update_fields=["content", "ai_provider_used", "is_mock", "updated_at"])
    return query
