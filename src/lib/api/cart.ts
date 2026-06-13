import api from './axios';
import { CartResponse } from '@/types/cart';

export async function getCart(): Promise<CartResponse> {
  const response = await api.get<CartResponse>('/api/cart');
  return response.data;
}

export async function addToCart(data: {
  restaurantId: number;
  menuId: number;
  quantity: number;
}): Promise<{ success: boolean; message: string }> {
  const response = await api.post('/api/cart', data);
  return response.data;
}

export async function updateCartItem(
  id: number,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  const response = await api.put(`/api/cart/${id}`, { quantity });
  return response.data;
}

export async function deleteCartItem(
  id: number
): Promise<{ success: boolean; message: string }> {
  const response = await api.delete(`/api/cart/${id}`);
  return response.data;
}

export async function clearCart(): Promise<{ success: boolean; message: string }> {
  const response = await api.delete('/api/cart');
  return response.data;
}