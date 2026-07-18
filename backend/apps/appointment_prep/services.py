"""Build a transparent, patient-facing brief from records the patient already owns."""

from apps.avatar_sessions.models import AvatarTurn
from apps.conversations.models import Message
from apps.health_profile.models import Allergy, Condition, Medication
from apps.media_analysis.models import UploadedMedia
from apps.patient_memory.services import retrieve_memory
from apps.triage.models import TriageSession


def _shorten(value: str, limit: int = 220) -> str:
    value = " ".join(value.split())
    return value if len(value) <= limit else f"{value[:limit - 1].rstrip()}..."


def _item(title: str, detail: str, source: str) -> dict:
    return {"title": title, "detail": _shorten(detail), "source": source}


def _symptom_detail(session: TriageSession) -> str:
    intake = session.intake_data or {}
    details = [intake.get("main_symptom", "Symptom check completed")]
    if intake.get("onset"):
        details.append(f"started {intake['onset']}")
    if intake.get("duration"):
        details.append(f"lasting {intake['duration']}")
    if intake.get("severity"):
        details.append(f"reported as {intake['severity']}")
    if intake.get("associated_symptoms"):
        details.append(f"with {intake['associated_symptoms']}")
    if hasattr(session, "result") and session.result:
        details.append(f"symptom-check next step: {session.result.get_urgency_level_display().lower()}")
    return "; ".join(details)


def build_appointment_brief(user, reason: str = "") -> dict:
    """Return only the signed-in user's existing information, ready to review with a clinician."""
    reason = reason.strip()
    always, relevant = retrieve_memory(user, reason, limit=4)
    memory_items = [*always, *relevant]
    details = [_item(memory.title, memory.content, "Health memory") for memory in memory_items]

    # Health-profile facts are included as a fallback for users who have not created memory entries yet.
    for allergy in Allergy.objects.filter(user=user)[:3]:
        details.append(_item(allergy.allergen, f"Reaction: {allergy.reaction or 'not recorded'}; severity: {allergy.get_severity_display().lower()}.", "Health profile"))
    for medication in Medication.objects.filter(user=user, is_active=True)[:3]:
        dosage = " ".join(part for part in [medication.dosage, medication.frequency] if part)
        details.append(_item(medication.name, dosage or "Active medication.", "Health profile"))
    for condition in Condition.objects.filter(user=user, status=Condition.Status.ONGOING)[:3]:
        details.append(_item(condition.name, condition.notes or "Ongoing condition.", "Health profile"))

    recent_updates = []
    triage_sessions = list(TriageSession.objects.filter(user=user).select_related("result")[:2])
    for session in triage_sessions:
        recent_updates.append(_item("Symptom check", _symptom_detail(session), "Symptom check"))

    media_items = list(UploadedMedia.objects.filter(user=user).select_related("analysis")[:2])
    for media in media_items:
        if hasattr(media, "analysis") and media.analysis:
            recent_updates.append(
                _item(
                    media.get_kind_display(),
                    media.analysis.summary or "A structured review is available in Photo & test review.",
                    "Photo & test review",
                )
            )

    avatar_turns = list(AvatarTurn.objects.filter(session__user=user).order_by("-created_at")[:2])
    for turn in avatar_turns:
        recent_updates.append(_item("Live doctor conversation", turn.user_text, "Talk to doctor"))

    chat_messages = list(Message.objects.filter(conversation__user=user, role=Message.Role.USER).order_by("-created_at")[:2])
    for message in chat_messages:
        recent_updates.append(_item("Saved health chat", message.content, "Saved chat"))

    questions = []
    if reason:
        questions.append(f"What could be contributing to: {reason}?")
    else:
        questions.append("What should I focus on during this appointment?")
    if details:
        questions.append("Do any of my current medicines, allergies, or conditions change the next steps?")
    if recent_updates:
        questions.append("Do these recent changes need further tests, monitoring, or a follow-up plan?")
    questions.append("What symptoms should prompt me to seek care sooner?")

    sources = [
        {"label": "Health memory", "count": len(memory_items)},
        {"label": "Health profile", "count": Allergy.objects.filter(user=user).count() + Medication.objects.filter(user=user, is_active=True).count() + Condition.objects.filter(user=user, status=Condition.Status.ONGOING).count()},
        {"label": "Recent health updates", "count": len(recent_updates)},
    ]

    detail_lines = [f"- {item['title']}: {item['detail']}" for item in details] or ["- No health details have been added yet."]
    update_lines = [f"- {item['title']}: {item['detail']}" for item in recent_updates] or ["- No recent symptom checks, uploads, or conversations to include."]
    summary_text = "\n".join(
        [
            "MYDOC24 APPOINTMENT BRIEF",
            "",
            f"Main concern: {reason or 'To discuss my current health and next steps.'}",
            "",
            "Health details to share:",
            *detail_lines,
            "",
            "Recent updates:",
            *update_lines,
            "",
            "Questions to discuss:",
            *[f"- {question}" for question in questions],
            "",
            "This summary is patient-reported and informational. It does not replace clinical records or professional advice.",
        ]
    )

    return {
        "main_concern": reason or "To discuss my current health and next steps.",
        "health_details": details,
        "recent_updates": recent_updates,
        "questions": questions,
        "sources": sources,
        "summary_text": summary_text,
    }
