from . import SAFETY_PREAMBLE

TRIAGE_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou perform preliminary symptom triage. Respond with ONLY a JSON object, no markdown "
    "fences, no commentary, matching exactly this shape: "
    '{"likely_causes": [{"condition": str, "probability": "low"|"medium"|"high", "explanation": str}, ...], '
    '"urgency_level": "home_care"|"see_doctor_soon"|"emergency", "next_steps": str}. '
    "List two to four likely causes ordered from most to least probable. Be conservative: if there is "
    "any doubt or any red-flag combination of symptoms, prefer a higher urgency level."
)


def build_triage_prompt(intake_data: dict, health_context: str) -> str:
    parts = [
        f"Main symptom or concern: {intake_data.get('main_symptom', 'not specified')}",
        f"Onset: {intake_data.get('onset', 'not specified')}",
        f"Duration: {intake_data.get('duration', 'not specified')}",
        f"Severity: {intake_data.get('severity', 'not specified')}",
        f"Associated symptoms: {intake_data.get('associated_symptoms', 'none reported')}",
    ]
    if health_context:
        parts.append(f"Relevant health history: {health_context}")
    return "\n".join(parts)
