import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const CollectionSection: React.FC = () => {
  const collections = [
    {
      title: 'PEOPLE',
      label: 'ATELIER WOMAN & MAN',
      description: 'Heirloom silks, hand-embroidered lehengas, sarees, sherwanis, and bespoke tailoring.',
      image: '/images/collections/people.jpg',
      link: '/people',
    },
    {
      title: 'PETS',
      label: 'CANINE & FELINE COUTURE',
      description: 'Velvet tuxedos, gold-hardware quilted coats, and ceremonial festive capes tested for zero skin friction.',
      image: '/images/collections/pets.jpg',
      link: '/pets',
    },
    {
      title: 'TWIN',
      label: 'HARMONIZED EDITS',
      description: 'The definitive Zenve signature. Coordinated human and companion silhouettes crafted in the same breath.',
      image: '/images/collections/twin.jpg',
      link: '/twin',
    },
  ];

  return (
    <section className="w-full bg-[#002B1D] py-16 sm:py-24 border-b border-[#E4BD5A]/15">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-left mb-10 sm:mb-14 space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
            THREE WORLDS, ONE WARDROBE
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F5F0DF] tracking-tight">
            Choose your collection
          </h2>
        </div>

        {/* 3 Editorial Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((col) => (
            <Link
              key={col.title}
              to={col.link}
              className="group relative flex flex-col h-[480px] sm:h-[540px] overflow-hidden border border-[#E4BD5A]/20 transition-all duration-500 hover:border-[#E4BD5A]/60 hover:-translate-y-1 hover:green-shadow-glow"
            >
              {/* Card Image */}
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 image-crisp"
              />

              {/* Rich Green Shadow Vignette Overlay */}
              <div className="absolute inset-0 green-shadow-card pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00140D] via-[#002B1D]/70 to-transparent transition-opacity duration-300 group-hover:from-[#00140D]/95 pointer-events-none" />

              {/* Content Panel at Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end space-y-2.5 z-10">
                <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                  {col.label}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl text-[#F5F0DF] tracking-wide group-hover:text-[#E4BD5A] transition-colors">
                  {col.title}
                </h3>

                <p className="text-xs text-[#B8B9A8] leading-relaxed font-light line-clamp-2 max-w-sm">
                  {col.description}
                </p>

                <div className="pt-2 flex items-center space-x-2 text-xs uppercase tracking-[0.2em] text-[#E4BD5A] group-hover:text-[#F1D27A] font-medium">
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
