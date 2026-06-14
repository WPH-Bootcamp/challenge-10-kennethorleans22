export interface MyReviewBody {
  transactionId: string;
  restaurantId: number;
  star: number;
  comment?: string;
}

export interface MyReviewUpdateBody {
  star?: number;
  comment?: string;
}

export interface MyReviewResponse {
  success: boolean;
  message: string;
}

export interface MyReview {
  id: number;
  star: number;
  comment: string | null;
  createdAt: string;
  transactionId: string;
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
}

export interface MyReviewsResponse {
  success: boolean;
  data: {
    reviews: MyReview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}