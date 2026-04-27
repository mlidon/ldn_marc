import { inject, Injectable, signal } from '@angular/core';
import { finalize, map } from 'rxjs';
import { ApiService } from './api.service';
import { Content, ContentPayload, ContentStatus, ContentType } from '../models/content.model';

export interface ContentFilters {
  type?: ContentType;
  status?: ContentStatus;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly api = inject(ApiService);
  readonly loading = signal(false);

  list(filters?: ContentFilters) {
    this.loading.set(true);
    const params: Record<string, string> = {};

    if (filters?.type) {
      params['type'] = filters.type;
    }

    if (filters?.status) {
      params['status'] = filters.status;
    }

    if (filters?.search) {
      params['search'] = filters.search;
    }

    return this.api.get<Content[]>('/contents', { params: Object.keys(params).length ? params : undefined }).pipe(
      map((response) => response.data),
      finalize(() => this.loading.set(false)),
    );
  }

  byId(id: number) {
    return this.api.get<Content>(`/contents/${id}`).pipe(map((response) => response.data));
  }

  bySlug(slug: string) {
    return this.api.get<Content>(`/contents/slug/${slug}`).pipe(map((response) => response.data));
  }

  create(payload: ContentPayload) {
    return this.api.post<Content>('/contents', payload).pipe(map((response) => response.data));
  }

  update(id: number, payload: Partial<ContentPayload>) {
    return this.api.put<Content>(`/contents/${id}`, payload).pipe(map((response) => response.data));
  }

  remove(id: number) {
    return this.api.delete<null>(`/contents/${id}`).pipe(map((response) => response.ok));
  }
}
