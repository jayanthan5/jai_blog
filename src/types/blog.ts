export type ElementType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DIVIDER' | 'BUTTON';

export interface ElementStyles {
  fontSize?: number; // in px
  fontWeight?: 'normal' | '500' | '600' | 'bold';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  width?: string; // e.g. '100%', '75%', '50%', 'auto'
  height?: string;
  padding?: number; // in px
  margin?: number;
  backgroundColor?: string;
  borderRadius?: number; // in px
  opacity?: number; // 0 to 100
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  textType?: 'h1' | 'h2' | 'h3' | 'paragraph' | 'quote' | 'lead';
  buttonVariant?: 'primary' | 'secondary' | 'outline';
}

export interface BuilderElement {
  id: string;
  type: ElementType;
  content: string; // text body, image src, video embed url, or button label
  subContent?: string; // caption for images, target link for buttons, or video title
  styles: ElementStyles;
  orderIndex: number;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  contentType: string;
  url?: string;
  allowDownload: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  categoryName: string;
  shortDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
  allowDownload: boolean;
  attachedFile?: FileAttachment;
  thumbnail: string;
  elements: BuilderElement[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readTimeMinutes: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  blogCount?: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN';
  token?: string;
}

export interface OtpState {
  email: string;
  code: string;
  generatedAt: number;
  expiresAt: number;
  consumed: boolean;
}

export interface StandardApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}
