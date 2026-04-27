import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Content } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';

@Component({
  selector: 'app-posts-admin',
  imports: [RouterLink, DatePipe],
  templateUrl: './posts-admin.component.html',
  styleUrl: './posts-admin.component.scss',
})
export class PostsAdminComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);

  readonly posts = signal<Content[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadPosts();
  }

  deletePost(postId: number): void {
    this.error.set(null);
    this.contentService
      .remove(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadPosts(),
        error: () => this.error.set('Unable to delete post.'),
      });
  }

  getBestDate(item: Content): string | null {
    return item.published_at ?? item.scheduled_at ?? item.updated_at ?? item.created_at ?? null;
  }

  private loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.contentService
      .list({ type: 'post' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => this.posts.set(items),
        error: () => this.error.set('Unable to load posts.'),
      });
  }
}
