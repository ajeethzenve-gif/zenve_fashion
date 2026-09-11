import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Scissors,
  Navigation,
  ShieldCheck,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types/order';
import { formatINR } from '../../utils/formatters';

interface TrackingStep {
  key: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp?: string;
}

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setIsLoading(false);
    }
    load();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#00140D] space-y-4">
        <div className="w-10 h-10 border-2 border-[#E4BD5A] border-t-transparent rounded-full animate-spin" />
        <span className="font-serif text-xs tracking-[0.25em] text-[#E4BD5A] uppercase">
          RETRIEVING ATELIER ARCHIVE...
        </span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#00140D] px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-full border border-[#E4BD5A]/30 flex items-center justify-center text-[#E4BD5A]">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Order Record Not Located</h2>
        <p className="text-xs text-[#B8B9A8] max-w-sm">
          The requested atelier commission could not be found in active records.
        </p>
        <button onClick={() => navigate('/account/orders')} className="btn-gold text-xs py-3 px-6 tracking-widest">
          RETURN TO ALL ORDERS
        </button>
      </div>
    );
  }

  // Calculate current stage index in tracking flow
  const trackingSteps: TrackingStep[] = [
    {
      key: 'placed',
      label: 'Order Confirmed',
      subtitle: 'Verified by Concierge',
      icon: Clock,
      timestamp: new Date(order.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      key: 'processing',
      label: 'Atelier Tailoring',
      subtitle: 'Artisan Inspection & Cut',
      icon: Scissors,
      timestamp:
        order.orderStatus !== 'placed'
          ? new Date(new Date(order.createdAt).getTime() + 86400000).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Pending schedule',
    },
    {
      key: 'shipped',
      label: 'Dispatched / In Transit',
      subtitle: 'Zenve White-Glove Logistics',
      icon: Truck,
      timestamp:
        order.orderStatus === 'shipped' || order.orderStatus === 'delivered'
          ? 'Bengaluru Central Hub'
          : 'Pending dispatch',
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      subtitle: 'Courier Concierge En Route',
      icon: Navigation,
      timestamp:
        order.orderStatus === 'delivered' ? 'Completed' : 'Expected: ' + (order.estimatedDelivery || 'Tomorrow'),
    },
    {
      key: 'delivered',
      label: 'Hand-Delivered',
      subtitle: 'Received into Client Care',
      icon: CheckCircle,
      timestamp: order.orderStatus === 'delivered' ? 'Hand-Delivered' : 'Pending final handover',
    },
  ];

  // Map order status to numeric step index (0 to 4)
  const getActiveStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'processing':
        return 1;
      case 'shipped':
        return 2; // For demo purposes, shipped shows step 2 as active/current
      case 'delivered':
        return 4;
      default:
        return 2;
    }
  };

  const activeIndex = getActiveStepIndex(order.orderStatus);

  return (
    <div className="w-full bg-[#00140D] min-h-screen py-10 sm:py-16 text-left text-[#F5F0DF]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4BD5A]/15 pb-4 text-xs">
          <div className="flex items-center space-x-2 text-[#B8B9A8]">
            <Link to="/account" className="text-[#E4BD5A] hover:underline flex items-center space-x-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>MY ACCOUNT</span>
            </Link>
            <span>/</span>
            <Link to="/account/orders" className="hover:text-[#F5F0DF]">
              ORDERS
            </Link>
            <span>/</span>
            <span className="text-[#F5F0DF] font-mono">#{order.orderNumber}</span>
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 text-[#E4BD5A] hover:text-[#F5F0DF] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="tracking-widest uppercase text-[11px]">PRINT INVOICE</span>
          </button>
        </div>

        {/* 1. ORDER HERO BANNER */}
        <div className="bg-[#001C13] border border-[#E4BD5A]/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          {/* Subtle Corner Highlights */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E4BD5A]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E4BD5A]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E4BD5A]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E4BD5A]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#E4BD5A]/15">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="bg-[#E4BD5A] text-[#00140D] text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-0.5">
                  COMMISSION RECORD
                </span>
                <span className="text-[11px] font-mono text-[#E4BD5A]">
                  AWB: ZNV-EXP-{order.orderNumber}-BLR
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-[#B8B9A8]">
                Commissioned on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#00140D] border border-[#E4BD5A]/40 px-4 py-2.5 flex items-center space-x-2.5">
                <span className="w-2 h-2 rounded-full bg-[#E4BD5A] animate-ping" />
                <span className="text-xs tracking-wider uppercase font-semibold text-[#E4BD5A]">
                  STATUS: {order.orderStatus === 'shipped' ? 'DISPATCHED / IN TRANSIT' : order.orderStatus.toUpperCase()}
                </span>
              </div>

              <div className="bg-[#002418] border border-[#E4BD5A]/25 px-4 py-2.5 text-xs">
                <span className="text-[10px] text-[#B8B9A8] block uppercase">ESTIMATED ARRIVAL</span>
                <span className="text-[#F5F0DF] font-serif font-medium text-sm">
                  {order.estimatedDelivery || 'Tomorrow by 6:00 PM'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. SHIPMENT TRACKING STEPPER (Requested by User) */}
          <div className="pt-8 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-semibold tracking-[0.25em] uppercase text-[#E4BD5A] flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>WHITE-GLOVE SHIPMENT PROGRESS</span>
              </h3>
              <span className="text-[11px] text-[#B8B9A8]">
                Carrier: <strong className="text-[#F5F0DF]">Zenve Express Courier</strong>
              </span>
            </div>

            {/* Desktop Stepper */}
            <div className="relative hidden md:block">
              {/* Background Line */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-[#002B1D] border-t border-[#E4BD5A]/20 -z-0" />
              {/* Active Highlight Line */}
              <div
                className="absolute top-5 left-8 h-0.5 bg-[#E4BD5A] transition-all duration-500 -z-0 shadow-[0_0_8px_rgba(228,189,90,0.6)]"
                style={{
                  width: `${(activeIndex / (trackingSteps.length - 1)) * 90}%`,
                }}
              />

              <div className="grid grid-cols-5 gap-2 relative z-10">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isCurrent = idx === activeIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[#002B1D] border-2 border-[#E4BD5A] text-[#E4BD5A]'
                            : isCurrent
                            ? 'bg-[#E4BD5A] text-[#00140D] border-2 border-[#F5F0DF] shadow-[0_0_15px_rgba(228,189,90,0.8)] ring-4 ring-[#E4BD5A]/30'
                            : 'bg-[#001710] border border-[#E4BD5A]/25 text-[#B8B9A8]/60'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5 stroke-[2]" />
                        )}
                      </div>

                      {/* Step Title */}
                      <div className="space-y-0.5">
                        <span
                          className={`text-xs font-semibold block tracking-wider uppercase ${
                            isCurrent
                              ? 'text-[#E4BD5A]'
                              : isCompleted
                              ? 'text-[#F5F0DF]'
                              : 'text-[#B8B9A8]/70'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-[#B8B9A8] block leading-tight">
                          {step.subtitle}
                        </span>
                        <span className="text-[9px] font-mono text-[#E4BD5A]/80 block pt-0.5">
                          {step.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="block md:hidden space-y-4 pt-2">
              {trackingSteps.map((step, idx) => {
                const isCompleted = idx < activeIndex;
                const isCurrent = idx === activeIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex items-start space-x-3.5 text-left">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? 'bg-[#002B1D] border-2 border-[#E4BD5A] text-[#E4BD5A]'
                            : isCurrent
                            ? 'bg-[#E4BD5A] text-[#00140D] shadow-[0_0_10px_rgba(228,189,90,0.7)]'
                            : 'bg-[#001710] border border-[#E4BD5A]/20 text-[#B8B9A8]/50'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <StepIcon className="w-4 h-4" />
                        )}
                      </div>
                      {idx < trackingSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${
                            isCompleted ? 'bg-[#E4BD5A]' : 'bg-[#002B1D] border-l border-[#E4BD5A]/20'
                          }`}
                        />
                      )}
                    </div>

                    <div className="pt-0.5 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider ${
                            isCurrent ? 'text-[#E4BD5A]' : isCompleted ? 'text-[#F5F0DF]' : 'text-[#B8B9A8]'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="bg-[#E4BD5A]/20 text-[#E4BD5A] border border-[#E4BD5A]/40 text-[9px] px-1.5 py-0.2 font-mono uppercase">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#B8B9A8]">{step.subtitle}</p>
                      <p className="text-[10px] text-[#E4BD5A]/75 font-mono">{step.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT: ITEMS & METRICS 2-COL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Pieces in Order (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#001C13] border border-[#E4BD5A]/25 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E4BD5A]/15 pb-4">
                <h3 className="font-serif text-xl sm:text-2xl text-[#F5F0DF]">
                  Atelier Creations ({order.items.length})
                </h3>
                <span className="text-[10px] tracking-[0.2em] text-[#E4BD5A] uppercase">
                  COMPLIMENTARY PACKAGING
                </span>
              </div>

              <div className="space-y-4 divide-y divide-[#E4BD5A]/10">
                {order.items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex space-x-4 items-center justify-between">
                    <div className="flex space-x-4 items-center">
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="w-20 sm:w-24 aspect-[3/4] overflow-hidden bg-[#00140D] border border-[#E4BD5A]/20 flex-shrink-0 group relative block"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 image-crisp"
                        />
                      </Link>

                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#E4BD5A] font-semibold">
                          {item.product.collection}
                        </span>
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif text-base sm:text-lg text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors block line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#B8B9A8]">
                          <span>Size: <strong className="text-[#F5F0DF]">{item.selectedSize}</strong></span>
                          <span>·</span>
                          <span className="flex items-center space-x-1">
                            <span>Color:</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block border border-[#E4BD5A]/50"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            <strong className="text-[#F5F0DF]">{item.selectedColor.name}</strong>
                          </span>
                          <span>·</span>
                          <span>Qty: <strong className="text-[#F5F0DF]">{item.quantity}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-serif text-lg text-[#E4BD5A] whitespace-nowrap pl-4">
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Destination, Payment & Financial Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Delivery Destination */}
            <div className="bg-[#001C13] border border-[#E4BD5A]/25 p-6 space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold flex items-center space-x-2 border-b border-[#E4BD5A]/15 pb-2.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>SHIPPING DESTINATION</span>
              </h4>
              <div className="text-xs text-[#F5F0DF] space-y-1">
                <p className="font-semibold text-sm">{order.shippingAddress.fullName}</p>
                <p className="text-[#B8B9A8]">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="text-[#B8B9A8]">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="text-[#B8B9A8]">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-[#E4BD5A]/90 pt-1 font-mono">{order.shippingAddress.mobile}</p>
              </div>
            </div>

            {/* Payment Disposition */}
            <div className="bg-[#001C13] border border-[#E4BD5A]/25 p-6 space-y-3">
              <h4 className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold flex items-center space-x-2 border-b border-[#E4BD5A]/15 pb-2.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>PAYMENT DISPOSITION</span>
              </h4>
              <div className="text-xs space-y-1.5 text-[#B8B9A8]">
                <div className="flex justify-between">
                  <span>Settlement Method:</span>
                  <strong className="text-[#F5F0DF] uppercase">{order.paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className="text-[#E4BD5A] font-semibold uppercase">{order.paymentStatus}</span>
                </div>
                <div className="flex items-center space-x-1.5 pt-2 text-[11px] text-[#B8B9A8]/80">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E4BD5A]" />
                  <span>256-bit Encrypted Transaction Guarantee</span>
                </div>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="bg-[#001C13] border border-[#E4BD5A]/30 p-6 space-y-4">
              <h4 className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold border-b border-[#E4BD5A]/15 pb-2.5">
                SETTLEMENT SUMMARY
              </h4>
              <div className="space-y-2.5 text-xs text-[#B8B9A8]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#F5F0DF] font-serif">{formatINR(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#E4BD5A]">
                    <span>Privilege Courtesy:</span>
                    <span className="font-serif">- {formatINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove Shipping:</span>
                  <span className="text-[#E4BD5A] uppercase font-semibold">COMPLIMENTARY</span>
                </div>
                <div className="pt-3 border-t border-[#E4BD5A]/25 flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase text-[#F5F0DF]">Total Paid:</span>
                  <span className="font-serif text-2xl text-[#E4BD5A] font-bold">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
