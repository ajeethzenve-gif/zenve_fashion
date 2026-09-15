import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scissors,
  Heart,
  Sparkles,
  Store,
  ArrowRight,
  ShieldCheck,
  Feather,
  Gem,
  MapPin,
  Clock,
} from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="relative w-full bg-[#001911] min-h-screen text-[#F7F4EB] overflow-hidden text-left">
      {/* Dynamic Molten Gold Ribbons Background Accents */}
      {/* Top-Left Arched Gold Wave */}
      <div className="absolute top-0 left-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonTLAbout" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#B38938" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowTLAbout" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10"
            stroke="url(#goldRibbonTLAbout)"
            strokeWidth="3"
            filter="url(#glowTLAbout)"
          />
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10 L 0 -10 L -30 -10 Z"
            fill="url(#goldRibbonTLAbout)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Bottom-Right Arched Gold Wave */}
      <div className="absolute bottom-0 right-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonBRAbout" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#B38938" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowBRAbout" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 320 390 C 430 300, 520 200, 650 110"
            stroke="url(#goldRibbonBRAbout)"
            strokeWidth="3"
            filter="url(#glowBRAbout)"
          />
          <path
            d="M 320 390 C 430 300, 520 200, 650 110 L 650 390 Z"
            fill="url(#goldRibbonBRAbout)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[950px] h-[520px] bg-radial from-[#043E2C]/25 via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-24 space-y-20 sm:space-y-28">
        
        {/* 1. Top Editorial Header matching Journal & Showroom language */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-4 sm:pb-8 border-b border-[#E4BD5A]/15">
          {/* Left Title & Summary */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#E4BD5A] uppercase">
                THE HOUSE
              </span>
              <div className="w-10 h-[1.5px] bg-[#E4BD5A]/70" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#F7F4EB] font-normal tracking-tight leading-[1.08]">
              Style that brings <span className="text-[#E4BD5A]">hearts</span> together
            </h1>

            <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed pt-1">
              Zenve Pets Healthcare Private Limited builds one unified wardrobe for the whole family. Haute couture for people, hypoallergenic tailored comfort for pets, and Twin sets crafted to be lived in side by side.
            </p>
          </div>

          {/* Right Bespoke Editorial Tag */}
          <div className="hidden md:flex items-start space-x-4 pt-2 flex-shrink-0">
            <div className="w-[1.5px] h-18 bg-[#E4BD5A]/60" />
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                CRAFTED
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                FOR A MORE
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                BEAUTIFUL
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                EVERYDAY
              </span>
              <div className="w-6 h-[1.5px] bg-[#E4BD5A]/60 mt-2" />
            </div>
          </div>
        </div>

        {/* 2. Our Story: Born in Bengaluru Showcase */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center bg-[#002116]/40 p-6 sm:p-8 lg:p-10 rounded-[32px] sm:rounded-[40px] border border-[#E4BD5A]/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
          {/* Left: Showroom Flagship Image in Fine Gold Border */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[24px] sm:rounded-[32px] overflow-hidden border border-[#E4BD5A]/35 shadow-[0_15px_40px_rgba(0,0,0,0.65)] group aspect-[16/10] bg-[#00140D]">
              <img
                src="/images/journal/inside-jayanagar-showroom.jpg"
                alt="Inside the Jayanagar Showroom"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#F5F0DF]">
                <span className="bg-[#001C13]/85 backdrop-blur-sm border border-[#E4BD5A]/40 px-3.5 py-1 rounded-full text-[10px] tracking-widest uppercase text-[#E4BD5A] font-semibold">
                  Jayanagar Flagship Salon
                </span>
                <span className="text-[11px] text-[#B8C7BC] font-light hidden sm:inline">
                  Bengaluru · 560041
                </span>
              </div>
            </div>
          </div>

          {/* Right: Story Content */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left py-2 lg:py-4 space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                OUR STORY
              </span>
              <div className="w-8 h-[1.5px] bg-[#E4BD5A]/60" />
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#F7F4EB] font-normal leading-[1.14] tracking-tight">
              Born in <span className="text-[#E4BD5A]">Bengaluru</span>
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed pt-1">
              <p>
                Zenve began with a simple frustration: you could dress exquisitely, or you could dress your pet companion, but never as one cohesive silhouette. Luxury Indian fashion had no maison that respected four paws as full family members.
              </p>
              <p>
                We started with six hand-embroidered festive pieces and one matching companion vest. Today, the atelier spans Festive, Evening, Workwear, Resort, and Everyday edits across People, Pets, and Twin — each piece measured, cut, and drafted in pairs.
              </p>
              <p className="border-l-2 border-[#E4BD5A]/70 pl-3.5 italic text-[#F7F4EB]/90">
                “Every seam that touches animal skin is vetted for hypoallergenic safety and kinetic freedom before our designers ever sketch the gold embroidery.”
              </p>
            </div>

            <div className="pt-3">
              <Link
                to="/shop"
                className="group inline-flex items-center space-x-3 rounded-full px-7 py-3 border border-[#E4BD5A]/80 text-[#E4BD5A] font-semibold text-xs tracking-[0.2em] uppercase bg-[#001D14]/80 hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all duration-300 shadow-[0_0_15px_rgba(228,189,90,0.2)] hover:shadow-[0_0_25px_rgba(228,189,90,0.5)] cursor-pointer"
              >
                <span>EXPLORE THE COLLECTION</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Four Atelier Pillars */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold tracking-[0.28em] text-[#E4BD5A] uppercase">
              THE ZENVE CODE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#F7F4EB] font-normal tracking-tight">
              Four Foundations of Our Workroom
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed">
              Every creation leaving our Bengaluru atelier adheres to four immutable principles of haute craftsmanship and animal wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
            {/* Pillar 1 */}
            <div className="p-7 rounded-2xl bg-[#002218]/60 border border-[#E4BD5A]/20 hover:border-[#E4BD5A]/60 transition-all duration-300 shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] shadow-inner group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-[#F7F4EB] font-normal group-hover:text-[#E4BD5A] transition-colors">
                Atelier Made
              </h3>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Cut, embroidered, and hand-finished in small numbered runs by resident master artisans at our Bengaluru salon.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-2xl bg-[#002218]/60 border border-[#E4BD5A]/20 hover:border-[#E4BD5A]/60 transition-all duration-300 shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] shadow-inner group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-[#F7F4EB] font-normal group-hover:text-[#E4BD5A] transition-colors">
                Pet-First Safety
              </h3>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Hypoallergenic Mulberry silk linings, non-friction flat seams, and magnetic breakaway fasteners placed away from pressure nerves.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-2xl bg-[#002218]/60 border border-[#E4BD5A]/20 hover:border-[#E4BD5A]/60 transition-all duration-300 shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] shadow-inner group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-[#F7F4EB] font-normal group-hover:text-[#E4BD5A] transition-colors">
                Designed in Pairs
              </h3>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Never costumes, always couture. Each human silhouette is drafted synchronously with its pet companion counterweight.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-7 rounded-2xl bg-[#002218]/60 border border-[#E4BD5A]/20 hover:border-[#E4BD5A]/60 transition-all duration-300 shadow-md hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-3.5 group">
              <div className="w-12 h-12 rounded-xl bg-[#001710] border border-[#E4BD5A]/35 flex items-center justify-center text-[#E4BD5A] shadow-inner group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-serif text-xl text-[#F7F4EB] font-normal group-hover:text-[#E4BD5A] transition-colors">
                A Real Showroom
              </h3>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Private twin dressing suites with non-slip Italian marble, acoustic drapery, and pedestal vanity mirrors in Jayanagar.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Atelier Craftsmanship & Material Integrity */}
        <section className="rounded-3xl bg-[#002116]/50 border border-[#E4BD5A]/25 p-8 sm:p-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E4BD5A]/15 pb-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold tracking-[0.28em] text-[#E4BD5A] uppercase">
                ATELIER SAVOIR-FAIRE
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F7F4EB] font-normal tracking-tight">
                Noble Fibers &amp; Ethical Science
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#B8C7BC] font-light max-w-md">
              We source natural fibers that honor centuries of South Indian weaving traditions while preventing skin dermatitis in pets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#001911]/80 border border-[#E4BD5A]/20 space-y-3">
              <Feather className="w-6 h-6 text-[#E4BD5A]" strokeWidth={1.5} />
              <h4 className="font-serif text-lg text-[#F7F4EB]">Mulberry Silk &amp; Micro-Velvet</h4>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Ultra-smooth filament silk glides over animal fur without static friction, heat build-up, or matting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#001911]/80 border border-[#E4BD5A]/20 space-y-3">
              <Gem className="w-6 h-6 text-[#E4BD5A]" strokeWidth={1.5} />
              <h4 className="font-serif text-lg text-[#F7F4EB]">Real Metallic Zari Craft</h4>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Hand-embroidered metallic threads secured on exterior faces so skin surfaces remain completely cushioned.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#001911]/80 border border-[#E4BD5A]/20 space-y-3">
              <ShieldCheck className="w-6 h-6 text-[#E4BD5A]" strokeWidth={1.5} />
              <h4 className="font-serif text-lg text-[#F7F4EB]">Veterinary Ergonomics</h4>
              <p className="text-xs text-[#B8C7BC] font-light leading-relaxed">
                Four cardinal measurements ensure thoracic expansion, spine flexing, and natural relief without constriction.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Flagship Invitation: Visit the Jayanagar Flagship */}
        <section className="py-16 sm:py-20 text-center rounded-3xl bg-[#002218]/50 border border-[#E4BD5A]/25 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto px-6 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#E4BD5A] font-semibold">
              FLAGSHIP SALON &amp; ATELIER
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F7F4EB] font-normal tracking-tight">
              Experience the Salon in Jayanagar
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed max-w-lg mx-auto">
              1446, 4th Floor, Puttayyanpalya, Kottapalya, Jayanagara 9th Block, Bengaluru 560041. Monday through Sunday, 11:00 – 20:30 IST. Four-legged guests always welcomed with chilled water &amp; silk cushions.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/contact"
                className="inline-block bg-[#E4BD5A] text-[#001C13] font-semibold px-8 py-3.5 text-xs sm:text-sm tracking-[0.25em] uppercase hover:bg-[#F1D27A] transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(228,189,90,0.3)] hover:shadow-[0_0_30px_rgba(228,189,90,0.5)] cursor-pointer"
              >
                CONTACT ATELIER
              </Link>
              <Link
                to="/showroom"
                className="inline-flex items-center space-x-2 border border-[#E4BD5A]/70 text-[#E4BD5A] px-7 py-3.5 text-xs sm:text-sm tracking-[0.2em] uppercase hover:bg-[#E4BD5A]/10 transition-colors rounded-sm cursor-pointer"
              >
                <span>VIRTUAL SHOWROOM TOUR</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

