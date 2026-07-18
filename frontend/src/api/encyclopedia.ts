import { apiClient } from "./client";

export type EntryCategory = "clinical" | "wellbeing";

export interface DiseaseEntrySummary {
  id: number;
  name: string;
  slug: string;
  category: EntryCategory;
  overview: string;
}

export interface DiseaseEntryDetail extends DiseaseEntrySummary {
  history: string;
  severity_mortality_context: string;
  treatment_evolution: string;
  current_outlook: string;
  sources: string[];
}

export async function listEncyclopediaEntries(category?: EntryCategory) {
  const { data } = await apiClient.get<DiseaseEntrySummary[]>("/encyclopedia/entries/", {
    params: category ? { category } : undefined,
  });
  return data;
}

export async function getEncyclopediaEntry(slug: string) {
  const { data } = await apiClient.get<DiseaseEntryDetail>(`/encyclopedia/entries/${slug}/`);
  return data;
}

export interface RoleModelContent {
  routine: string;
  habits: string[];
  philosophy: string;
}

export interface RoleModelQuery {
  id: number;
  name: string;
  content: RoleModelContent;
  ai_provider_used: string;
  is_mock: boolean;
  created_at: string;
}

export async function createRoleModelQuery(name: string) {
  const { data } = await apiClient.post<RoleModelQuery>("/encyclopedia/role-model/", { name });
  return data;
}

export interface WellbeingRecommendationContent {
  recommendations: string[];
}

export interface WellbeingRecommendationQuery {
  id: number;
  goal: string;
  content: WellbeingRecommendationContent;
  ai_provider_used: string;
  is_mock: boolean;
  created_at: string;
}

export async function createWellbeingRecommendationQuery(goal: string) {
  const { data } = await apiClient.post<WellbeingRecommendationQuery>("/encyclopedia/recommendations/", { goal });
  return data;
}
