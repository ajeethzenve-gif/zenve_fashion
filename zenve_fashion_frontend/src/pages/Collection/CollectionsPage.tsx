import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint, Heart, Sparkles, Play } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { productService } from '../../services/productService';
import { Product, ProductCategory } from '../../types/product';

// Luxury Coat Hanger SVG Icon
const HangerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3 C10.5 3 10 5 11.5 6 C12.5 6.7 13 7.5 12 9 L2 16 C1.5 16.5 2 17.5 3 17.5 L21 17.5 C22 17.5 22.5 16.5 22 16 L12 9 Z" />
    <path d="M10 21 L14 21" />
  </svg>
);

interface AudienceMeta {
  key: ProductCategory;
  title: string;
  countLabel: string;
  description: string;
  shopLink: string;
  occasions: string[];
}

const AUDIENCES: AudienceMeta[] = [
  {
    key: 'people',
    title: 'People',
    countLabel: '22 DESIGNS',
    description: 'Couture, festive, workwear and evening edits, cut in small runs.',
    shopLink: '/people',
    occasions: ['Evening', 'Everyday', 'Festive', 'Monsoon', 'Party', 'Resort', 'Wedding', 'Workwear'],
  },
  {
    key: 'pets',
    title: 'Pets',
    countLabel: '20 DESIGNS',
    description: 'Tailored comfort with skin-safe linings for every companion.',
    shopLink: '/pets',
    occasions: ['Accessories', 'Everyday', 'Festive', 'Monsoon', 'Party', 'Resort', 'Wedding', 'Winter'],
  },
  {
    key: 'twin',
    title: 'Twin',
    countLabel: '15 DESIGNS',
    description: 'Matching sets drafted in pairs, made to be photographed.',
    shopLink: '/twin',
    occasions: ['Accessories', 'Evening', 'Everyday', 'Festive', 'Monsoon', 'Party', 'Resort', 'Wedding', 'Winter'],
  },
];

