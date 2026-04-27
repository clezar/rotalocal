
export interface User {
  uid: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  photoURL?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  businessId?: string;
  publishedAt: string;
  isPrivate?: boolean;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  gallery: string[];
  ownerId?: string; // Add ownerId
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  thumbnailUrl: string;
  publishedAt: string;
  tags: string[];
}

export interface CommercialRequest {
  id: string;
  name: string;
  businessName: string;
  email: string;
  whatsapp: string;
  message?: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  videoId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export interface Plan {
  name: string;
  price: string;
  features: string[];
  isFeatured: boolean;
  ctaText: string;
}
