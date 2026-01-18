export interface Article {
    id?: string;
    title: string;
    content: string;
    status: 'draft' | 'in_review' | 'published';
    image?: string;
    author?: string;
    authorEmail?: string;
    authorId?: string;
    category?: string;
    display?: boolean;
    publishDate?: string;
    slug?: string;
    tags?: string[];
    city?: string;
    state?: string;
    country?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface Category {
    id?: string;
    name: string;
    description?: string;
}

export interface Tag {
    id?: string;
    name: string;
    slug?: string;
}

export interface UserRole {
    uid: string;
    email: string;
    role: 'admin' | 'writer';
    createdAt: any;
}
