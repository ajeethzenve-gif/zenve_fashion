import { apiClient } from './api';
import { Order, CheckoutFormData } from '../types/order';
import { CartItem } from '../types/cart';
import { generateOrderNumber } from '../utils/formatters';
import { useAuthStore } from '../store/authStore';

// Store placed orders in localStorage for instant retrieval across sessions if offline
const STORAGE_KEY = 'zenve_orders';

export const orderService = {
  /**
   * Create and place a new order in database
   */
  async createOrder(
    formData: CheckoutFormData,
    items: CartItem[],
    total: number,
    discount: number,
    shipping: number
  ): Promise<Order> {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currentUser = useAuthStore.getState().user;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      userId: currentUser?.id || 'guest',
      items,
      subtotal,
      discount,
      shipping,
      total,
      paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'completed',
      orderStatus: 'placed',
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        id: `addr-${Date.now()}`,
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
      },
      estimatedDelivery: '3-5 Business Days',
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await apiClient.post<Order>('/orders', newOrder);
      if (response && response.data && response.data.id) {
        return response.data;
      }
      const existing = orderService.getLocalOrders();
      existing.unshift(newOrder);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return newOrder;
    } catch {
      // Local fallback for client session
      const existing = orderService.getLocalOrders();
      existing.unshift(newOrder);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      return newOrder;
    }
  },

  /**
   * Get all orders for current user from database or local storage
   */
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders');
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch {
      // Offline fallback to locally stored placed orders
    }

    return orderService.getLocalOrders();
  },

  /**
   * Get single order by ID or orderNumber from database
   */
  async getOrderById(idOrNumber: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${idOrNumber}`);
      return response.data || null;
    } catch {
      const orders = orderService.getLocalOrders();
      return (
        orders.find(
          (o) => o.id === idOrNumber || o.orderNumber.toLowerCase() === idOrNumber.toLowerCase()
        ) || null
      );
    }
  },

  getLocalOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: Order[] = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse error
    }
    return [];
  },
};
