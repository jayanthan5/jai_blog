import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Layers, 
  FileCheck2, 
  FileEdit, 
  DownloadCloud, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  Tag,
  Lock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Code2
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigateToCreate: () => void;
  onNavigateToManage: () => void;
  onEditBlog: (blogId: string) => void;
  onViewPublicBlog: (blogId: string) => void;
  onViewSpringBoot: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToCreate,
  onNavigateToManage,
  onEditBlog,
  onViewPublicBlog,
  onViewSpringBoot,
}) => {
  const { user, sessionRemainingSeconds } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAdminBlogs();
      if (res.success) {
        setBlogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const draftBlogs = blogs.filter((b) => b.status === 'DRAFT').length;
  const downloadableAssetsCount = blogs.filter((b) => b.attachedFile && b.allowDownload).length;

  const sessionMinutes = Math.floor(sessionRemainingSeconds / 60);
  const sessionSeconds = sessionRemainingSeconds % 60;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3368a0] text-white">
              Administrator Hub
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Signed in as {user?.email}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Welcome back, {user?.name || 'Administrator'}
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Visually assemble rich articles with the Figma-like drag-and-drop canvas, control per-blog visitor file download permissions, and manage live publications.
          </p>
        </div>

        {/* Primary Action Button (UI/UX Spec 8.1 & 10) */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onNavigateToCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold shadow-md shadow-[#3368a0]/25 transition-all group"
          >
            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create New Blog</span>
          </button>

          <button
            onClick={onViewSpringBoot}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors"
          >
            <Code2 className="w-4 h-4 text-amber-600" />
            <span>Spring Boot Code</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (UI/UX Spec Section 8.1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Blogs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#3368a0] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-[#0f172a]">{totalBlogs}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">all records</span>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Live Published</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-emerald-600">{publishedBlogs}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">on public reader</span>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Draft Articles</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-amber-600">{draftBlogs}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">un-published</span>
          </div>
        </div>

        {/* Downloadable Assets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Public Assets</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DownloadCloud className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-indigo-600">{downloadableAssetsCount}</span>
            <span className="text-xs text-slate-500 ml-2 font-medium">download allowed</span>
          </div>
        </div>
      </div>

      {/* Session Inactivity Indicator (TRD AUTH-05: 30 minutes timeout) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#3368a0]" />
          <span>
            Active Admin Session Timeout (AUTH-05):{' '}
            <strong className="text-[#0f172a] font-mono">
              {sessionMinutes}m {sessionSeconds.toString().padStart(2, '0')}s
            </strong>{' '}
            remaining before automatic logout.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline font-medium">
          Resets on keyboard / cursor activity
        </span>
      </div>

      {/* Recent Blogs Table (UI/UX Spec 8.1 & MB-01) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0f172a]">Recent Blog Publications</h2>
            <p className="text-xs text-slate-500">
              Manage layouts, modify contents in the drag-and-drop builder, or toggle download permissions.
            </p>
          </div>

          <button
            onClick={onNavigateToManage}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3368a0] hover:underline"
          >
            <span>View All ({totalBlogs})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading publications...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-slate-500">No blog articles recorded yet.</p>
            <button
              onClick={onNavigateToCreate}
              className="px-4 py-2 bg-[#3368a0] text-white text-xs font-semibold rounded-lg"
            >
              Create your first article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Blog Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">File Download</th>
                  <th className="py-3 px-4">Elements</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.slice(0, 5).map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-[#0f172a] max-w-sm line-clamp-1">
                        {blog.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {blog.shortDescription}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {blog.categoryName}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {blog.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {blog.attachedFile ? (
                        blog.allowDownload ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <DownloadCloud className="w-3.5 h-3.5" />
                            Allowed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                            <Lock className="w-3.5 h-3.5" />
                            Restricted
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No file</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-slate-600 font-semibold">
                      {blog.elements?.length || 0} nodes
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => onEditBlog(blog.id)}
                        className="px-3 py-1.5 bg-[#3368a0] hover:bg-[#285584] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Manage
                      </button>

                      {blog.status === 'PUBLISHED' && (
                        <button
                          onClick={() => onViewPublicBlog(blog.id)}
                          className="px-2.5 py-1.5 text-slate-600 hover:text-[#3368a0] rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                          title="Open public view"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
