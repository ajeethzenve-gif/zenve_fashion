import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { ProductFilterState, ProductCategory } from '../../types/product';
import { formatINR } from '../../utils/formatters';

interface ShopFiltersProps {
  filters: ProductFilterState;
  onFilterChange: (newFilters: Partial<ProductFilterState>) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  hideCategorySelector?: boolean;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
  hideCategorySelector = false,
}) => {
  const categories: { label: string; value: ProductCategory | 'all' }[] = [
    { label: 'ALL COLLECTIONS', value: 'all' },
    { label: 'PEOPLE', value: 'people' },
    { label: 'PETS', value: 'pets' },
    { label: 'TWIN', value: 'twin' },
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];

  const availableColors = [
    { name: 'Gold', hex: '#E4BD5A' },
    { name: 'Emerald', hex: '#002B1D' },
    { name: 'Ivory', hex: '#F5F0DF' },
    { name: 'Ruby', hex: '#800020' },
    { name: 'Navy', hex: '#0F1E36' },
    { name: 'Mint', hex: '#9BB8A5' },
  ];

  const badges = ['NEW', 'BESTSELLER', 'TWIN EDIT', 'LIMITED ATELIER'];

  const handleSizeToggle = (size: string) => {
    const current = filters.sizes;
    const updated = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    onFilterChange({ sizes: updated });
  };

  const handleColorToggle = (colorName: string) => {
    const current = filters.colors;
    const updated = current.includes(colorName)
      ? current.filter((c) => c !== colorName)
      : [...current, colorName];
    onFilterChange({ colors: updated });
  };

  const handleBadgeToggle = (badge: string) => {
    const current = filters.badges;
    const updated = current.includes(badge)
      ? current.filter((b) => b !== badge)
      : [...current, badge];
    onFilterChange({ badges: updated });
  };

  const filterContent = (
    <div className="space-y-8 text-left">
      {/* Reset Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E4BD5A]/20">
        <span className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
          FILTERS
        </span>
        <button
          onClick={onReset}
          className="text-xs text-[#B8B9A8] hover:text-[#E4BD5A] flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category selector (if not on dedicated category page) */}
      {!hideCategorySelector && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold tracking-[0.2em] text-[#F5F0DF] uppercase">
            CATEGORY
          </h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center space-x-2.5 cursor-pointer text-xs tracking-wider text-[#B8B9A8] hover:text-[#F5F0DF]"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.value}
                  onChange={() => onFilterChange({ category: cat.value })}
                  className="accent-[#E4BD5A]"
                />
                <span className={filters.category === cat.value ? 'text-[#E4BD5A] font-medium' : ''}>
                  {cat.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Slider / Inputs */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-[0.2em] text-[#F5F0DF] uppercase">
          PRICE RANGE
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#B8B9A8]">
            <span>{formatINR(filters.minPrice ?? 0)}</span>
            <span>{formatINR(filters.maxPrice ?? 70000)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="70000"
            step="1000"
            value={filters.maxPrice ?? 70000}
            onChange={(e) => onFilterChange({ maxPrice: Number(e.target.value) })}
            className="w-full accent-[#E4BD5A] cursor-pointer"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-[0.2em] text-[#F5F0DF] uppercase">
          SIZE
        </h4>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const selected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-1.5 text-xs tracking-wider border transition-all ${
                  selected
                    ? 'border-[#E4BD5A] bg-[#E4BD5A] text-[#001C13] font-medium'
                    : 'border-[#E4BD5A]/25 text-[#B8B9A8] hover:border-[#E4BD5A] hover:text-[#F5F0DF]'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-[0.2em] text-[#F5F0DF] uppercase">
          COLOR PALETTE
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {availableColors.map((color) => {
            const selected = filters.colors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 text-[11px] tracking-wider border transition-all ${
                  selected
                    ? 'border-[#E4BD5A] bg-[#E4BD5A]/15 text-[#E4BD5A]'
                    : 'border-[#E4BD5A]/20 text-[#B8B9A8] hover:border-[#E4BD5A]/50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-[#001C13]"
                  style={{ backgroundColor: color.hex }}
                />
                <span>{color.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges / Collections */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold tracking-[0.2em] text-[#F5F0DF] uppercase">
          ATELIER EDITS
        </h4>
        <div className="space-y-2">
          {badges.map((badge) => {
            const checked = filters.badges.includes(badge);
            return (
              <label
                key={badge}
                className="flex items-center space-x-2.5 cursor-pointer text-xs tracking-wider text-[#B8B9A8] hover:text-[#F5F0DF]"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleBadgeToggle(badge)}
                  className="accent-[#E4BD5A]"
                />
                <span className={checked ? 'text-[#E4BD5A] font-medium' : ''}>
                  {badge}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* In stock toggle */}
      <div className="pt-2 border-t border-[#E4BD5A]/15">
        <label className="flex items-center justify-between cursor-pointer text-xs text-[#B8B9A8] hover:text-[#F5F0DF]">
          <span>In Stock Atelier Pieces Only</span>
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="accent-[#E4BD5A]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible lg and above) */}
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0 pr-8">
        <div className="sticky top-28 p-6 bg-[#002217]/60 border border-[#E4BD5A]/20">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer (opens when isOpenMobile is true) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-full max-w-xs bg-[#001C13] border-r border-[#E4BD5A]/25 h-full p-6 overflow-y-auto z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4BD5A]/15 mb-6">
              <span className="font-serif text-lg text-[#F5F0DF]">Filter Atelier</span>
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-[#B8B9A8] hover:text-[#E4BD5A]"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  );
};
