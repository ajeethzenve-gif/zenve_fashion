import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  User,
  PawPrint,
  Heart,
  LayoutGrid,
  ShoppingBag,
  Moon,
  Sun,
  Sparkles,
  Umbrella,
  PartyPopper,
  Sunset,
  Crown,
  Snowflake,
  Briefcase,
} from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { productService } from '../../services/productService';
import { Product, ProductCategory, SortOption } from '../../types/product';

// Mapping of Occasion Icons
const OCCASION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  All: LayoutGrid,
  Accessories: ShoppingBag,
  Evening: Moon,
  Everyday: Sun,
  Festive: Sparkles,
  Monsoon: Umbrella,
  Party: PartyPopper,
  Resort: Sunset,
  Wedding: Crown,
  Winter: Snowflake,
  Workwear: Briefcase,
};

// Exact audience categories specified by user
const AUDIENCE_CATEGORIES: Record<ProductCategory | 'all', string[]> = {
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
};

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
];

interface ShopProps {
  forcedAudience?: ProductCategory | 'all';
}

export const Shop: React.FC<ShopProps> = ({ forcedAudience }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPathAudience = (): ProductCategory | 'all' | null => {
    if (location.pathname === '/people') return 'people';
    if (location.pathname === '/pets') return 'pets';
    if (location.pathname === '/twin') return 'twin';
    return null;
  };

  const getActiveAudience = (): ProductCategory | 'all' => {
    if (forcedAudience) return forcedAudience;
    const pathAud = getPathAudience();
    if (pathAud) return pathAud;
    const audParam = (searchParams.get('audience') || searchParams.get('category')) as ProductCategory | null;
    if (audParam && ['people', 'pets', 'twin'].includes(audParam)) return audParam;
    return 'all';
  };

  const resolveOccasion = (aud: ProductCategory | 'all', occ: string): string => {
    const list = AUDIENCE_CATEGORIES[aud] || AUDIENCE_CATEGORIES.all;
    const found = list.find((item) => item.toLowerCase() === occ.toLowerCase());
    return found || 'All';
  };

  const initialAudience = getActiveAudience();
  const rawOccasion = searchParams.get('occasion') || searchParams.get('tag') || 'All';
  const sortParam = (searchParams.get('sort') as SortOption) || 'featured';

  const [audience, setAudience] = useState<ProductCategory | 'all'>(initialAudience);
  const [activeOccasion, setActiveOccasion] = useState<string>(resolveOccasion(initialAudience, rawOccasion));
  const [currentSort, setCurrentSort] = useState<SortOption>(sortParam);

  // Sync state when location or searchParams change
  useEffect(() => {
    const newAudience = getActiveAudience();
    const rawOcc = searchParams.get('occasion') || searchParams.get('tag') || 'All';
    const srt = (searchParams.get('sort') as SortOption) || 'featured';
    const validOcc = resolveOccasion(newAudience, rawOcc);

    setAudience(newAudience);
    setActiveOccasion(validOcc);
    setCurrentSort(srt);
  }, [location.pathname, searchParams, forcedAudience]);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const results = await productService.getProducts({
        audience: audience === 'all' ? undefined : audience,
        occasion: activeOccasion === 'All' ? undefined : activeOccasion,
        sort: currentSort,
      });
      setProducts(results);
      setIsLoading(false);
    }
    loadProducts();
  }, [audience, activeOccasion, currentSort]);

  const handleAudienceClick = (selected: ProductCategory) => {
    const next = audience === selected ? 'all' : selected;
    setAudience(next);
    const validOcc = resolveOccasion(next, activeOccasion);
    setActiveOccasion(validOcc);

    const targetPath = next === 'all' ? '/shop' : `/${next}`;
    const params = new URLSearchParams();
    if (validOcc !== 'All') {
      params.set('occasion', validOcc);
    }
    if (currentSort !== 'featured') {
      params.set('sort', currentSort);
    }
    const qs = params.toString();
    navigate(qs ? `${targetPath}?${qs}` : targetPath);
  };

  const handleOccasionClick = (occ: string) => {
    setActiveOccasion(occ);
    const params = new URLSearchParams(searchParams);
    if (occ === 'All') {
      params.delete('occasion');
      params.delete('tag');
    } else {
      params.set('occasion', occ);
    }
    setSearchParams(params);
  };

  const handleScrollRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = e.target.value as SortOption;
    setCurrentSort(nextSort);
    const params = new URLSearchParams(searchParams);
    if (nextSort === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }
    setSearchParams(params);
  };

  // Filter products by active occasion with client-side fallback
  const filteredProducts = useMemo(() => {
    if (activeOccasion === 'All') return products;
    const target = activeOccasion.toLowerCase();

    return products.filter((p) => {
      const occ = (p.occasion || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return occ === target || occ.includes(target) || name.includes(target) || desc.includes(target);
    });
  }, [products, activeOccasion]);

  const pageTitle = useMemo(() => {
    if (audience === 'people') return 'People Collection';
    if (audience === 'pets') return 'Pet Collection';
    if (audience === 'twin') return 'Twin Collection';
    return 'All Designs';
  }, [audience]);

  const currentCategories = AUDIENCE_CATEGORIES[audience] || AUDIENCE_CATEGORIES.all;

  return (
    <div className="w-full bg-[#00140D] min-h-screen text-[#F5F0DF]">
      {/* Luxury Boutique Shop Hero Banner */}
      <section className="relative w-full overflow-hidden bg-[#00120B] border-b border-[#E4BD5A]/20 min-h-[380px] sm:min-h-[430px] lg:min-h-[470px] flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Background Boutique Image (lighted bags, armchair, books, sweeping curves) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/collections/shop-hero-banner.png"
            alt="ZENVE Luxury Boutique Collection"
            className="w-full h-full object-cover object-[72%_center] sm:object-right select-none pointer-events-none image-crisp"
          />

          {/* Deep Emerald Left Shadow Gradient for Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00140D]/85 via-[#001710]/50 via-40% md:via-50% to-transparent w-full lg:w-[60%] pointer-events-none" />
          
          {/* Subtle Top & Bottom Vignettes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00140D]/50 via-transparent to-[#00140D]/80 pointer-events-none" />
        </div>

        {/* Top Header Block: Eyebrow, Title, Divider & Quotation */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto">
          {/* Eyebrow */}
          <div className="flex items-center space-x-2.5 text-[#E4BD5A]">
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              ZENVE SIGNATURE COLLECTION
            </span>
            <div className="w-8 sm:w-12 h-[1px] bg-[#E4BD5A]/70" />
            <Sparkles className="w-3 h-3 text-[#E4BD5A]" />
          </div>

          {/* Title Row with "Style Without Limits" quote on right */}
          <div className="flex items-center space-x-6 sm:space-x-12 mt-3">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F5F0DF] tracking-tight font-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                {pageTitle}
              </h1>
              <p className="mt-2 text-[10px] sm:text-xs tracking-[0.25em] text-[#E4BD5A] uppercase font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] flex items-center space-x-2">
                <span>EXPLORE NOW</span>
                <span className="text-[#B8B9A8]/70">·</span>
                <span className="text-[#B8B9A8] font-light">
                  {isLoading ? 'Loading pieces…' : `${filteredProducts.length} pieces`}
                </span>
              </p>
            </div>

            {/* Vertical Hairline Divider & "Style Without Limits" */}
            <div className="hidden md:flex items-center space-x-4 pl-6 border-l border-[#E4BD5A]/30 select-none">
              <div className="flex flex-col text-left space-y-0.5">
                <span className="font-serif italic text-lg sm:text-xl text-[#F5F0DF] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  Style
                </span>
                <span className="font-serif italic text-lg sm:text-xl text-[#F5F0DF] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  Without
                </span>
                <span className="font-serif italic text-lg sm:text-xl text-[#F5F0DF] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  Limits
                </span>
                <div className="w-6 h-[1px] bg-[#E4BD5A]/70 mt-1" />
              </div>
            </div>
          </div>

          {/* Top Audience Filter Pill Container */}
          <div className="mt-6 sm:mt-7 inline-flex items-center rounded-full bg-[#001710]/80 backdrop-blur-md border border-[#E4BD5A]/30 p-1 space-x-1 sm:space-x-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] select-none">
            {/* PEOPLE */}
            <button
              onClick={() => handleAudienceClick('people')}
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                audience === 'people'
                  ? 'pill-glow-gold'
                  : 'text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#002419]/40'
              }`}
            >
              <User className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>PEOPLE</span>
            </button>

            <div className="w-[1px] h-4 bg-[#E4BD5A]/25" />

            {/* PETS */}
            <button
              onClick={() => handleAudienceClick('pets')}
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                audience === 'pets'
                  ? 'pill-glow-gold'
                  : 'text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#002419]/40'
              }`}
            >
              <PawPrint className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>PETS</span>
            </button>

            <div className="w-[1px] h-4 bg-[#E4BD5A]/25" />

            {/* TWINS */}
            <button
              onClick={() => handleAudienceClick('twin')}
              className={`flex items-center space-x-2 px-4 sm:px-5 py-2 rounded-full text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${
                audience === 'twin'
                  ? 'pill-glow-gold'
                  : 'text-[#B8B9A8] hover:text-[#E4BD5A] hover:bg-[#002419]/40'
              }`}
            >
              <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
              <span>TWINS</span>
            </button>
          </div>
        </div>

        {/* Bottom Category/Occasion Navigation Pill Bar - Dynamically adapts to active audience */}
        <div className="relative z-10 max-w-[1400px] w-full mx-auto mt-8 sm:mt-10">
          <div className="flex items-center rounded-full bg-[#001710]/95 backdrop-blur-lg border border-[#E4BD5A]/35 py-1.5 px-2.5 sm:px-3 shadow-[0_10px_35px_rgba(0,0,0,0.7)]">
            {/* Scrollable Occasions/Categories Row */}
            <div
              ref={categoryScrollRef}
              className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto no-scrollbar scroll-smooth flex-1 pr-2 select-none"
            >
              {currentCategories.map((cat) => {
                const isActive = activeOccasion === cat;
                const Icon = OCCASION_ICONS[cat] || LayoutGrid;
                return (
                  <button
                    key={cat}
                    onClick={() => handleOccasionClick(cat)}
                    className={`flex items-center space-x-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs tracking-wider transition-all duration-300 flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#E4BD5A] text-[#001C13] font-semibold shadow-[0_2px_12px_rgba(228,189,90,0.4)]'
                        : 'text-[#D1D9D0] hover:text-[#E4BD5A] hover:bg-[#00261A]/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[1.6]" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] h-5 bg-[#E4BD5A]/30 flex-shrink-0 mx-1.5 sm:mx-2" />

            {/* Scroll Next Arrow Button */}
            <button
              onClick={handleScrollRight}
              aria-label="Scroll categories right"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#E4BD5A]/50 flex items-center justify-center text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all duration-300 flex-shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Product Catalogue Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {/* Sub-header Bar: Count & Sort Dropdown */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E4BD5A]/15">
          <p className="text-xs text-[#B8B9A8] tracking-widest uppercase">
            Showing <span className="text-[#E4BD5A] font-medium">{filteredProducts.length}</span> designs
            {activeOccasion !== 'All' && (
              <span className="ml-1 text-[#E4BD5A]/80 font-normal">
                in {activeOccasion}
              </span>
            )}
          </p>

          {/* Sort Dropdown */}
          <div className="relative min-w-[140px] sm:min-w-[160px]">
            <select
              value={currentSort}
              onChange={handleSortChange}
              aria-label="Sort products"
              className="w-full border border-[#E4BD5A]/30 bg-[#001810] text-[#F5F0DF] px-3.5 py-2 pr-9 text-xs tracking-wider rounded appearance-none focus:outline-none focus:border-[#E4BD5A] cursor-pointer transition-colors"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#001810] text-[#F5F0DF]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#E4BD5A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4-Column Responsive Product Grid */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-[#001D14] border border-[#E4BD5A]/10 animate-pulse rounded"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4 border border-[#E4BD5A]/25 bg-[#001A12]/40 rounded-xl my-8 px-4">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF]">No Atelier Pieces Matched</h3>
              <p className="text-xs text-[#B8B9A8] max-w-sm mx-auto font-light leading-relaxed">
                No designs currently match your selected combination of {audience !== 'all' ? audience : 'collection'} and {activeOccasion}.
              </p>
              <button
                onClick={() => {
                  setAudience('all');
                  setActiveOccasion('All');
                  setCurrentSort('featured');
                  setSearchParams(new URLSearchParams());
                }}
                className="btn-pill-gold text-xs mt-3 px-6 py-2.5"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
