import { apiClient } from './api';
import { Order, CheckoutFormData } from '../types/order';
import { CartItem } from '../types/cart';
import { generateOrderNumber } from '../utils/formatters';
import { useAuthStore } from '../store/authStore';

export const orderService = {
  getUserStorageKey(): string | null {
    const currentUser = useAuthStore.getState().user;
    return currentUser?.id ? `zenve_orders_${currentUser.id}` : null;
  },

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
      const response = await apiClient.post<Order>('/orders/', newOrder);
      if (response && response.data && response.data.id) {
        return response.data;
      }
      const storageKey = orderService.getUserStorageKey();
      if (storageKey) {
        const existing = orderService.getLocalOrders();
        existing.unshift(newOrder);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
      return newOrder;
    } catch {
      // Local fallback scoped strictly to this specific customer
      const storageKey = orderService.getUserStorageKey();
      if (storageKey) {
        const existing = orderService.getLocalOrders();
        existing.unshift(newOrder);
        localStorage.setItem(storageKey, JSON.stringify(existing));
      }
      return newOrder;
    }
  },

  /**
   * Get all orders for current user from database or user-scoped local storage
   */
  async getUserOrders(): Promise<Order[]> {
    try {
      const response = await apiClient.get<Order[]>('/orders/');
      if (Array.isArray(response.data)) {
        const storageKey = orderService.getUserStorageKey();
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(response.data));
        }
        return response.data;
      }
    } catch {
      // Offline fallback to customer's own scoped orders
    }

    return orderService.getLocalOrders();
  },

  /**
   * Get single order by ID or orderNumber from database
   */
  async getOrderById(idOrNumber: string): Promise<Order | null> {
    try {
      const response = await apiClient.get<Order>(`/orders/${idOrNumber}/`);
      if (response.data) {
        const storageKey = orderService.getUserStorageKey();
        if (storageKey) {
          const orders = orderService.getLocalOrders();
          const idx = orders.findIndex(
            (o) =>
              o.id === response.data.id ||
              o.orderNumber.toLowerCase() === response.data.orderNumber.toLowerCase()
          );
          if (idx !== -1) {
            orders[idx] = response.data;
            localStorage.setItem(storageKey, JSON.stringify(orders));
          }
        }
        return response.data;
      }
    } catch {
      const orders = orderService.getLocalOrders();
      return (
        orders.find(
          (o) => o.id === idOrNumber || o.orderNumber.toLowerCase() === idOrNumber.toLowerCase()
        ) || null
      );
    }
    return null;
  },

  /**
   * Update order status on backend (Admin / Staff or cancellation)
   */
  async updateOrderStatus(
    idOrNumber: string,
    orderStatus: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<Order | null> {
    try {
      const response = await apiClient.patch<Order>(`/orders/${idOrNumber}/`, {
        orderStatus,
        ...(paymentStatus ? { paymentStatus } : {}),
      });
      if (response.data) {
        const storageKey = orderService.getUserStorageKey();
        if (storageKey) {
          const orders = orderService.getLocalOrders();
          const idx = orders.findIndex(
            (o) =>
              o.id === response.data.id ||
              o.orderNumber.toLowerCase() === response.data.orderNumber.toLowerCase()
          );
          if (idx !== -1) {
            orders[idx] = response.data;
            localStorage.setItem(storageKey, JSON.stringify(orders));
          }
        }
        return response.data;
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
    return null;
  },

  getLocalOrders(): Order[] {
    try {
      const storageKey = orderService.getUserStorageKey();
      if (!storageKey) return [];
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed: Order[] = JSON.parse(data);
        if (Array.isArray(parsed)) {
          const currentUser = useAuthStore.getState().user;
          return parsed.filter((o) => o.userId === currentUser?.id);
        }
      }
    } catch {
      // Ignore parse error
    }
    return [];
  },
};
