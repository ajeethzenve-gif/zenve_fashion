import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, X, Sparkles } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { productService } from '../../services/productService';
import { Product, ProductCategory } from '../../types/product';

const SHOWROOM_OCCASIONS: Record<'all' | ProductCategory, string[]> = {
  all: [
    'All',
    'Accessories',
    'Evening',
    'Everyday',
    'Festive',
    'Monsoon',
    'Party',
    'Resort',
    'Wedding',
    'Winter',
    'Workwear',
  ],
  people: [
    'All',
    'Evening',
    'Everyday',
    'Festive',
    'Monsoon',
    'Party',
    'Resort',
    'Wedding',
    'Workwear',
  ],
  pets: [
    'All',
    'Accessories',
    'Everyday',
    'Festive',
    'Monsoon',
    'Party',
    'Resort',
    'Wedding',
    'Winter',
  ],
  twin: [
    'All',
    'Accessories',
    'Evening',
    'Everyday',
    'Festive',
    'Monsoon',
    'Party',
    'Resort',
    'Wedding',
    'Winter',
  ],
};

const SHOWROOM_COLLECTIONS: {
  id: 'all' | ProductCategory;
  label: string;
  title: string;
  description: string;
  shopLink: string;
}[] = [
  {
    id: 'all',
    label: 'ALL COLLECTIONS',
    title: 'All Collections',
    description: 'The complete atelier showcase for people, pets, and matched twin sets.',
    shopLink: '/shop',
  },
  {
    id: 'people',
    label: 'PEOPLE',
    title: 'People',
    description: 'Couture, festive, workwear and evening edits, cut in small runs.',
    shopLink: '/people',
  },
  {
    id: 'pets',
    label: 'PETS',
    title: 'Pets',
    description: 'Tailored comfort with skin-safe linings for every companion.',
    shopLink: '/pets',
  },
  {
    id: 'twin',
    label: 'TWIN',
    title: 'Twin',
    description: 'Matching sets drafted in pairs, made to be photographed.',
    shopLink: '/twin',
  },
];

