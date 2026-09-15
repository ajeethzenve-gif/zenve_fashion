import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

export const FlagshipSection: React.FC = () => {
  return (
    <section className="w-full bg-[#001710] py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-12 border-b border-[#E4BD5A]/15 relative overflow-hidden">
      <div className="max-w-[1380px] mx-auto">
        {/* Luxury Banner Container matching reference screenshot */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E4BD5A]/30 bg-gradient-to-r from-[#00271B] via-[#003828] to-[#001F15] p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
          
          {/* Top-Left Sweeping Ribbon Arc with Gold Illumination */}
          <svg
            className="absolute -top-12 -left-12 w-80 sm:w-96 h-80 sm:h-96 pointer-events-none opacity-60"
            viewBox="0 0 300 300"
            fill="none"
          >
            <path
              d="M-40 180 C 60 70, 160 40, 260 -20"
              stroke="url(#flagshipGoldTop)"
              strokeWidth="2.5"
            />
            <path
              d="M-20 220 C 80 110, 190 70, 280 10"
              stroke="#004D36"
              strokeWidth="35"
              strokeOpacity="0.4"
            />
            <defs>
              <linearGradient id="flagshipGoldTop" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E4BD5A" stopOpacity="0" />
                <stop offset="40%" stopColor="#FFF4BD" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#E4BD5A" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Bottom Graceful Golden Curve Wave */}
          <svg
            className="absolute -bottom-14 left-0 right-0 w-full h-40 pointer-events-none opacity-75"
            viewBox="0 0 1000 160"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M-50 160 Q 200 40 500 110 T 1050 40"
              stroke="url(#flagshipGoldBottom)"
              strokeWidth="2.2"
            />
            <path
              d="M-50 160 Q 200 40 500 110 T 1050 40 L 1050 160 Z"
              fill="url(#flagshipDeepEmerald)"
              opacity="0.45"
            />
            <defs>
              <linearGradient id="flagshipGoldBottom" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E4BD5A" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#FFF7C8" stopOpacity="1" />
                <stop offset="70%" stopColor="#E4BD5A" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FFF4BA" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="flagshipDeepEmerald" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#004D36" />
                <stop offset="100%" stopColor="#001810" />
              </linearGradient>
            </defs>
          </svg>

          {/* Golden Lens Sparkle Glint (Bottom Right Ribbon Curve) */}
          <div className="absolute right-8 sm:right-16 bottom-8 sm:bottom-12 pointer-events-none">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute w-10 h-[1.5px] bg-[#FFF2B2] shadow-[0_0_12px_#FFF]" />
              <div className="absolute h-10 w-[1.5px] bg-[#FFF2B2] shadow-[0_0_12px_#FFF]" />
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#E4BD5A]" />
            </div>
          </div>

          {/* Golden Lens Sparkle Glint (Bottom Left Ribbon Curve) */}
          <div className="absolute left-16 sm:left-24 bottom-6 sm:bottom-8 pointer-events-none hidden sm:block">
            <div className="relative w-6 h-6 flex items-center justify-center">
              <div className="absolute w-8 h-[1px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
              <div className="absolute h-8 w-[1px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#E4BD5A]" />
            </div>
          </div>

          {/* Top-Right Large Paw Print Watermark */}
          <div className="absolute top-4 right-8 sm:right-16 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none opacity-25 text-[#004F37]">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 48 C35 48 28 62 32 76 C35 85 45 92 50 92 C55 92 65 85 68 76 C72 62 65 48 50 48 Z" />
              <ellipse cx="26" cy="42" rx="7" ry="10" transform="rotate(-25 26 42)" />
              <ellipse cx="42" cy="30" rx="7" ry="11" transform="rotate(-8 42 30)" />
              <ellipse cx="58" cy="30" rx="7" ry="11" transform="rotate(8 58 30)" />
              <ellipse cx="74" cy="42" rx="7" ry="10" transform="rotate(25 74 42)" />
            </svg>
          </div>

          {/* Bottom-Center Subtle Paw Print Watermark */}
          <div className="absolute bottom-3 left-1/3 w-16 h-16 pointer-events-none opacity-20 text-[#004F37] hidden md:block">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <path d="M50 48 C35 48 28 62 32 76 C35 85 45 92 50 92 C55 92 65 85 68 76 C72 62 65 48 50 48 Z" />
              <ellipse cx="26" cy="42" rx="7" ry="10" transform="rotate(-25 26 42)" />
              <ellipse cx="42" cy="30" rx="7" ry="11" transform="rotate(-8 42 30)" />
              <ellipse cx="58" cy="30" rx="7" ry="11" transform="rotate(8 58 30)" />
              <ellipse cx="74" cy="42" rx="7" ry="10" transform="rotate(25 74 42)" />
            </svg>
          </div>

          {/* Cursive Script Watermark: "Healthy Pets Happier Lives" */}
          <div className="absolute right-6 sm:right-12 bottom-12 sm:bottom-16 pointer-events-none transform -rotate-[14deg] select-none opacity-60">
            <span className="font-['Caveat',cursive] text-2xl sm:text-3xl lg:text-[34px] text-[#428867] tracking-wider leading-tight block">
              Healthy Pets<br />Happier Lives
            </span>
          </div>

          {/* Content Layout: 2 Columns */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left Column: Glassmorphism Gold Monogram Box matching screenshot */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start">
              <div className="relative w-64 sm:w-72 md:w-80 aspect-square rounded-2xl sm:rounded-3xl border border-[#E4BD5A]/60 bg-[#001D14]/85 backdrop-blur-md p-6 sm:p-8 flex items-center justify-center shadow-[0_12px_36px_rgba(0,0,0,0.55)] group">
                
                {/* Top-Left Star Glint on the Card Frame */}
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-5 h-[1.5px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
                  <div className="absolute h-5 w-[1.5px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#E4BD5A]" />
                </div>

                {/* Bottom Center Star Glint on the Card Frame */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-5 h-[1.5px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
                  <div className="absolute h-5 w-[1.5px] bg-[#FFF2B2] shadow-[0_0_8px_#FFF]" />
                  <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#E4BD5A]" />
                </div>

                {/* The Golden Monogram Emblem */}
                <img
                  src="/logo/zenve-logo.png"
                  alt="Zenve Atelier Crest"
                  className="w-full h-full object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:scale-105 select-none"
                />
              </div>
            </div>

            {/* Right Column: Text Information and CTAs matching screenshot */}
            <div className="lg:col-span-8 text-left space-y-5 sm:space-y-6">
              
              {/* Eyebrow Label: — VISIT THE FLAGSHIP — */}
              <div className="flex items-center space-x-2.5 text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                <span className="w-6 h-[1px] bg-[#E4BD5A]/60" />
                <span>VISIT THE FLAGSHIP</span>
                <span className="w-6 h-[1px] bg-[#E4BD5A]/60" />
              </div>

              {/* Company Title */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#F5F0DF] font-normal tracking-tight leading-[1.18]">
                <span className="text-[#E4BD5A] font-serif mr-2.5 inline-block font-normal">
                  Zenve
                </span>
                <span>Pets Healthcare Private Limited</span>
              </h2>

              {/* Address with Circular Golden Pin Icon */}
              <div className="flex items-start space-x-3.5 pt-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#001D14] border border-[#E4BD5A]/50 flex items-center justify-center text-[#E4BD5A] flex-shrink-0 shadow-[0_0_12px_rgba(228,189,90,0.22)] mt-0.5">
                  <MapPin className="w-4 h-4 text-[#E4BD5A]" />
                </div>
                <p className="text-xs sm:text-[13px] text-[#B8C7B4] font-light leading-relaxed max-w-xl">
                  1446, 4th Floor, Puttayyanpalya, Kottapalya, Jayanagara 9th Block, Jayanagar,
                  Bengaluru, Karnataka 560041
                </p>
              </div>

              {/* Action Buttons matching screenshot */}
              <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-5">
                {/* Explore Showroom Button */}
                <Link
                  to="/showroom"
                  className="bg-gradient-to-r from-[#E5BE5E] via-[#E4BD5A] to-[#D5A73E] text-[#001C13] font-semibold text-xs sm:text-[13px] tracking-[0.2em] uppercase px-7 sm:px-8 py-3.5 rounded-lg flex items-center space-x-2 shadow-[0_4px_16px_rgba(228,189,90,0.35)] hover:brightness-105 hover:scale-[1.02] active:scale-[0.99] transition-all"
                >
                  <span>EXPLORE SHOWROOM</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>

                {/* About the House Button */}
                <Link
                  to="/about"
                  className="border border-[#E4BD5A]/80 bg-[#001C13]/50 text-[#E4BD5A] hover:bg-[#E4BD5A]/10 font-semibold text-xs sm:text-[13px] tracking-[0.2em] uppercase px-7 sm:px-8 py-3.5 rounded-lg flex items-center space-x-2 transition-all hover:border-[#E4BD5A]"
                >
                  <span>ABOUT THE HOUSE</span>
                  <ArrowRight className="w-4 h-4 stroke-[2]" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
