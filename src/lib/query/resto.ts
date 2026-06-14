import { useQuery } from "@tanstack/react-query";
import {
  getRestaurants,
  getRecommended,
  getBestSeller,
  getNearby,
  searchRestaurants,
  getRestaurantDetail,
} from '@/lib/api/resto';
import { RestaurantFilters } from "@/types/restaurant";

export function useRestaurants(filters?: RestaurantFilters, enabled = true) {
  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: () => getRestaurants(filters),
    enabled,
  });
}

export function useRecommended(enabled = true) {
  return useQuery({
    queryKey: ["restaurants", "recommended"],
    queryFn: () => getRecommended(),
    enabled,
  });
}

export function useBestSeller(enabled = true) {
  return useQuery({
    queryKey: ["restaurants", "best-seller"],
    queryFn: () => getBestSeller(),
    enabled,
  });
}

export function useNearby(enabled = true) {
  return useQuery({
    queryKey: ["restaurants", "nearby"],
    queryFn: () => getNearby(),
    enabled,
  });
}

export function useSearchRestaurants(q: string) {
  return useQuery({
    queryKey: ["restaurants", "search", q],
    queryFn: () => searchRestaurants(q),
    enabled: q.length > 0,
  });
}

export function useRestaurantDetail(id: string) {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantDetail(id),
    enabled: !!id,
  });
}