export const ShowroomPage: React.FC = () => {
  const [activeCollection, setActiveCollection] = useState<'all' | ProductCategory>('all');
  const [activeOccasion, setActiveOccasion] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const resolveOccasion = (col: 'all' | ProductCategory, occ: string): string => {
    const list = SHOWROOM_OCCASIONS[col] || SHOWROOM_OCCASIONS.all;
    const found = list.find((item) => item.toLowerCase() === occ.toLowerCase());
    return found || 'All';
  };

  const handleCollectionClick = (selected: 'all' | ProductCategory) => {
    setActiveCollection(selected);
    const validOcc = resolveOccasion(selected, activeOccasion);
    setActiveOccasion(validOcc);
  };

  const handleShopCollectionClick = () => {
    const el = document.getElementById('showroom-catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const results = await productService.getProducts({
        audience: activeCollection === 'all' ? undefined : activeCollection,
        occasion: activeOccasion === 'All' ? undefined : activeOccasion,
      });
      setProducts(results);
      setIsLoading(false);
    }
    loadProducts();
  }, [activeCollection, activeOccasion]);

  const currentOccasions = SHOWROOM_OCCASIONS[activeCollection] || SHOWROOM_OCCASIONS.all;
  const currentCollectionMeta =
    SHOWROOM_COLLECTIONS.find((c) => c.id === activeCollection) || SHOWROOM_COLLECTIONS[0];

  return (
    <div className="w-full bg-[#001C13] min-h-screen text-[#F5F0DF]">
      {/* 1. Ultra-Luxury Showroom Hero Banner matching Reference Art */}
      <section className="relative w-full overflow-hidden bg-[#00120B] border-b border-[#E4BD5A]/25 min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] xl:min-h-[640px] flex items-center">
        {/* Background Boutique Showroom Image (4K, razor-sharp clean backdrop) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/showroom/showroom-hero-clean-4k.png"
            alt="The Zenve Showroom"
            className="w-full h-full object-cover object-[70%_center] sm:object-[64%_center] lg:object-right select-none pointer-events-none image-crisp"
          />

          {/* Deep Emerald Left Shadow Gradient for Vector Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00120B] via-[#00140D]/95 via-35% md:via-48% to-transparent w-full lg:w-[65%] pointer-events-none" />

          {/* Top & Bottom Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00140D]/75 via-transparent to-[#00140D]/85 pointer-events-none" />
        </div>

        {/* Content Container - Spans maximum width cleanly with proper padding */}
        <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 flex flex-col justify-between h-full">
          {/* Main Hero Header Block */}
          <div className="max-w-2xl">
            {/* Top Eyebrow: ― EXCLUSIVE DESIGNER SHOWROOM */}
            <div className="flex items-center space-x-2.5 text-[#E4BD5A]">
              <div className="w-8 sm:w-12 h-[1px] bg-[#E4BD5A]" />
              <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                EXCLUSIVE DESIGNER SHOWROOM
              </span>
            </div>

            {/* Main Title: The Zenve Showroom */}
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem] text-[#F5F0DF] tracking-tight font-normal leading-[1.08] drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
              The{' '}
              <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#FFF4BD] via-[#E4BD5A] to-[#D4AF37]">
                Zenve
              </span>{' '}
              Showroom
            </h1>

            {/* Sub-eyebrow: ― FASHION BEYOND TRENDS ― */}
            <div className="flex items-center space-x-3 mt-3 text-[#E4BD5A]">
              <div className="w-6 sm:w-10 h-[1px] bg-[#E4BD5A]/70" />
              <span className="text-[10px] sm:text-xs font-medium tracking-[0.28em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                FASHION BEYOND TRENDS
              </span>
              <div className="w-6 sm:w-10 h-[1px] bg-[#E4BD5A]/70" />
            </div>

            {/* Description */}
            <p className="mt-4 max-w-xl text-xs sm:text-sm md:text-base text-[#F5F0DF]/90 font-light leading-relaxed tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              57 designs on display. Filter a collection, open a piece and add it to your bag.
            </p>

            {/* Micro-tags: EXPLORE • DISCOVER • EXPERIENCE */}
            <p className="mt-3 text-[10px] sm:text-[11px] tracking-[0.25em] text-[#E4BD5A]/90 uppercase font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              EXPLORE &nbsp;•&nbsp; DISCOVER &nbsp;•&nbsp; EXPERIENCE
            </p>

            {/* CTA Buttons: SHOP COLLECTION → and WATCH SHOWROOM TOUR */}
            <div className="mt-8 flex flex-wrap items-center gap-4 select-none">
              {/* Primary Pill Button: SHOP COLLECTION → */}
              <button
                onClick={handleShopCollectionClick}
                className="inline-flex items-center space-x-2.5 px-6 sm:px-8 py-3 rounded-full bg-[#002217]/90 border border-[#E4BD5A] text-[#F5F0DF] text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#E4BD5A] hover:text-[#001C13] hover:shadow-[0_0_25px_rgba(228,189,90,0.6)] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary Button: WATCH SHOWROOM TOUR */}
              <button
                onClick={() => setIsTourOpen(true)}
                className="inline-flex items-center space-x-3 px-5 sm:px-6 py-2.5 rounded-full border border-[#E4BD5A]/40 bg-[#001710]/70 text-[#F5F0DF] hover:border-[#E4BD5A] hover:text-[#E4BD5A] hover:bg-[#002B1D]/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full border border-[#E4BD5A] flex items-center justify-center bg-[#002419] group-hover:scale-105 group-hover:bg-[#E4BD5A] transition-all">
                  <Play className="w-3.5 h-3.5 text-[#E4BD5A] group-hover:text-[#001C13] fill-current translate-x-0.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] uppercase tracking-wider text-[#B8B9A8]">Watch</span>
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#F5F0DF] group-hover:text-[#E4BD5A]">
                    Showroom Tour
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Row / Floating Stats Badges on Desktop & Mobile */}
          <div className="mt-10 pt-6 border-t border-[#E4BD5A]/15 flex flex-wrap items-center justify-between gap-4 max-w-2xl">
            {/* 57+ DESIGNS (Circular Badge Style) */}
            <button
              onClick={() => {
                setActiveCollection('all');
                handleShopCollectionClick();
              }}
              className="flex items-center space-x-3 text-left group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full border border-[#E4BD5A]/60 flex items-center justify-center bg-[#002419]/70 group-hover:border-[#E4BD5A] group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(228,189,90,0.4)] transition-all">
                <span className="font-serif text-sm font-semibold text-[#E4BD5A]">57+</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#F5F0DF] group-hover:text-[#E4BD5A]">
                  DESIGNS
                </span>
                <span className="text-[9px] text-[#B8B9A8] font-light">On Display</span>
              </div>
            </button>

            <div className="w-[1px] h-8 bg-[#E4BD5A]/20 hidden sm:block" />

            {/* 3 WORLDS */}
            <button
              onClick={() => {
                setActiveCollection((prev) => (prev === 'all' ? 'people' : prev === 'people' ? 'pets' : prev === 'pets' ? 'twin' : 'all'));
                handleShopCollectionClick();
              }}
              className="flex items-center space-x-3 text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl font-semibold text-[#E4BD5A]">3</span>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#F5F0DF] group-hover:text-[#E4BD5A]">
                  WORLDS
                </span>
                <span className="text-[9px] text-[#B8B9A8] font-light">People · Pets · Twin</span>
              </div>
            </button>

            <div className="w-[1px] h-8 bg-[#E4BD5A]/20 hidden sm:block" />

            {/* ∞ ENDLESS POSSIBILITIES */}
            <Link
              to="/contact"
              className="flex items-center space-x-3 text-left group cursor-pointer"
            >
              <span className="font-serif text-2xl font-semibold text-[#E4BD5A]">∞</span>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#F5F0DF] group-hover:text-[#E4BD5A]">
                  POSSIBILITIES
                </span>
                <span className="text-[9px] text-[#B8B9A8] font-light">Bespoke Couture</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Main Interactive Showroom Catalogue */}
      <main id="showroom-catalogue" className="w-full bg-[#002219] border-b border-[#E4BD5A]/15 py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 text-left">
          {/* Collection Audience Switcher Tabs: ALL COLLECTIONS | PEOPLE | PETS | TWIN */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pb-8 border-b border-[#E4BD5A]/15 mb-8">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#E4BD5A]/70 font-semibold mr-2 hidden sm:inline-block">
              Collection:
            </span>
            {SHOWROOM_COLLECTIONS.map((tab) => {
              const isActive = activeCollection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleCollectionClick(tab.id)}
                  className={`rounded-xl px-4 sm:px-5 py-2 text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-[#D5BA64] text-[#132516] shadow-[0_0_20px_rgba(213,186,100,0.55)] border border-[#D5BA64]'
                      : 'bg-[#002219] border border-[#526857]/50 text-[#B8C7BC] hover:border-[#D5BA64]/70 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Header block matching reference screenshot */}
          <div className="text-left space-y-1.5">
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {isLoading ? '...' : `${products.length} DESIGNS`}
            </p>
            <h2 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] text-[#F7F4EB] font-normal tracking-tight leading-none mt-1">
              {currentCollectionMeta.title}
            </h2>
            <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed max-w-2xl pt-2">
              {currentCollectionMeta.description}
            </p>
          </div>

          {/* Occasion Filter Pills Row + SHOP [COLLECTION] Link matching reference screenshot */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-6">
            {/* Horizontal Occasion Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 select-none">
              {currentOccasions.map((occ) => {
                const isActive = activeOccasion.toLowerCase() === occ.toLowerCase();
                return (
                  <button
                    key={occ}
                    onClick={() => setActiveOccasion(occ)}
                    className={`rounded-xl px-4 sm:px-5 py-2 text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#D5BA64] text-[#132516] shadow-[0_0_20px_rgba(213,186,100,0.55)] border border-[#D5BA64]'
                        : 'bg-[#002219] border border-[#526857]/50 text-[#B8C7BC] hover:border-[#D5BA64]/70 hover:text-white'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>

            {/* SHOP [COLLECTION] Link with Underline */}
            <div className="flex-shrink-0 pt-2 lg:pt-0">
              <Link
                to={`${currentCollectionMeta.shopLink}${
                  activeOccasion && activeOccasion !== 'All'
                    ? `?occasion=${encodeURIComponent(activeOccasion)}`
                    : ''
                }`}
                className="group inline-flex items-center space-x-2 border-b-[1.5px] border-[#E4BD5A] pb-1 text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#E4BD5A] uppercase transition-colors hover:text-white hover:border-white cursor-pointer"
              >
                <span>SHOP {currentCollectionMeta.title.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>

          {/* 4-Column Product Grid */}
          <div className="mt-10 sm:mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] bg-[#002217] border border-[#244c3b]/50 animate-pulse rounded-sm"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center space-y-4 border border-[#244c3b]/60 bg-[#002217]/30 my-8">
                <h3 className="font-serif text-2xl text-[#F5F0DF]">No Atelier Pieces Matched</h3>
                <p className="text-xs text-[#9ca3af] max-w-sm mx-auto font-light">
                  No creations currently match your selected filters. Please select another category or reset your criteria.
                </p>
                <button
                  onClick={() => {
                    setActiveCollection('all');
                    setActiveOccasion('All');
                  }}
                  className="btn-gold text-xs mt-2"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>


      {/* 3. Luxury Virtual Showroom Walkthrough Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#001710] border border-[#E4BD5A]/40 rounded-2xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4BD5A]/25 bg-[#001C13]">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] font-semibold uppercase">
                  ZENVE FLAGSHIP SHOWROOM · 360° TOUR
                </span>
              </div>
              <button
                onClick={() => setIsTourOpen(false)}
                className="p-1 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors rounded-full hover:bg-white/5 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6 text-left">
              {/* Showroom Panoramic Visual */}
              <div className="relative rounded-xl overflow-hidden border border-[#E4BD5A]/25 shadow-lg group">
                <img
                  src="/images/showroom/zenve-showroom-walkthrough.jpg"
                  alt="Zenve Flagship Showroom Interior"
                  className="w-full h-64 sm:h-80 md:h-96 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00140D] via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-[#F5F0DF]">
                  <span className="bg-[#001C13]/80 backdrop-blur-sm border border-[#E4BD5A]/30 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase text-[#E4BD5A]">
                    Jayanagar 9th Block, Bengaluru
                  </span>
                  <span className="text-[11px] text-[#B8B9A8] font-light hidden sm:inline">
                    Emerald Marble &amp; Brushed Brass Salon
                  </span>
                </div>
              </div>

              {/* Atelier Experience Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#002217]/70 border border-[#244c3b] hover:border-[#E4BD5A]/50 transition-colors">
                  <h4 className="font-serif text-[#F5F0DF] text-base mb-1">Couture Fitting Suites</h4>
                  <p className="text-xs text-[#9ca3af] font-light leading-relaxed">
                    Spacious private suites with full-length vanity mirrors designed for you and your companion.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#002217]/70 border border-[#244c3b] hover:border-[#E4BD5A]/50 transition-colors">
                  <h4 className="font-serif text-[#F5F0DF] text-base mb-1">Skin-Safe Linings Lab</h4>
                  <p className="text-xs text-[#9ca3af] font-light leading-relaxed">
                    Examine our hypoallergenic pure Mulberry silk and breathable organic cotton linings in person.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#002217]/70 border border-[#244c3b] hover:border-[#E4BD5A]/50 transition-colors">
                  <h4 className="font-serif text-[#F5F0DF] text-base mb-1">Twin Tailoring Bar</h4>
                  <p className="text-xs text-[#9ca3af] font-light leading-relaxed">
                    Coordinated human and companion silhouettes measured and hand-stitched by master artisans.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-[#E4BD5A]/25 bg-[#00140D]">
              <button
                onClick={() => {
                  setIsTourOpen(false);
                  handleShopCollectionClick();
                }}
                className="text-xs uppercase tracking-[0.2em] text-[#E4BD5A] hover:underline cursor-pointer"
              >
                ← Explore 57 Designs on Display
              </button>
              <Link
                to="/contact"
                className="btn-gold text-xs tracking-widest uppercase font-semibold py-2.5 px-6"
              >
                Contact Salon Concierge →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
