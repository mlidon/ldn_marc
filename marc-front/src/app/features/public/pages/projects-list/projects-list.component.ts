import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Content } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { ContentCardComponent } from '../../components/content-card/content-card.component';

@Component({
  selector: 'app-projects-list',
  imports: [ContentCardComponent],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
})
export class ProjectsListComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);

  readonly projects = signal<Content[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loading.set(true);
    this.contentService
      .list({ type: 'project', status: 'published' })
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
