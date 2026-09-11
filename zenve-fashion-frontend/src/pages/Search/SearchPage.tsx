import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';
import { ProductCard } from '../../components/product/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function search() {
      setIsLoading(true);
      const results = await productService.getProducts({ searchQuery: query });
      setProducts(results);
      setIsLoading(false);
    }
    search();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  return (
    <div className="w-full bg-[#002B1D] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Search Header and Input */}
        <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
          <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
            ARCHIVE SEARCH
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0DF]">
            Atelier Search Results
          </h1>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by piece name, collection, fabric, or SKU..."
              className="w-full bg-[#001710] border border-[#E4BD5A]/40 py-3.5 pl-5 pr-14 text-sm text-[#F5F0DF] focus:outline-none focus:border-[#E4BD5A]"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#E4BD5A] hover:text-[#F1D27A]"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {query && (
            <p className="text-xs text-[#B8B9A8]">
              Displaying results for &ldquo;<span className="text-[#E4BD5A] font-medium">{query}</span>&rdquo; ({products.length} pieces found)
            </p>
          )}
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#001F15] animate-pulse border border-[#E4BD5A]/10" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 border border-[#E4BD5A]/15 bg-[#001710] p-8 space-y-4 max-w-md mx-auto">
            <p className="font-serif text-xl text-[#F5F0DF]">No creations matched your search.</p>
            <p className="text-xs text-[#B8B9A8]">
              Try searching for terms like &ldquo;Anarkali&rdquo;, &ldquo;Silk&rdquo;, &ldquo;Twin&rdquo;, or &ldquo;Tuxedo&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
