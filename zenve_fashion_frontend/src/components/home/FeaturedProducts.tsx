import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../product/ProductCard';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';

export const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const picks = await productService.getAtelierPicks();
      // If less than 8, supplement with more products for a rich 8-item grid
      if (picks.length < 8) {
        const all = await productService.getProducts();
        const combined = [...picks];
        all.forEach((p) => {
          if (!combined.some((item) => item.id === p.id) && combined.length < 8) {
            combined.push(p);
          }
        });
        setProducts(combined);
      } else {
        setProducts(picks.slice(0, 8));
      }
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <section className="w-full bg-[#002B1D] py-16 sm:py-24 border-b border-[#E4BD5A]/15">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Row */}
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <div className="text-left space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
              ATELIER PICKS
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F5F0DF] tracking-tight">
              Featured designs
            </h2>
          </div>

          <Link
            to="/shop"
            className="flex items-center space-x-1.5 text-xs tracking-[0.2em] uppercase text-[#E4BD5A] hover:text-[#F1D27A] font-medium transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid: 4 columns desktop, 2–3 tablet, 2 mobile */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#001F15] animate-pulse border border-[#E4BD5A]/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
