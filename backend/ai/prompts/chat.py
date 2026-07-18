from . import SAFETY_PREAMBLE

CHAT_SYSTEM_PROMPT = SAFETY_PREAMBLE + (
    "\n\nYou are having an ongoing conversation with this person about their health, wellbeing, "
    "or a beauty or lifestyle question. Reply conversationally in a few short paragraphs at most, "
    "the way a warm, unhurried clinician would, not as a bulleted reference document."
)


def build_chat_prompt(history: list[dict], message: str) -> str:
    lines = []
    for turn in history[-10:]:
        speaker = "User" if turn.get("role") == "user" else "Assistant"
        lines.append(f"{speaker}: {turn.get('content', '')}")
    lines.append(f"User: {message}")
    lines.append("Assistant:")
    return "\n".join(lines)
