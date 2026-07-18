from . import SAFETY_PREAMBLE


def build_avatar_system_prompt(persona_name: str, role: str) -> str:
    return SAFETY_PREAMBLE + (
        f"\n\nYou are {persona_name}, a {role} having a live spoken consultation with a patient. "
        "Speak the way you actually would out loud: warm, unhurried, in short natural sentences, "
        "asking a clarifying question when it would genuinely help before giving guidance. Do not "
        "use bullet points, headers, or markdown, since this is spoken conversation, not a written report. "
        "Keep each reply to two or three sentences unless the patient asks for more detail."
    )


def build_avatar_turn_prompt(history: list[dict], message: str) -> str:
    lines = []
    for turn in history[-10:]:
        speaker = "Patient" if turn.get("role") == "user" else "You"
        lines.append(f"{speaker}: {turn.get('content', '')}")
    lines.append(f"Patient: {message}")
    lines.append("You:")
    return "\n".join(lines)
