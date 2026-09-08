import { BlogPost, Category, FileAttachment, StandardApiResponse } from '../types/blog';
import { INITIAL_BLOGS, PREDEFINED_CATEGORIES } from '../data/initialData';

const STORAGE_KEYS = {
  BLOGS: 'jaiblog_posts_v1',
  CATEGORIES: 'jaiblog_categories_v1',
  AUTH: 'jaiblog_auth_session_v1',
  PENDING_OTP: 'jaiblog_pending_otp_v1',
};

// Initialize Storage if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.BLOGS)) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(INITIAL_BLOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(PREDEFINED_CATEGORIES));
  }
}

initializeStorage();

function getStoredBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOGS);
    return raw ? JSON.parse(raw) : INITIAL_BLOGS;
  } catch {
    return INITIAL_BLOGS;
  }
}

function saveStoredBlogs(blogs: BlogPost[]): void {
  localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
}

// Emulate network latency for authentic feel (under 300ms per TRD Section 18)
const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // ==========================================
  // Public Blog Endpoints (TRD Section 13)
  // ==========================================

  // GET /api/blogs
  async getPublishedBlogs(params?: { category?: string; search?: string }): Promise<StandardApiResponse<BlogPost[]>> {
    await delay();
    let blogs = getStoredBlogs().filter(b => b.status === 'PUBLISHED');

    if (params?.category && params.category !== 'all') {
      blogs = blogs.filter(b => b.categoryId.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      blogs = blogs.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.shortDescription.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      message: 'Operation completed successfully',
      data: blogs,
    };
  },

  // GET /api/blogs/{id}
  async getBlogById(id: string): Promise<StandardApiResponse<BlogPost>> {
    await delay();
    const blog = getStoredBlogs().find(b => b.id === id);
    if (!blog) {
      return {
        success: false,
        message: 'Blog post not found',
        errorCode: 'RESOURCE_NOT_FOUND',
        data: null as unknown as BlogPost,
      };
    }
    return {
      success: true,
      message: 'Operation completed successfully',
      data: blog,
    };
  },

  // GET /api/categories
  async getCategories(): Promise<StandardApiResponse<Category[]>> {
    await delay();
    const blogs = getStoredBlogs();
    const categories = PREDEFINED_CATEGORIES.map(cat => ({
      ...cat,
      blogCount: blogs.filter(b => b.status === 'PUBLISHED' && b.categoryId === cat.id).length,
    }));
    return {
      success: true,
      message: 'Operation completed successfully',
      data: categories,
    };
  },

  // GET /api/categories/{id}/blogs
  async getBlogsByCategory(categoryId: string): Promise<StandardApiResponse<BlogPost[]>> {
    return this.getPublishedBlogs({ category: categoryId });
  },

  // ==========================================
  // Admin Blog Endpoints (TRD Section 13)
  // ==========================================

  // GET /api/admin/blogs
  async getAdminBlogs(): Promise<StandardApiResponse<BlogPost[]>> {
    await delay();
    const blogs = getStoredBlogs();
    return {
      success: true,
      message: 'Admin blogs retrieved successfully',
      data: blogs,
    };
  },

  // POST /api/admin/blogs
  async createBlog(blog: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<StandardApiResponse<BlogPost>> {
    await delay();
    const blogs = getStoredBlogs();
    const newBlog: BlogPost = {
      ...blog,
      id: `blog-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: blog.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
    };
    blogs.unshift(newBlog);
    saveStoredBlogs(blogs);
    return {
      success: true,
      message: 'Blog created successfully',
      data: newBlog,
    };
  },

  // PUT /api/admin/blogs/{id}
  async updateBlog(id: string, updates: Partial<BlogPost>): Promise<StandardApiResponse<BlogPost>> {
    await delay();
    const blogs = getStoredBlogs();
    const idx = blogs.findIndex(b => b.id === id);
    if (idx === -1) {
      return {
        success: false,
        message: 'Blog post not found',
        errorCode: 'RESOURCE_NOT_FOUND',
        data: null as unknown as BlogPost,
      };
    }

    const wasDraft = blogs[idx].status === 'DRAFT';
    const isNowPublished = updates.status === 'PUBLISHED';

    blogs[idx] = {
      ...blogs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
      publishedAt: isNowPublished && wasDraft ? new Date().toISOString() : blogs[idx].publishedAt,
    };

    saveStoredBlogs(blogs);
    return {
      success: true,
      message: 'Blog updated successfully',
      data: blogs[idx],
    };
  },

  // DELETE /api/admin/blogs/{id}
  async deleteBlog(id: string): Promise<StandardApiResponse<void>> {
    await delay();
    let blogs = getStoredBlogs();
    blogs = blogs.filter(b => b.id !== id);
    saveStoredBlogs(blogs);
    return {
      success: true,
      message: 'Blog deleted successfully',
      data: undefined,
    };
  },

  // POST /api/admin/blogs/{id}/publish
  async publishBlog(id: string): Promise<StandardApiResponse<BlogPost>> {
    return this.updateBlog(id, { status: 'PUBLISHED' });
  },

  // POST /api/admin/blogs/{id}/draft
  async saveAsDraft(id: string): Promise<StandardApiResponse<BlogPost>> {
    return this.updateBlog(id, { status: 'DRAFT' });
  },

  // ==========================================
  // File Management Endpoints (TRD Section 12 & 13)
  // ==========================================

  // POST /api/admin/files
  async uploadFile(file: File, allowDownload: boolean): Promise<StandardApiResponse<FileAttachment>> {
    await delay(200);

    // Validation per TRD Section 12: max 50MB
    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        success: false,
        message: 'File too large. Maximum allowed size is 50MB (HTTP 413).',
        errorCode: 'FILE_TOO_LARGE',
        data: null as unknown as FileAttachment,
      };
    }

    // Allowed types: PDF, ZIP, JPG, PNG, MP4
    const allowed = ['pdf', 'zip', 'jpeg', 'png', 'mp4', 'quicktime'];
    const matches = allowed.some(type => file.type.includes(type) || file.name.toLowerCase().endsWith(type));
    if (!matches) {
      return {
        success: false,
        message: 'Unsupported file type. Allowed: PDF, ZIP, JPG, PNG, MP4 (HTTP 415).',
        errorCode: 'UNSUPPORTED_FILE_TYPE',
        data: null as unknown as FileAttachment,
      };
    }

    const attachment: FileAttachment = {
      id: `file-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type || 'application/octet-stream',
      allowDownload,
      url: URL.createObjectURL(file),
    };

    return {
      success: true,
      message: 'File uploaded successfully',
      data: attachment,
    };
  },

  // GET /api/files/{id}/download
  async checkDownloadPermission(blogId: string): Promise<{ permitted: boolean; reason?: string; file?: FileAttachment }> {
    const blog = getStoredBlogs().find(b => b.id === blogId);
    if (!blog || !blog.attachedFile) {
      return { permitted: false, reason: 'No attachment found for this blog post.' };
    }
    // Strict enforcement of allowDownload (PRD PUB-04 & TRD Section 12)
    if (!blog.allowDownload || !blog.attachedFile.allowDownload) {
      return { permitted: false, reason: 'The administrator has restricted download permissions for this asset.' };
    }
    return { permitted: true, file: blog.attachedFile };
  },

  // Reset demo data to factory defaults
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(INITIAL_BLOGS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(PREDEFINED_CATEGORIES));
  }
};
