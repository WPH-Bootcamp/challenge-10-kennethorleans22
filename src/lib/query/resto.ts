import { useQuery } from "@tanstack/react-query";
import { getRestaurants, getBestSeller, searchRestaurants, getRestaurantDetail } from '@/lib/api/resto';
import { RestaurantFilters } from "@/types/restaurant";

export function useRestaurants(filters?: RestaurantFilters) {
  return useQuery({
    queryKey: ["restaurants", filters],
    queryFn: () => getRestaurants(filters),
  });
}

export function useBestSeller() {
  return useQuery({
    queryKey: ["restaurants", "best-seller"],
    queryFn: () => getBestSeller(),
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