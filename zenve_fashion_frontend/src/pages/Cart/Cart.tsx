import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, Tag, Sparkles } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { cartService } from '../../services/cartService';
import { formatINR } from '../../utils/formatters';

export const Cart: React.FC = () => {
  const {
    items,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    applyPromo,
    removePromo,
    promoCode,
  } = useCartStore();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsApplying(true);
    const result = await cartService.applyPromoCode(inputCode);
    if (result.valid) {
      applyPromo(inputCode.toUpperCase(), result.discountPercentage);
      setPromoMessage(result.message);
      setInputCode('');
    } else {
      setPromoMessage(result.message);
    }
    setIsApplying(false);
  };

  if (items.length === 0) {
    return (
      <div className="w-full bg-[#00140D] min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center text-[#F5F0DF]">
        <div className="w-20 h-20 rounded-full border border-[#E4BD5A]/30 bg-[#001C13] flex items-center justify-center text-[#E4BD5A] mb-5 shadow-2xl">
          <ShoppingBag className="w-9 h-9 stroke-[1.4]" />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
            ATELIER BAG
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF]">Your Bag is Waiting</h1>
          <p className="text-xs sm:text-sm text-[#B8B9A8] leading-relaxed">
            Select hand-finished couture for people, noble pets, and synchronized Twin designs.
          </p>
        </div>
        <Link to="/shop" className="btn-gold mt-8 text-xs py-3.5 px-8 tracking-widest flex items-center space-x-2">
          <span>EXPLORE THE COLLECTION</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#00140D] min-h-screen py-10 sm:py-16 text-left text-[#F5F0DF]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        
        {/* Cart Header */}
        <div className="space-y-1.5 border-b border-[#E4BD5A]/20 pb-6">
          <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
            CURATED ATELIER SELECTIONS
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0DF] tracking-tight">
            Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
          </h1>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Cart Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="hidden sm:grid grid-cols-12 pb-3 border-b border-[#E4BD5A]/20 text-[10px] tracking-[0.2em] uppercase text-[#B8B9A8]">
              <span className="col-span-6">CREATION</span>
              <span className="col-span-2 text-center">QUANTITY</span>
              <span className="col-span-2 text-right">UNIT PRICE</span>
              <span className="col-span-2 text-right">TOTAL</span>
            </div>

            <div className="space-y-6 divide-y divide-[#E4BD5A]/10">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-6 first:pt-0"
                >
                  {/* Product info (col 6) */}
                  <div className="sm:col-span-6 flex space-x-4 items-center">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="w-20 sm:w-24 aspect-[3/4] bg-[#001710] border border-[#E4BD5A]/20 overflow-hidden flex-shrink-0 group relative block"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 image-crisp"
                      />
                    </Link>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-widest text-[#E4BD5A] font-semibold block">
                        {item.product.collection}
                      </span>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-base text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors block line-clamp-1"
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
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] text-[#B8B9A8] hover:text-red-400 flex items-center space-x-1 transition-colors pt-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove piece</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity controls (col 2) */}
                  <div className="sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-[#E4BD5A]/30 bg-[#001710]">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="p-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-mono text-[#F5F0DF] font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="p-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Unit price (col 2) */}
                  <div className="sm:col-span-2 text-left sm:text-right font-serif text-sm text-[#B8B9A8]">
                    <span className="sm:hidden text-xs text-[#B8B9A8] mr-2">Unit:</span>
                    {formatINR(item.price)}
                  </div>

                  {/* Total price (col 2) */}
                  <div className="sm:col-span-2 text-left sm:text-right font-serif text-base text-[#E4BD5A] font-semibold">
                    <span className="sm:hidden text-xs text-[#B8B9A8] mr-2">Total:</span>
                    {formatINR(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Promo Code Card */}
            <div className="bg-[#001710] border border-[#E4BD5A]/25 p-5 space-y-3 shadow-xl">
              <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold flex items-center space-x-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>ATELIER PRIVILEGE CODE</span>
              </span>

              {promoCode ? (
                <div className="flex items-center justify-between p-3 bg-[#002418] border border-emerald-500/40 text-xs">
                  <span className="font-mono text-emerald-300 font-semibold">{promoCode} APPLIED</span>
                  <button
                    onClick={removePromo}
                    className="text-xs text-[#B8B9A8] hover:text-red-400 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="E.g. ZENVE10"
                    className="flex-1 bg-[#00140D] border border-[#E4BD5A]/30 px-3 py-2.5 text-xs text-[#F5F0DF] uppercase placeholder:normal-case focus:outline-none focus:border-[#E4BD5A]"
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="btn-gold px-4 text-xs tracking-wider cursor-pointer"
                  >
                    APPLY
                  </button>
                </form>
              )}

              {promoMessage && (
                <p className="text-[11px] text-[#E4BD5A] italic">{promoMessage}</p>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-[#001710] border border-[#E4BD5A]/30 p-6 sm:p-8 space-y-5 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E4BD5A]" />
              
              <h3 className="font-serif text-xl text-[#F5F0DF] border-b border-[#E4BD5A]/15 pb-3">
                Order Settlement
              </h3>

              <div className="space-y-3 text-xs text-[#B8B9A8]">
                <div className="flex justify-between">
                  <span>Pieces Subtotal:</span>
                  <span className="font-serif text-[#F5F0DF] text-sm">{formatINR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#E4BD5A]">
                    <span>Privilege Courtesy:</span>
                    <span className="font-serif text-sm">- {formatINR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>White-Glove Courier:</span>
                  <span className="text-[#E4BD5A] uppercase font-semibold">
                    {shipping === 0 ? 'COMPLIMENTARY' : formatINR(shipping)}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#E4BD5A]/25 flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase text-[#F5F0DF]">Total Amount:</span>
                  <span className="font-serif text-2xl sm:text-3xl text-[#E4BD5A] font-bold">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-gold py-4 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
              >
                <span>PROCEED TO SECURE CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-3 border-t border-[#E4BD5A]/15 space-y-2 text-[11px] text-[#B8B9A8]/80">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3.5 h-3.5 text-[#E4BD5A] flex-shrink-0" />
                  <span>Complimentary insured shipping across India</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#E4BD5A] flex-shrink-0" />
                  <span>Bespoke garment bags & golden hanger included</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
