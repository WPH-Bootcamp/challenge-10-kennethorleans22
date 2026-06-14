import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkout, getOrders } from '@/lib/api/order';
import { clearCart } from '@/lib/api/cart';
import { CheckoutBody } from '@/types/checkout';

export function useCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CheckoutBody) => checkout(body),
    onSuccess: async () => {
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['orders', status ?? 'all'],
    queryFn: () => getOrders(status),
  });
}