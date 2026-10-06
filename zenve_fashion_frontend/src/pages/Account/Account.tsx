import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { addressService } from '../../services/addressService';
import { OrderList } from './OrderList';

interface AddressItem {
  id: string;
  label: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export const Account: React.FC = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Address state backed by isolated backend database
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<AddressItem, 'id'>>({
    label: 'Primary Residence',
    name: user?.name || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
    isDefault: false,
  });

  // Load addresses strictly belonging to current authenticated customer
  useEffect(() => {
    let mounted = true;
    async function loadAddresses() {
      if (!user) {
        if (mounted) setAddresses([]);
        return;
      }
      const backendAddrs = await addressService.getAddresses();
      if (mounted) {
        if (backendAddrs.length > 0) {
          const mapped: AddressItem[] = backendAddrs.map((a, i) => ({
            id: String(a.id),
            label: i === 0 ? 'Primary Residence' : `Residence ${i + 1}`,
            name: a.fullName || a.name || user?.name || '',
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2 || '',
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            phone: a.mobile || a.phone || user?.phone || '',
            isDefault: Boolean(a.isDefault),
          }));
          setAddresses(mapped);
        } else if (user?.addresses && user.addresses.length > 0) {
          const mapped: AddressItem[] = user.addresses.map((a, i) => ({
            id: String(a.id),
            label: i === 0 ? 'Primary Residence' : `Residence ${i + 1}`,
            name: a.fullName || a.name || user?.name || '',
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2 || '',
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            phone: a.mobile || a.phone || user?.phone || '',
            isDefault: Boolean(a.isDefault),
          }));
          setAddresses(mapped);
        } else {
          setAddresses([]);
        }
      }
    }
    loadAddresses();
    return () => {
      mounted = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      phone: profileForm.phone,
    });
    setIsEditingProfile(false);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'New Residence',
      name: user?.name || '',
      addressLine1: '',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '',
      phone: user?.phone || '',
      isDefault: addresses.length === 0,
    });
    setIsEditingAddress(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      name: addr.name,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (id: string) => {
    await addressService.deleteAddress(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.addressLine1 || !addressForm.city || !addressForm.pincode) {
      return;
    }

    try {
      if (editingAddressId) {
        const updated = await addressService.updateAddress(editingAddressId, {
          fullName: addressForm.name,
          mobile: addressForm.phone,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          country: 'India',
          isDefault: addressForm.isDefault,
        });
        setAddresses((prev) =>
          prev.map((item) => {
            if (item.id === editingAddressId) {
              return {
                ...item,
                ...addressForm,
                id: updated ? String(updated.id) : item.id,
              };
            }
            if (addressForm.isDefault) {
              return { ...item, isDefault: false };
            }
            return item;
          })
        );
      } else {
        const created = await addressService.createAddress({
          fullName: addressForm.name,
          mobile: addressForm.phone,
          addressLine1: addressForm.addressLine1,
          addressLine2: addressForm.addressLine2,
          city: addressForm.city,
          state: addressForm.state,
          pincode: addressForm.pincode,
          country: 'India',
          isDefault: addressForm.isDefault,
        });
        const newId = created ? String(created.id) : `addr-${Date.now()}`;
        setAddresses((prev) => {
          const updated = addressForm.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev];
          return [...updated, { ...addressForm, id: newId }];
        });
      }
    } catch (err) {
      console.error('Save address error:', err);
    }

    setIsEditingAddress(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'Z';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="w-full bg-[#00140D] min-h-screen py-10 sm:py-16 text-left text-[#F5F0DF]">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 space-y-10">
        
        {/* 1. ULTRA-LUXURY PATRON HEADER */}
        <div className="bg-[#001710] border border-[#E4BD5A]/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle Golden Corner Frames */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#E4BD5A]" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#E4BD5A]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#E4BD5A]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#E4BD5A]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              {/* Gold Initials Medallion */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#E4BD5A] bg-[#002418] flex items-center justify-center font-serif text-2xl sm:text-3xl text-[#E4BD5A] shadow-[0_0_15px_rgba(228,189,90,0.3)] flex-shrink-0">
                {getInitials(user?.name || 'Zenve Patron')}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#E4BD5A] text-[#00140D] text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-0.5">
                    {user?.role === 'admin' ? 'HEAD CURATOR' : 'VIP PATRON'}
                  </span>
                  <span className="text-[10px] text-[#B8B9A8] tracking-widest font-mono">
                    CLIENT ID: {user?.id || 'ZNV-CLIENT'}
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl text-[#F5F0DF] tracking-tight">
                  {user?.name || 'Atelier Patron'}
                </h1>
                <p className="text-xs text-[#B8B9A8] flex items-center space-x-2">
                  <span>{user?.email}</span>
                  {user?.phone && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[#E4BD5A]/90">{user.phone}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 self-start sm:self-auto">
              <button
                onClick={handleLogout}
                className="btn-outline-gold py-2.5 px-4 text-xs tracking-widest flex items-center space-x-2 text-[#E4BD5A] hover:bg-[#E4BD5A]/10 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. NAVIGATION TABS */}
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto no-scrollbar border-b border-[#E4BD5A]/20 pb-0.5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-6 py-3 text-xs tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#E4BD5A] text-[#00140D] font-bold shadow-md'
                : 'text-[#B8B9A8] hover:text-[#F5F0DF] hover:bg-[#001C13]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>MY ORDERS</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 px-6 py-3 text-xs tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#E4BD5A] text-[#00140D] font-bold shadow-md'
                : 'text-[#B8B9A8] hover:text-[#F5F0DF] hover:bg-[#001C13]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>PROFILE</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center space-x-2 px-6 py-3 text-xs tracking-widest uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#E4BD5A] text-[#00140D] font-bold shadow-md'
                : 'text-[#B8B9A8] hover:text-[#F5F0DF] hover:bg-[#001C13]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>ADDRESSES ({addresses.length})</span>
          </button>

          <Link
            to="/wishlist"
            className="flex items-center space-x-2 px-6 py-3 text-xs tracking-widest uppercase text-[#B8B9A8] hover:text-[#F5F0DF] hover:bg-[#001C13] transition-all whitespace-nowrap"
          >
            <Heart className="w-3.5 h-3.5 text-[#E4BD5A]" />
            <span>WISHLIST ({wishlistItems.length})</span>
          </Link>
        </div>

        {/* 3. TAB CONTENT */}

        {/* TAB A: MY ORDERS */}
        {activeTab === 'orders' && <OrderList />}

        {/* TAB B: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl space-y-6">
            {profileSaveSuccess && (
              <div className="p-3.5 bg-[#002418] border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Atelier client profile updated successfully.</span>
              </div>
            )}

            <div className="bg-[#001710] border border-[#E4BD5A]/25 p-6 sm:p-10 space-y-6 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-[#E4BD5A]/15 pb-4">
                <div>
                  <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                    CREDENTIALS & RECORD
                  </span>
                  <h3 className="font-serif text-2xl text-[#F5F0DF]">Personal Profile</h3>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
                      setIsEditingProfile(true);
                    }}
                    className="btn-outline-gold py-2 px-4 text-xs tracking-wider flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDIT PROFILE</span>
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="space-y-4 text-xs text-[#B8B9A8]">
                  <div className="flex justify-between border-b border-[#E4BD5A]/10 pb-3">
                    <span className="uppercase tracking-wider">Client Legal Name:</span>
                    <strong className="text-[#F5F0DF] text-sm font-serif">{user?.name || '—'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E4BD5A]/10 pb-3">
                    <span className="uppercase tracking-wider">Registered Email:</span>
                    <strong className="text-[#F5F0DF]">{user?.email || '—'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#E4BD5A]/10 pb-3">
                    <span className="uppercase tracking-wider">Contact Phone:</span>
                    <strong className="text-[#E4BD5A] font-mono">{user?.phone || '—'}</strong>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="uppercase tracking-wider">Atelier Tier:</span>
                    <span className="text-[#E4BD5A] font-semibold tracking-wider uppercase flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{user?.role === 'admin' ? 'Head Curator Access' : 'Private VIP Patron'}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/35 px-4 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                    />
                  </div>

                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/35 px-4 py-3 text-xs text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                    />
                  </div>

                  <div className="flex items-center space-x-3 pt-3">
                    <button type="submit" className="btn-gold py-2.5 px-6 text-xs tracking-wider cursor-pointer">
                      SAVE CHANGES
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="btn-outline-gold py-2.5 px-5 text-xs tracking-wider cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB C: ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4BD5A]/15 pb-4">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                  SHIPPING DIRECTORY
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">Saved Residences</h3>
                <p className="text-xs text-[#B8B9A8]">
                  Manage delivery addresses for your tailored pieces and companion couture.
                </p>
              </div>

              {!isEditingAddress && (
                <button
                  onClick={handleOpenAddAddress}
                  className="btn-gold py-2.5 px-5 text-xs tracking-widest flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD RESIDENCE</span>
                </button>
              )}
            </div>

            {/* Inline Address Form Modal/Card */}
            {isEditingAddress && (
              <div className="bg-[#001710] border border-[#E4BD5A]/40 p-6 sm:p-8 max-w-2xl space-y-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-[#E4BD5A]/15 pb-3">
                  <h4 className="font-serif text-xl text-[#F5F0DF]">
                    {editingAddressId ? 'Edit Delivery Residence' : 'Add New Delivery Residence'}
                  </h4>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="text-[#B8B9A8] hover:text-[#F5F0DF] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                        Residence Label (e.g. Penthouse, Estate)
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.label}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                        className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                        placeholder="Primary Residence"
                      />
                    </div>

                    <div>
                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                        Recipient Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.name}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                      Street Address & Apt/Suite
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      placeholder="Penthouse 4B, Tower A"
                    />
                  </div>

                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                      Landmark / Locality (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      placeholder="Near Cubbon Park"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      />
                    </div>

                    <div>
                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                      />
                    </div>

                    <div>
                      <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                        PIN Code
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, pincode: e.target.value }))}
                        className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                        placeholder="560001"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block tracking-wider uppercase text-[#B8B9A8] mb-1">
                      Recipient Mobile Phone
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#00140D] border border-[#E4BD5A]/30 px-3.5 py-2.5 text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
                    />
                  </div>

                  <label className="flex items-center space-x-2 pt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                      className="accent-[#E4BD5A] w-4 h-4"
                    />
                    <span className="text-[#F5F0DF]">Designate as Primary Atelier Residence</span>
                  </label>

                  <div className="flex items-center space-x-3 pt-3">
                    <button type="submit" className="btn-gold py-2.5 px-6 text-xs tracking-wider cursor-pointer">
                      SAVE RESIDENCE
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingAddress(false)}
                      className="btn-outline-gold py-2.5 px-5 text-xs tracking-wider cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Saved Addresses Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-6 bg-[#001710] border transition-all duration-300 relative space-y-4 shadow-xl ${
                    addr.isDefault
                      ? 'border-[#E4BD5A] ring-1 ring-[#E4BD5A]/40'
                      : 'border-[#E4BD5A]/25 hover:border-[#E4BD5A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4BD5A]/15">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-[#E4BD5A]" />
                      <span className="font-serif text-base text-[#F5F0DF] font-medium">{addr.label}</span>
                    </div>

                    {addr.isDefault && (
                      <span className="bg-[#E4BD5A] text-[#00140D] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                        PRIMARY
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#B8B9A8] space-y-1">
                    <p className="text-[#F5F0DF] font-semibold text-sm">{addr.name}</p>
                    <p>{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[#E4BD5A]/90 font-mono pt-1">{addr.phone}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E4BD5A]/10 text-xs">
                    <button
                      onClick={() => handleOpenEditAddress(addr)}
                      className="text-[#E4BD5A] hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-[#B8B9A8] hover:text-red-400 flex items-center space-x-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
