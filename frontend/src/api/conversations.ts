import { apiClient } from "./client";

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  ai_provider_used: string;
  is_mock: boolean;
  created_at: string;
}

export interface ConversationSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetail extends ConversationSummary {
  messages: Message[];
}

export async function listConversations() {
  const { data } = await apiClient.get<{ results: ConversationSummary[] } | ConversationSummary[]>("/conversations/");
  return Array.isArray(data) ? data : data.results;
}

export async function createConversation() {
  const { data } = await apiClient.post<ConversationSummary>("/conversations/", {});
  return data;
}

export async function getConversation(id: number) {
  const { data } = await apiClient.get<ConversationDetail>(`/conversations/${id}/`);
  return data;
}

export async function deleteConversation(id: number) {
  await apiClient.delete(`/conversations/${id}/`);
}

export async function sendMessage(conversationId: number, content: string) {
  const { data } = await apiClient.post<{ user_message: Message; assistant_message: Message }>(
    `/conversations/${conversationId}/messages/`,
    { content },
  );
  return data;
}

export interface EphemeralTurn {
  role: "user" | "assistant";
  content: string;
}

export async function sendEphemeralMessage(history: EphemeralTurn[], message: string) {
  const { data } = await apiClient.post<{ reply: string; provider: string; is_mock: boolean }>(
    "/conversations/ephemeral-message/",
    { history, message },
  );
  return data;
}
