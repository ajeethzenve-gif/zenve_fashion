import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, PawPrint, Heart, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const trustBadges = [
    {
      icon: Gem,
      line1: 'PREMIUM',
      line2: 'COLLECTIONS',
    },
    {
      icon: PawPrint,
      line1: 'PEOPLE',
      line2: 'FIRST',
    },
    {
      icon: Heart,
      line1: 'PETS',
      line2: 'ALWAYS',
    },
    {
      icon: Sparkles,
      line1: 'STYLE',
      line2: 'TOGETHER',
    },
  ];

  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden bg-[#001710] pt-[72px] sm:pt-[80px]">
      {/* Showroom Background Image with golden retriever and boutique interior */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/showroom/zenve-showroom-hero.jpg"
          alt="ZENVE Flagship Showroom Interior with Companion"
          className="w-full h-full object-cover object-[66%_center] sm:object-[70%_center] lg:object-[73%_center] image-crisp select-none pointer-events-none"
        />

        {/* Deep emerald green shadow and vignette overlays */}
        <div className="absolute inset-0 green-shadow-banner pointer-events-none" />
        <div className="absolute inset-0 green-shadow-radial pointer-events-none opacity-65 mix-blend-multiply" />
        
        {/* Left Smooth Emerald Gradient for high-contrast legible text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00140D] via-[#001810]/95 via-40% md:via-50% to-transparent w-full lg:w-[65%] pointer-events-none" />
        
        {/* Top Vignette for seamless header integration */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-[#00140D]/85 via-[#001710]/40 to-transparent pointer-events-none" />
        
        {/* Bottom Vignette */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#00140D] via-[#001810]/50 to-transparent pointer-events-none" />
      </div>

      {/* Bottom-Left Luxury Botanical Leaves & Golden Accent Curve */}
      <div className="absolute bottom-0 left-0 w-44 sm:w-60 md:w-72 h-44 sm:h-60 md:h-72 pointer-events-none z-10 overflow-hidden select-none">
        <svg viewBox="0 0 260 260" fill="none" className="w-full h-full">
          <defs>
            <radialGradient id="cornerVignette" cx="0%" cy="100%" r="90%">
              <stop offset="0%" stopColor="#00140D" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#002419" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#001C13" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="goldRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#997316" stopOpacity="0.2" />
              <stop offset="40%" stopColor="#E4BD5A" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#FFF4BD" stopOpacity="1" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#001F15" />
              <stop offset="50%" stopColor="#074530" />
              <stop offset="100%" stopColor="#0B5C40" />
            </linearGradient>
            <linearGradient id="leafGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#001710" />
              <stop offset="70%" stopColor="#003D29" />
              <stop offset="100%" stopColor="#0A5237" />
            </linearGradient>
          </defs>

          {/* Corner Vignette back layer */}
          <rect width="260" height="260" fill="url(#cornerVignette)" />

          {/* Sweeping Gold Ribbon Accent Curve */}
          <path
            d="M-20 280 C 40 240, 110 210, 150 140 C 170 100, 185 40, 190 -20"
            stroke="url(#goldRibbon)"
            strokeWidth="2.5"
          />
          <path
            d="M-20 280 C 40 240, 110 210, 150 140 C 170 100, 185 40, 190 -20"
            stroke="#FFF6CF"
            strokeWidth="0.75"
            strokeOpacity="0.6"
          />
          <path
            d="M-10 290 C 50 255, 120 230, 160 170"
            stroke="url(#goldRibbon)"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />

          {/* Stylized Botanical Leaf 1 */}
          <path
            d="M-20 240 C 20 200, 50 160, 45 100 C 65 130, 80 170, 70 210 C 60 250, 10 260, -20 240 Z"
            fill="url(#leafGrad1)"
            stroke="#E4BD5A"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <path d="M-10 240 Q 30 180 45 100" stroke="#E4BD5A" strokeWidth="0.8" strokeOpacity="0.6" />

          {/* Stylized Botanical Leaf 2 */}
          <path
            d="M10 260 C 50 220, 95 190, 120 130 C 115 170, 105 210, 65 245 Z"
            fill="url(#leafGrad2)"
            stroke="#E4BD5A"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <path d="M15 260 Q 70 200 120 130" stroke="#E4BD5A" strokeWidth="0.7" strokeOpacity="0.5" />

          {/* Lower glossy leaf accent */}
          <path
            d="M-15 270 C 40 270, 90 260, 125 220 C 85 240, 40 250, -15 270 Z"
            fill="url(#leafGrad1)"
            stroke="#E4BD5A"
            strokeWidth="0.7"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Main Hero Content Container */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="max-w-2xl text-left space-y-6 sm:space-y-7 animate-fade-in">
          
          {/* Eyebrow: EXCLUSIVE DESIGNER SHOWROOM with flanking gold divider lines */}
          <div className="flex items-center space-x-3 text-[#E4BD5A]">
            <div className="w-8 sm:w-12 h-[1px] bg-[#E4BD5A]/80" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] sm:tracking-[0.28em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              EXCLUSIVE DESIGNER SHOWROOM
            </span>
            <div className="w-8 sm:w-12 h-[1px] bg-[#E4BD5A]/80" />
          </div>

          {/* Headline: Style that brings hearts together */}
          <h1 className="text-[#F5F0DF] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            <span className="block font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal leading-[1.08]">
              Style that brings
            </span>
            <span className="flex items-center flex-wrap gap-x-3 sm:gap-x-4 mt-1 sm:mt-2">
              <span className="font-script text-4xl sm:text-6xl md:text-7xl lg:text-[5.4rem] font-normal font-cursive-gold leading-[0.9] flex items-center">
                hearts
                {/* Looped heart flourish continuing the cursive tail */}
                <svg
                  viewBox="0 0 28 22"
                  fill="none"
                  className="w-5 h-4 sm:w-7 sm:h-5 text-[#E4BD5A] -ml-2 sm:-ml-3 inline-block drop-shadow-[0_2px_8px_rgba(228,189,90,0.6)]"
                >
                  <path
                    d="M2 13 C 6 13, 9 10, 12 10 C 15 10, 16 13, 18 15 C 20 17, 23 14, 24 11 C 25 8, 22 6, 19 8 C 17 9, 17 12, 19 14 C 21 16, 24 14, 25 11"
                    stroke="url(#heartFlourishGold)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="heartFlourishGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF9DE" />
                      <stop offset="50%" stopColor="#E4BD5A" />
                      <stop offset="100%" stopColor="#C89626" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <span className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal leading-[1.08]">
                together
              </span>
            </span>
          </h1>

          {/* Subtitle description */}
          <p className="text-sm sm:text-base text-[#F5F0DF]/90 font-light leading-relaxed max-w-xl tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            India&apos;s first fashion house designing for people and their pets in the same breath.
            <br className="hidden sm:inline" />
            {' '}50+ pieces across People, Pets and Twin.
          </p>

          {/* Call-to-Action Pill Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-5">
            <Link
              to="/shop"
              className="btn-pill-gold group flex items-center justify-center space-x-2.5 shadow-[0_4px_25px_rgba(228,189,90,0.35)]"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-[0.18em]">SHOP THE COLLECTION</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/showroom"
              className="btn-pill-outline group flex items-center justify-center space-x-2.5"
            >
              <span className="text-xs sm:text-sm font-medium tracking-[0.18em]">ENTER THE SHOWROOM</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Integrated Trust Badges Row (Bottom Left) matching reference screenshot */}
          <div className="pt-8 sm:pt-10 border-t border-[#E4BD5A]/20">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 sm:divide-x sm:divide-[#E4BD5A]/25">
              {trustBadges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 sm:space-x-3 sm:px-3 first:pl-0 last:pr-0 group"
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4BD5A] stroke-[1.6] flex-shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_6px_rgba(228,189,90,0.3)]" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.18em] text-[#E4BD5A] uppercase leading-tight">
                        {badge.line1}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-medium tracking-[0.18em] text-[#F5F0DF] uppercase leading-tight mt-0.5">
                        {badge.line2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
