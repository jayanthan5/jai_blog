import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit3, 
  Trash2, 
  Globe, 
  EyeOff, 
  DownloadCloud, 
  Lock, 
  Calendar, 
  Tag, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import { apiService } from '../../services/apiService';

interface ManageBlogsViewProps {
  onEditBlog: (blogId: string) => void;
  onCreateNew: () => void;
  onViewPublic: (blogId: string) => void;
}

export const ManageBlogsView: React.FC<ManageBlogsViewProps> = ({
  onEditBlog,
  onCreateNew,
  onViewPublic,
}) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<BlogPost | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleToggleStatus = async (blog: BlogPost) => {
    try {
      const newStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const res = await apiService.updateBlog(blog.id, { status: newStatus });
      if (res.success) {
        setBlogs((prev) =>
          prev.map((b) => (b.id === blog.id ? { ...b, status: newStatus } : b))
        );
        setNotification(
          newStatus === 'PUBLISHED'
            ? `"${blog.title}" is now published and visible to public readers!`
            : `"${blog.title}" has been unpublished and moved to drafts.`
        );
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to toggle status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      const res = await apiService.deleteBlog(deleteCandidate.id);
      if (res.success) {
        setBlogs((prev) => prev.filter((b) => b.id !== deleteCandidate.id));
        setNotification(`Article "${deleteCandidate.title}" deleted.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to delete blog:', err);
    } finally {
      setDeleteCandidate(null);
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Manage Blog Publications (MB-01)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control publication states, edit layouts in the visual builder, and verify download permissions.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Blog</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter publications by title or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-4">
          <span>Total: <strong className="text-slate-800">{blogs.length}</strong></span>
          <span>Published: <strong className="text-emerald-600">{blogs.filter(b => b.status === 'PUBLISHED').length}</strong></span>
          <span>Drafts: <strong className="text-amber-600">{blogs.filter(b => b.status === 'DRAFT').length}</strong></span>
        </div>
      </div>

      {/* Table of Blogs (MB-01) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading publications...</span>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-xs text-slate-500">No blog articles found matching your query.</p>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-[#3368a0] text-white text-xs font-bold rounded-lg"
            >
              Create New Blog
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Name (MB-01)</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status (MB-01)</th>
                  <th className="py-3.5 px-4">Download Permission</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions (MB-02)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Short Description (MB-01) */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm text-[#0f172a] max-w-sm">
                        {blog.title}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 max-w-md">
                        {blog.shortDescription}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                        {blog.categoryName}
                      </span>
                    </td>

                    {/* Status (MB-01: Published / Draft) */}
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

                    {/* Download Permission Toggle State (PUB-04, FILE-03) */}
                    <td className="py-4 px-4">
                      {blog.attachedFile ? (
                        blog.allowDownload ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Download Enabled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Download Disabled</span>
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No file attached</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {new Date(blog.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions: Manage button (MB-02), Toggle status, Delete */}
                    <td className="py-4 px-6 text-right space-x-2">
                      {/* Manage Button (MB-02 & MB-03) */}
                      <button
                        onClick={() => onEditBlog(blog.id)}
                        className="px-3 py-1.5 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                        title="Open in Visual Builder"
                      >
                        Manage
                      </button>

                      {/* Status Toggle */}
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          blog.status === 'PUBLISHED'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                        title={blog.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Publish to Public'}
                      >
                        {blog.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>

                      {/* Public Preview link */}
                      {blog.status === 'PUBLISHED' && (
                        <button
                          onClick={() => onViewPublic(blog.id)}
                          className="p-1.5 text-slate-500 hover:text-[#3368a0] rounded-lg hover:bg-slate-100 transition-colors"
                          title="View on Public Reader"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => setDeleteCandidate(blog)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[#0f172a]">Delete Blog Article?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove <strong className="text-slate-800">"{deleteCandidate.title}"</strong>? This operation cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
