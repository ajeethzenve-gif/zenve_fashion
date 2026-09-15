import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint } from 'lucide-react';

export const ShowroomBanner: React.FC = () => {
  return (
    <section className="relative w-full min-h-[600px] sm:min-h-[660px] lg:min-h-[720px] flex items-center justify-center overflow-hidden bg-[#00140D] border-y border-[#E4BD5A]/20">
      {/* Centered Showroom Panoramic Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/showroom/zenve-showroom-hero.jpg"
          alt="The ZENVE Showroom Interior with Golden Retriever"
          className="w-full h-full object-cover object-center scale-100 image-crisp select-none pointer-events-none"
        />

        {/* Ambient Dark Emerald Overlays for Contrast & Depth */}
        <div className="absolute inset-0 green-shadow-banner pointer-events-none opacity-90" />
        <div className="absolute inset-0 bg-radial from-[#001C13]/55 via-[#001710]/80 to-[#00140D]/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00140D] via-transparent to-[#00140D]/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00140D]/85 via-transparent to-[#00140D]/85 pointer-events-none" />
      </div>

      {/* Left-Side Editorial Accents (matching reference image) */}
      <div className="absolute left-6 sm:left-10 lg:left-14 top-[32%] -translate-y-1/2 hidden md:flex items-start space-x-3.5 pointer-events-none z-20 select-none">
        <div className="w-[1.5px] h-24 bg-gradient-to-b from-[#E4BD5A] via-[#E4BD5A]/50 to-transparent" />
        <div className="flex flex-col text-left space-y-1.5 pt-0.5">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            PEOPLE
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            PETS
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            STYLE
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            TOGETHER
          </span>
        </div>
      </div>

      {/* Bottom-Left Subtle Watermark Text */}
      <div className="absolute left-6 sm:left-10 lg:left-14 bottom-10 sm:bottom-14 hidden md:flex flex-col text-left space-y-1 pointer-events-none z-20 select-none">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#E4BD5A]/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          MORE THAN
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#E4BD5A]/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          A SHOWROOM
        </span>
        <div className="w-7 h-[1px] bg-[#E4BD5A]/60 mt-1" />
      </div>

      {/* Right-Side Editorial Text */}
      <div className="absolute right-6 sm:right-10 lg:right-14 top-[32%] -translate-y-1/2 hidden md:flex flex-col text-right items-end space-y-1 pointer-events-none z-20 select-none">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#E4BD5A]/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          STYLE
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#E4BD5A]/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          FOR EVERY
        </span>
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#E4BD5A]/90 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          BOND
        </span>
        <div className="w-7 h-[1px] bg-[#E4BD5A]/60 mt-1" />
      </div>

      {/* Bottom-Left Foreground Blurred Foliage */}
      <div className="absolute -bottom-8 -left-8 w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 pointer-events-none z-20 overflow-hidden select-none opacity-85">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full filter blur-[2px]">
          <path
            d="M-20 220 C 30 160, 70 120, 50 60 C 90 90, 110 140, 80 200 Z"
            fill="#052E20"
            stroke="#0B4E37"
            strokeWidth="2"
          />
          <path
            d="M10 210 C 60 170, 110 140, 130 90 C 120 130, 110 180, 50 210 Z"
            fill="#083B2A"
          />
          <path
            d="M-30 200 C 20 180, 80 190, 110 160 C 60 180, 10 190, -30 200 Z"
            fill="#032117"
          />
        </svg>
      </div>

      {/* Bottom-Right Foreground Blurred Foliage */}
      <div className="absolute -bottom-8 -right-8 w-44 sm:w-56 md:w-64 h-44 sm:h-56 md:h-64 pointer-events-none z-20 overflow-hidden select-none opacity-85">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full filter blur-[2px]">
          <path
            d="M220 220 C 170 160, 130 120, 150 60 C 110 90, 90 140, 120 200 Z"
            fill="#052E20"
            stroke="#0B4E37"
            strokeWidth="2"
          />
          <path
            d="M190 210 C 140 170, 90 140, 70 90 C 80 130, 90 180, 150 210 Z"
            fill="#083B2A"
          />
        </svg>
      </div>

      {/* Main Centered Content */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6 animate-fade-in py-12 sm:py-16">
        
        {/* Eyebrow with flanking gold lines */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-[#E4BD5A]">
          <div className="w-10 sm:w-16 h-[1px] bg-[#E4BD5A]/80" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.26em] sm:tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            THE ZENVE SHOWROOM
          </span>
          <div className="w-10 sm:w-16 h-[1px] bg-[#E4BD5A]/80" />
        </div>

        {/* Headline: Walk through the collection, piece by piece */}
        <h2 className="text-[#F5F0DF] tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
          <span className="block font-serif text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal leading-[1.12]">
            Walk through the collection,
          </span>
          <span className="block font-serif italic text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-normal text-[#E4BD5A] leading-[1.12] mt-1 drop-shadow-[0_2px_12px_rgba(228,189,90,0.5)]">
            piece by piece
          </span>
        </h2>

        {/* Central Gold Paw Divider */}
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 py-0.5">
          <div className="w-14 sm:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#E4BD5A]/70 to-[#E4BD5A]" />
          <PawPrint className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4BD5A] fill-[#E4BD5A]/25 stroke-[1.6] drop-shadow-[0_2px_6px_rgba(228,189,90,0.6)]" />
          <div className="w-14 sm:w-24 h-[1px] bg-gradient-to-l from-transparent via-[#E4BD5A]/70 to-[#E4BD5A]" />
        </div>

        {/* Subtitle Description */}
        <p className="text-xs sm:text-sm md:text-base text-[#F5F0DF]/90 font-light leading-relaxed max-w-xl mx-auto tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] px-2">
          Filter by collection, open any design in the viewer and add it to your bag without leaving the room.
        </p>

        {/* CTA Button */}
        <div className="pt-2 sm:pt-3">
          <Link
            to="/showroom"
            className="inline-flex items-center justify-center bg-[#E4BD5A] text-[#001C13] font-semibold tracking-[0.2em] uppercase rounded-md px-8 sm:px-10 py-3.5 text-xs sm:text-sm transition-all duration-300 hover:bg-[#F5D77F] hover:shadow-[0_6px_25px_rgba(228,189,90,0.45)] hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer shadow-lg"
          >
            <span>ENTER SHOWROOM</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
};
