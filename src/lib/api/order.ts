import api from './axios';
import { CheckoutBody, CheckoutResponse } from '@/types/checkout';
import { OrdersResponse } from '@/types/order';

export async function checkout(body: CheckoutBody): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>('/api/order/checkout', body);
  return response.data;
}

export async function getOrders(status?: string): Promise<OrdersResponse> {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  const response = await api.get<OrdersResponse>('/api/order/my-order', { params });
  return response.data;
}