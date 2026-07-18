"""Canned demo responses used by every provider when its API key is absent.

Keeping these in one place makes the "zero-key acceptance" behavior easy to
audit: every provider's mock branch pulls from here rather than improvising
inline strings.
"""

MOCK_TEXT_RESPONSE = (
    "This is a demo response shown because no AI provider key is configured yet. "
    "Once an API key is added to the .env file, this space will show real "
    "model-generated guidance instead of this placeholder. In general, mild, "
    "short-lived symptoms without red-flag features can often be safely managed "
    "at home with rest, fluids, and over-the-counter relief, while anything "
    "severe, sudden, or unusual is worth having a clinician look at."
)

MOCK_IMAGE_FINDINGS = [
    {"label": "Demo finding", "detail": "No AI provider key configured. This is placeholder analysis text, not a real reading of your upload.", "confidence": "n/a"},
]

MOCK_MEDICATION_NOTE = (
    "Detailed dosing and interaction information for this medication will appear "
    "here once an AI provider key is configured. For now, always follow the "
    "dosing on your prescription label or package insert and ask a pharmacist "
    "about interactions."
)

MOCK_LIFESTYLE_REPORT = {
    "summary": "Demo mode: configure an AI provider key to see a real, personalized lifestyle assessment here instead of this placeholder.",
    "strengths": ["Demo mode: strengths will be identified from your answers once an AI provider key is configured."],
    "improvement_areas": ["Demo mode: improvement areas will appear here once an AI provider key is configured."],
    "suggestions": ["Add an OpenAI, Anthropic, or Gemini key to .env to unlock a real assessment."],
}

MOCK_TRIAGE_RESULT = {
    "likely_causes": [
        {
            "condition": "Demo mode: no AI provider configured",
            "probability": "medium",
            "explanation": "Add an OpenAI, Anthropic, or Gemini key to .env to see a real triage assessment here instead of this placeholder.",
        }
    ],
    "urgency_level": "see_doctor_soon",
    "next_steps": MOCK_TEXT_RESPONSE,
}

MOCK_ROLE_MODEL_RESULT = {
    "routine": "Demo mode: configure an AI provider key to see an illustrative daily routine here instead of this placeholder.",
    "habits": ["Demo mode: habits will appear here once an AI provider key is configured."],
    "philosophy": "Demo mode: no AI provider configured.",
}

MOCK_WELLBEING_RECOMMENDATION_RESULT = {
    "recommendations": [
        "Demo mode: configure an AI provider key to see real, personalized recommendations here instead of this placeholder."
    ],
}
