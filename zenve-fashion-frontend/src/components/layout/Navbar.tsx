import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Menu, Search } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());
  const { toggleCartDrawer, toggleMobileMenu, openSearchOverlay } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'SHOP', path: '/shop' },
    { name: 'COLLECTIONS', path: '/collections' },
    { name: 'PEOPLE', path: '/people' },
    { name: 'PETS', path: '/pets' },
    { name: 'SHOWROOM', path: '/showroom' },
    { name: 'JOURNAL', path: '/journal' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
  ];

  const isCurrent = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#00140D]/95 backdrop-blur-xl border-b border-[#E4BD5A]/30 py-2.5 sm:py-3 shadow-[0_12px_35px_rgba(0,0,0,0.7)]'
          : 'bg-[#001710]/90 backdrop-blur-xl border-b border-[#E4BD5A]/25 py-3.5 sm:py-4 shadow-[0_6px_25px_rgba(0,0,0,0.45)]'
      }`}
    >
      {/* Top Hairline Amber Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFF4D0]/20 to-transparent pointer-events-none" />

      {/* Bottom Hairline Molten Gold Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E4BD5A]/45 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between relative z-10">
        {/* Mobile: Hamburger Button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={toggleMobileMenu}
            aria-label="Open mobile menu"
            className="p-2 text-[#F7F4EB] hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Left / Center-Mobile: Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 sm:space-x-3.5 group select-none">
          {!logoError ? (
            <img
              src="/logo/zenve-logo.png"
              alt="ZENVE Monogram"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 image-crisp drop-shadow-[0_2px_12px_rgba(228,189,90,0.35)]"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg border border-[#E4BD5A]/60 bg-[#00140D] flex items-center justify-center font-serif text-[#E4BD5A] text-xl font-bold shadow-[0_0_15px_rgba(228,189,90,0.3)]">
              Z
            </div>
          )}
          <div className="flex flex-col text-left">
            <span className="font-serif text-xl sm:text-2xl tracking-[0.24em] text-[#F7F4EB] group-hover:text-[#E4BD5A] transition-colors font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              ZENVE
            </span>
            <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.32em] text-[#E4BD5A] uppercase font-semibold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              PETS LIFESTYLE
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 select-none">
          {navLinks.map((link) => {
            const active = isCurrent(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`relative text-[11px] xl:text-[12px] font-semibold tracking-[0.22em] uppercase transition-all duration-300 py-2 px-1 group ${
                  active
                    ? 'text-[#E4BD5A] drop-shadow-[0_0_10px_rgba(228,189,90,0.6)]'
                    : 'text-[#F7F4EB]/80 hover:text-[#E4BD5A]'
                }`}
              >
                <span>{link.name}</span>
                {/* Active Indicator Bar with Gold Glow */}
                {active ? (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-[#E4BD5A] via-[#FFF4D0] to-[#E4BD5A] rounded-full shadow-[0_0_10px_rgba(228,189,90,0.9)]" />
                ) : (
                  /* Hover Indicator */
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#E4BD5A]/80 rounded-full group-hover:w-full transition-all duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions (Search, Account, Shopping Bag) */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5">
          {/* Subtle Vertical Divider */}
          <div className="w-[1px] h-5 bg-[#E4BD5A]/25 hidden lg:block mr-1.5" />

          {/* Search Trigger */}
          <button
            onClick={openSearchOverlay}
            aria-label="Search collection"
            className="p-2 text-[#F7F4EB]/85 hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
          >
            <Search className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Account Icon */}
          <Link
            to="/account"
            aria-label="Account profile"
            className="hidden sm:inline-flex p-2 text-[#F7F4EB]/85 hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 rounded-full transition-all duration-300 cursor-pointer focus:outline-none"
          >
            <User className="w-5 h-5 stroke-[1.75]" />
          </Link>

          {/* Shopping Bag Button with Glowing Gold Count Badge */}
          <button
            onClick={toggleCartDrawer}
            aria-label="Shopping bag"
            className="relative p-2 text-[#F7F4EB]/85 hover:text-[#E4BD5A] hover:bg-[#E4BD5A]/10 rounded-full transition-all duration-300 cursor-pointer focus:outline-none group"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.75] transition-transform duration-300 group-hover:scale-105" />
            <span className="absolute -top-0.5 -right-0.5 bg-[#D5BA64] text-[#132516] text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(213,186,100,0.7)] border border-[#132516]">
              {itemCount > 0 ? itemCount : 3}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

