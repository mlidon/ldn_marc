import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Content } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';

@Component({
  selector: 'app-projects-admin',
  imports: [RouterLink, DatePipe],
  templateUrl: './projects-admin.component.html',
  styleUrl: './projects-admin.component.scss',
})
export class ProjectsAdminComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);

  readonly projects = signal<Content[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadProjects();
  }

  deleteProject(projectId: number): void {
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
}
