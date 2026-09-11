import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, ArrowRight } from 'lucide-react';
import { journalService } from '../../services/journalService';
import { Article } from '../../types/journal';

export const JournalDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setIsLoading(true);
      const art = await journalService.getArticleBySlug(slug);
      if (art) {
        setArticle(art);
        const rel = await journalService.getRelatedArticles(art.slug, 3);
        setRelated(rel);
      }
      setIsLoading(false);
      window.scrollTo(0, 0);
    }
    load();
  }, [slug]);

  if (isLoading) {
    return <div className="text-xs text-[#B8B9A8] py-20">Retrieving article...</div>;
  }

  if (!article) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-serif text-3xl text-[#F5F0DF]">Essay Not Found</h2>
        <button onClick={() => navigate('/journal')} className="btn-gold text-xs">
          BACK TO JOURNAL
        </button>
      </div>
    );
  }

  return (
    <article className="w-full bg-[#001C13] min-h-screen py-10 sm:py-16 text-left">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/journal"
          className="inline-flex items-center space-x-2 text-xs tracking-widest text-[#E4BD5A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO THE JOURNAL</span>
        </Link>

        {/* Category & Metadata */}
        <div className="space-y-4 text-center sm:text-left">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-[#E4BD5A] uppercase">
            {article.category} · {article.readTime} READ
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#F5F0DF] tracking-tight leading-[1.14]">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#B8B9A8] pt-2 border-b border-[#E4BD5A]/15 pb-6">
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-[#E4BD5A]" />
              <span>{article.author}</span>
            </span>
            <span>·</span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#E4BD5A]" />
              <span>{article.publishedAt}</span>
            </span>
          </div>
        </div>

        {/* Large Hero Image */}
        <div className="w-full max-h-[620px] aspect-[16/10] sm:aspect-[16/9] overflow-hidden border border-[#E4BD5A]/25 bg-[#001710] shadow-xl rounded-2xl">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose prose-invert max-w-none text-sm sm:text-base text-[#F5F0DF]/90 font-light leading-relaxed space-y-6 pt-4">
          <p className="text-base sm:text-lg text-[#E4BD5A] font-serif italic border-l-2 border-[#E4BD5A] pl-4">
            {article.description}
          </p>

          {article.content.map((paragraph, index) => (
            <p key={index} className="tracking-wide">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="pt-8 border-t border-[#E4BD5A]/15 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-wider uppercase px-3 py-1 bg-[#001F15] border border-[#E4BD5A]/20 text-[#B8B9A8]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="pt-16 mt-16 border-t border-[#E4BD5A]/20">
            <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F0DF] mb-8">
              More From The Atelier
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/journal/${rel.slug}`}
                  className="group block space-y-2.5"
                >
                  <div className="aspect-[16/10] overflow-hidden border border-[#E4BD5A]/15 bg-[#001710]">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-[#E4BD5A]">
                    {rel.category}
                  </p>
                  <h4 className="font-serif text-base text-[#F5F0DF] group-hover:text-[#E4BD5A] line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
