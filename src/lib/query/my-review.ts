import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { submitReview, getMyReviews, updateReview, deleteReview } from '@/lib/api/my-review';
import { MyReviewBody, MyReviewUpdateBody } from '@/types/my-review';

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: MyReviewBody) => submitReview(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => getMyReviews(),
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: MyReviewUpdateBody }) => updateReview(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
}