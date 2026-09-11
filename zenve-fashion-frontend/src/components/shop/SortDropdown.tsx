import React from 'react';
import { ChevronDown } from 'lucide-react';
import { SortOption } from '../../types/product';

interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const options: { label: string; value: SortOption }[] = [
    { label: 'Featured Atelier', value: 'featured' },
    { label: 'Newest Releases', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Highest Rated', value: 'rating' },
  ];

  return (
    <div className="relative inline-block">
      <div className="flex items-center space-x-2 text-xs tracking-wider text-[#B8B9A8]">
        <span className="hidden sm:inline">SORT BY:</span>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value as SortOption)}
            className="appearance-none bg-[#002217] border border-[#E4BD5A]/30 text-[#F5F0DF] text-xs tracking-wider py-2 pl-3 pr-8 focus:outline-none focus:border-[#E4BD5A] cursor-pointer"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#001C13] text-[#F5F0DF]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#E4BD5A] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
