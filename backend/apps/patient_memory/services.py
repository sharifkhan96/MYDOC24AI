"""Transparent, deterministic retrieval for the hackathon memory demo."""

import re

from .models import PatientMemory


DEMO_MEMORY_FACTS = [
    {
        "kind": PatientMemory.Kind.ALLERGY,
        "title": "NSAID sensitivity",
        "content": "Reported facial swelling and wheeze after ibuprofen in 2024. Avoid ibuprofen and other NSAIDs until a clinician reviews it.",
        "source": PatientMemory.Source.DEMO,
        "confidence": PatientMemory.Confidence.REPORTED,
        "is_pinned": True,
    },
    {
        "kind": PatientMemory.Kind.MEDICATION,
        "title": "Lisinopril 10 mg every morning",
        "content": "Active blood-pressure medication, reported as taken every morning.",
        "source": PatientMemory.Source.DEMO,
        "confidence": PatientMemory.Confidence.CONFIRMED,
        "is_pinned": True,
    },
    {
        "kind": PatientMemory.Kind.CONDITION,
        "title": "Chronic kidney disease, stage 2",
        "content": "Ongoing condition. Medication recommendations should take kidney health into account.",
        "source": PatientMemory.Source.DEMO,
        "confidence": PatientMemory.Confidence.REPORTED,
        "is_pinned": True,
    },
    {
        "kind": PatientMemory.Kind.SYMPTOM,
        "title": "Recurring headaches after poor sleep",
        "content": "Reported three evening headaches over the past month; usually follows less than six hours of sleep.",
        "source": PatientMemory.Source.DEMO,
        "confidence": PatientMemory.Confidence.REPORTED,
        "is_pinned": False,
    },
    {
        "kind": PatientMemory.Kind.PREFERENCE,
        "title": "Prefers simple next steps",
        "content": "Asked for plain-English explanations and a clear recommendation on when to seek care.",
        "source": PatientMemory.Source.DEMO,
        "confidence": PatientMemory.Confidence.CONFIRMED,
        "is_pinned": False,
    },
]


KIND_KEYWORDS = {
    PatientMemory.Kind.ALLERGY: {"allergy", "allergic", "ibuprofen", "nsaid", "medicine", "medication", "painkiller"},
    PatientMemory.Kind.MEDICATION: {"medicine", "medication", "dose", "drug", "tablet", "ibuprofen", "painkiller", "blood pressure"},
    PatientMemory.Kind.CONDITION: {"kidney", "blood pressure", "condition", "painkiller", "ibuprofen", "nsaid"},
    PatientMemory.Kind.SYMPTOM: {"headache", "pain", "sleep", "symptom", "dizzy", "tired"},
    PatientMemory.Kind.PREFERENCE: {"explain", "simple", "steps", "help"},
    PatientMemory.Kind.CARE_PLAN: {"plan", "appointment", "follow up", "review"},
}


def seed_demo_memories(user):
    """Idempotently attach a realistic, safety-focused history to the local demo user."""
    for fact in DEMO_MEMORY_FACTS:
        PatientMemory.objects.get_or_create(user=user, title=fact["title"], defaults=fact)


def _tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def retrieve_memory(user, query: str = "", limit: int = 5) -> tuple[list[PatientMemory], list[PatientMemory]]:
    """Return pinned safety facts plus the most relevant non-pinned facts for a query."""
    memories = list(PatientMemory.objects.filter(user=user, is_active=True))
    always = [memory for memory in memories if memory.is_pinned]
    query_tokens = _tokens(query)

    def score(memory: PatientMemory):
        haystack = _tokens(f"{memory.title} {memory.content}")
        matches = len(query_tokens & haystack)
        kind_bonus = 3 if query_tokens & KIND_KEYWORDS.get(memory.kind, set()) else 0
        return (matches * 4) + kind_bonus

    ranked = sorted(
        (memory for memory in memories if not memory.is_pinned),
        key=lambda memory: (score(memory), memory.occurred_on or memory.updated_at.date()),
        reverse=True,
    )
    relevant = [memory for memory in ranked if score(memory) > 0][:limit]
    return always, relevant


def memory_context_text(memories: list[PatientMemory]) -> str:
    if not memories:
        return "No patient memory is available for this response."
    lines = [
        "Patient-controlled memory context. Use only when relevant, do not treat patient-reported entries as confirmed diagnoses, and never state that you know more than these records show."
    ]
    for memory in memories:
        source = memory.get_source_display().lower()
        lines.append(f"- [{memory.get_kind_display()} | {source}] {memory.title}: {memory.content}")
    return "\n".join(lines)


def mock_memory_reply(query: str, memories: list[PatientMemory]) -> str:
    """Make zero-key mode visibly demonstrate retrieval without pretending to be clinical AI."""
    facts = "\n".join(f"• {memory.title}: {memory.content}" for memory in memories)
    return (
        "Memory-aware demo — before replying, MyDoc24 retrieved these patient-controlled records:\n"
        f"{facts}\n\n"
        "Those details should shape a real clinician-style response, but they are not a diagnosis or a substitute for professional advice. "
        "For medication or new symptom decisions, a pharmacist or clinician should review the full history—especially where an allergy, kidney condition, or active medicine may be relevant.\n\n"
        "You can inspect, edit, or delete every fact in Health memory."
    )
