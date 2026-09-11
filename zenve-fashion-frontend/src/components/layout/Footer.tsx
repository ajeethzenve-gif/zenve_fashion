import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, ChevronRight, ChevronUp } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export const Footer: React.FC = () => {
  const toggleCartDrawer = useUIStore((state) => state.toggleCartDrawer);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#001B12] via-[#002419] to-[#00160F] text-[#B8C5B4] text-xs sm:text-sm border-t border-[#E4BD5A]/25 overflow-hidden">
      {/* Top-Right Decorative Paw Print Watermark */}
      <div className="absolute top-4 right-10 sm:right-20 w-36 h-36 pointer-events-none opacity-25 text-[#004A33]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 48 C35 48 28 62 32 76 C35 85 45 92 50 92 C55 92 65 85 68 76 C72 62 65 48 50 48 Z" />
          <ellipse cx="26" cy="42" rx="7" ry="10" transform="rotate(-25 26 42)" />
          <ellipse cx="42" cy="30" rx="7" ry="11" transform="rotate(-8 42 30)" />
          <ellipse cx="58" cy="30" rx="7" ry="11" transform="rotate(8 58 30)" />
          <ellipse cx="74" cy="42" rx="7" ry="10" transform="rotate(25 74 42)" />
        </svg>
      </div>

      {/* Top-Right Botanical Leaf Motif */}
      <div className="absolute top-6 right-4 sm:right-8 w-24 h-24 pointer-events-none opacity-35">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M30 80 C 40 40, 80 30, 95 10 C 85 40, 65 70, 30 80 Z"
            stroke="#E4BD5A"
            strokeWidth="1.2"
            fill="#004D36"
            fillOpacity="0.4"
          />
          <path d="M42 66 Q 65 48 86 20" stroke="#E4BD5A" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      {/* Bottom-Left Paw Print Watermark */}
      <div className="absolute bottom-20 left-4 sm:left-8 w-24 h-24 pointer-events-none opacity-20 text-[#004A33] hidden sm:block">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 48 C35 48 28 62 32 76 C35 85 45 92 50 92 C55 92 65 85 68 76 C72 62 65 48 50 48 Z" />
          <ellipse cx="26" cy="42" rx="7" ry="10" transform="rotate(-25 26 42)" />
          <ellipse cx="42" cy="30" rx="7" ry="11" transform="rotate(-8 42 30)" />
          <ellipse cx="58" cy="30" rx="7" ry="11" transform="rotate(8 58 30)" />
          <ellipse cx="74" cy="42" rx="7" ry="10" transform="rotate(25 74 42)" />
        </svg>
      </div>

      {/* Bottom-Left Sweeping Gold Ribbon Curve */}
      <svg
        className="absolute -bottom-8 -left-8 w-80 sm:w-[420px] h-48 pointer-events-none opacity-80"
        viewBox="0 0 400 180"
        fill="none"
      >
        <path
          d="M-20 180 C 80 120, 180 80, 260 120 C 320 150, 360 140, 390 110"
          stroke="url(#footerGoldRibbon)"
          strokeWidth="2.5"
        />
        <path
          d="M-20 180 C 80 120, 180 80, 260 120 C 320 150, 360 140, 390 110 L 400 180 Z"
          fill="#004D36"
          fillOpacity="0.25"
        />
        <defs>
          <linearGradient id="footerGoldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E4BD5A" stopOpacity="0.3" />
            <stop offset="45%" stopColor="#FFF4BD" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#E4BD5A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Sparkle Glint on Bottom-Left Ribbon */}
      <div className="absolute left-40 sm:left-48 bottom-16 sm:bottom-20 pointer-events-none">
        <div className="relative w-6 h-6 flex items-center justify-center">
          <div className="absolute w-8 h-[1.5px] bg-[#FFF2B2] shadow-[0_0_10px_#FFF]" />
          <div className="absolute h-8 w-[1.5px] bg-[#FFF2B2] shadow-[0_0_10px_#FFF]" />
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#E4BD5A]" />
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-14 sm:pt-16 pb-6">
        
        {/* Main 4-Column Grid with Vertical Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-0 pb-12">
          
          {/* Column 1: Brand Emblem, Slogan, Socials */}
          <div className="lg:col-span-3 lg:pr-8 flex flex-col justify-between space-y-5 lg:border-r lg:border-[#E4BD5A]/15 text-left">
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <img
                  src="/logo/zenve-logo.png"
                  alt="ZENVE Flagship Crest"
                  className="h-16 sm:h-20 w-auto object-contain image-crisp drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                />
              </Link>
              <p className="font-serif text-[#F5F0DF] text-sm sm:text-[15px] leading-snug max-w-xs font-normal">
                India&apos;s exclusive designer showroom for people and their pets.
              </p>
              <p className="text-[#E4BD5A] text-xs sm:text-[13px] font-serif italic tracking-wider">
                Style Without Limits.
              </p>
            </div>

            {/* Circular Gold Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[#E4BD5A]/50 bg-[#001D14]/70 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all shadow-[0_0_8px_rgba(228,189,90,0.15)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[#E4BD5A]/50 bg-[#001D14]/70 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all shadow-[0_0_8px_rgba(228,189,90,0.15)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-[#E4BD5A]/50 bg-[#001D14]/70 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all shadow-[0_0_8px_rgba(228,189,90,0.15)]"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full border border-[#E4BD5A]/50 bg-[#001D14]/70 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all shadow-[0_0_8px_rgba(228,189,90,0.15)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: COLLECTIONS */}
          <div className="lg:col-span-3 lg:px-8 space-y-4 lg:border-r lg:border-[#E4BD5A]/15 text-left">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                COLLECTIONS
              </h4>
              <span className="block w-6 h-[1.5px] bg-[#E4BD5A] mt-1.5 mb-4" />
            </div>
            <ul className="space-y-3 text-xs sm:text-[13px] tracking-wide">
              <li>
                <Link to="/collections" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>All collections</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/people" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>People</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/pets" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>Pets</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/twin" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>Twin</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/showroom" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>Showroom</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HOUSE */}
          <div className="lg:col-span-3 lg:px-8 space-y-4 lg:border-r lg:border-[#E4BD5A]/15 text-left">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                HOUSE
              </h4>
              <span className="block w-6 h-[1.5px] bg-[#E4BD5A] mt-1.5 mb-4" />
            </div>
            <ul className="space-y-3 text-xs sm:text-[13px] tracking-wide">
              <li>
                <Link to="/about" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>About Zenve</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/journal" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>The Journal</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>Contact</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>Sign in</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group">
                  <span>My orders</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <button
                  onClick={toggleCartDrawer}
                  className="hover:text-[#E4BD5A] transition-colors inline-flex items-center space-x-1.5 group text-left focus:outline-none"
                >
                  <span>Shopping bag</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-75 group-hover:translate-x-1 transition-transform" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: ATELIER */}
          <div className="lg:col-span-3 lg:pl-8 space-y-4 text-left relative">
            <div>
              <h4 className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                ATELIER
              </h4>
              <span className="block w-6 h-[1.5px] bg-[#E4BD5A] mt-1.5 mb-4" />
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed">
              <p className="text-[#F5F0DF] font-medium text-sm">
                Zenve Pets Healthcare Private Limited
              </p>

              {/* Address with Round Pin Badge */}
              <div className="flex items-start space-x-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-[#001D14] border border-[#E4BD5A]/50 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 shadow-[0_0_8px_rgba(228,189,90,0.2)] mt-0.5">
                  <MapPin className="w-4 h-4 text-[#E4BD5A]" />
                </div>
                <p className="text-[#A7B9A4] text-xs leading-relaxed">
                  1446, 4th Floor, Puttayyanpalya,<br />
                  Kottapalya, Jayanagara 9th Block,<br />
                  Jayanagar, Bengaluru, Karnataka 560041
                </p>
              </div>

              {/* Email with Round Mail Badge */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="w-8 h-8 rounded-full bg-[#001D14] border border-[#E4BD5A]/50 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 shadow-[0_0_8px_rgba(228,189,90,0.2)]">
                  <Mail className="w-4 h-4 text-[#E4BD5A]" />
                </div>
                <a
                  href="mailto:care@zenve.fashion"
                  className="text-[#E4BD5A] hover:underline text-xs"
                >
                  care@zenve.fashion
                </a>
              </div>
            </div>

            {/* Cursive Signature Watermark: Together for Happier Pets + Gold Paw */}
            <div className="pt-6 sm:pt-8 flex items-center justify-end pointer-events-none transform -rotate-6 opacity-85 select-none">
              <span className="font-['Caveat',cursive] text-2xl sm:text-[28px] text-[#E4BD5A] tracking-wider font-semibold">
                Together for Happier Pets
              </span>
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-4 h-4 text-[#E4BD5A] inline-block ml-2 mb-1">
                <path d="M50 48 C35 48 28 62 32 76 C35 85 45 92 50 92 C55 92 65 85 68 76 C72 62 65 48 50 48 Z" />
                <ellipse cx="26" cy="42" rx="7" ry="10" transform="rotate(-25 26 42)" />
                <ellipse cx="42" cy="30" rx="7" ry="11" transform="rotate(-8 42 30)" />
                <ellipse cx="58" cy="30" rx="7" ry="11" transform="rotate(8 58 30)" />
                <ellipse cx="74" cy="42" rx="7" ry="10" transform="rotate(25 74 42)" />
              </svg>
            </div>
          </div>

        </div>

        {/* Bottom Horizontal Divider with Subtle Golden Tone */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#E4BD5A]/30 to-transparent my-4" />

        {/* Bottom Bar: Copyright, Legal Links, Back-To-Top Button */}
        <div className="pt-4 pb-2 flex flex-col md:flex-row items-center justify-between text-xs text-[#9DAFA0] gap-4">
          
          <div className="text-left text-xs">
            © 2026 Zenve Pets Healthcare Private Limited — People | Pets | Together
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs">
            <Link to="/privacy" className="hover:text-[#E4BD5A] transition-colors">Privacy Policy</Link>
            <span className="text-[#E4BD5A]/50">·</span>
            <Link to="/terms" className="hover:text-[#E4BD5A] transition-colors">Terms & Conditions</Link>
            <span className="text-[#E4BD5A]/50">·</span>
            <Link to="/shipping" className="hover:text-[#E4BD5A] transition-colors">Shipping Policy</Link>
            <span className="text-[#E4BD5A]/50">·</span>
            <Link to="/refund" className="hover:text-[#E4BD5A] transition-colors">Refund Policy</Link>
          </div>

          {/* Scroll to Top Circular Gold Button */}
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top of page"
            className="w-10 h-10 rounded-full border border-[#E4BD5A]/60 bg-[#001D14]/80 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all shadow-[0_0_12px_rgba(228,189,90,0.2)] group"
          >
            <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
