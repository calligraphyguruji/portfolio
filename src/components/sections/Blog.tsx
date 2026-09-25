import React from 'react';
import { blogPosts } from '../../data/blogData';
import { PageSEO } from '../common/PageSEO';
import { BookOpen, Calendar, Clock, ArrowRight, ArrowLeft, Tag } from 'lucide-react';

interface BlogProps {
  activeSlug?: string | null;
  onNavigateHome: () => void;
  onSelectArticle: (slug: string) => void;
}

export const Blog: React.FC<BlogProps> = ({
  activeSlug,
  onNavigateHome,
  onSelectArticle,
}) => {
  const currentPost = activeSlug ? blogPosts.find((p) => p.slug === activeSlug) : null;

  if (currentPost) {
    return (
      <>
        <PageSEO
          title={`${currentPost.title} | Aman Mishra`}
          description={currentPost.excerpt}
          canonical={`https://www.calligraphyguruji.dev/blog/${currentPost.slug}`}
          type="article"
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: currentPost.title,
            description: currentPost.excerpt,
            datePublished: currentPost.publishDate,
            author: {
              '@type': 'Person',
              name: 'Aman Mishra',
              url: 'https://www.calligraphyguruji.dev/',
            },
            publisher: {
              '@type': 'Person',
              name: 'Aman Mishra',
            },
          }}
        />
        <article className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => onSelectArticle('')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Articles</span>
            </button>
          </div>

          <div className="editorial-panel p-6 sm:p-12 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#8E8E93] dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {currentPost.publishDate}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {currentPost.readingTime}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-[#171717] dark:text-white leading-[1.1]">
              {currentPost.title}
            </h1>

            <p className="text-base sm:text-lg text-[#5E5E5E] dark:text-slate-300 leading-relaxed font-medium">
              {currentPost.excerpt}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {currentPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-black/[0.04] dark:bg-white/[0.06] text-[#171717] dark:text-white"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] prose dark:prose-invert max-w-none text-[#333] dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
              {currentPost.content?.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h2
                      key={idx}
                      className="text-xl sm:text-2xl font-bold font-sans text-[#171717] dark:text-white pt-4"
                    >
                      {paragraph.replace('### ', '')}
                    </h2>
                  );
                }
                return <p key={idx}>{paragraph}</p>;
              })}
            </div>
          </div>
        </article>
      </>
    );
  }

  return (
    <>
      <PageSEO
        title="Technical Articles & Architecture Notes | Aman Mishra"
        description="Engineering deep-dives, systems architecture notes, C++ algorithmic patterns, and full-stack development insights by Aman Mishra."
        canonical="https://www.calligraphyguruji.dev/blog"
      />
      <section id="blog" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="editorial-panel p-6 sm:p-12 relative overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-8">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-semibold uppercase tracking-wider text-[#171717] dark:text-white hover:border-black dark:hover:border-white shadow-xs transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Return to Portfolio</span>
            </button>
            <span className="text-xs font-mono text-[#8E8E93] dark:text-slate-400 uppercase tracking-widest">
              Engineering Notes
            </span>
          </div>

          <div className="space-y-4 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-cyan-500/10 border border-indigo-500/20 dark:border-cyan-500/20 text-indigo-600 dark:text-cyan-400 text-xs font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Writing &amp; Architecture</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-[#171717] dark:text-white">
              Engineering Deep-Dives &amp; Notes
            </h1>
            <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-400 max-w-2xl leading-relaxed">
              In-depth articles documenting practical engineering decisions, high-throughput microservices, C++ algorithmic optimizations, and AI integration architectures.
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectArticle(post.slug);
                }}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#141822] border border-black/[0.08] dark:border-white/[0.08] hover:border-black dark:hover:border-white transition-all shadow-xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E93] dark:text-slate-400">
                    <span>{post.publishDate}</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="text-lg font-sans font-bold text-[#171717] dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-xs text-[#5E5E5E] dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#171717] dark:text-white">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
