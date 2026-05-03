import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Content, Tag } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { ContentCardComponent } from '../../components/content-card/content-card.component';
import { ContentFiltersComponent } from '../../components/content-filters/content-filters.component';
import { SeoService } from '../../../../core/services/seo.service';

@Component({
  selector: 'app-posts-list',
  imports: [ContentCardComponent, ContentFiltersComponent],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss',
})
export class PostsListComponent implements OnInit{
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);
  private readonly seoService = inject(SeoService);

  readonly posts = signal<Content[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedTag = signal<string | null>('all');
  readonly sortValue = signal<'newest' | 'oldest'>('newest');

  readonly availableTags = computed(() => {
    const map = new Map<string, Tag>();

    for (const item of this.posts()) {
      for (const tag of item.tags ?? []) {
        if (!map.has(tag.slug)) {
          map.set(tag.slug, tag);
        }
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredPosts = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const selectedTagSlug = this.selectedTag();
    const order = this.sortValue();

    const filtered = this.posts().filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.short_description.toLowerCase().includes(query);

      const matchesTag =
        selectedTagSlug === 'all' ||
        (item.tags ?? []).some((tag) => tag.slug === selectedTagSlug);

      return matchesQuery && matchesTag;
    });

    return [...filtered].sort((a, b) => {
      const left = this.getBestDateTimestamp(a);
      const right = this.getBestDateTimestamp(b);
      return order === 'newest' ? right - left : left - right;
    });
  });

  constructor() {
    this.loading.set(true);
    this.contentService
      .list({ type: 'post', status: 'published' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => this.posts.set(items),
        error: () => this.error.set('No se pudieron cargar los artículos.'),
      });
  }


  ngOnInit(): void {
    this.seoService.update({
      title: 'Artículos | Marc Lidón',
      description: 'Descubre los artículos de Marc Lidón, desarrollador de software especializado en Angular, Node.js, .NET, Python, Unity e integración de IA aplicada.',
      keywords: 'artículos, blog, Marc Lidón, desarrollador software, Angular, Node.js, .NET, Python, Unity, IA aplicada',
    });
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onTagChange(value: string): void {
    this.selectedTag.set(value);
  }

  onSortChange(value: 'newest' | 'oldest'): void {
    this.sortValue.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedTag.set('all');
    this.sortValue.set('newest');
  }

  private getBestDateTimestamp(item: Content): number {
    const dateValue =
      item.published_at ?? item.scheduled_at ?? item.updated_at ?? item.created_at ?? null;

    if (!dateValue) {
      return 0;
    }

    const timestamp = Date.parse(dateValue);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }
}
