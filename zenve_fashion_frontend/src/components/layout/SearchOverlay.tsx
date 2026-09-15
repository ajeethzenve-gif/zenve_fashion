import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import { formatINR } from '../../utils/formatters';

export const SearchOverlay: React.FC = () => {
  const { isSearchOverlayOpen, closeSearchOverlay } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  const popularSearches = [
    'Champagne Anarkali',
    'Twin Kurta Duo',
    'Pet Coat',
    'Emerald Saree',
    'Pet Tuxedo',
    'Banarasi Silk',
  ];

  const recentSearches = [
    'Wedding Couture',
    'Pet Winter',
    'Twin Human & Pet',
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const found = await productService.getProducts({ searchQuery: searchTerm });
        setResults(found.slice(0, 6));
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isSearchOverlayOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      closeSearchOverlay();
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectSearch = (term: string) => {
    setSearchTerm(term);
    closeSearchOverlay();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#001C13]/98 backdrop-blur-xl animate-fade-in text-[#F5F0DF]">
      {/* Top Header */}
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-[#E4BD5A]/20">
        <div className="flex items-center space-x-3">
          <img src="/logo/zenve-logo.png" alt="ZENVE" className="h-8 w-auto" />
          <span className="font-serif text-lg tracking-[0.2em] text-[#E4BD5A]">
            ATELIER SEARCH
          </span>
        </div>
        <button
          onClick={closeSearchOverlay}
          className="p-2 text-[#B8B9A8] hover:text-[#E4BD5A] transition-colors"
          aria-label="Close search"
        >
          <X className="w-6 h-6 stroke-[1.5]" />
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-[800px] w-full mx-auto px-4 pt-10 pb-6">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-[#E4BD5A]" />
          <input
            type="text"
            autoFocus
            placeholder="Search by piece, collection, fabric or SKU (e.g., Anarkali, Twin, Silk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-b-2 border-[#E4BD5A]/40 focus:border-[#E4BD5A] py-4 pl-10 pr-24 text-lg sm:text-2xl font-serif text-[#F5F0DF] placeholder:text-[#B8B9A8]/40 focus:outline-none transition-colors"
          />
          {searchTerm && (
            <button
              type="submit"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.2em] text-[#E4BD5A] hover:underline"
            >
              SEARCH →
            </button>
          )}
        </form>

        {/* Quick tags */}
        {!searchTerm && (
          <div className="mt-8 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#E4BD5A] mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>POPULAR SEARCHES</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectSearch(term)}
                    className="text-xs tracking-wider px-3.5 py-1.5 border border-[#E4BD5A]/20 hover:border-[#E4BD5A] hover:bg-[#E4BD5A]/10 text-[#F5F0DF] transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#B8B9A8] mb-3">
                RECENT EXPLORATIONS
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectSearch(term)}
                    className="text-xs tracking-wider px-3.5 py-1.5 bg-[#002B1D] border border-[#E4BD5A]/15 hover:border-[#E4BD5A] text-[#B8B9A8] hover:text-[#F5F0DF] transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Preview */}
        {searchTerm && (
          <div className="mt-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4BD5A]/15 mb-4 text-xs tracking-widest text-[#B8B9A8]">
              <span>{isPending ? 'SEARCHING ATELIER ARCHIVE...' : `${results.length} PIECES FOUND`}</span>
              {results.length > 0 && (
                <button
                  onClick={handleSubmit}
                  className="text-[#E4BD5A] hover:underline"
                >
                  VIEW ALL RESULTS →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    closeSearchOverlay();
                    navigate(`/product/${item.slug}`);
                  }}
                  className="flex space-x-3 p-2.5 border border-[#E4BD5A]/15 hover:border-[#E4BD5A] hover:bg-[#002B1D]/60 transition-all cursor-pointer group"
                >
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-20 object-cover border border-[#E4BD5A]/10 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-[#E4BD5A]">
                        {item.category.toUpperCase()}
                      </p>
                      <h5 className="font-serif text-sm text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors line-clamp-1">
                        {item.name}
                      </h5>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif text-[#F5F0DF]">
                        {formatINR(item.price)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E4BD5A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
