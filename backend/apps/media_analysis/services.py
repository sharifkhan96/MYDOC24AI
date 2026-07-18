import json
import logging

from pypdf import PdfReader

from ai.prompts.media_analysis import (
    DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
    IMAGE_ANALYSIS_SYSTEM_PROMPT,
    build_document_prompt,
    build_image_prompt,
)
from ai.providers.mock_data import MOCK_IMAGE_FINDINGS, MOCK_TEXT_RESPONSE
from ai.router import TaskType, get_text_provider, get_vision_provider

from .models import AnalysisResult, UploadedMedia

logger = logging.getLogger(__name__)


def _extract_pdf_text(file) -> str:
    try:
        file.seek(0)
        reader = PdfReader(file)
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        logger.exception("Failed to extract PDF text for uploaded media")
        return ""


def analyze_media(media: UploadedMedia) -> AnalysisResult:
    kind_label = media.get_kind_display()

    if media.is_image:
        provider = get_vision_provider(TaskType.IMAGE_ANALYSIS)
        media.file.seek(0)
        image_bytes = media.file.read()
        result = provider.analyze_image(
            IMAGE_ANALYSIS_SYSTEM_PROMPT,
            build_image_prompt(kind_label),
            image_bytes,
            media.content_type or "image/jpeg",
        )
        if result.is_mock:
            return AnalysisResult.objects.create(
                media=media,
                summary=result.summary,
                structured_findings=MOCK_IMAGE_FINDINGS,
                confidence="n/a",
                flagged_for_clinician=False,
                ai_provider_used=result.provider,
                is_mock=True,
            )
        try:
            data = json.loads(result.summary)
        except (json.JSONDecodeError, TypeError):
            data = {"summary": result.summary, "findings": [], "confidence": "low", "flagged_for_clinician": True}
        return AnalysisResult.objects.create(
            media=media,
            summary=data.get("summary", ""),
            structured_findings=data.get("findings", []),
            confidence=data.get("confidence", ""),
            flagged_for_clinician=data.get("flagged_for_clinician", False),
            ai_provider_used=result.provider,
            is_mock=False,
        )

    # Document path: extract text, then run through the text provider.
    extracted_text = _extract_pdf_text(media.file) if media.content_type == "application/pdf" else ""
    provider = get_text_provider(TaskType.DOCUMENT_ANALYSIS)
    text_result = provider.generate_text(
        DOCUMENT_ANALYSIS_SYSTEM_PROMPT,
        build_document_prompt(kind_label, extracted_text or "(no extractable text found in this file)"),
    )

    if text_result.is_mock:
        return AnalysisResult.objects.create(
            media=media,
            summary=MOCK_TEXT_RESPONSE,
            structured_findings=MOCK_IMAGE_FINDINGS,
            confidence="n/a",
            flagged_for_clinician=False,
            ai_provider_used=text_result.provider,
            is_mock=True,
        )
    try:
        data = json.loads(text_result.text)
    except (json.JSONDecodeError, TypeError):
        data = {"summary": text_result.text, "findings": [], "confidence": "low", "flagged_for_clinician": True}
    return AnalysisResult.objects.create(
        media=media,
        summary=data.get("summary", ""),
        structured_findings=data.get("findings", []),
        confidence=data.get("confidence", ""),
        flagged_for_clinician=data.get("flagged_for_clinician", False),
        ai_provider_used=text_result.provider,
        is_mock=False,
    )
