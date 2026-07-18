from ai.prompts.chat import CHAT_SYSTEM_PROMPT, build_chat_prompt
from ai.router import TaskType, get_text_provider

from .models import Conversation, Message


def _generate_reply(history: list[dict], message: str):
    provider = get_text_provider(TaskType.CONVERSATIONAL_VOICE)
    return provider.generate_text(CHAT_SYSTEM_PROMPT, build_chat_prompt(history, message))


def send_message(conversation: Conversation, content: str) -> tuple[Message, Message]:
    history = list(conversation.messages.values("role", "content"))
    user_message = Message.objects.create(conversation=conversation, role=Message.Role.USER, content=content)

    result = _generate_reply(history, content)
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

    return user_message, assistant_message


def send_ephemeral_message(history: list[dict], message: str):
    result = _generate_reply(history, message)
    return {"reply": result.text, "provider": result.provider, "is_mock": result.is_mock}
