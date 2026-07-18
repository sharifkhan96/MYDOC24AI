from . import SAFETY_PREAMBLE

ROLE_MODEL_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nThe user has named someone who inspires them (this may be a real, well-known "
    "public figure). Generate an illustrative overview of a healthy daily routine, "
    "habits, and wellness philosophy commonly associated with that kind of person, "
    "based on general public perception, not private or unverified biographical claims. "
    "Be explicit that this is inspirational and illustrative, not a verified factual "
    "account of the named individual's actual life. Respond ONLY with a JSON object: "
    '{"routine": "a short paragraph describing a plausible daily routine", '
    '"habits": ["3 to 5 short habit strings"], '
    '"philosophy": "a short paragraph on the underlying wellness philosophy"}. '
    "No markdown, no commentary outside the JSON."
)


def build_role_model_prompt(name: str) -> str:
    return f"The person who inspires the user is: {name}."


WELLBEING_RECOMMENDATION_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nThe user has stated a wellbeing or beauty goal. Give 4 to 6 concrete, "
    "evidence-informed recommendations framed as popular, currently well-regarded "
    "approaches, not a claim of real-time trend data. Each recommendation should be "
    "one to two sentences, specific and actionable. Respond ONLY with a JSON object: "
    '{"recommendations": ["...", "..."]}. No markdown, no commentary outside the JSON.'
)


def build_wellbeing_recommendation_prompt(goal: str) -> str:
    return f"The user's goal is: {goal}."
