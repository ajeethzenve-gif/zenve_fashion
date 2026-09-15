import { CartItem } from './cart';
import { Address } from './user';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethodType = 'card' | 'upi' | 'netbanking' | 'cod' | 'razorpay';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethodType;
  shippingAddress: Address;
  estimatedDelivery?: string;
  createdAt: string;
}

export interface CheckoutFormData {
  // Step 1: Customer Information
  fullName: string;
  email: string;
  mobile: string;
  // Step 2: Shipping Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  // Step 3: Delivery Method
  deliveryMethod: 'standard' | 'express' | 'atelier_concierge';
  // Step 4: Payment
  paymentMethod: PaymentMethodType;
}
