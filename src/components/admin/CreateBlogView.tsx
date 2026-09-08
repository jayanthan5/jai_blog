import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Type, 
  Image as ImageIcon, 
  Video, 
  Minus, 
  Square, 
  Eye, 
  Save, 
  Globe, 
  Palette, 
  Sliders, 
  Maximize2, 
  Sparkles,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { BlogPost, BuilderElement, ElementType, FileAttachment } from '../../types/blog';
import { PREDEFINED_CATEGORIES } from '../../data/initialData';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../context/AuthContext';

interface CreateBlogViewProps {
  editingBlogId?: string | null;
  onFinish: () => void;
  onCancel: () => void;
}

export const CreateBlogView: React.FC<CreateBlogViewProps> = ({
  editingBlogId,
  onFinish,
  onCancel,
}) => {
  const { user } = useAuth();

  // Wizard Step: 1 = Metadata Form (CB-01 & CB-02), 2 = Visual Builder (CB-03 to CB-08)
  const [step, setStep] = useState<1 | 2>(1);

  // Metadata State
  const [blogTitle, setBlogTitle] = useState('');
  const [author, setAuthor] = useState(user?.name || 'Jai Administrator');
  const [categoryId, setCategoryId] = useState('tech');
  const [shortDescription, setShortDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80');
  
  // File Attachment & Download Control (CB-01, CB-02, PUB-04, AC-03)
  const [attachedFile, setAttachedFile] = useState<FileAttachment | undefined>(undefined);
  const [allowDownload, setAllowDownload] = useState<boolean>(false); // Default unchecked per CB-02!
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  // Canvas State (CB-04, CB-05, CB-06)
  const [elements, setElements] = useState<BuilderElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState(false);

  // Status & Notification
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  // Load existing blog if in Edit mode (MB-03)
  useEffect(() => {
    if (editingBlogId) {
      loadExistingBlog(editingBlogId);
    } else {
      // Default initial element template
      setElements([
        {
          id: 'el-init-1',
          type: 'TEXT',
          content: 'The Architecture of Autonomous Systems',
          styles: {
            textType: 'h1',
            fontSize: 32,
            fontWeight: 'bold',
            color: '#0f172a',
            textAlign: 'left',
            width: '100%',
            padding: 8,
          },
          orderIndex: 0,
        },
        {
          id: 'el-init-2',
          type: 'TEXT',
          content: 'Enter the introductory body text here. Click any element on this canvas to edit its properties in the right inspector panel.',
          styles: {
            textType: 'paragraph',
            fontSize: 16,
            fontWeight: 'normal',
            color: '#475569',
            textAlign: 'left',
            width: '100%',
            padding: 8,
          },
          orderIndex: 1,
        },
      ]);
    }
  }, [editingBlogId]);

  const loadExistingBlog = async (id: string) => {
    const res = await apiService.getBlogById(id);
    if (res.success && res.data) {
      const b = res.data;
      setBlogTitle(b.title);
      setAuthor(b.author);
      setCategoryId(b.categoryId);
      setShortDescription(b.shortDescription);
      setThumbnailUrl(b.thumbnail);
      setAllowDownload(b.allowDownload);
      setAttachedFile(b.attachedFile);
      setElements(b.elements || []);
      if (b.elements && b.elements.length > 0) {
        setSelectedElementId(b.elements[0].id);
      }
    }
  };

  // -------------------------------------------------------------
  // File Upload Handlers (FILE-01, FILE-02, CB-01)
  // -------------------------------------------------------------
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploadError(null);
    try {
      const res = await apiService.uploadFile(file, allowDownload);
      if (!res.success) {
        setFileUploadError(res.message);
      } else {
        setAttachedFile(res.data);
      }
    } catch (err: any) {
      setFileUploadError(err.message || 'File upload failed');
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(undefined);
  };

  // -------------------------------------------------------------
  // Step 1 -> Step 2 Validation (CB-03)
  // -------------------------------------------------------------
  const handleNextToBuilder = (e: React.FormEvent) => {
    e.preventDefault();
    setMetadataError(null);

    if (!blogTitle.trim()) {
      setMetadataError('Blog Name / Title is required (CB-01).');
      return;
    }
    if (!shortDescription.trim()) {
      setMetadataError('Short Description is required (CB-01).');
      return;
    }

    setStep(2);
  };

  // -------------------------------------------------------------
  // Visual Drag-and-Drop Canvas Logic (CB-04 to CB-07)
  // -------------------------------------------------------------
  const addElement = (type: ElementType) => {
    const newId = `el-${Date.now()}`;
    let newContent = '';
    let newSub = '';
    let styles: BuilderElement['styles'] = {
      width: '100%',
      padding: 10,
      opacity: 100,
      borderRadius: 8,
      textAlign: 'left',
    };

    switch (type) {
      case 'TEXT':
        newContent = 'New Section Heading or Paragraph Content';
        styles = {
          ...styles,
          textType: 'paragraph',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#334155',
        };
        break;
      case 'IMAGE':
        newContent = 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80';
        newSub = 'Descriptive image caption';
        styles = {
          ...styles,
          shadow: 'md',
        };
        break;
      case 'VIDEO':
        newContent = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        newSub = 'Video stream overview';
        styles = {
          ...styles,
        };
        break;
      case 'DIVIDER':
        newContent = '';
        styles = {
          ...styles,
          backgroundColor: '#e2e8f0',
          margin: 16,
          padding: 2,
        };
        break;
      case 'BUTTON':
        newContent = 'Explore Document Resource';
        newSub = '#';
        styles = {
          ...styles,
          buttonVariant: 'primary',
          backgroundColor: '#3368a0',
          color: '#ffffff',
          fontSize: 14,
          fontWeight: '600',
          borderRadius: 8,
          textAlign: 'center',
          width: 'auto',
          padding: 12,
        };
        break;
    }

    const newElement: BuilderElement = {
      id: newId,
      type,
      content: newContent,
      subContent: newSub,
      styles,
      orderIndex: elements.length,
    };

    setElements([...elements, newElement]);
    setSelectedElementId(newId);
  };

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  const updateSelectedStyle = (key: keyof BuilderElement['styles'], value: any) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElementId
          ? { ...el, styles: { ...el.styles, [key]: value } }
          : el
      )
    );
  };

  const updateSelectedContent = (content: string, subContent?: string) => {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === selectedElementId
          ? {
              ...el,
              content,
              subContent: subContent !== undefined ? subContent : el.subContent,
            }
          : el
      )
    );
  };

  const deleteElement = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const duplicateElement = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = elements.find((el) => el.id === id);
    if (!target) return;

    const dupId = `el-${Date.now()}`;
    const dup: BuilderElement = {
      ...target,
      id: dupId,
      orderIndex: target.orderIndex + 1,
    };

    const newElements = [...elements, dup];
    setElements(newElements);
    setSelectedElementId(dupId);
  };

  const moveElement = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= elements.length) return;

    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[targetIndex];
    newElements[targetIndex] = temp;

    // re-index
    newElements.forEach((el, idx) => {
      el.orderIndex = idx;
    });

    setElements(newElements);
  };

  // -------------------------------------------------------------
  // Save Draft vs Publish Blog (CB-08, CB-09, AC-01)
  // -------------------------------------------------------------
  const handleSaveOrPublish = async (status: 'DRAFT' | 'PUBLISHED') => {
    setIsPublishing(true);
    setNotification(null);

    const categoryObj = PREDEFINED_CATEGORIES.find((c) => c.id === categoryId);

    const blogData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
      title: blogTitle,
      author: author || 'Jai Administrator',
      categoryId,
      categoryName: categoryObj ? categoryObj.name : 'Technology',
      shortDescription,
      status,
      allowDownload,
      attachedFile: attachedFile ? { ...attachedFile, allowDownload } : undefined,
      thumbnail: thumbnailUrl || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      elements,
      readTimeMinutes: Math.max(3, Math.ceil(elements.length * 1.5)),
    };

    try {
      if (editingBlogId) {
        // Update existing (MB-04)
        const res = await apiService.updateBlog(editingBlogId, blogData);
        if (res.success) {
          setNotification({
            message: status === 'PUBLISHED' 
              ? 'Blog updated and published live successfully! (AC-01)' 
              : 'Draft changes saved successfully.',
            type: 'success',
          });
          setTimeout(() => onFinish(), 1200);
        }
      } else {
        // Create new (CB-08 / CB-09)
        const res = await apiService.createBlog(blogData);
        if (res.success) {
          setNotification({
            message: status === 'PUBLISHED'
              ? 'Blog published! Now visible immediately on the public website (AC-01).'
              : 'Blog saved as draft. Invisible to public visitors.',
            type: 'success',
          });
          setTimeout(() => onFinish(), 1200);
        }
      }
    } catch (err: any) {
      setNotification({ message: err.message || 'Operation failed', type: 'error' });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-100">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={step === 2 ? () => setStep(1) : onCancel}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={step === 2 ? 'Back to Metadata' : 'Cancel'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#0f172a]">
                {editingBlogId ? 'Manage & Edit Blog' : 'Create New Blog'}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Step {step} of 2: {step === 1 ? 'Metadata Form' : 'Figma-like Builder'}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md">
              {blogTitle || 'Untitled Blog Post'}
            </p>
          </div>
        </div>

        {/* Action Controls for Step 2 */}
        {step === 2 && (
          <div className="flex items-center gap-2">
            {/* Viewport Width Toggle */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewportMode === 'desktop' ? 'bg-white text-[#3368a0] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Desktop Canvas (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewportMode === 'tablet' ? 'bg-white text-[#3368a0] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tablet Preview (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewportMode === 'mobile' ? 'bg-white text-[#3368a0] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mobile Preview (375px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                previewMode
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
            </button>

            {/* Save as Draft (CB-09) */}
            <button
              onClick={() => handleSaveOrPublish('DRAFT')}
              disabled={isPublishing}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-600" />
              <span>Save as Draft</span>
            </button>

            {/* Publish Blog (CB-08 & AC-01) */}
            <button
              onClick={() => handleSaveOrPublish('PUBLISHED')}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3368a0] hover:bg-[#285584] text-white flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isPublishing ? 'Publishing...' : 'Publish Blog'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Flash Notification Toast */}
      {notification && (
        <div
          className={`px-6 py-3 text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* STEP 1: METADATA FORM (CB-01, CB-02, CB-03)                    */}
      {/* ============================================================= */}
      {step === 1 && (
        <div className="max-w-3xl mx-auto w-full p-6 md:p-10 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Step 1: Blog Metadata &amp; File Permissions</h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure primary article attributes, assign a predefined category, attach supplementary files, and set download permissions.
              </p>
            </div>

            {metadataError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{metadataError}</span>
              </div>
            )}

            <form onSubmit={handleNextToBuilder} className="space-y-5">
              {/* Blog Name (CB-01) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blog Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  placeholder="e.g. Architecting Distributed Microservices with Spring Boot 3"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all text-[#0f172a]"
                />
              </div>

              {/* Author (CB-01: auto-filled from logged-in user) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author <span className="text-slate-400 font-normal">(Auto-filled)</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={author}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed"
                  />
                </div>

                {/* Category (CAT-02: Predefined categories) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all text-[#0f172a]"
                  >
                    {PREDEFINED_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short Description (CB-01) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Provide a concise 1-2 sentence synopsis for search and public cards..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all text-[#0f172a]"
                />
              </div>

              {/* Cover / Thumbnail Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Header Thumbnail URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:border-transparent focus:bg-white transition-all text-[#0f172a]"
                />
              </div>

              {/* File Attachment Upload (CB-01, FILE-01: max 50MB, PDF/ZIP/JPG/PNG/MP4) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Resource File <span className="text-slate-400 font-normal">(Optional, max 50MB)</span>
                </label>

                {fileUploadError && (
                  <p className="text-xs text-rose-600 font-medium mb-2">{fileUploadError}</p>
                )}

                {attachedFile ? (
                  <div className="p-3.5 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3368a0] text-white flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0f172a]">{attachedFile.fileName}</div>
                        <div className="text-[10px] text-slate-500">
                          {(attachedFile.fileSize / 1024).toFixed(1)} KB • {attachedFile.contentType}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#3368a0] hover:bg-sky-50/30 transition-all">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      Click to choose or drop file (PDF, ZIP, JPG, PNG, MP4)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Max file size: 50MB (TRD Section 12)
                    </span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.zip,.jpg,.jpeg,.png,.mp4"
                    />
                  </label>
                )}
              </div>

              {/* ========================================================= */}
              {/* CHECKBOX: "Allow visitors to download this file" (CB-02) */}
              {/* Default: unchecked per CB-02                              */}
              {/* ========================================================= */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#3368a0] rounded-sm border-slate-300 focus:ring-[#3368a0]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#0f172a]">
                      Allow visitors to download this file (CB-02)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      When checked, a prominent download button appears on the public article page. When unchecked, visitors cannot download the file (PRD AC-03 &amp; FILE-04). Default: unchecked.
                    </p>
                  </div>
                </label>
              </div>

              {/* Next Button (CB-03) */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3368a0] hover:bg-[#285584] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <span>Next: Enter Visual Drag-and-Drop Editor</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* STEP 2: FIGMA-LIKE DRAG-AND-DROP EDITOR (CB-04 to CB-07)       */}
      {/* ============================================================= */}
      {step === 2 && (
        <div className="flex-1 flex overflow-hidden">
          {/* ----------------------------------------------------------- */}
          {/* LEFT PANEL: Draggable Element Library (CB-04)               */}
          {/* Elements: Text, Image, Video, Divider, Button               */}
          {/* ----------------------------------------------------------- */}
          {!previewMode && (
            <div className="w-64 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#3368a0]" />
                    <span>Element Library (CB-04)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Click to add components onto the canvas
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Text Element (CB-04) */}
                  <button
                    onClick={() => addElement('TEXT')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#3368a0] bg-slate-50 hover:bg-sky-50/50 text-left flex items-center gap-3 transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#3368a0] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Type className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Text / Heading</div>
                      <div className="text-[10px] text-slate-500">Headings, paragraphs &amp; quotes</div>
                    </div>
                  </button>

                  {/* Image Element (CB-04) */}
                  <button
                    onClick={() => addElement('IMAGE')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#3368a0] bg-slate-50 hover:bg-sky-50/50 text-left flex items-center gap-3 transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Image / Media</div>
                      <div className="text-[10px] text-slate-500">Captioned responsive visual</div>
                    </div>
                  </button>

                  {/* Video Element (CB-04) */}
                  <button
                    onClick={() => addElement('VIDEO')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#3368a0] bg-slate-50 hover:bg-sky-50/50 text-left flex items-center gap-3 transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Video Player</div>
                      <div className="text-[10px] text-slate-500">YouTube, Vimeo, MP4 stream</div>
                    </div>
                  </button>

                  {/* Divider Element (CB-04) */}
                  <button
                    onClick={() => addElement('DIVIDER')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#3368a0] bg-slate-50 hover:bg-sky-50/50 text-left flex items-center gap-3 transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Minus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Divider Line</div>
                      <div className="text-[10px] text-slate-500">Spacing &amp; rhythmic break</div>
                    </div>
                  </button>

                  {/* Button Element (CB-04) */}
                  <button
                    onClick={() => addElement('BUTTON')}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#3368a0] bg-slate-50 hover:bg-sky-50/50 text-left flex items-center gap-3 transition-all group shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Square className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Call to Action</div>
                      <div className="text-[10px] text-slate-500">Link button with custom styling</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Elements Tree / Hierarchy */}
              <div className="pt-4 border-t border-slate-200">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Canvas Layers ({elements.length})
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {elements.map((el, idx) => (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between cursor-pointer ${
                        selectedElementId === el.id
                          ? 'bg-[#3368a0] text-white font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">
                        {idx + 1}. {el.type}
                      </span>
                      <button
                        onClick={(e) => deleteElement(el.id, e)}
                        className="opacity-60 hover:opacity-100"
                        title="Delete element"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------- */}
          {/* CENTER CANVAS: Drop Zone & Visual Composition (CB-05 & CB-07) */}
          {/* ----------------------------------------------------------- */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start bg-slate-200/60">
            {/* Viewport Dimension Wrapper */}
            <div
              className={`bg-white rounded-2xl border border-slate-300 shadow-sm transition-all duration-300 min-h-[600px] p-6 sm:p-10 flex flex-col space-y-4 ${
                viewportMode === 'mobile'
                  ? 'w-[375px]'
                  : viewportMode === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full max-w-3xl'
              }`}
            >
              {/* Blog Title & Badge Header in Canvas */}
              <div className="pb-6 border-b border-slate-100 space-y-2">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-[#3368a0] text-white">
                  {PREDEFINED_CATEGORIES.find((c) => c.id === categoryId)?.name || 'Category'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
                  {blogTitle || 'Untitled Blog Post'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  By {author} • {elements.length} layout elements • Visual Drag-and-Drop Canvas
                </p>
              </div>

              {/* Elements Stream on Canvas */}
              {elements.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl p-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">The Canvas is Empty</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Click any element on the Left Panel (Text, Image, Video, Divider, Button) to place it on this canvas.
                  </p>
                </div>
              ) : (
                elements.map((el, index) => {
                  const isSelected = selectedElementId === el.id;
                  const s = el.styles || {};

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`relative group rounded-xl p-2 transition-all cursor-pointer ${
                        isSelected && !previewMode
                          ? 'ring-2 ring-[#3368a0] bg-sky-50/20 shadow-xs'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Bounding box hover / action tools (CB-07) */}
                      {isSelected && !previewMode && (
                        <div className="absolute -top-3.5 right-2 bg-slate-900 text-white rounded-lg px-2 py-0.5 flex items-center gap-1.5 text-[10px] font-bold shadow-md z-10">
                          <span className="uppercase text-sky-400">{el.type}</span>
                          <button
                            onClick={(e) => moveElement(index, 'up', e)}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 hover:text-sky-300 disabled:opacity-30"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => moveElement(index, 'down', e)}
                            disabled={index === elements.length - 1}
                            title="Move Down"
                            className="p-1 hover:text-sky-300 disabled:opacity-30"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => duplicateElement(el.id, e)}
                            title="Duplicate"
                            className="p-1 hover:text-emerald-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => deleteElement(el.id, e)}
                            title="Delete"
                            className="p-1 hover:text-rose-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Element Specific Rendering */}
                      {el.type === 'TEXT' && (
                        <div
                          style={{
                            fontSize: s.fontSize ? `${s.fontSize}px` : undefined,
                            fontWeight: s.fontWeight || 'normal',
                            color: s.color || '#0f172a',
                            textAlign: s.textAlign || 'left',
                            padding: s.padding ? `${s.padding}px` : undefined,
                            borderRadius: s.borderRadius ? `${s.borderRadius}px` : undefined,
                            backgroundColor: s.backgroundColor || 'transparent',
                            opacity: s.opacity !== undefined ? s.opacity / 100 : 1,
                          }}
                          className={`${
                            s.textType === 'h1'
                              ? 'text-2xl sm:text-3xl font-extrabold tracking-tight'
                              : s.textType === 'h2'
                              ? 'text-xl sm:text-2xl font-bold tracking-tight'
                              : s.textType === 'quote'
                              ? 'italic border-l-4 border-[#3368a0] pl-4 py-2'
                              : 'text-base leading-relaxed'
                          }`}
                        >
                          {el.content}
                        </div>
                      )}

                      {el.type === 'IMAGE' && (
                        <div
                          style={{
                            width: s.width || '100%',
                            opacity: s.opacity !== undefined ? s.opacity / 100 : 1,
                          }}
                          className="space-y-1.5"
                        >
                          <div
                            className={`overflow-hidden rounded-xl bg-slate-100 border border-slate-200 ${
                              s.shadow === 'md' ? 'shadow-md' : ''
                            }`}
                          >
                            <img
                              src={el.content}
                              alt={el.subContent || 'Canvas image'}
                              className="w-full h-auto max-h-[380px] object-cover"
                            />
                          </div>
                          {el.subContent && (
                            <p className="text-[11px] text-center text-slate-500 italic">
                              {el.subContent}
                            </p>
                          )}
                        </div>
                      )}

                      {el.type === 'VIDEO' && (
                        <div className="space-y-1.5">
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                            {el.content.includes('youtube') || el.content.includes('vimeo') ? (
                              <iframe
                                src={el.content}
                                title="Builder Video"
                                className="w-full h-full border-0"
                              />
                            ) : (
                              <video src={el.content} controls className="w-full h-full" />
                            )}
                          </div>
                          {el.subContent && (
                            <p className="text-[11px] text-center text-slate-500 italic">
                              {el.subContent}
                            </p>
                          )}
                        </div>
                      )}

                      {el.type === 'DIVIDER' && (
                        <hr
                          className="my-3 border-t"
                          style={{
                            borderColor: s.backgroundColor || '#e2e8f0',
                            margin: s.margin ? `${s.margin}px 0` : undefined,
                          }}
                        />
                      )}

                      {el.type === 'BUTTON' && (
                        <div style={{ textAlign: s.textAlign || 'left' }}>
                          <button
                            type="button"
                            style={{
                              backgroundColor: s.backgroundColor || '#3368a0',
                              color: s.color || '#ffffff',
                              fontSize: s.fontSize ? `${s.fontSize}px` : '14px',
                              borderRadius: s.borderRadius ? `${s.borderRadius}px` : '8px',
                              padding: s.padding ? `${s.padding / 2}px ${s.padding}px` : '10px 20px',
                            }}
                            className="font-semibold shadow-xs"
                          >
                            {el.content}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Download Asset Preview on Canvas */}
              {attachedFile && (
                <div className="mt-8 pt-4 border-t border-slate-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Attached File Asset:
                  </div>
                  {allowDownload ? (
                    <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#3368a0]" />
                        <div>
                          <span className="font-bold text-[#0f172a]">{attachedFile.fileName}</span>
                          <span className="block text-[10px] text-emerald-700 font-semibold">
                            ✓ Public download permitted by author
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-[#3368a0] text-white font-bold rounded-lg text-[11px]">
                        Download
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{attachedFile.fileName} (Download disabled by author)</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* RIGHT PANEL: Properties Controls for Selected Element (CB-06) */}
          {/* Font size, color, width, height, alignment, opacity, pos   */}
          {/* ----------------------------------------------------------- */}
          {!previewMode && (
            <div className="w-80 shrink-0 bg-white border-l border-slate-200 p-5 overflow-y-auto space-y-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#3368a0]" />
                  <span>Properties Inspector (CB-06)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Live styling and content controls for active node
                </p>
              </div>

              {selectedElement ? (
                <div className="space-y-5">
                  {/* Active Element Badge */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Selected Type
                      </span>
                      <div className="text-xs font-bold text-[#0f172a]">
                        {selectedElement.type}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      #{selectedElement.id.slice(-6)}
                    </span>
                  </div>

                  {/* Content / Text / URL Editor */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      {selectedElement.type === 'TEXT'
                        ? 'Text Content'
                        : selectedElement.type === 'IMAGE' || selectedElement.type === 'VIDEO'
                        ? 'Media / Embed URL'
                        : selectedElement.type === 'BUTTON'
                        ? 'Button Label'
                        : 'Divider Style'}
                    </label>

                    {selectedElement.type === 'TEXT' ? (
                      <textarea
                        rows={4}
                        value={selectedElement.content}
                        onChange={(e) => updateSelectedContent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white text-[#0f172a]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={selectedElement.content}
                        onChange={(e) => updateSelectedContent(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white text-[#0f172a]"
                      />
                    )}

                    {/* Subcontent (Caption or Button Link) */}
                    {(selectedElement.type === 'IMAGE' || selectedElement.type === 'BUTTON') && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          {selectedElement.type === 'BUTTON' ? 'Target Link / URL' : 'Caption Text'}
                        </label>
                        <input
                          type="text"
                          value={selectedElement.subContent || ''}
                          onChange={(e) => updateSelectedContent(selectedElement.content, e.target.value)}
                          placeholder={selectedElement.type === 'BUTTON' ? 'https://...' : 'Caption...'}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#3368a0] focus:bg-white text-[#0f172a]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Typography Controls (CB-06: font size, color, alignment) */}
                  {(selectedElement.type === 'TEXT' || selectedElement.type === 'BUTTON') && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Typography
                      </span>

                      {selectedElement.type === 'TEXT' && (
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1">Role Type</label>
                          <select
                            value={selectedElement.styles.textType || 'paragraph'}
                            onChange={(e) => updateSelectedStyle('textType', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                          >
                            <option value="h1">Heading 1 (Hero)</option>
                            <option value="h2">Heading 2 (Section)</option>
                            <option value="lead">Lead Paragraph</option>
                            <option value="paragraph">Standard Body</option>
                            <option value="quote">Pull Quote</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Font Size (CB-06)</span>
                          <span className="font-mono">{selectedElement.styles.fontSize || 16}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={48}
                          value={selectedElement.styles.fontSize || 16}
                          onChange={(e) => updateSelectedStyle('fontSize', Number(e.target.value))}
                          className="w-full accent-[#3368a0]"
                        />
                      </div>

                      {/* Alignment (CB-06) */}
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Alignment (CB-06)</label>
                        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg">
                          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
                            <button
                              key={align}
                              type="button"
                              onClick={() => updateSelectedStyle('textAlign', align)}
                              className={`py-1 text-[10px] font-bold capitalize rounded-md transition-colors ${
                                selectedElement.styles.textAlign === align
                                  ? 'bg-white text-[#3368a0] shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color (CB-06) */}
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Text Color (CB-06)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.styles.color || '#0f172a'}
                            onChange={(e) => updateSelectedStyle('color', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={selectedElement.styles.color || '#0f172a'}
                            onChange={(e) => updateSelectedStyle('color', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dimensions & Spacing Controls (CB-06: width, height, position/padding) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Dimensions &amp; Spacing (CB-06)
                    </span>

                    {/* Width (CB-06) */}
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-1">Width (CB-06)</label>
                      <select
                        value={selectedElement.styles.width || '100%'}
                        onChange={(e) => updateSelectedStyle('width', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="100%">100% (Full Width)</option>
                        <option value="75%">75% Width</option>
                        <option value="50%">50% Width</option>
                        <option value="auto">Auto / Inline</option>
                      </select>
                    </div>

                    {/* Padding / Spacing (CB-06) */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Padding (CB-06)</span>
                        <span className="font-mono">{selectedElement.styles.padding || 8}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={32}
                        value={selectedElement.styles.padding || 8}
                        onChange={(e) => updateSelectedStyle('padding', Number(e.target.value))}
                        className="w-full accent-[#3368a0]"
                      />
                    </div>

                    {/* Opacity (CB-06) */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span>Opacity (CB-06)</span>
                        <span className="font-mono">{selectedElement.styles.opacity ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={selectedElement.styles.opacity ?? 100}
                        onChange={(e) => updateSelectedStyle('opacity', Number(e.target.value))}
                        className="w-full accent-[#3368a0]"
                      />
                    </div>

                    {/* Background Color & Border Radius (CB-06) */}
                    {(selectedElement.type === 'BUTTON' || selectedElement.type === 'TEXT') && (
                      <div className="space-y-2">
                        <label className="block text-[11px] text-slate-600">Background Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.styles.backgroundColor || '#3368a0'}
                            onChange={(e) => updateSelectedStyle('backgroundColor', e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                          />
                          <button
                            type="button"
                            onClick={() => updateSelectedStyle('backgroundColor', 'transparent')}
                            className="text-[11px] px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions for active element */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => duplicateElement(selectedElement.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Duplicate Node
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteElement(selectedElement.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg"
                    >
                      Delete Node
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-slate-400">
                  <Sliders className="w-8 h-8 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Element Selected</p>
                  <p className="text-[11px] text-slate-400">
                    Click any element on the center canvas to customize its typography, spacing, and styling properties.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
