import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/product';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { formatINR } from '../../utils/formatters';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const isFavorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.colors[0] || { name: 'Standard', hex: '#E4BD5A' };
    const defaultSize = product.sizes[0] || 'Standard';
    addItemToCart(product, defaultSize, defaultColor, 1);
    openCartDrawer();
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      className="group relative flex flex-col w-full text-left cursor-pointer select-none transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/product/${product.slug}`)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#001F15] border border-[#E4BD5A]/15 transition-all duration-300 group-hover:border-[#E4BD5A]/45 group-hover:shadow-luxury-green">
        <img
          src={imageError ? '/images/collections/people.jpg' : product.images[0]}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] image-crisp"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          {/* Left badge */}
          {product.badge ? (
            <span className="bg-[#E4BD5A] text-[#001C13] text-[9px] sm:text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 shadow-sm">
              {product.badge}
            </span>
          ) : <div />}

          {/* Right discount badge */}
          {product.discount > 0 && (
            <span className="bg-[#001C13]/80 border border-[#E4BD5A]/60 text-[#E4BD5A] text-[9px] sm:text-[10px] font-medium tracking-[0.15em] px-2.5 py-1 shadow-sm">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button in Image */}
        <button
          onClick={handleWishlistToggle}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute bottom-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-20 ${isFavorited
            ? 'bg-[#E4BD5A] text-[#001C13]'
            : 'bg-[#001C13]/70 text-[#F5F0DF] hover:text-[#E4BD5A] hover:bg-[#001C13]'
            }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View / Add to Bag hover bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-[#001C13]/90 border-t border-[#E4BD5A]/30 py-2.5 px-3 flex items-center justify-between text-xs tracking-[0.2em] uppercase font-medium text-[#E4BD5A] transition-all duration-300 z-10 ${isHovered
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
          <span className="text-[10px] tracking-[0.25em]">VIEW PIECE</span>
          <button
            onClick={handleQuickAdd}
            className="flex items-center space-x-1 text-[#F5F0DF] hover:text-[#E4BD5A] transition-colors p-1"
            title="Quick add to bag"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="text-[9px] tracking-wider hidden sm:inline">+ BAG</span>
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="mt-3 space-y-1">
        {/* Subtitle / Atelier line */}
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#9ca3af] font-light truncate">
          {product.designer ? `${product.designer} · ${product.category.toUpperCase()}` : product.subtitle || `${product.collection.toUpperCase()} · ${product.category.toUpperCase()}`}
        </p>

        {/* Product Title */}
        <h4 className="font-serif text-base sm:text-lg text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors line-clamp-1">
          {product.name}
        </h4>

        {/* Color Indicators */}
        <div className="flex items-center space-x-2 pt-0.5">
          <div className="flex items-center -space-x-1">
            {product.colors.slice(0, 4).map((col, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-[#002B1D] shadow-sm"
                style={{ backgroundColor: col.hex }}
                title={col.name}
              />
            ))}
          </div>
          <span className="text-[10px] text-[#9ca3af] tracking-wider">
            {product.colors.length} {product.colors.length === 1 ? 'colour' : 'colours'}
          </span>
        </div>

        {/* Price & Rating Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif text-sm sm:text-base text-[#E4BD5A] font-medium">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#9ca3af]/80 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-[#E4BD5A] text-xs font-medium">
            <Star className="w-3 h-3 fill-current text-[#E4BD5A]" />
            <span className="text-[11px] text-[#9ca3af]">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
