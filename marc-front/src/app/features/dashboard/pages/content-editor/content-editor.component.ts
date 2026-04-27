import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, map } from 'rxjs';
import { ContentFormComponent } from '../../../../shared/components/content-form/content-form.component';
import { Content, ContentPayload, ContentType, Tag } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { TagService } from '../../../../core/services/tag.service';

@Component({
  selector: 'app-content-editor',
  imports: [ContentFormComponent],
  templateUrl: './content-editor.component.html',
  styleUrl: './content-editor.component.scss',
})
export class ContentEditorComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly contentService = inject(ContentService);
  private readonly tagService = inject(TagService);

  readonly tags = signal<Tag[]>([]);
  readonly content = signal<Content | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly typeMismatchError = signal<string | null>(null);

  readonly contentType = computed(() => (this.route.snapshot.data['contentType'] as ContentType) ?? 'post');
  readonly contentId = computed(() => {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return null;
    }

    const id = Number(idParam);
    return Number.isNaN(id) ? null : id;
  });
  readonly isEditMode = computed(() => this.route.snapshot.paramMap.has('id'));

  readonly title = computed(() => {
    const typeLabel = this.contentType() === 'project' ? 'project' : 'post';
    return this.isEditMode() ? `Edit ${typeLabel}` : `New ${typeLabel}`;
  });

  constructor() {
    this.loadTags();
    this.loadContentForEdit();
  }

  goBack(): void {
    void this.router.navigateByUrl(this.listUrl());
  }

  cancel(): void {
    void this.router.navigateByUrl(this.listUrl());
  }

  save(payload: ContentPayload): void {
    if (this.typeMismatchError()) {
      return;
    }

    const type = this.contentType();
    const normalizedPayload: ContentPayload = {
      ...payload,
      content_type: type,
    };

    this.saving.set(true);
    this.error.set(null);

    const id = this.contentId();
    const request = id === null
      ? this.contentService.create(normalizedPayload)
      : this.contentService.update(id, normalizedPayload);

    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.listUrl()),
        error: () => this.error.set('Unable to save content. Please review your data and try again.'),
      });
  }

  private loadTags(): void {
    this.tagService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tags) => this.tags.set(tags),
        error: () => this.error.set('Unable to load tags.'),
      });
  }

  private loadContentForEdit(): void {
    const id = this.contentId();

    if (id === null) {
      if (this.isEditMode()) {
        this.error.set('Invalid content id.');
      }
      return;
    }

    this.loading.set(true);

    this.contentService
      .byId(id)
      .pipe(
        map((item) => {
          if (item.content_type !== this.contentType()) {
            this.typeMismatchError.set('This content type does not match the selected dashboard section.');
            throw new Error('Content type mismatch for this route.');
          }

          this.typeMismatchError.set(null);
          return item;
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => this.content.set(item),
        error: () => {
          if (!this.typeMismatchError()) {
            this.error.set('Unable to load this content for editing.');
          }
        },
      });
  }

  private listUrl(): string {
    return this.contentType() === 'project' ? '/dashboard/projects' : '/dashboard/posts';
  }
}
