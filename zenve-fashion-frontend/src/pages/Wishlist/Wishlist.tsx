import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { formatINR } from '../../utils/formatters';

export const Wishlist: React.FC = () => {
  const { items, removeItem, moveToCart, clearWishlist } = useWishlistStore();
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const handleMoveToBag = (product: any) => {
    moveToCart(product);
    openCartDrawer();
  };

  if (items.length === 0) {
    return (
      <div className="w-full bg-[#00140D] min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center text-[#F5F0DF]">
        <div className="w-20 h-20 rounded-full border border-[#E4BD5A]/30 bg-[#001C13] flex items-center justify-center text-[#E4BD5A] mb-5 shadow-2xl">
          <Heart className="w-9 h-9 stroke-[1.4]" />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
            YOUR SAVED ARCHIVE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF]">Your Wishlist is Empty</h1>
          <p className="text-xs sm:text-sm text-[#B8B9A8] leading-relaxed">
            Curate your private selection of bespoke garments, ceremonial attire, and noble companion couture.
          </p>
        </div>
        <Link to="/shop" className="btn-gold mt-8 text-xs py-3.5 px-8 tracking-widest flex items-center space-x-2">
          <span>EXPLORE THE COLLECTION</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#00140D] min-h-screen py-10 sm:py-16 text-left text-[#F5F0DF]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 space-y-8">
        
        {/* Wishlist Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-[#E4BD5A]/20 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
              PRIVATE WARDROBE CURATION
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0DF] tracking-tight">
              Saved Pieces ({items.length})
            </h1>
          </div>

          <button
            onClick={clearWishlist}
            className="text-xs text-[#B8B9A8] hover:text-red-400 flex items-center space-x-1.5 transition-colors w-max cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase text-[11px]">Clear Wishlist</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {items.map((product) => (
            <div
              key={product.id}
              className="flex flex-col border border-[#E4BD5A]/20 bg-[#001710] p-3 text-left space-y-3 group hover:border-[#E4BD5A]/50 transition-all duration-300 shadow-xl"
            >
              {/* Image Frame */}
              <Link
                to={`/product/${product.slug}`}
                className="aspect-[3/4] overflow-hidden bg-[#00140D] border border-[#E4BD5A]/15 relative block group"
              >
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out image-crisp"
                />
                {product.badge && (
                  <span className="absolute top-2.5 left-2.5 bg-[#E4BD5A] text-[#00140D] text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
                    {product.badge}
                  </span>
                )}
              </Link>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between pt-1">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#E4BD5A] font-semibold block truncate">
                    {product.collection}
                  </span>
                  <Link
                    to={`/product/${product.slug}`}
                    className="font-serif text-sm sm:text-base text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors block line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="font-serif text-sm sm:text-base text-[#E4BD5A] font-medium pt-0.5">
                    {formatINR(product.price)}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full btn-gold py-2.5 text-[11px] tracking-widest flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>MOVE TO BAG</span>
                  </button>

                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-full text-center text-[10px] tracking-widest uppercase text-[#B8B9A8] hover:text-red-400 py-1 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
