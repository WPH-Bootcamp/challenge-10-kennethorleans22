import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkout } from '@/lib/api/order';
import { CheckoutBody } from '@/types/checkout';

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutBody) => checkout(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}