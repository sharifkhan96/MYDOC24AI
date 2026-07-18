from ai.prompts.avatar import build_avatar_system_prompt, build_avatar_turn_prompt
from ai.router import TaskType, get_avatar_provider, get_speech_provider, get_text_provider

from .models import AvatarSession, AvatarTurn


def create_turn(session: AvatarSession, user_text: str) -> AvatarTurn:
    persona = session.persona
    history = []
    for turn in session.turns.all():
        history.append({"role": "user", "content": turn.user_text})
        if turn.assistant_text:
            history.append({"role": "assistant", "content": turn.assistant_text})

    text_provider = get_text_provider(TaskType.CONVERSATIONAL_VOICE)
    text_result = text_provider.generate_text(
        build_avatar_system_prompt(persona.name, persona.get_role_display()),
        build_avatar_turn_prompt(history, user_text),
    )

    speech_provider = get_speech_provider()
    speech_result = speech_provider.synthesize_speech(text_result.text, persona.voice_id or "default")

    avatar_provider = get_avatar_provider()
    video_result = avatar_provider.generate_avatar_video(persona.avatar_image_url, speech_result.audio_url, text_result.text)

    is_mock = text_result.is_mock or speech_result.is_mock

    return AvatarTurn.objects.create(
        session=session,
        user_text=user_text,
        assistant_text=text_result.text,
        tts_audio_url=speech_result.audio_url,
        video_url=video_result.video_url,
        video_status=video_result.status,
        provider_job_id=video_result.provider_job_id or "",
        text_provider_used=text_result.provider,
        tts_provider_used=speech_result.provider,
        avatar_provider_used=video_result.provider,
        is_mock=is_mock,
    )


def refresh_turn_video(turn: AvatarTurn) -> AvatarTurn:
    if turn.video_status != AvatarTurn.VideoStatus.PROCESSING or not turn.provider_job_id:
        return turn
    avatar_provider = get_avatar_provider()
    result = avatar_provider.check_video_status(turn.provider_job_id)
    turn.video_status = result.status
    if result.video_url:
        turn.video_url = result.video_url
    turn.save(update_fields=["video_status", "video_url", "updated_at"])
    return turn
