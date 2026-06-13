import api from './axios';
import { CheckoutBody, CheckoutResponse } from '@/types/checkout';

export async function checkout(body: CheckoutBody): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>('/api/order/checkout', body);
  return response.data;
}