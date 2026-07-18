from ai.prompts.meditation import (
    build_breathing_prompt,
    build_hardship_prompt,
    build_motivation_prompt,
    build_poem_prompt,
)
from ai.router import TaskType, get_speech_provider, get_text_provider

from .models import MeditationEntry, MeditationSession

_ONE_SHOT_PROMPT_BUILDERS = {
    MeditationSession.SessionType.BREATHING: build_breathing_prompt,
    MeditationSession.SessionType.POEM: build_poem_prompt,
    MeditationSession.SessionType.MOTIVATION: build_motivation_prompt,
}


def _generate_entry(session: MeditationSession, user_text: str) -> MeditationEntry:
    guide = session.guide
    text_provider = get_text_provider(TaskType.MEDITATION_GUIDANCE)

    if session.session_type == MeditationSession.SessionType.HARDSHIP:
        history = []
        for entry in session.entries.all():
            history.append({"role": "user", "content": entry.user_text})
            if entry.content:
                history.append({"role": "assistant", "content": entry.content})
        system_prompt, user_prompt = build_hardship_prompt(guide.tone, history, user_text)
    else:
        builder = _ONE_SHOT_PROMPT_BUILDERS[session.session_type]
        system_prompt, user_prompt = builder(guide.tone)

    text_result = text_provider.generate_text(system_prompt, user_prompt)

    speech_provider = get_speech_provider()
    speech_result = speech_provider.synthesize_speech(text_result.text, guide.voice_id or "default")

    return MeditationEntry.objects.create(
        session=session,
        user_text=user_text,
        content=text_result.text,
        audio_url=speech_result.audio_url,
        is_mock=text_result.is_mock or speech_result.is_mock,
        text_provider_used=text_result.provider,
        tts_provider_used=speech_result.provider,
    )


def start_meditation_session(user, guide, session_type: str, user_text: str = "") -> MeditationSession:
    session = MeditationSession.objects.create(user=user, guide=guide, session_type=session_type)
    _generate_entry(session, user_text)
    return session


def continue_meditation_session(session: MeditationSession, user_text: str) -> MeditationEntry:
    return _generate_entry(session, user_text)
