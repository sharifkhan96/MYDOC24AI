from . import SAFETY_PREAMBLE

TONE_INSTRUCTIONS = {
    "funny": (
        "Your natural tone is light and funny: gentle jokes and playful asides woven in "
        "throughout, but never so much that it undercuts the actual calm you're creating. "
        "Think warm stand-up comedian who genuinely wants you to relax."
    ),
    "moderate": ("Your natural tone is warm, steady, and neutral: reassuring without being flowery, practical and grounded."),
    "serious": (
        "Your natural tone is quiet, contemplative, and a little grave in a good way: unhurried, "
        "sparing with words, comfortable with silence and depth."
    ),
}


def _base(tone: str) -> str:
    return SAFETY_PREAMBLE + f"\n\n{TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS['moderate'])}"


def build_breathing_prompt(tone: str) -> tuple[str, str]:
    system = _base(tone) + (
        "\n\nGuide a short calming breathing exercise spoken aloud. Include a specific, concrete "
        "posture suggestion (how to sit or lie, what to do with hands) and a specific breathing "
        "pattern (e.g. inhale for a count, hold, exhale for a count). Two to three short "
        "paragraphs, plain spoken language, no headers or bullet points."
    )
    return system, "Guide me through a short calming breathing exercise."


def build_poem_prompt(tone: str) -> tuple[str, str]:
    system = _base(tone) + (
        "\n\nWrite a short, original calming poem (8 to 16 lines). Never reproduce or closely "
        "paraphrase an existing copyrighted poem; write something new. After the poem, add one "
        "warm spoken sentence introducing or closing it, as you would aloud."
    )
    return system, "Share a poem with me."


def build_motivation_prompt(tone: str) -> tuple[str, str]:
    system = _base(tone) + (
        "\n\nGive a short, genuine motivational talk, two to three short paragraphs, spoken "
        "aloud style. Ground it in something real and specific rather than generic slogans."
    )
    return system, "Give me some real motivation."


def build_hardship_prompt(tone: str, history: list[dict], message: str) -> tuple[str, str]:
    system = _base(tone) + (
        "\n\nThe person is sharing something difficult they're going through. Respond as a "
        "supportive, present listener: acknowledge what they said specifically, don't rush to "
        "fix it, and only gently suggest a next step if it feels earned. Two short paragraphs at "
        "most. If anything suggests they may be in crisis or at risk of harming themselves, "
        "clearly and warmly point them toward a crisis line or emergency care in addition to "
        "responding with care."
    )
    lines = []
    for turn in history[-10:]:
        speaker = "Person" if turn.get("role") == "user" else "You"
        lines.append(f"{speaker}: {turn.get('content', '')}")
    lines.append(f"Person: {message}")
    lines.append("You:")
    return system, "\n".join(lines)
