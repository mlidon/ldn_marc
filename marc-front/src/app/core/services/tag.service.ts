import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { Tag } from '../models/content.model';

@Injectable({ providedIn: 'root' })
export class TagService {
  private readonly api = inject(ApiService);

  list() {
    return this.api.get<Tag[]>('/tags').pipe(map((response) => response.data));
  }

  create(name: string) {
    return this.api.post<Tag>('/tags', { name }).pipe(map((response) => response.data));
  }

  update(id: number, name: string) {
    return this.api.put<Tag>(`/tags/${id}`, { name }).pipe(map((response) => response.data));
  }

  remove(id: number) {
    return this.api.delete<null>(`/tags/${id}`).pipe(map((response) => response.ok));
  }
}
