from . import SAFETY_PREAMBLE

_RESPONSE_SHAPE = (
    'Respond with ONLY a JSON object, no markdown fences, no commentary, matching exactly this shape: '
    '{"summary": str, "findings": [{"label": str, "detail": str}, ...], '
    '"confidence": "low"|"medium"|"high", "flagged_for_clinician": bool}. '
    "Set flagged_for_clinician to true whenever there is any meaningful chance this needs a clinician's eyes."
)

IMAGE_ANALYSIS_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou are looking at a photo a patient uploaded (a skin condition, wound, or similar). "
    "Describe what is visible in plain terms and what it might suggest, while being explicit "
    "about the real limits of assessing a single photo without an in-person exam. " + _RESPONSE_SHAPE
)

DOCUMENT_ANALYSIS_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou are reading the extracted text of a medical document a patient uploaded (a lab report, "
    "prescription, or discharge summary). Explain what the values or content mean in plain terms, "
    "what's within normal range, and what's worth flagging to a doctor. " + _RESPONSE_SHAPE
)


def build_image_prompt(kind_label: str) -> str:
    return f"This photo was uploaded as a '{kind_label}'. Analyze it."


def build_document_prompt(kind_label: str, extracted_text: str) -> str:
    return f"This document was uploaded as a '{kind_label}'. Extracted text follows:\n\n{extracted_text[:8000]}"
