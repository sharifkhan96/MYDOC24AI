from . import SAFETY_PREAMBLE

LIFESTYLE_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou review a short lifestyle questionnaire and give a realistic, encouraging assessment. "
    "Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape: "
    '{"summary": str, "strengths": [str, ...], "improvement_areas": [str, ...], "suggestions": [str, ...]}. '
    "If the answers already describe a healthy pattern, say so honestly rather than inventing problems; "
    "focus suggestions on refinement rather than a complete overhaul."
)


def build_lifestyle_prompt(answers: dict) -> str:
    return (
        f"Diet: {answers.get('diet', 'not specified')}\n"
        f"Sleep: {answers.get('sleep', 'not specified')}\n"
        f"Physical activity: {answers.get('activity', 'not specified')}\n"
        f"Stress levels: {answers.get('stress', 'not specified')}\n"
        f"Smoking: {answers.get('smoking', 'not specified')}\n"
        f"Alcohol: {answers.get('alcohol', 'not specified')}"
    )
