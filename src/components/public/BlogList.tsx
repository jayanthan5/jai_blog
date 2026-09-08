import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Tag, 
  Calendar, 
  Clock, 
  Download, 
  Lock, 
  ArrowRight, 
  BookOpen, 
  Sparkles,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { BlogPost, Category } from '../../types/blog';
import { apiService } from '../../services/apiService';

interface BlogListProps {
  onSelectBlog: (blogId: string) => void;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const BlogList: React.FC<BlogListProps> = ({
  onSelectBlog,
  selectedCategory,
  onSelectCategory,
}) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [blogsRes, catsRes] = await Promise.all([
        apiService.getPublishedBlogs({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          search: searchQuery,
        }),
        apiService.getCategories(),
      ]);

      if (blogsRes.success) setBlogs(blogsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) {
      console.error('Failed to load published blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Editorial Header Section */}
      <section className="bg-white border-b border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-semibold text-[#3368a0]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Engineering, Design &amp; Thought Leadership</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight">
            Jai-Blog Publications
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Visually constructed articles, architectural blueprints, and deep dives published directly through the Jai-Blog Drag-and-Drop builder engine.
          </p>

          {/* Search Bar & Category Controls (TRD 8.2 & PUB-03) */}
          <div className="pt-4 max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search published articles by title or keyword..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills & Dropdown (PRD PUB-03 & CAT-03) */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => onSelectCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#3368a0] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[#3368a0] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.blogCount !== undefined && cat.blogCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {cat.blogCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category Header when filtered */}
        {selectedCategory !== 'all' && currentCategoryObj && (
          <div className="mb-8 p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#3368a0]" />
                <h2 className="text-lg font-bold text-[#0f172a]">{currentCategoryObj.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentCategoryObj.description}</p>
            </div>
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs font-semibold text-[#3368a0] hover:underline"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
                <div className="h-6 bg-slate-200 rounded-sm w-4/5" />
                <div className="h-12 bg-slate-200 rounded-sm w-full" />
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          /* Empty State per TRD 8.2 */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a]">No Published Articles Found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery
                ? `No articles matched your search query "${searchQuery}". Try a different term or clear filters.`
                : 'No articles currently published under this category.'}
            </p>
            <div className="mt-5">
              <button
                onClick={() => {
                  setSearchQuery('');
                  onSelectCategory('all');
                }}
                className="px-4 py-2 bg-[#3368a0] text-white rounded-lg text-xs font-semibold hover:bg-[#285584] transition-colors"
              >
                Show All Published Blogs
              </button>
            </div>
          </div>
        ) : (
          /* Blog Cards Grid (PUB-01) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                onClick={() => onSelectBlog(blog.id)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group cursor-pointer hover:border-slate-300"
              >
                {/* Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={blog.thumbnail || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80'}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#3368a0] text-white shadow-xs">
                      {blog.categoryName}
                    </span>
                  </div>

                  {/* Download permission indicator on card (PRD PUB-04) */}
                  {blog.attachedFile && (
                    <div className="absolute top-3 right-3">
                      {blog.allowDownload ? (
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-600 text-white shadow-xs backdrop-blur-xs"
                          title="Contains downloadable assets"
                        >
                          <Download className="w-3 h-3" />
                          <span>Downloadable</span>
                        </span>
                      ) : (
                        <span 
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-200 backdrop-blur-xs"
                          title="Author has restricted direct file downloads"
                        >
                          <Lock className="w-3 h-3" />
                          <span>File Protected</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {blog.readTimeMinutes} min read
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-[#0f172a] group-hover:text-[#3368a0] transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h2>

                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {blog.shortDescription}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 font-medium">By {blog.author}</span>
                    <span className="inline-flex items-center gap-1 text-[#3368a0] group-hover:translate-x-0.5 transition-transform">
                      Read Article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
