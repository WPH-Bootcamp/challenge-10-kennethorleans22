import api from './axios';
import { MyReviewBody, MyReviewUpdateBody, MyReviewResponse, MyReviewsResponse } from '@/types/my-review';

export async function submitReview(body: MyReviewBody): Promise<MyReviewResponse> {
  const response = await api.post<MyReviewResponse>('/api/review', body);
  return response.data;
}

export async function getMyReviews(): Promise<MyReviewsResponse> {
  const response = await api.get<MyReviewsResponse>('/api/review/my-reviews');
  return response.data;
}

export async function updateReview(id: number, body: MyReviewUpdateBody): Promise<MyReviewResponse> {
  const response = await api.put<MyReviewResponse>(`/api/review/${id}`, body);
  return response.data;
}

export async function deleteReview(id: number): Promise<MyReviewResponse> {
  const response = await api.delete<MyReviewResponse>(`/api/review/${id}`);
  return response.data;
}