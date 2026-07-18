import json
import logging

from ai.prompts.medication import MEDICATION_SYSTEM_PROMPT, build_medication_lookup_prompt
from ai.router import TaskType, get_text_provider

from .models import MedicationReference

logger = logging.getLogger(__name__)


def get_or_generate_medication(name: str) -> tuple[MedicationReference, bool]:
    """Returns (medication, is_mock). Looks up an existing reference entry by
    name first; only calls out to an AI provider for names we don't already
    have, so seeded common medications are instant and free of API calls.
    """
    existing = MedicationReference.objects.filter(name__iexact=name).first()
    if existing:
        return existing, existing.generated_as_mock

    provider = get_text_provider(TaskType.MEDICATION_LOOKUP)
    result = provider.generate_text(MEDICATION_SYSTEM_PROMPT, build_medication_lookup_prompt(name))

    if result.is_mock:
        medication = MedicationReference.objects.create(
            name=name,
            adult_dosing="Demo mode: configure an AI provider key to see real dosing guidance here.",
            how_to_take=result.text,
            is_seeded=False,
            generated_as_mock=True,
        )
        return medication, True

    try:
        data = json.loads(result.text)
    except (json.JSONDecodeError, TypeError):
        logger.warning("Medication lookup for %s returned non-JSON, storing as raw text", name)
        data = {"how_to_take": result.text}

    medication = MedicationReference.objects.create(
        name=name,
        generic_name=data.get("generic_name", ""),
        drug_class=data.get("drug_class", ""),
        adult_dosing=data.get("adult_dosing", ""),
        pediatric_dosing=data.get("pediatric_dosing", ""),
        how_to_take=data.get("how_to_take", ""),
        food_alcohol_interactions=data.get("food_alcohol_interactions", ""),
        common_side_effects=data.get("common_side_effects", ""),
        serious_side_effects=data.get("serious_side_effects", ""),
        missed_dose_guidance=data.get("missed_dose_guidance", ""),
        interaction_warnings=data.get("interaction_warnings", []),
        is_seeded=False,
        generated_as_mock=False,
    )
    return medication, False
