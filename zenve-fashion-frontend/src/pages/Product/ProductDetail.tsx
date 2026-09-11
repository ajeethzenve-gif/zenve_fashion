import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { ProductGallery } from '../../components/product/ProductGallery';
import { ProductCard } from '../../components/product/ProductCard';
import { PetFitFinder } from '../../components/product/PetFitFinder';
import { productService } from '../../services/productService';
import { Product, ProductColor } from '../../types/product';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useUIStore } from '../../store/uiStore';
import { formatINR } from '../../utils/formatters';

const getSizePriceMultiplier = (size: string): number => {
  const s = (size || '').toUpperCase().trim();
  switch (s) {
    case 'XS':
      return 0.9;
    case 'S':
      return 0.95;
    case 'M':
      return 1.0;
    case 'L':
      return 1.1;
    case 'XL':
      return 1.2;
    case 'XXL':
    case '2XL':
      return 1.3;
    default:
      return 1.0;
  }
};

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const addItemToCart = useCartStore((state) => state.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      const data = await productService.getProductBySlug(slug);
      if (data) {
        setProduct(data);
        setSelectedColor(data.colors[0] || null);
        setSelectedSize(data.sizes[0] || 'M');
        setQuantity(1);

        // Fetch related
        const related = await productService.getRelatedProducts(data.id, data.category, 4);
        setRelatedProducts(related);
      }
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#002B1D]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#E4BD5A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-[#E4BD5A] tracking-widest text-sm">
            RETRIEVING ATELIER ARCHIVE...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#002B1D] px-4 text-center space-y-4">
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF]">
          The Piece You&apos;re Looking For Has Moved.
        </h2>
        <p className="text-xs text-[#B8B9A8] max-w-md">
          This atelier design may have concluded its limited-run edition or been archived.
        </p>
        <button onClick={() => navigate('/shop')} className="btn-gold text-xs">
          EXPLORE ALL COLLECTIONS
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  // Size-dependent dynamic price calculation
  const currentPrice = Math.round((product.price * getSizePriceMultiplier(selectedSize)) / 100) * 100;
  const currentOriginalPrice = product.originalPrice
    ? Math.round((product.originalPrice * getSizePriceMultiplier(selectedSize)) / 100) * 100
    : currentPrice;

  const handleAddToCart = () => {
    const colorToUse =
      selectedColor || (product.colors && product.colors[0]) || { name: 'Standard', hex: '#E4BD5A' };
    const sizeToUse = selectedSize || (product.sizes && product.sizes[0]) || 'M';
    const productWithSizePrice = {
      ...product,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
    };
    addItemToCart(productWithSizePrice, sizeToUse, colorToUse, quantity);
    openCartDrawer();
  };

  const handleBuyNow = () => {
    const colorToUse =
      selectedColor || (product.colors && product.colors[0]) || { name: 'Standard', hex: '#E4BD5A' };
    const sizeToUse = selectedSize || (product.sizes && product.sizes[0]) || 'M';
    const productWithSizePrice = {
      ...product,
      price: currentPrice,
      originalPrice: currentOriginalPrice,
    };
    addItemToCart(productWithSizePrice, sizeToUse, colorToUse, quantity);
    navigate('/checkout');
  };

  return (
    <div className="w-full bg-[#001C13] min-h-screen py-8 sm:py-14 text-left">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumb path */}
        <div className="flex items-center space-x-2 text-[10px] tracking-[0.2em] uppercase text-[#B8B9A8] mb-8 overflow-x-auto">
          <Link to="/" className="hover:text-[#E4BD5A]">HOME</Link>
          <span>/</span>
          <Link to={`/${product.category}`} className="hover:text-[#E4BD5A]">{product.category}</Link>
          <span>/</span>
          <span className="text-[#E4BD5A] truncate">{product.name}</span>
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Image Gallery (7 cols) */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Details, Selectors, Add to Cart (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Badges & Collection */}
            <div className="flex items-center space-x-3">
              {product.badge && (
                <span className="bg-[#E4BD5A] text-[#001C13] text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1">
                  {product.badge}
                </span>
              )}
              <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                {product.collection.toUpperCase()}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating (SKU removed per user request) */}
            <div className="flex items-center border-b border-[#E4BD5A]/15 pb-4">
              <div className="flex items-center space-x-2 text-xs">
                <div className="flex text-[#E4BD5A]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-40'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-[#F5F0DF] font-medium">{product.rating}</span>
                <span className="text-[#B8B9A8]">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price Row (Dynamic based on selected size) */}
            <div className="flex items-baseline space-x-3">
              <span className="font-serif text-2xl sm:text-3xl text-[#E4BD5A] font-medium transition-all">
                {formatINR(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-sm text-[#B8B9A8] line-through transition-all">
                    {formatINR(currentOriginalPrice)}
                  </span>
                  <span className="border border-[#E4BD5A]/40 bg-[#001C13] text-[#E4BD5A] text-xs font-semibold px-2 py-0.5">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#F5F0DF]/90 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Color Selector */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs tracking-[0.2em] uppercase text-[#B8B9A8] block">
                Color: <span className="text-[#F5F0DF] font-medium">{selectedColor?.name}</span>
              </label>
              <div className="flex items-center space-x-3">
                {product.colors.map((color) => {
                  const isSelected = selectedColor?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'ring-2 ring-[#E4BD5A] ring-offset-2 ring-offset-[#002B1D]' : ''
                        }`}
                      title={color.name}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/30 shadow-inner"
                        style={{ backgroundColor: color.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center text-xs tracking-wider">
                <span className="text-[#B8B9A8] uppercase">
                  Select Size: <span className="text-[#F5F0DF] font-medium">{selectedSize}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs tracking-wider border transition-all ${isSelected
                          ? 'border-[#E4BD5A] bg-[#E4BD5A] text-[#001C13] font-semibold'
                          : 'border-[#E4BD5A]/30 text-[#F5F0DF] hover:border-[#E4BD5A]'
                        }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pet Fit Finder for all Pet & Twin Products */}
            {(product.category === 'pets' || product.category === 'twin') && (
              <PetFitFinder
                currentSize={selectedSize}
                onSelectSize={(newSize) => setSelectedSize(newSize)}
              />
            )}

            {/* Quantity + In Stock + Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Quantity + Stock Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-[#E4BD5A]/30 px-3 py-1.5 bg-[#001710]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#B8B9A8] hover:text-[#E4BD5A] px-2 py-0.5 text-sm font-semibold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs text-[#F5F0DF] font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#B8B9A8] hover:text-[#E4BD5A] px-2 py-0.5 text-sm font-semibold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-[#B8B9A8] font-light">
                  {product.stock || 41} in stock
                </span>
              </div>

              {/* Action Buttons: Add to Bag + Buy Now + Wishlist */}
              <div className="flex items-stretch space-x-3 pt-1">
                {/* Add to Bag Button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#E4BD5A] text-[#001C13] hover:bg-[#F1D27A] transition-all font-semibold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 shadow-md uppercase"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO BAG</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="flex-1 border border-[#E4BD5A] text-[#E4BD5A] hover:bg-[#E4BD5A] hover:text-[#001C13] transition-colors font-semibold py-3.5 text-xs tracking-[0.2em] flex items-center justify-center uppercase"
                >
                  BUY NOW
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 border transition-colors flex items-center justify-center ${isFavorited
                      ? 'border-[#E4BD5A] bg-[#E4BD5A] text-[#001C13]'
                      : 'border-[#E4BD5A]/30 text-[#F5F0DF] hover:border-[#E4BD5A] hover:text-[#E4BD5A]'
                    }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Atelier Assurance Badges */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E4BD5A]/15 text-[11px] text-[#B8B9A8]">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#E4BD5A]" />
                  <span>Complimentary India Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-[#E4BD5A]" />
                  <span>100% Certified Heirloom Silk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-[#E4BD5A]/15">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                  COMPLEMENTARY ATELIER PIECES
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF] tracking-tight">
                  You May Also Admire
                </h3>
              </div>
              <Link
                to={`/${product.category}`}
                className="flex items-center space-x-1 text-xs tracking-widest text-[#E4BD5A] hover:underline uppercase"
              >
                <span>VIEW MORE {product.category.toUpperCase()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
