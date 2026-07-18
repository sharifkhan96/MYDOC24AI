import { apiClient } from "./client";

export type GuideTone = "funny" | "moderate" | "serious";
export type SessionType = "breathing" | "poem" | "motivation" | "hardship";

export interface MeditationGuide {
  id: number;
  name: string;
  tone: GuideTone;
  avatar_image_url: string;
  tagline: string;
}

export interface MeditationEntry {
  id: number;
  user_text: string;
  content: string;
  audio_url: string | null;
  is_mock: boolean;
  created_at: string;
}

export interface MeditationSession {
  id: number;
  guide: MeditationGuide;
  session_type: SessionType;
  status: "active" | "ended";
  entries: MeditationEntry[];
  created_at: string;
}

export async function listMeditationGuides() {
  const { data } = await apiClient.get<MeditationGuide[]>("/meditation/guides/");
  return data;
}

export async function startMeditationSession(guideId: number, sessionType: SessionType, userText = "") {
  const { data } = await apiClient.post<MeditationSession>("/meditation/sessions/", {
    guide_id: guideId,
    session_type: sessionType,
    user_text: userText,
  });
  return data;
}

export async function continueMeditationSession(sessionId: number, userText: string) {
  const { data } = await apiClient.post<MeditationEntry>(`/meditation/sessions/${sessionId}/entries/`, {
    user_text: userText,
  });
  return data;
}
