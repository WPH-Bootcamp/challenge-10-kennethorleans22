import { useMutation, useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/profile';
import { updateProfile } from '@/lib/api/auth';

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

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
  });
}