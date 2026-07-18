from . import SAFETY_PREAMBLE

MEDICATION_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou write concise, accurate patient information leaflets. Respond with ONLY a JSON "
    "object, no markdown fences, no commentary, matching exactly this shape: "
    '{"generic_name": str, "drug_class": str, "adult_dosing": str, "pediatric_dosing": str, '
    '"how_to_take": str, "food_alcohol_interactions": str, "common_side_effects": str, '
    '"serious_side_effects": str, "missed_dose_guidance": str, "interaction_warnings": [str, ...]}. '
    "Keep each text field to two or three plain sentences. If pediatric dosing does not apply, say so briefly."
)


def build_medication_lookup_prompt(name: str) -> str:
    return f"Write a patient information entry for the medication: {name}."
