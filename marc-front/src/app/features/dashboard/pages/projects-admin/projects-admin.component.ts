import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Content, ContentStatus, Tag } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DashboardContentFiltersComponent } from '../../components/dashboard-content-filters/dashboard-content-filters.component';

@Component({
  selector: 'app-projects-admin',
  imports: [RouterLink, DatePipe, ConfirmDialogComponent, DashboardContentFiltersComponent],
  templateUrl: './projects-admin.component.html',
  styleUrl: './projects-admin.component.scss',
})
export class ProjectsAdminComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);

  readonly projects = signal<Content[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly selectedTag = signal<string>('all');
  readonly selectedStatus = signal<'all' | ContentStatus>('all');
  readonly sortValue = signal<'newest' | 'oldest'>('newest');
  readonly showConfirmDelete = signal(false);
  readonly selectedProjectId = signal<number | null>(null);

  readonly availableTags = computed(() => {
    const map = new Map<string, Tag>();

    for (const item of this.projects()) {
      for (const tag of item.tags ?? []) {
        if (!map.has(tag.slug)) {
          map.set(tag.slug, tag);
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

  readonly filteredProjects = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const selectedTagSlug = this.selectedTag();
    const status = this.selectedStatus();
    const order = this.sortValue();

    const filtered = this.projects().filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.short_description.toLowerCase().includes(query);

      const matchesTag =
        selectedTagSlug === 'all' ||
        (item.tags ?? []).some((tag) => tag.slug === selectedTagSlug);

      const matchesStatus = status === 'all' || item.status === status;

      return matchesQuery && matchesTag && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      const left = this.getBestDateTimestamp(a);
      const right = this.getBestDateTimestamp(b);
      return order === 'newest' ? right - left : left - right;
    });
  });

  constructor() {
    this.loadProjects();
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
  }

  onTagChange(value: string): void {
    this.selectedTag.set(value);
  }

  onStatusChange(value: 'all' | ContentStatus): void {
    this.selectedStatus.set(value);
  }

  onSortChange(value: 'newest' | 'oldest'): void {
    this.sortValue.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedTag.set('all');
    this.selectedStatus.set('all');
    this.sortValue.set('newest');
  }

  onDeleteClick(projectId: number): void {
    this.selectedProjectId.set(projectId);
    this.showConfirmDelete.set(true);
  }

  onConfirmDelete(): void {
    const projectId = this.selectedProjectId();
    if (projectId === null) {
      return;
    }

    this.closeDeleteDialog();
    this.deleteProject(projectId);
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  private deleteProject(projectId: number): void {
    this.error.set(null);
    this.contentService
      .remove(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadProjects(),
        error: () => this.error.set('Unable to delete project.'),
      });
  }

  getBestDate(item: Content): string | null {
    return item.published_at ?? item.scheduled_at ?? item.updated_at ?? item.created_at ?? null;
  }

  private getBestDateTimestamp(item: Content): number {
    const dateValue = this.getBestDate(item);
    if (!dateValue) {
      return 0;
    }

    const timestamp = Date.parse(dateValue);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.contentService
      .list({ type: 'project' })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => this.projects.set(items),
        error: () => this.error.set('Unable to load projects.'),
      });
  }

  private closeDeleteDialog(): void {
    this.selectedProjectId.set(null);
    this.showConfirmDelete.set(false);
  }
}
