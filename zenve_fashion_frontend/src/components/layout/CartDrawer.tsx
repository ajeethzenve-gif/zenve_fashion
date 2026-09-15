import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { formatINR } from '../../utils/formatters';

export const CartDrawer: React.FC = () => {
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const { items, removeItem, increaseQuantity, decreaseQuantity, getSubtotal } = useCartStore();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const handleViewBag = () => {
    closeCartDrawer();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeCartDrawer}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-[#001C13] border-l border-[#E4BD5A]/25 h-full flex flex-col justify-between shadow-2xl z-10 animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-[#E4BD5A]/15 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-5 h-5 text-[#E4BD5A]" />
            <h3 className="font-serif text-xl text-[#F5F0DF] tracking-wide">
              Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={closeCartDrawer}
            aria-label="Close cart"
            className="p-1.5 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Line items list or Empty state */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full border border-[#E4BD5A]/30 flex items-center justify-center text-[#E4BD5A]/60 mb-2">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl text-[#F5F0DF]">Your bag is waiting.</h4>
              <p className="text-xs text-[#B8B9A8] max-w-xs leading-relaxed">
                Explore our couture creations across People, Pets and coordinated Twin designs.
              </p>
              <button
                onClick={() => {
                  closeCartDrawer();
                  navigate('/shop');
                }}
                className="btn-gold mt-4 text-xs"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex space-x-4 border-b border-[#E4BD5A]/10 pb-5"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product.slug}`}
                  onClick={closeCartDrawer}
                  className="w-20 h-24 sm:w-24 sm:h-28 bg-[#002B1D] border border-[#E4BD5A]/15 overflow-hidden flex-shrink-0"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCartDrawer}
                        className="font-serif text-sm sm:text-base text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors leading-snug line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[#B8B9A8] hover:text-red-400 p-1 ml-2 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#B8B9A8] mt-1">
                      Size: <span className="text-[#F5F0DF]">{item.selectedSize}</span> · Color:{' '}
                      <span className="text-[#F5F0DF]">{item.selectedColor.name}</span>
                    </p>
                    <p className="text-xs font-serif text-[#E4BD5A] mt-1">
                      {formatINR(item.price)}
                    </p>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-[#E4BD5A]/30">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="p-1 px-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs text-[#F5F0DF] font-medium min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="p-1 px-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-serif text-xs sm:text-sm text-[#F5F0DF]">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E4BD5A]/20 bg-[#001710] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#B8B9A8]">
                <span>Complimentary India Shipping</span>
                <span className="text-[#E4BD5A] font-medium">FREE</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm tracking-wider uppercase text-[#F5F0DF]">
                  Subtotal
                </span>
                <span className="font-serif text-xl text-[#E4BD5A] font-medium">
                  {formatINR(subtotal)}
                </span>
              </div>
              <p className="text-[10px] text-[#B8B9A8] italic">
                Taxes calculated at atelier checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={handleCheckout}
                className="w-full btn-gold py-3 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewBag}
                className="w-full btn-outline-gold py-2.5 text-xs tracking-[0.2em]"
              >
                VIEW FULL BAG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
