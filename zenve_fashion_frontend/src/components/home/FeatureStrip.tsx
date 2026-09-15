import React from 'react';
import { Scissors, Heart, Sparkles, Truck } from 'lucide-react';

export const FeatureStrip: React.FC = () => {
  const features = [
    {
      icon: Scissors,
      title: 'Hand-finished',
      description: 'Limited-run atelier make.',
    },
    {
      icon: Heart,
      title: 'Pet-safe',
      description: 'Skin-friendly, tested fabrics.',
    },
    {
      icon: Sparkles,
      title: 'Twin design',
      description: 'Every look has a match.',
    },
    {
      icon: Truck,
      title: 'Free shipping',
      description: 'Complimentary across India.',
    },
  ];

  return (
    <section className="w-full bg-[#001710] py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative z-20">
      <div className="max-w-[1380px] mx-auto">
        {/* Luxury Rounded Pill Container matching screenshot */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E4BD5A]/35 bg-gradient-to-r from-[#002419] via-[#003B2A] to-[#002419] px-6 sm:px-8 lg:px-10 py-6 sm:py-7 shadow-[0_16px_40px_rgba(0,0,0,0.65)]">
          
          {/* Subtle Ambient Emerald Glow */}
          <div className="absolute inset-0 bg-radial from-[#00543B]/20 via-transparent to-transparent pointer-events-none" />

          {/* Left Decorative Botanical Line Flourish */}
          <div className="absolute -left-4 -bottom-4 w-32 h-32 pointer-events-none opacity-40">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full stroke-[#E4BD5A]">
              <path d="M10 90 Q 50 15 90 45" strokeWidth="1.2" />
              <path d="M0 70 Q 40 25 80 65" strokeWidth="0.8" opacity="0.6" />
              <circle cx="50" cy="50" r="38" strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4" />
            </svg>
          </div>

          {/* Right Botanical Golden Leaves Accent matching screenshot */}
          <div className="absolute right-0 top-0 bottom-0 w-36 sm:w-48 pointer-events-none overflow-hidden flex items-center justify-end pr-2 sm:pr-4 opacity-75">
            <svg viewBox="0 0 160 110" fill="none" className="w-full h-auto">
              {/* Upper leaf */}
              <path
                d="M70 42 C 98 16, 132 20, 148 10 C 138 32, 122 56, 92 50 Z"
                stroke="#E4BD5A"
                strokeWidth="1.2"
                fill="#004D36"
                fillOpacity="0.3"
              />
              <path d="M84 38 Q 110 28 138 16" stroke="#E4BD5A" strokeWidth="0.8" opacity="0.75" />
              
              {/* Lower leaf */}
              <path
                d="M85 54 C 114 48, 136 70, 152 75 C 130 90, 102 86, 85 70 Z"
                stroke="#E4BD5A"
                strokeWidth="1.2"
                fill="#004D36"
                fillOpacity="0.3"
              />
              <path d="M96 61 Q 120 68 142 74" stroke="#E4BD5A" strokeWidth="0.8" opacity="0.75" />

              {/* Graceful contour curve */}
              <path
                d="M50 10 Q 105 45 135 100"
                stroke="#E4BD5A"
                strokeWidth="0.6"
                strokeDasharray="2 3"
                opacity="0.4"
              />
            </svg>
          </div>

          {/* 4 Feature Items Grid with Dividers */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x lg:divide-[#E4BD5A]/20">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center space-x-4 lg:px-6 first:pl-2 last:pr-2 group transition-transform duration-300 hover:translate-x-1 sm:hover:translate-x-0"
                >
                  {/* Rounded Gold-Glow Icon Box matching screenshot */}
                  <div className="relative flex-shrink-0 w-12 h-12 sm:w-13 sm:h-13 rounded-xl border border-[#E4BD5A]/70 bg-[#001D14]/80 shadow-[0_0_14px_rgba(228,189,90,0.22)] flex items-center justify-center transition-all duration-300 group-hover:border-[#E4BD5A] group-hover:shadow-[0_0_20px_rgba(228,189,90,0.45)] group-hover:scale-105">
                    <Icon className="w-5 h-5 text-[#E4BD5A] stroke-[1.6]" />
                  </div>

                  {/* Title & Description */}
                  <div className="text-left">
                    <h4 className="font-serif text-[16px] sm:text-[17px] text-[#F5F0DF] tracking-normal font-normal leading-snug group-hover:text-[#E4BD5A] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#A2B19F] font-light leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};
