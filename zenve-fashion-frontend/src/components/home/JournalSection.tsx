import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { journalService } from '../../services/journalService';
import { Article } from '../../types/journal';

export const JournalSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function load() {
      const data = await journalService.getArticles();
      setArticles(data.slice(0, 3));
    }
    load();
  }, []);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#002B1D] py-16 sm:py-24 border-b border-[#E4BD5A]/15">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Row matching Screenshot 5 */}
        <div className="flex items-end justify-between mb-10 sm:mb-12">
          <div className="text-left space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
              THE JOURNAL
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F5F0DF] tracking-tight">
              Notes from the atelier
            </h2>
          </div>

          <Link
            to="/journal"
            className="flex items-center space-x-1.5 text-xs tracking-[0.2em] uppercase text-[#E4BD5A] hover:text-[#F1D27A] font-medium transition-colors"
          >
            <span>READ ALL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Journal Cards Grid matching Screenshot 5 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((art) => (
            <Link
              key={art.id}
              to={`/journal/${art.slug}`}
              className="group flex flex-col text-left space-y-3.5"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#001C13] border border-[#E4BD5A]/20 transition-all duration-300 group-hover:border-[#E4BD5A]/50 group-hover:shadow-luxury-green">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 image-crisp"
                />
              </div>

              {/* Tag & Reading Time */}
              <p className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-medium">
                {art.category} · {art.readTime}
              </p>

              {/* Title in Serif */}
              <h3 className="font-serif text-xl sm:text-2xl text-[#F5F0DF] group-hover:text-[#E4BD5A] transition-colors leading-snug">
                {art.title}
              </h3>

              {/* Summary */}
              <p className="text-xs text-[#B8B9A8] leading-relaxed font-light line-clamp-3">
                {art.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
