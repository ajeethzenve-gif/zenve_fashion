import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  MapPin,
  Tag,
  Smartphone,
  Building,
  Banknote,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import { addressService } from '../../services/addressService';
import { formatINR } from '../../utils/formatters';

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  upiId: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    items = [],
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    clearCart,
    removeItem,
    applyPromo,
    promoCode,
  } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);

  const user = useAuthStore((state) => state.user);

  // Load saved addresses strictly for the authenticated customer
  const [savedAddresses, setSavedAddresses] = useState<any[]>(() => {
    return user?.addresses && Array.isArray(user.addresses) ? user.addresses : [];
  });

  useEffect(() => {
    let mounted = true;
    async function loadAddresses() {
      if (!user) {
        if (mounted) setSavedAddresses([]);
        return;
      }
      const backendAddrs = await addressService.getAddresses();
      if (mounted) {
        if (backendAddrs.length > 0) {
          setSavedAddresses(backendAddrs);
        } else if (user?.addresses && user.addresses.length > 0) {
          setSavedAddresses(user.addresses);
        } else {
          setSavedAddresses([]);
        }
      }
    }
    loadAddresses();
    return () => {
      mounted = false;
    };
  }, [user]);

  const defaultAddress = savedAddresses.find((a) => a && a.isDefault) || savedAddresses[0] || null;

  const subtotal = typeof getSubtotal === 'function' ? getSubtotal() : 0;
  const discount = typeof getDiscount === 'function' ? getDiscount() : 0;
  const shipping = typeof getShipping === 'function' ? getShipping() : 0;
  const total = typeof getTotal === 'function' ? getTotal() : subtotal - discount + shipping;

  const [formData, setFormData] = useState<FormData>(() => {
    const initialAddr = defaultAddress || user?.addresses?.[0];
    return {
      fullName: initialAddr?.fullName || initialAddr?.name || user?.name || '',
      email: initialAddr?.email || user?.email || '',
      mobile: initialAddr?.mobile
        ? String(initialAddr.mobile).replace(/[^0-9]/g, '')
        : initialAddr?.phone
        ? String(initialAddr.phone).replace(/[^0-9]/g, '')
        : user?.phone
        ? String(user.phone).replace(/[^0-9]/g, '')
        : '',
      addressLine1: initialAddr?.addressLine1 || '',
      addressLine2: initialAddr?.addressLine2 || '',
      city: initialAddr?.city || '',
      state: initialAddr?.state || '',
      pincode: initialAddr?.pincode || '',
      country: initialAddr?.country || 'India',
      paymentMethod: 'cod',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      upiId: '',
    };
  });

  // Automatically sync saved address if user hydrates after mount
  useEffect(() => {
    if (!formData.addressLine1 && savedAddresses.length > 0) {
      const addr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
      if (addr) {
        handleSelectSavedAddress(addr);
      }
    }
  }, [savedAddresses]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setOrderError(null);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSelectSavedAddress = (addr: any) => {
    if (!addr) return;
    setFormData((prev) => ({
      ...prev,
      fullName: addr.fullName || addr.name || prev.fullName,
      email: addr.email || prev.email,
      mobile: addr.mobile
        ? String(addr.mobile).replace(/[^0-9]/g, '')
        : addr.phone
        ? String(addr.phone).replace(/[^0-9]/g, '')
        : prev.mobile,
      addressLine1: addr.addressLine1 || prev.addressLine1,
      addressLine2: addr.addressLine2 || '',
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || prev.pincode,
      country: addr.country || prev.country,
    }));
    setErrors({});
    setOrderError(null);
  };

  const handleApplyPromoCode = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!promoInput.trim()) return;
    const code = promoInput.trim().toUpperCase();
    if (code === 'ZENVE10' || code === 'ATELIER10' || code === 'FIRST') {
      applyPromo(code, 10);
      setPromoMessage('10% Atelier Privileges Applied');
    } else {
      setPromoMessage('Invalid promo code. Try ZENVE10');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full legal name is required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address required';
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/[^0-9]/g, '').length < 10) {
      newErrors.mobile = 'Valid 10-digit mobile number required';
    }
    if (!formData.addressLine1.trim() || formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.pincode.trim() || formData.pincode.replace(/[^0-9]/g, '').length < 6) {
      newErrors.pincode = 'Valid 6-digit Indian PIN code required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    if (!validateForm()) {
      setOrderError('Please complete all required delivery details (Name, Mobile, Address, City, PIN code) above.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Initiate payment request (COD instantly passes)
      const payReq = await paymentService.initiatePayment({
        orderId: `temp-${Date.now()}`,
        amount: total,
        currency: 'INR',
        gateway: formData.paymentMethod === 'cod' ? 'cod' : 'razorpay',
      });

      // 2. Verify payment if online gateway
      if (formData.paymentMethod !== 'cod') {
        await paymentService.verifyPayment({
          orderId: payReq.orderId,
          paymentId: payReq.paymentId,
        });
      }

      // 3. Create persistent Order in database or localStorage
      const createdOrder = await orderService.createOrder(
        {
          fullName: formData.fullName,
          email: formData.email,
          mobile: formData.mobile,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
          deliveryMethod: 'standard',
          paymentMethod: formData.paymentMethod,
        },
        items,
        total,
        discount,
        shipping
      );

      // 4. Clear cart items
      clearCart();

      // 5. Navigate to order confirmation
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'Unable to complete order settlement. Please try again.';
      setOrderError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-[#00140D] text-center p-6 text-[#F5F0DF]">
        <div className="w-16 h-16 rounded-full border border-[#E4BD5A]/30 flex items-center justify-center text-[#E4BD5A] mb-4">
          <Truck className="w-8 h-8 stroke-[1.4]" />
        </div>
        <h2 className="font-serif text-3xl text-[#F5F0DF]">Your Bag is Empty</h2>
        <p className="text-xs text-[#B8B9A8] mt-2 mb-6">
          Add pieces from the atelier collection to proceed to checkout.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="btn-gold px-8 py-3.5 text-xs uppercase tracking-widest cursor-pointer"
        >
          EXPLORE COLLECTIONS
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#00140D] min-h-screen py-10 sm:py-16 text-left text-[#F5F0DF]">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#E4BD5A]/20 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
              ATELIER CONCIERGE CHECKOUT
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] tracking-tight">
              Order Settlement
            </h1>
          </div>
        </div>

        {/* 2-Column Grid: Left Form | Right Summary */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Address & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Delivery Address Card */}
            <div className="bg-[#001710] border border-[#E4BD5A]/25 p-6 sm:p-8 space-y-6 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-[#E4BD5A]/15 pb-3">
                <div className="flex items-center space-x-2 text-[#E4BD5A]">
                  <MapPin className="w-4 h-4 stroke-[1.5]" />
                  <h2 className="font-serif text-xl sm:text-2xl text-[#F5F0DF]">1. Delivery Residence</h2>
                </div>
              </div>

              {/* Saved Address Quick Switcher if available */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2.5 pb-2">
                  <p className="text-[11px] text-[#B8B9A8] uppercase tracking-wider">
                    Select from saved residences:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedAddresses.map((addr, idx) => (
                      <button
                        key={addr.id || `addr-${idx}`}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`text-left p-3.5 border transition-all space-y-0.5 cursor-pointer ${
                          formData.addressLine1 === addr.addressLine1
                            ? 'border-[#E4BD5A] bg-[#002418] shadow-sm ring-1 ring-[#E4BD5A]'
                            : 'border-[#E4BD5A]/20 bg-[#00140D] hover:border-[#E4BD5A]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-xs font-medium text-[#E4BD5A]">
                            {addr.label || (addr.isDefault ? 'Primary Residence' : `Residence ${idx + 1}`)}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-[#E4BD5A] text-[#00140D] px-1.5 py-0.2 font-bold uppercase">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#F5F0DF] font-medium truncate">
                          {addr.fullName || addr.name || 'Atelier Patron'}
                        </p>
                        <p className="text-[11px] text-[#B8B9A8] truncate">
                          {addr.addressLine1}, {addr.city} {addr.pincode}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="e.g. Raghavendra Varma"
                    className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-[11px] mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Email Address (For Invoice) *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Mobile Contact *
                    </label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    />
                    {errors.mobile && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.mobile}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Residence / Suite / Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="Penthouse 4B, Kingfisher Towers, Ashok Nagar"
                    className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                  />
                  {errors.addressLine1 && (
                    <p className="text-red-400 text-[11px] mt-1">{errors.addressLine1}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                    Apartment / Area / Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="Near UB City"
                    className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Bengaluru"
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    />
                    {errors.city && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Karnataka"
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    />
                    {errors.state && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder="560001"
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 p-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A] transition-colors"
                    />
                    {errors.pincode && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="bg-[#001710] border border-[#E4BD5A]/25 p-6 sm:p-8 space-y-6 shadow-xl relative">
              <div className="flex items-center space-x-2 text-[#E4BD5A] border-b border-[#E4BD5A]/15 pb-3">
                <CreditCard className="w-4 h-4 stroke-[1.5]" />
                <h2 className="font-serif text-xl sm:text-2xl text-[#F5F0DF]">2. Payment Disposition</h2>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'card')}
                  className={`p-4 border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#E4BD5A] bg-[#002418] text-[#E4BD5A] shadow-md ring-1 ring-[#E4BD5A]'
                      : 'border-[#E4BD5A]/20 bg-[#00140D] text-[#B8B9A8] hover:border-[#E4BD5A]/50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'upi')}
                  className={`p-4 border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                    formData.paymentMethod === 'upi'
                      ? 'border-[#E4BD5A] bg-[#002418] text-[#E4BD5A] shadow-md ring-1 ring-[#E4BD5A]'
                      : 'border-[#E4BD5A]/20 bg-[#00140D] text-[#B8B9A8] hover:border-[#E4BD5A]/50'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'netbanking')}
                  className={`p-4 border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                    formData.paymentMethod === 'netbanking'
                      ? 'border-[#E4BD5A] bg-[#002418] text-[#E4BD5A] shadow-md ring-1 ring-[#E4BD5A]'
                      : 'border-[#E4BD5A]/20 bg-[#00140D] text-[#B8B9A8] hover:border-[#E4BD5A]/50'
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInputChange('paymentMethod', 'cod')}
                  className={`p-4 border cursor-pointer flex flex-col items-center justify-center space-y-2 text-center transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#E4BD5A] bg-[#002418] text-[#E4BD5A] shadow-md ring-1 ring-[#E4BD5A]'
                      : 'border-[#E4BD5A]/20 bg-[#00140D] text-[#B8B9A8] hover:border-[#E4BD5A]/50'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">COD Concierge</span>
                </button>
              </div>

              {/* Card Inputs */}
              {formData.paymentMethod === 'card' && (
                <div className="space-y-4 text-xs bg-[#00140D] border border-[#E4BD5A]/20 p-4">
                  <p className="text-[#B8B9A8] text-[11px]">
                    Encrypted card transaction via RBI-compliant 3D-Secure 2.0 gateway.
                  </p>
                  <div>
                    <label className="block text-[#B8B9A8] uppercase font-medium mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="4532 •••• •••• 8920"
                      className="w-full bg-[#001710] border border-[#E4BD5A]/30 p-2.5 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#B8B9A8] uppercase font-medium mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={formData.cardExpiry}
                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                        placeholder="08/29"
                        className="w-full bg-[#001710] border border-[#E4BD5A]/30 p-2.5 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#B8B9A8] uppercase font-medium mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={formData.cardCvv}
                        onChange={(e) => handleInputChange('cardCvv', e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full bg-[#001710] border border-[#E4BD5A]/30 p-2.5 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Input */}
              {formData.paymentMethod === 'upi' && (
                <div className="space-y-3 text-xs bg-[#00140D] border border-[#E4BD5A]/20 p-4">
                  <label className="block text-[#B8B9A8] uppercase font-medium mb-1">
                    Virtual Payment Address (VPA) / UPI ID
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => handleInputChange('upiId', e.target.value)}
                    placeholder="name@okaxis or name@upi"
                    className="w-full bg-[#001710] border border-[#E4BD5A]/30 p-2.5 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                  />
                  <p className="text-[11px] text-[#B8B9A8]">
                    A verification collect request will be sent to your UPI provider app.
                  </p>
                </div>
              )}

              {/* COD Concierge Notice with direct order action */}
              {formData.paymentMethod === 'cod' && (
                <div className="p-4 bg-[#002418] border border-[#E4BD5A]/45 text-xs space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E4BD5A]" />
                    <p className="font-semibold text-[#E4BD5A] uppercase tracking-wider">
                      White-Glove Cash on Delivery Concierge Active
                    </p>
                  </div>
                  <p className="text-[#F5F0DF]/90 text-[11px] leading-relaxed">
                    No advance digital payment required. Our certified delivery concierge will securely present your tailored garments and accept Cash, Card, or UPI on doorstep handover.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-gold py-3 text-xs tracking-[0.2em] uppercase font-semibold flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold hover:brightness-105 transition-all"
                  >
                    <span>{isSubmitting ? 'CONFIRMING COD ORDER...' : 'PLACE CASH ON DELIVERY ORDER NOW'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Review & Total (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#001710] border border-[#E4BD5A]/30 p-6 sm:p-8 space-y-6 shadow-2xl relative sticky top-24">
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E4BD5A]" />

              <h3 className="font-serif text-xl sm:text-2xl text-[#F5F0DF] border-b border-[#E4BD5A]/15 pb-3">
                Order Review ({items.length})
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1 no-scrollbar divide-y divide-[#E4BD5A]/10">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex space-x-3.5 items-center justify-between group">
                    <div className="flex space-x-3 items-center overflow-hidden">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-14 h-18 aspect-[3/4] object-cover bg-[#00140D] border border-[#E4BD5A]/20 flex-shrink-0 image-crisp"
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
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-1.5 flex-shrink-0 pl-2">
                      <span className="font-serif text-sm text-[#E4BD5A] whitespace-nowrap">
                        {formatINR(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        title={`Remove ${item.product.name} from bag`}
                        className="text-[10px] text-[#B8B9A8]/80 hover:text-red-400 flex items-center space-x-1 transition-colors cursor-pointer group-hover:opacity-100"
                      >
                        <Trash2 className="w-3 h-3 text-red-400/80" />
                        <span className="uppercase tracking-wider">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code Strip */}
              <div className="pt-3 border-t border-[#E4BD5A]/15 space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo Code (e.g. ZENVE10)"
                    className="flex-1 bg-[#00140D] border border-[#E4BD5A]/30 px-3 py-2 text-xs text-[#F5F0DF] uppercase placeholder:normal-case focus:outline-none focus:border-[#E4BD5A]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    className="btn-gold px-3.5 py-2 text-xs tracking-wider cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                {promoMessage && <p className="text-[11px] text-[#E4BD5A] italic">{promoMessage}</p>}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-[#E4BD5A]/15 text-xs text-[#B8B9A8]">
                <div className="flex justify-between">
                  <span>Pieces Subtotal:</span>
                  <span className="text-[#F5F0DF] font-serif">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#E4BD5A]">
                    <span>Privilege Courtesy:</span>
                    <span className="font-serif">- {formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>White-Glove Courier:</span>
                  <span className="text-[#E4BD5A] uppercase font-semibold">
                    {shipping === 0 ? 'COMPLIMENTARY' : formatINR(shipping)}
                  </span>
                </div>
                <div className="pt-3 border-t border-[#E4BD5A]/25 flex justify-between items-baseline">
                  <span className="text-sm font-semibold uppercase text-[#F5F0DF]">Final Settlement:</span>
                  <span className="font-serif text-2xl text-[#E4BD5A] font-bold">
                    {formatINR(total)}
                  </span>
                </div>
              </div>

              {orderError && (
                <div className="p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{orderError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-gold py-4 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer shadow-luxury-gold"
              >
                <span>
                  {isSubmitting
                    ? formData.paymentMethod === 'cod'
                      ? 'PLACING COD ORDER...'
                      : 'AUTHORIZING SETTLEMENT...'
                    : formData.paymentMethod === 'cod'
                    ? 'PLACE CASH ON DELIVERY ORDER'
                    : 'CONFIRM ATELIER ORDER'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[10px] text-[#B8B9A8]/70 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E4BD5A]" />
                <span>Authorized with Master Concierge Inspection Guarantee</span>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
export default Checkout;
