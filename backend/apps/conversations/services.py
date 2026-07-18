from ai.prompts.chat import CHAT_SYSTEM_PROMPT, build_chat_prompt
from ai.router import TaskType, get_text_provider
from apps.patient_memory.services import memory_context_text, mock_memory_reply, retrieve_memory

from .models import Conversation, Message


def _generate_reply(history: list[dict], message: str, user):
    always, relevant = retrieve_memory(user, message)
    memories = [*always, *relevant]
    provider = get_text_provider(TaskType.CONVERSATIONAL_VOICE)
    result = provider.generate_text(
        f"{CHAT_SYSTEM_PROMPT}\n\n{memory_context_text(memories)}",
        build_chat_prompt(history, message),
    )
    if result.is_mock and memories:
        result.text = mock_memory_reply(message, memories)
    return result, memories


def send_message(conversation: Conversation, content: str) -> tuple[Message, Message, list]:
    history = list(conversation.messages.values("role", "content"))
    user_message = Message.objects.create(conversation=conversation, role=Message.Role.USER, content=content)

    result, memories = _generate_reply(history, content, conversation.user)
    assistant_message = Message.objects.create(
        conversation=conversation,
        role=Message.Role.ASSISTANT,
        content=result.text,
        ai_provider_used=result.provider,
        is_mock=result.is_mock,
    )

    if not conversation.title:
        conversation.title = content[:60]
        conversation.save(update_fields=["title", "updated_at"])
    else:
        conversation.save(update_fields=["updated_at"])

    return user_message, assistant_message, memories


def send_ephemeral_message(history: list[dict], message: str):
    result = _generate_reply(history, message)
    return {"reply": result.text, "provider": result.provider, "is_mock": result.is_mock}
