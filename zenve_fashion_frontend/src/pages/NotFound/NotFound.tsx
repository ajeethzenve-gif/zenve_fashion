import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="w-full bg-[#002B1D] min-h-[80vh] flex items-center justify-center py-20 px-4 text-center">
      <div className="max-w-lg w-full bg-[#001C13] border border-[#E4BD5A]/30 p-10 sm:p-14 space-y-6 shadow-2xl relative">
        <div className="w-16 h-16 rounded-full border border-[#E4BD5A]/40 flex items-center justify-center mx-auto text-[#E4BD5A] bg-[#002B1D]">
          <Compass className="w-8 h-8 stroke-[1.2]" />
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-[#E4BD5A] font-semibold">
          404 ARCHIVE MISSING
        </p>

        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F5F0DF] leading-snug">
          THE PIECE YOU&apos;RE LOOKING FOR HAS MOVED.
        </h1>

        <p className="text-xs text-[#B8B9A8] leading-relaxed max-w-sm mx-auto">
          The page or edition you are attempting to view may have concluded its private atelier showing or been reorganized.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-gold py-3 px-8 text-xs tracking-widest flex items-center space-x-2">
            <span>BACK TO HOME</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link to="/shop" className="btn-outline-gold py-3 px-8 text-xs tracking-widest">
            VIEW ARCHIVE
          </Link>
        </div>
      </div>
    </div>
  );
};
