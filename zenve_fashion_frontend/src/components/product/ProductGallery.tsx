import React, { useState } from 'react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const activeImage = images[activeIndex] || images[0] || '/images/collections/people.jpg';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 sm:gap-6 w-full">
      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar py-1 lg:w-24 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-[3/4] w-16 sm:w-20 lg:w-full overflow-hidden border transition-all flex-shrink-0 bg-[#001C13] ${
                activeIndex === idx
                  ? 'border-[#E4BD5A] ring-1 ring-[#E4BD5A]'
                  : 'border-[#E4BD5A]/20 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Large Display with Interactive Magnifier Zoom */}
      <div
        className="relative flex-1 aspect-[3/4] overflow-hidden bg-[#001C13] border border-[#E4BD5A]/20 cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={productName}
          className={`w-full h-full object-cover object-center transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }
              : undefined
          }
        />

        {/* Subtle Luxury Corner Watermark */}
        <div className="absolute bottom-4 right-4 pointer-events-none opacity-40 group-hover:opacity-10 transition-opacity">
          <span className="font-serif text-[10px] tracking-[0.2em] text-[#E4BD5A]">
            ZENVE ATELIER
          </span>
        </div>
      </div>
    </div>
  );
};
