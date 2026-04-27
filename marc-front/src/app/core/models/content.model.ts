export type ContentType = 'post' | 'project';
export type ContentStatus = 'draft' | 'published' | 'scheduled';

export interface Tag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ContentFile {
  id: number;
  content_id: number;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
}

export interface Content {
  id: number;
  content_type: ContentType;
  title: string;
  slug: string;
  short_description: string;
  cover_image_url: string;
  content_html: string | null;
  status: ContentStatus;
  published_at: string | null;
  scheduled_at: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  files?: ContentFile[];
}

export interface ContentPayload {
  content_type: ContentType;
  title: string;
  slug: string;
  short_description: string;
  cover_image_url: string;
  content_html: string | null;
  status: ContentStatus;
  published_at?: string | null;
  scheduled_at?: string | null;
  tag_ids?: number[];
}

export type ContentItem = Content;
