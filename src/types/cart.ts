export interface CartMenuItemDetail {
  id: number;
  foodName: string;
  price: number;
  type: string;
  image: string;
}

export interface CartItem {
  id: number;
  menu: CartMenuItemDetail;
  quantity: number;
  itemTotal: number;
}

export interface CartRestaurantGroup {
  restaurant: {
    id: number;
    name: string;
    logo: string;
  };
  items: CartItem[];
  subtotal: number;
}

export interface CartSummary {
  totalItems: number;
  totalPrice: number;
  restaurantCount: number;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    cart: CartRestaurantGroup[];
    summary: CartSummary;
  };
}