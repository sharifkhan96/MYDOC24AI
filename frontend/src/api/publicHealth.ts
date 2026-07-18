import { apiClient } from "./client";

export interface Bulletin {
  id: number;
  title: string;
  region: string;
  summary: string;
  body: string;
  severity_level: "low" | "moderate" | "high";
  source_links: string[];
  published_at: string;
}

export async function listBulletins() {
  const { data } = await apiClient.get<Bulletin[]>("/public-health/bulletins/");
  return data;
}

export type DestinationType =
  | "cold"
  | "hot_desert"
  | "beach_tropical"
  | "cruise"
  | "forest_jungle"
  | "high_altitude"
  | "urban_city";

export interface TravelAdvisoryQuery {
  id: number;
  destination_type: DestinationType;
  destination_name: string;
  advice: string;
  ai_provider_used: string;
  is_mock: boolean;
  created_at: string;
}

export async function createTravelAdvisory(payload: { destination_type: DestinationType; destination_name: string }) {
  const { data } = await apiClient.post<TravelAdvisoryQuery>("/public-health/travel-advisory/", payload);
  return data;
}
