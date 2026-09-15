import React from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, User, ShoppingBag } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export const MobileMenu: React.FC = () => {
  const { isMobileMenuOpen, closeMobileMenu, toggleCartDrawer } = useUIStore();
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);

  if (!isMobileMenuOpen) return null;

  const links = [
    { name: 'SHOP', path: '/shop' },
    { name: 'COLLECTIONS', path: '/collections' },
    { name: 'PEOPLE', path: '/people' },
    { name: 'PETS', path: '/pets' },
    { name: 'TWIN', path: '/twin' },
    { name: 'SHOWROOM', path: '/showroom' },
    { name: 'JOURNAL', path: '/journal' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeMobileMenu}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-sm bg-[#001C13] border-r border-[#E4BD5A]/20 flex flex-col justify-between p-6 sm:p-8 z-10 animate-slide-up shadow-2xl overflow-y-auto">
        {/* Top bar in drawer */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#E4BD5A]/15">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3">
              <img src="/logo/zenve-logo.png" alt="ZENVE" className="h-9 w-auto" />
              <div className="text-left">
                <span className="font-serif text-xl tracking-[0.16em] text-[#F5F0DF] block">
                  ZENVE
                </span>
                <span className="text-[8px] tracking-[0.2em] text-[#B8B9A8] block">
                  PEOPLE · PETS · TOGETHER
                </span>
              </div>
            </Link>
            <button
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="p-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
            >
              <X className="w-6 h-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Links list */}
          <nav className="flex flex-col space-y-4 py-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMobileMenu}
                className="text-sm font-medium tracking-[0.25em] text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors py-1 flex items-center justify-between border-b border-[#E4BD5A]/10 pb-3"
              >
                <span>{link.name}</span>
                <span className="text-[#E4BD5A]/40 text-xs">→</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="pt-6 border-t border-[#E4BD5A]/15 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/account"
              onClick={closeMobileMenu}
              className="flex items-center justify-center space-x-2 border border-[#E4BD5A]/30 py-2.5 px-3 text-xs tracking-widest text-[#F5F0DF] hover:bg-[#E4BD5A]/10 transition-colors"
            >
              <User className="w-4 h-4 text-[#E4BD5A]" />
              <span>ACCOUNT</span>
            </Link>

            <Link
              to="/wishlist"
              onClick={closeMobileMenu}
              className="flex items-center justify-center space-x-2 border border-[#E4BD5A]/30 py-2.5 px-3 text-xs tracking-widest text-[#F5F0DF] hover:bg-[#E4BD5A]/10 transition-colors"
            >
              <Heart className="w-4 h-4 text-[#E4BD5A]" />
              <span>WISHLIST ({wishlistCount})</span>
            </Link>
          </div>

          <button
            onClick={() => {
              closeMobileMenu();
              toggleCartDrawer();
            }}
            className="w-full btn-gold py-3 text-xs flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>VIEW SHOPPING BAG ({cartCount})</span>
          </button>

          <p className="text-[10px] tracking-wider text-center text-[#B8B9A8] pt-2">
            ZENVE FLAGSHIP · JAYANAGAR 9TH BLOCK, BENGALURU
          </p>
        </div>
      </div>
    </div>
  );
};
