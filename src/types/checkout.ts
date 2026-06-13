export interface CheckoutItem {
  menuId: number;
  quantity: number;
}

export interface CheckoutRestaurant {
  restaurantId: number;
  items: CheckoutItem[];
}

export interface CheckoutBody {
  restaurants: CheckoutRestaurant[];
  deliveryAddress: string;
  phone?: string;
  paymentMethod?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  data: Record<string, unknown>;
}