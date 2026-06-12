export interface Restaurant {
  id: number;
  name: string;
  star: number;
  place: string;
  logo: string;
  images: string[];
  category: string;
  reviewCount: number;
  menuCount: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface RestaurantPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RestaurantListResponse {
  success: boolean;
  message: string;
  data: {
    restaurants: Restaurant[];
    pagination: RestaurantPagination;
    filters: {
      range: number | null;
      priceMin: number | null;
      priceMax: number | null;
      rating: number | null;
      category: string | null;
    };
  };
}

export interface RestaurantFilters {
  location?: string;
  range?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  category?: string;
  page?: number;
  limit?: number;
}