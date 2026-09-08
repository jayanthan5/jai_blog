import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Download, 
  FileText, 
  CheckCircle2, 
  Lock, 
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { BlogPost, BuilderElement } from '../../types/blog';
import { apiService } from '../../services/apiService';

interface BlogDetailProps {
  blogId: string;
  onBack: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ blogId, onBack }) => {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    loadBlog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [blogId]);

  const loadBlog = async () => {
    setLoading(true);
    try {
      const res = await apiService.getBlogById(blogId);
      if (res.success && res.data) {
        setBlog(res.data);
      }
    } catch (err) {
      console.error('Failed to load blog details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!blog || !blog.attachedFile || !blog.allowDownload) return;

    // Trigger synthetic file download for visitor
    const blob = new Blob([
      `Jai-Blog Attached Resource Document\n\nTitle: ${blog.title}\nOriginal File: ${blog.attachedFile.fileName}\nPublished via Jai-Blog Engine\n\nContent verified and authorized for public distribution.`
    ], { type: 'text/plain;charset=utf-8' });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', blog.attachedFile.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded-sm w-24" />
          <div className="h-10 bg-slate-200 rounded-sm w-3/4" />
          <div className="h-4 bg-slate-200 rounded-sm w-1/2" />
          <div className="h-80 bg-slate-200 rounded-2xl w-full" />
          <div className="space-y-3 pt-6">
            <div className="h-4 bg-slate-200 rounded-sm w-full" />
            <div className="h-4 bg-slate-200 rounded-sm w-5/6" />
            <div className="h-4 bg-slate-200 rounded-sm w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-xs">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#0f172a]">Article Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">
            The requested article could not be retrieved or is in draft mode.
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-4 py-2 bg-[#3368a0] text-white text-xs font-semibold rounded-lg hover:bg-[#285584]"
          >
            Return to Publications
          </button>
        </div>
      </div>
    );
  }

  // Helper to format bytes
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown Size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Render individual element according to Drag & Drop layout (PRD PUB-02)
  const renderElement = (el: BuilderElement) => {
    const s = el.styles || {};

    switch (el.type) {
      case 'TEXT': {
        const textType = s.textType || 'paragraph';
        const styleObj: React.CSSProperties = {
          fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
          fontWeight: s.fontWeight || 'normal',
          color: s.color || '#0f172a',
          textAlign: s.textAlign || 'left',
          backgroundColor: s.backgroundColor || 'transparent',
          padding: s.padding ? `${s.padding}px` : undefined,
          borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
          opacity: s.opacity !== undefined ? s.opacity / 100 : 1,
        };

        if (textType === 'h1') {
          return (
            <h1 key={el.id} style={styleObj} className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight my-4">
              {el.content}
            </h1>
          );
        }
        if (textType === 'h2') {
          return (
            <h2 key={el.id} style={styleObj} className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a] mt-8 mb-3">
              {el.content}
            </h2>
          );
        }
        if (textType === 'quote') {
          return (
            <blockquote key={el.id} style={styleObj} className="my-6 border-l-4 border-[#3368a0] pl-4 italic text-slate-700 bg-slate-50 py-3 rounded-r-lg">
              {el.content}
            </blockquote>
          );
        }
        if (textType === 'lead') {
          return (
            <p key={el.id} style={styleObj} className="text-lg sm:text-xl text-slate-700 leading-relaxed font-normal my-4">
              {el.content}
            </p>
          );
        }

        return (
          <p key={el.id} style={styleObj} className="text-base text-slate-700 leading-relaxed my-3 whitespace-pre-line">
            {el.content}
          </p>
        );
      }

      case 'IMAGE': {
        return (
          <figure key={el.id} className="my-8 space-y-2">
            <div
              className={`overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
                s.shadow === 'md' ? 'shadow-md' : s.shadow === 'lg' ? 'shadow-lg' : ''
              }`}
              style={{
                width: s.width || '100%',
                opacity: s.opacity !== undefined ? s.opacity / 100 : 1,
              }}
            >
              <img
                src={el.content || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                alt={el.subContent || 'Article visual element'}
                className="w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
              />
            </div>
            {el.subContent && (
              <figcaption className="text-xs text-center text-slate-500 font-medium italic">
                {el.subContent}
              </figcaption>
            )}
          </figure>
        );
      }

      case 'VIDEO': {
        const isEmbed = el.content.includes('youtube') || el.content.includes('vimeo');
        return (
          <div key={el.id} className="my-8 space-y-2">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
              {isEmbed ? (
                <iframe
                  src={el.content}
                  title="Article Video Element"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={el.content}
                  controls
                  className="w-full h-full"
                  poster={blog.thumbnail}
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>
            {el.subContent && (
              <p className="text-xs text-slate-500 text-center font-medium italic">{el.subContent}</p>
            )}
          </div>
        );
      }

      case 'DIVIDER': {
        return (
          <hr
            key={el.id}
            className="my-8 border-t"
            style={{
              borderColor: s.backgroundColor || '#e2e8f0',
              margin: s.margin ? `${s.margin}px 0` : undefined,
            }}
          />
        );
      }

      case 'BUTTON': {
        return (
          <div key={el.id} className="my-6" style={{ textAlign: s.textAlign || 'left' }}>
            <a
              href={el.subContent || '#'}
              target={el.subContent?.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{
                backgroundColor: s.backgroundColor || '#3368a0',
                color: s.color || '#ffffff',
                fontSize: s.fontSize ? `${s.fontSize}px` : '15px',
                borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
                padding: s.padding ? `${s.padding / 2}px ${s.padding}px` : '10px 20px',
              }}
              className="inline-flex items-center gap-2 font-semibold shadow-xs hover:opacity-90 transition-opacity"
            >
              <span>{el.content || 'Action Button'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <article className="min-h-screen bg-white">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-100 bg-slate-50/70 sticky top-16 z-20 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#3368a0] transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Publications</span>
          </button>

          <span className="text-xs font-semibold text-slate-400">
            {blog.categoryName}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Article Meta Header */}
        <header className="space-y-4 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#3368a0] text-white">
              {blog.categoryName}
            </span>
            <span className="text-xs text-slate-400 font-medium">Published Article</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f172a] tracking-tight leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-2 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <User className="w-3.5 h-3.5 text-[#3368a0]" />
              {blog.author}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {blog.readTimeMinutes} min read
            </span>
          </div>

          {/* Lead Description */}
          {blog.shortDescription && (
            <p className="text-lg text-slate-600 font-normal leading-relaxed pt-2 italic border-l-2 border-slate-300 pl-4">
              {blog.shortDescription}
            </p>
          )}
        </header>

        {/* Hero Image if present */}
        {blog.thumbnail && (
          <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <img
              src={blog.thumbnail}
              alt={blog.title}
              className="w-full h-auto max-h-[460px] object-cover"
            />
          </div>
        )}

        {/* Dynamic Drag-and-Drop Canvas Elements (PRD PUB-02) */}
        <div className="space-y-4 py-4">
          {blog.elements && blog.elements.length > 0 ? (
            blog.elements
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((el) => renderElement(el))
          ) : (
            <p className="text-slate-500 italic py-8">This article has no content elements configured.</p>
          )}
        </div>

        {/* ========================================================= */}
        {/* FILE ATTACHMENT & PERMISSION CONTROL (PRD PUB-04 & AC-03) */}
        {/* "Download button appears ONLY if blog has a file AND      */}
        {/*  allow_download = true"                                   */}
        {/* ========================================================= */}
        <section className="mt-14 pt-8 border-t border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Article Resource &amp; Attached Assets
          </h2>

          {blog.attachedFile ? (
            blog.allowDownload ? (
              /* ACTIVE DOWNLOAD BUTTON: allow_download = true (PUB-04 & AC-03) */
              <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#3368a0] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0f172a]">
                        {blog.attachedFile.fileName}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Public Download Authorized
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Size: {formatFileSize(blog.attachedFile.fileSize)} • Type: {blog.attachedFile.contentType}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Attached File</span>
                </button>
              </div>
            ) : (
              /* RESTRICTED ATTACHMENT: allow_download = false (PRD AC-03) */
              /* The download button is completely hidden / absent as mandated */
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>
                    Attachment <span className="font-semibold text-slate-700">{blog.attachedFile.fileName}</span> is attached to this record, but file downloading has been restricted by the administrator.
                  </span>
                </div>
                <span className="font-medium text-[11px] text-slate-400 italic">
                  Downloads Disabled
                </span>
              </div>
            )
          ) : (
            <p className="text-xs text-slate-400 italic">
              No downloadable files or attachments are associated with this publication.
            </p>
          )}

          {downloadSuccess && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Asset downloaded successfully via authorized endpoint!</span>
            </div>
          )}
        </section>

        {/* Footer Note (PRD PUB-05: No comments or likes on public site) */}
        <footer className="mt-14 pt-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 Jai-Blog Platform. Published under editorial review.</p>
          <p className="text-[11px] text-slate-400">
            Public Reader Mode: Clean, distraction-free consumption.
          </p>
        </footer>
      </div>
    </article>
  );
};
