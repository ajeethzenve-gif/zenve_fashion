import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, Home, ArrowRight, Truck } from 'lucide-react';
import { Order } from '../../types/order';
import { formatINR } from '../../utils/formatters';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = (location.state as { order?: Order })?.order;

  if (!order) {
    return (
      <div className="w-full bg-[#00140D] min-h-[85vh] flex items-center justify-center py-16 px-4 text-center text-[#F5F0DF]">
        <div className="max-w-md w-full bg-[#001710] border border-[#E4BD5A]/35 p-8 sm:p-12 space-y-6 shadow-2xl">
          <Package className="w-12 h-12 text-[#E4BD5A] mx-auto stroke-[1.5]" />
          <h1 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Atelier Orders</h1>
          <p className="text-xs text-[#B8B9A8] leading-relaxed">
            No active order confirmation in session. View your past wardrobe orders or explore the collections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/account" className="w-full sm:w-auto btn-gold py-3 px-6 text-xs tracking-widest">
              VIEW ORDERS
            </Link>
            <Link to="/shop" className="w-full sm:w-auto btn-outline-gold py-3 px-6 text-xs tracking-widest">
              EXPLORE SHOP
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderNumber = order.orderNumber;
  const orderId = order.id;
  const orderTotal = order.total;

  return (
    <div className="w-full bg-[#00140D] min-h-[85vh] flex items-center justify-center py-16 px-4 text-center text-[#F5F0DF]">
      <div className="max-w-xl w-full bg-[#001710] border border-[#E4BD5A]/35 p-8 sm:p-12 space-y-7 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Golden Corner Notches */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#E4BD5A]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#E4BD5A]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#E4BD5A]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#E4BD5A]" />

        {/* Success Icon */}
        <div className="w-18 h-18 rounded-full border-2 border-[#E4BD5A] flex items-center justify-center mx-auto text-[#E4BD5A] bg-[#002418] shadow-[0_0_20px_rgba(228,189,90,0.4)]">
          <CheckCircle className="w-9 h-9 stroke-[1.5]" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#E4BD5A] font-semibold block">
            ATELIER COMMISSION CONFIRMED
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] tracking-tight">
            Thank you for choosing ZENVE.
          </h1>
          <p className="text-xs text-[#B8B9A8] leading-relaxed max-w-md mx-auto">
            Your tailored garments are now being prepared by our master tailors.
            A confirmation notice and dispatch schedule have been sent to your registered email.
          </p>
        </div>

        {/* Order Number Box */}
        <div className="bg-[#00140D] border border-[#E4BD5A]/25 p-6 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#B8B9A8]">
            YOUR ATELIER ORDER NUMBER
          </p>
          <p className="font-serif text-3xl sm:text-4xl text-[#E4BD5A] font-bold tracking-wider">
            #{orderNumber}
          </p>
          <div className="pt-3 border-t border-[#E4BD5A]/15 flex justify-between text-xs text-[#B8B9A8]">
            <span>Total Settlement:</span>
            <span className="text-[#F5F0DF] font-serif font-bold text-base">{formatINR(orderTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to={`/account/orders/${orderId}`}
            className="w-full sm:w-auto btn-gold py-3 px-6 text-xs tracking-widest flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
          >
            <Truck className="w-4 h-4" />
            <span>TRACK ATELIER SHIPMENT</span>
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto btn-outline-gold py-3 px-6 text-xs tracking-widest flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>CONTINUE SHOPPING</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
