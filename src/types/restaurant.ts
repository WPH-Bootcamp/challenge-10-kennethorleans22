import { MenuItem } from './menu';
import { Review } from './review';

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
  priceRange: { min: number; max: number };
  coordinates?: { lat: number; long: number };
}

export interface RecommendedRestaurant {
  id: number;
  name: string;
  star: number;
  place: string;
  lat: number;
  long: number;
  logo: string;
  images: string[];
  category: string;
  reviewCount: number;
  sampleMenus: {
    id: number;
    foodName: string;
    price: number;
    type: string;
    image: string;
  }[];
  isFrequentlyOrdered: boolean;
}

export interface RecommendedResponse {
  success: boolean;
  message: string;
  data: {
    recommendations: RecommendedRestaurant[];
    message: string;
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
  lat?: number;
  long?: number;
  range?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export interface RestaurantDetailResponse {
  success: boolean;
  message: string;
  data: Restaurant & {
    menus: MenuItem[];
    reviews: Review[];
  };
}