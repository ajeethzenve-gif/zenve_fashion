import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { journalService } from '../../services/journalService';
import { Article } from '../../types/journal';

export const JournalList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeHeroIndex, setActiveHeroIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await journalService.getArticles();
      setArticles(data);
      setIsLoading(false);
    }
    load();
  }, []);

  // Top 3 featured articles for the interactive hero carousel
  const featuredArticles = articles.slice(0, 3);
  const currentHeroArticle = featuredArticles[activeHeroIndex] || articles[0];

  // Distinct categories for filtering
  const categories = [
    'ALL',
    'HOUSE',
    'FIT GUIDE',
    'STYLING',
    'FABRIC',
    'CARE',
    'HERITAGE',
  ];

  // Filtered remaining articles (excluding current hero if category is ALL, or matching category)
  const filteredArticles = articles.filter((art) => {
    if (selectedCategory === 'ALL') {
      return art.id !== currentHeroArticle?.id;
    }
    return art.category.toUpperCase() === selectedCategory;
  });

  // Helper to style story titles with the last word or highlight in warm gold
  const renderStyledTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length <= 1) return title;
    const lastWord = words[words.length - 1];
    const prefix = words.slice(0, -1).join(' ');
    return (
      <>
        {prefix} <span className="text-[#E4BD5A]">{lastWord}</span>
      </>
    );
  };

  return (
    <div className="relative w-full bg-[#001911] min-h-screen text-[#F7F4EB] overflow-hidden">
      {/* Dynamic Molten Gold Ribbons Background Accents */}
      {/* Top-Left Arched Gold Wave */}
      <div className="absolute top-0 left-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="25%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="65%" stopColor="#B38938" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowTL" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10"
            stroke="url(#goldRibbonTL)"
            strokeWidth="3"
            filter="url(#glowTL)"
          />
          <path
            d="M -30 200 C 60 160, 160 80, 290 -10 L 0 -10 L -30 -10 Z"
            fill="url(#goldRibbonTL)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Bottom-Right Arched Gold Wave */}
      <div className="absolute bottom-0 right-0 w-[320px] sm:w-[480px] lg:w-[620px] h-[220px] sm:h-[300px] lg:h-[380px] pointer-events-none overflow-hidden select-none z-0">
        <svg
          viewBox="0 0 620 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="goldRibbonBR" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#E4BD5A" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#B38938" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E4BD5A" stopOpacity="0" />
            </linearGradient>
            <filter id="glowBR" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            d="M 320 390 C 430 300, 520 200, 650 110"
            stroke="url(#goldRibbonBR)"
            strokeWidth="3"
            filter="url(#glowBR)"
          />
          <path
            d="M 320 390 C 430 300, 520 200, 650 110 L 650 390 Z"
            fill="url(#goldRibbonBR)"
            opacity="0.07"
          />
        </svg>
      </div>

      {/* Subtle Radial Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial from-[#043E2C]/25 via-transparent to-transparent pointer-events-none z-0" />

      {/* Main Journal Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-24 text-left">
        
        {/* 1. Top Editorial Header Area matching reference image */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-12 sm:pb-16">
          {/* Left Title & Description */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-3">
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] text-[#E4BD5A] uppercase">
                THE JOURNAL
              </span>
              <div className="w-10 h-[1.5px] bg-[#E4BD5A]/70" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] text-[#F7F4EB] font-normal tracking-tight leading-[1.08] pt-1">
              Notes from the <span className="text-[#E4BD5A]">atelier</span>
            </h1>

            <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed pt-1">
              Styling, fit, fabric and care — written by the team who cuts the clothes.
            </p>
          </div>

          {/* Right Bespoke Editorial Tag */}
          <div className="hidden md:flex items-start space-x-4 pt-2 flex-shrink-0">
            <div className="w-[1.5px] h-18 bg-[#E4BD5A]/60" />
            <div className="flex flex-col text-left space-y-1">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                CRAFTED
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                FOR A MORE
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                BEAUTIFUL
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#E4BD5A]/90 font-medium">
                EVERYDAY
              </span>
              <div className="w-6 h-[1.5px] bg-[#E4BD5A]/60 mt-2" />
            </div>
          </div>
        </div>

        {/* 2. Hero Featured Article Showcase Card matching reference image */}
        {isLoading ? (
          <div className="w-full aspect-[16/8] bg-[#002217] border border-[#244c3b]/50 rounded-[32px] animate-pulse my-8" />
        ) : currentHeroArticle ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center bg-[#002116]/40 p-4 sm:p-6 lg:p-8 rounded-[32px] sm:rounded-[40px] border border-[#E4BD5A]/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            {/* Left Image Showcase Frame with Fine Gold Border */}
            <div className="lg:col-span-7">
              <Link
                to={`/journal/${currentHeroArticle.slug}`}
                className="block relative rounded-[24px] sm:rounded-[32px] overflow-hidden border border-[#E4BD5A]/35 shadow-[0_15px_40px_rgba(0,0,0,0.65)] group aspect-[16/10] bg-[#00140D]"
              >
                <img
                  src={currentHeroArticle.image}
                  alt={currentHeroArticle.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </Link>
            </div>

            {/* Right Story Details */}
            <div className="lg:col-span-5 flex flex-col justify-center text-left py-2 lg:py-4">
              {/* Category & Read Time */}
              <span className="text-xs font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
                {currentHeroArticle.category} · {currentHeroArticle.readTime}
              </span>

              {/* Story Title with Gold Accent */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] text-[#F7F4EB] font-normal leading-[1.14] tracking-tight mt-3 mb-2">
                <Link
                  to={`/journal/${currentHeroArticle.slug}`}
                  className="hover:opacity-95 transition-opacity"
                >
                  {renderStyledTitle(currentHeroArticle.title)}
                </Link>
              </h2>

              {/* Thin Gold Divider */}
              <div className="w-12 h-[1.5px] bg-[#E4BD5A]/70 my-5" />

              {/* Story Excerpt */}
              <p className="text-sm sm:text-base text-[#B8C7BC] font-light leading-relaxed max-w-md mb-8">
                {currentHeroArticle.description}
              </p>

              {/* Action Button & Carousel Indicators */}
              <div className="flex flex-wrap items-center justify-between gap-6">
                {/* READ THE STORY → Pill Button */}
                <Link
                  to={`/journal/${currentHeroArticle.slug}`}
                  className="group inline-flex items-center space-x-3 rounded-full px-7 py-3 sm:px-8 sm:py-3.5 border border-[#E4BD5A]/80 text-[#E4BD5A] font-semibold text-xs tracking-[0.2em] uppercase bg-[#001D14]/80 hover:bg-[#E4BD5A] hover:text-[#001C13] transition-all duration-300 shadow-[0_0_15px_rgba(228,189,90,0.2)] hover:shadow-[0_0_25px_rgba(228,189,90,0.5)] cursor-pointer"
                >
                  <span>READ THE STORY</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>

                {/* Carousel Pagination Indicators */}
                {featuredArticles.length > 1 && (
                  <div className="flex items-center space-x-2 select-none">
                    {featuredArticles.map((art, idx) => {
                      const isActive = activeHeroIndex === idx;
                      return (
                        <button
                          key={art.id}
                          onClick={() => setActiveHeroIndex(idx)}
                          aria-label={`Show featured story: ${art.title}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            isActive
                              ? 'w-7 bg-[#E4BD5A] shadow-[0_0_8px_rgba(228,189,90,0.8)]'
                              : 'w-3.5 bg-[#174635] hover:bg-[#E4BD5A]/60'
                          }`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* 3. Category Filter Pills Row */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-[#E4BD5A]/15">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#E4BD5A] font-semibold">
                Explore Edits:
              </span>
            </div>

            {/* Horizontal Filter Pills matching luxury rounded-xl pill design */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 select-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-4 sm:px-5 py-2 text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#D5BA64] text-[#132516] shadow-[0_0_20px_rgba(213,186,100,0.55)] border border-[#D5BA64]'
                        : 'bg-[#002219] border border-[#526857]/50 text-[#B8C7BC] hover:border-[#D5BA64]/70 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Atelier Editorial Articles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredArticles.map((art) => (
              <article
                key={art.id}
                className="group flex flex-col rounded-2xl overflow-hidden border border-[#E4BD5A]/20 bg-[#002218]/60 hover:border-[#E4BD5A]/60 transition-all duration-300 shadow-md hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
              >
                {/* Article Card Image */}
                <Link
                  to={`/journal/${art.slug}`}
                  className="block aspect-[3/4] w-full overflow-hidden bg-[#00140D] relative"
                >
                  <img
                    src={art.image}
                    alt={art.title}
                    className={`w-full h-full object-cover ${
                      art.slug === 'twin-edit-styling-notes'
                        ? 'object-right sm:object-center'
                        : art.slug === 'how-we-fit-pet-garment'
                        ? 'object-center'
                        : 'object-top'
                    } transition-transform duration-500 ease-out group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                </Link>

                {/* Article Card Content */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <span className="text-[10px] tracking-[0.25em] text-[#E4BD5A] uppercase font-semibold">
                      {art.category} · {art.readTime}
                    </span>

                    <h3 className="font-serif text-xl sm:text-2xl text-[#F7F4EB] font-normal leading-snug group-hover:text-[#E4BD5A] transition-colors">
                      <Link to={`/journal/${art.slug}`}>
                        {art.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed line-clamp-3">
                      {art.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E4BD5A]/15">
                    <Link
                      to={`/journal/${art.slug}`}
                      className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.2em] text-[#E4BD5A] uppercase transition-colors hover:text-white"
                    >
                      <span>Read Essay</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="py-16 text-center text-[#B8C7BC] font-light text-sm">
              No essays found in this category. Select another edit or view all.
            </div>
          )}
        </div>

        {/* 5. Bottom Atelier CTA Section */}
        <div className="mt-24 sm:mt-32 py-16 sm:py-20 text-center rounded-3xl bg-[#002218]/50 border border-[#E4BD5A]/25 relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto px-4 space-y-6">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#E4BD5A] font-semibold">
              ATELIER TO WARDROBE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#F7F4EB] font-normal tracking-tight">
              Read it, then wear it
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C7BC] font-light leading-relaxed">
              Every garment discussed in our journal is cut by hand in limited runs. Explore the current collections for people, pets, and twins.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-block bg-[#E4BD5A] text-[#001C13] font-semibold px-8 py-3.5 text-xs sm:text-sm tracking-[0.25em] uppercase hover:bg-[#F1D27A] transition-all duration-300 rounded-sm shadow-[0_0_20px_rgba(228,189,90,0.3)] hover:shadow-[0_0_30px_rgba(228,189,90,0.5)] cursor-pointer"
              >
                SHOP THE COLLECTION
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

