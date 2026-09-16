import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Truck, CheckCircle, Clock, Scissors, Printer } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types/order';
import { formatINR } from '../../utils/formatters';
import { OrderInvoiceModal } from '../../components/orders/OrderInvoiceModal';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#E4BD5A] border-t-transparent rounded-full animate-spin mx-auto" />
        <span className="text-xs text-[#E4BD5A] tracking-[0.2em] uppercase font-mono">
          LOADING ATELIER ORDERS...
        </span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center bg-[#001710] border border-[#E4BD5A]/25 p-8 sm:p-12 space-y-5 shadow-xl relative">
        <div className="w-16 h-16 rounded-full border border-[#E4BD5A]/30 flex items-center justify-center text-[#E4BD5A] mx-auto bg-[#001F15]">
          <Package className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-serif text-2xl text-[#F5F0DF]">No Atelier Orders Found</h3>
          <p className="text-xs text-[#B8B9A8] max-w-sm mx-auto">
            Your private wardrobe commissions and luxury purchases will be archived here.
          </p>
        </div>
        <Link to="/shop" className="btn-gold inline-block text-xs py-3 px-6 tracking-widest">
          BROWSE ATELIER DESIGNS
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#002418] border border-[#E4BD5A]/40 text-[#E4BD5A] text-[10px] font-semibold tracking-wider uppercase">
            <Clock className="w-3 h-3" />
            <span>ORDER CONFIRMED</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#002B1D] border border-[#E4BD5A]/50 text-[#E4BD5A] text-[10px] font-semibold tracking-wider uppercase">
            <Scissors className="w-3 h-3" />
            <span>ATELIER TAILORING</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#002418] border border-[#E4BD5A] text-[#E4BD5A] text-[10px] font-bold tracking-wider uppercase shadow-[0_0_8px_rgba(228,189,90,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E4BD5A] animate-ping mr-0.5" />
            <Truck className="w-3 h-3" />
            <span>DISPATCHED / IN TRANSIT</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-[10px] font-semibold tracking-wider uppercase">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>HAND-DELIVERED</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-[#001710] border border-[#E4BD5A]/30 text-[#E4BD5A] text-[10px] uppercase font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-[#001710] border border-[#E4BD5A]/25 p-6 sm:p-8 space-y-6 hover:border-[#E4BD5A]/50 transition-all duration-300 shadow-xl text-left relative group"
        >
          {/* Subtle Corner Notch */}
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E4BD5A]/60" />

          {/* Top Bar: Order Info & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4BD5A]/15 gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B8B9A8]">ORDER</span>
                <span className="font-serif text-[#E4BD5A] text-lg sm:text-xl font-medium tracking-wide">
                  #{order.orderNumber}
                </span>
              </div>
              <p className="text-[11px] text-[#B8B9A8]">
                Commissioned on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {getStatusBadge(order.orderStatus)}
            </div>
          </div>

          {/* Pieces Preview */}
          <div className="space-y-3">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#B8B9A8] block">
              PIECES IN THIS SHIPMENT ({order.items.length})
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3.5 bg-[#00140D] border border-[#E4BD5A]/15 p-3"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-18 aspect-[3/4] object-cover border border-[#E4BD5A]/20 flex-shrink-0 image-crisp"
                  />
                  <div className="space-y-0.5 overflow-hidden text-xs">
                    <span className="text-[9px] uppercase tracking-widest text-[#E4BD5A] block truncate">
                      {item.product.collection}
                    </span>
                    <h5 className="font-serif text-sm text-[#F5F0DF] truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] text-[#B8B9A8]">
                      Size: {item.selectedSize} · Qty: {item.quantity}
                    </p>
                    <span className="font-serif text-[#E4BD5A] text-xs font-semibold block pt-0.5">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Total & Tracking CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-[#E4BD5A]/15 gap-4">
            <div className="flex items-baseline space-x-2">
              <span className="text-xs uppercase text-[#B8B9A8] tracking-wider">Settlement Total:</span>
              <span className="font-serif text-xl sm:text-2xl text-[#E4BD5A] font-bold">
                {formatINR(order.total)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSelectedInvoiceOrder(order)}
                className="btn-outline-gold py-2 px-4 text-xs tracking-widest flex items-center justify-center space-x-1.5 cursor-pointer hover:bg-[#E4BD5A] hover:text-[#00140D] transition-all"
                title="View & Download Official Tax Invoice"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>TAX INVOICE</span>
              </button>

              <Link
                to={`/account/orders/${order.id}`}
                className="btn-gold py-2 px-5 text-xs tracking-widest flex items-center justify-center space-x-2 group-hover:shadow-luxury-gold transition-all"
              >
                <span>TRACK SHIPMENT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Official Tax Invoice Modal for selected order */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          isOpen={Boolean(selectedInvoiceOrder)}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
