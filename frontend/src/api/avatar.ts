import { apiClient } from "./client";

export type PersonaRole = "doctor" | "nurse";
export type PersonaGender = "male" | "female";

export interface Persona {
  id: number;
  name: string;
  role: PersonaRole;
  gender: PersonaGender;
  tagline: string;
  avatar_image_url: string;
}

export type VideoStatus = "processing" | "ready" | "failed" | "skipped";

export interface AvatarTurn {
  id: number;
  user_text: string;
  assistant_text: string;
  tts_audio_url: string | null;
  video_url: string | null;
  video_status: VideoStatus;
  is_mock: boolean;
  created_at: string;
}

export interface AvatarSession {
  id: number;
  persona: Persona;
  status: "active" | "ended";
  turns: AvatarTurn[];
  created_at: string;
}

export async function listPersonas() {
  const { data } = await apiClient.get<Persona[]>("/avatar/personas/");
  return data;
}

export async function createAvatarSession(personaId: number) {
  const { data } = await apiClient.post<AvatarSession>("/avatar/sessions/", { persona_id: personaId });
  return data;
}

export async function sendAvatarTurn(sessionId: number, userText: string) {
  const { data } = await apiClient.post<AvatarTurn>(`/avatar/sessions/${sessionId}/turns/`, { user_text: userText });
  return data;
}

export async function pollAvatarTurn(sessionId: number, turnId: number) {
  const { data } = await apiClient.get<AvatarTurn>(`/avatar/sessions/${sessionId}/turns/${turnId}/`);
  return data;
}

export async function endAvatarSession(sessionId: number) {
  const { data } = await apiClient.post<AvatarSession>(`/avatar/sessions/${sessionId}/end/`);
  return data;
}
