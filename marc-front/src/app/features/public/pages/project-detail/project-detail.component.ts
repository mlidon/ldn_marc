import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Content } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { ContentDetailComponent } from '../../components/content-detail/content-detail.component';



@Component({
  selector: 'app-project-detail',
  imports: [ContentDetailComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);

  readonly project = signal<Content | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.loading.set(true);
          return this.contentService.bySlug(params.get('slug') ?? '');
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          this.loading.set(false);
          if (item.content_type !== 'project' || item.status !== 'published') {
            this.project.set(null);
            this.error.set('Proyecto no encontrado.');
            return;
          }

          this.error.set(null);
          this.project.set(item);
        },
        error: () => {
          this.loading.set(false);
          this.project.set(null);
          this.error.set('Proyecto no encontrado.');
        },
      });
  }
}
