import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/profile';

interface UseProfileOptions {
  enabled?: boolean;
}

export function useProfile({ enabled = true }: UseProfileOptions = {}) {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled,
  });
}