export const CollectionsPage: React.FC = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Per-audience active selected occasion matching reference screenshot
  const [selectedOccasions, setSelectedOccasions] = useState<Record<ProductCategory, string>>({
    people: 'Evening',
    pets: 'Accessories',
    twin: 'Evening',
  });

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      const results = await productService.getProducts();
      setAllProducts(results);
      setIsLoading(false);
    }
    loadAll();
  }, []);

  const totalDesignsCount = allProducts.length > 0 ? `${allProducts.length}+` : '57+';

  const handleOccasionClick = (audKey: ProductCategory, occ: string) => {
    setSelectedOccasions((prev) => ({
      ...prev,
      [audKey]: prev[audKey] === occ ? '' : occ,
    }));
  };

  return (
    <div className="w-full bg-[#00140D] min-h-screen text-[#F5F0DF]">
      {/* 1. Ultra-Luxury Collections Header Banner matching reference mockup */}
      <section className="relative w-full overflow-hidden bg-[#00120B] border-b border-[#E4BD5A]/25 min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        
        {/* Background Image: Showroom with Chandelier, Dog, and Gold Porthole Frame with Mannequin & Handbag on right */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/collections/collections-hero-clean.png"
            alt="ZENVE The Wardrobe Collections Showroom"
            className="w-full h-full object-cover object-[75%_center] sm:object-right select-none pointer-events-none image-crisp"
          />

          {/* Deep Emerald Left Shadow Gradient for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00140D] via-[#001810]/95 via-45% md:via-55% to-transparent w-full lg:w-[62%] pointer-events-none" />
          
          {/* Subtle Top & Bottom Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00140D]/75 via-transparent to-[#00140D] pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto">
          
          {/* Eyebrow: ── THE WARDROBE */}
          <div className="flex items-center space-x-2.5 text-[#E4BD5A]">
            <div className="w-8 sm:w-12 h-[1px] bg-[#E4BD5A]/80" />
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              THE WARDROBE
            </span>
          </div>

          {/* Main Title: Collections with golden sparkle star */}
          <div className="relative inline-block mt-2 sm:mt-3">
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[4.8rem] text-[#F5F0DF] tracking-tight font-normal leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
              Collections
            </h1>
            {/* Shining 4-point sparkle star glint */}
            <div className="absolute -top-1 sm:-top-2 -right-4 sm:-right-6 pointer-events-none">
              <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#FFF6D4] fill-[#E4BD5A] animate-pulse drop-shadow-[0_0_14px_rgba(228,189,90,0.85)]" />
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs sm:text-sm md:text-base text-[#F5F0DF]/90 font-light leading-relaxed max-w-xl tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {totalDesignsCount} designs across three worlds. Open any collection to shop, or step into the interactive showroom.
          </p>

          {/* Three Collection Features (People, Pets, Twin) */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 border-y border-[#E4BD5A]/20 py-3.5 sm:py-4 select-none max-w-2xl">
            {/* People */}
            <Link
              to="/people"
              className="flex items-center space-x-3 group transition-transform duration-300 hover:translate-x-1"
            >
              <div className="w-8 h-8 rounded-lg border border-[#E4BD5A]/40 flex items-center justify-center text-[#E4BD5A] group-hover:border-[#E4BD5A] group-hover:bg-[#E4BD5A]/15 transition-colors">
                <HangerIcon className="w-4 h-4 stroke-[1.6]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-serif font-medium text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors">
                  People
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#B8B9A8] tracking-wider uppercase font-light">
                  Couture &amp; Everyday
                </span>
              </div>
            </Link>

            <div className="hidden sm:block w-[1px] h-6 bg-[#E4BD5A]/30" />

            {/* Pets */}
            <Link
              to="/pets"
              className="flex items-center space-x-3 group transition-transform duration-300 hover:translate-x-1"
            >
              <div className="w-8 h-8 rounded-lg border border-[#E4BD5A]/40 flex items-center justify-center text-[#E4BD5A] group-hover:border-[#E4BD5A] group-hover:bg-[#E4BD5A]/15 transition-colors">
                <PawPrint className="w-4 h-4 stroke-[1.6]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-serif font-medium text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors">
                  Pets
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#B8B9A8] tracking-wider uppercase font-light">
                  Stylish Comfort
                </span>
              </div>
            </Link>

            <div className="hidden sm:block w-[1px] h-6 bg-[#E4BD5A]/30" />

            {/* Twin */}
            <Link
              to="/twin"
              className="flex items-center space-x-3 group transition-transform duration-300 hover:translate-x-1"
            >
              <div className="w-8 h-8 rounded-lg border border-[#E4BD5A]/40 flex items-center justify-center text-[#E4BD5A] group-hover:border-[#E4BD5A] group-hover:bg-[#E4BD5A]/15 transition-colors">
                <Heart className="w-4 h-4 stroke-[1.6]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-serif font-medium text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors">
                  Twin
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#B8B9A8] tracking-wider uppercase font-light">
                  Designed Together
                </span>
              </div>
            </Link>
          </div>

          {/* Action Row: EXPLORE COLLECTIONS → and Style Without Limits */}
          <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => {
                const el = document.getElementById('explore-collections');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-pill-gold group flex items-center justify-center space-x-2.5 shadow-[0_4px_25px_rgba(228,189,90,0.4)] cursor-pointer"
            >
              <span className="text-xs sm:text-sm font-semibold tracking-[0.18em]">EXPLORE COLLECTIONS</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center space-x-3 text-[#E4BD5A]">
              <div className="w-8 h-[1px] bg-[#E4BD5A]/70" />
              <span className="font-cursive-gold text-lg sm:text-2xl font-normal drop-shadow-[0_2px_8px_rgba(228,189,90,0.5)]">
                Style Without Limits
              </span>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="mt-8 flex items-center space-x-5 sm:space-x-8 select-none">
            <div className="flex flex-col text-left">
              <span className="font-serif text-lg sm:text-2xl text-[#F5F0DF] font-semibold leading-tight">
                {totalDesignsCount}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#E4BD5A] uppercase">
                DESIGNS
              </span>
            </div>

            <div className="w-[1px] h-7 bg-[#E4BD5A]/30" />

            <div className="flex flex-col text-left">
              <span className="font-serif text-lg sm:text-2xl text-[#F5F0DF] font-semibold leading-tight">
                3
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#E4BD5A] uppercase">
                WORLDS
              </span>
            </div>

            <div className="w-[1px] h-7 bg-[#E4BD5A]/30" />

            <div className="flex flex-col text-left">
              <span className="font-serif text-lg sm:text-2xl text-[#F5F0DF] font-semibold leading-tight">
                ∞
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#E4BD5A] uppercase">
                ENDLESS POSSIBILITIES
              </span>
            </div>
          </div>

        </div>

        {/* Bottom-Right VIEW SHOWROOM Action Link (overlaid on the golden circular frame) */}
        <div className="relative sm:absolute sm:right-6 lg:sm:right-12 sm:bottom-8 lg:sm:bottom-10 z-20 mt-6 sm:mt-0 flex justify-end">
          <Link
            to="/showroom"
            className="inline-flex items-center space-x-2.5 bg-[#001710]/85 hover:bg-[#002419] backdrop-blur-md border border-[#E4BD5A]/60 hover:border-[#E4BD5A] px-4 py-2.5 rounded-full transition-all duration-300 group shadow-[0_4px_20px_rgba(0,0,0,0.7)] cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full border border-[#E4BD5A] flex items-center justify-center text-[#E4BD5A] group-hover:bg-[#E4BD5A] group-hover:text-[#001710] transition-colors">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors">
              VIEW SHOWROOM
            </span>
          </Link>
        </div>

      </section>

      {/* Anchor for EXPLORE COLLECTIONS button */}
      <div id="explore-collections" />

      {/* Loading state indicator */}
      {isLoading && (
        <div className="mx-auto max-w-7xl px-4 py-20 text-sm text-[#9ca3af] sm:px-6 text-center animate-pulse">
          Loading collections…
        </div>
      )}

      {/* 2. Distinct Collection Sections for People, Pets, and Twin matching reference design */}
      {!isLoading &&
        AUDIENCES.map((aud) => {
          const audienceItems = allProducts.filter((p) => p.category === aud.key);
          const activeOcc = selectedOccasions[aud.key];

          // Filter by active occasion if selected
          const filteredByOccasion = activeOcc
            ? audienceItems.filter((p) => {
                const occ = (p.occasion || '').toLowerCase();
                const name = (p.name || '').toLowerCase();
                const target = activeOcc.toLowerCase();
                return occ === target || occ.includes(target) || name.includes(target);
              })
            : audienceItems;

          const displayItems = (filteredByOccasion.length > 0 ? filteredByOccasion : audienceItems).slice(0, 4);

          return (
            <section
              key={aud.key}
              className="w-full bg-[#002219] border-b border-[#E4BD5A]/15 py-14 sm:py-18"
            >
              <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
                {/* Header block matching reference screenshot */}
                <div className="text-left space-y-1.5">
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                    {audienceItems.length} DESIGNS
                  </p>
                  <h2 className="font-serif text-5xl sm:text-6xl lg:text-[4rem] text-[#F7F4EB] font-normal tracking-tight leading-none mt-1">
                    {aud.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed max-w-2xl pt-2">
                    {aud.description}
                  </p>
                </div>

                {/* Occasion Filter Pills Row + SHOP [COLLECTION] Link matching screenshot */}
                <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-between gap-6">
                  
                  {/* Horizontal Occasion Pills */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 select-none">
                    {aud.occasions.map((occ) => {
                      const isActive = selectedOccasions[aud.key] === occ;
                      return (
                        <button
                          key={occ}
                          onClick={() => handleOccasionClick(aud.key, occ)}
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
                      to={`${aud.shopLink}${selectedOccasions[aud.key] ? `?occasion=${selectedOccasions[aud.key]}` : ''}`}
                      className="group inline-flex items-center space-x-2 border-b-[1.5px] border-[#E4BD5A] pb-1 text-xs sm:text-sm font-semibold tracking-[0.2em] text-[#E4BD5A] uppercase transition-colors hover:text-white hover:border-white cursor-pointer"
                    >
                      <span>SHOP {aud.title.toUpperCase()}</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  </div>

                </div>

                {/* 4-Column Product Grid (shown when products exist) */}
                {displayItems.length > 0 && (
                  <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {displayItems.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}

      {/* 3. Bottom Showroom CTA Section */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] font-normal tracking-tight">
          Prefer to walk the room?
        </h2>
        <div className="mt-8">
          <Link
            to="/showroom"
            className="btn-pill-gold text-xs sm:text-sm px-8 py-3.5 tracking-[0.22em]"
          >
            ENTER THE SHOWROOM
          </Link>
        </div>
      </section>
    </div>
  );
};
