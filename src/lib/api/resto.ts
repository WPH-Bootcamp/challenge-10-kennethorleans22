import api from "./axios";
import { RestaurantDetailResponse, RecommendedResponse } from '@/types/restaurant';
import { Restaurant, RestaurantListResponse, RestaurantFilters } from "@/types/restaurant";

export async function getRestaurants(filters?: RestaurantFilters): Promise<RestaurantListResponse> {
  const response = await api.get<RestaurantListResponse>("/api/resto", {
    params: filters,
  });
  return response.data;
}

export async function getRecommended(): Promise<RecommendedResponse> {
  const response = await api.get<RecommendedResponse>("/api/resto/recommended");
  return response.data;
}

export async function getBestSeller(page = 1, limit = 10): Promise<RestaurantListResponse> {
  const response = await api.get<RestaurantListResponse>("/api/resto/best-seller", {
    params: { page, limit },
  });
  return response.data;
}

export async function getNearby(range?: number, limit?: number): Promise<RestaurantListResponse> {
  const response = await api.get<RestaurantListResponse>("/api/resto/nearby", {
    params: { range, limit },
  });
  return response.data;
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  const response = await api.get<Restaurant>(`/api/resto/${id}`);
  return response.data;
}

export async function searchRestaurants(q: string, page = 1, limit = 10): Promise<RestaurantListResponse> {
  const response = await api.get<RestaurantListResponse>("/api/resto/search", {
    params: { q, page, limit },
  });
  return response.data;
}

export async function getRestaurantDetail(id: string): Promise<RestaurantDetailResponse> {
  const response = await api.get<RestaurantDetailResponse>(`/api/resto/${id}`);
  return response.data;
}