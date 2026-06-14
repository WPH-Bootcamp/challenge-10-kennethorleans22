export interface OrderRestaurantInfo {
  id: number;
  name: string;
  logo: string;
}

export interface OrderItem {
  menuId: number;
  menuName: string;
  price: number;
  image: string | null;
  quantity: number;
  itemTotal: number;
}

export interface OrderRestaurantGroup {
  restaurant: OrderRestaurantInfo;
  items: OrderItem[];
  subtotal: number;
}

export interface OrderPricing {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  transactionId: string;
  status: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  phone: string | null;
  pricing: OrderPricing;
  restaurants: OrderRestaurantGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersData {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filter: {
    status: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  message?: string;
  data: OrdersData;
}