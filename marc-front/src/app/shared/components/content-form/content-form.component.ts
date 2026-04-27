import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  Content,
  ContentPayload,
  ContentStatus,
  ContentType,
  Tag,
} from '../../../core/models/content.model';
import { UploadService } from '../../../core/services/upload.service';
import { QuillComponent } from '../quill/quill.component';

@Component({
  selector: 'app-content-form',
  imports: [CommonModule, ReactiveFormsModule, QuillComponent],
  templateUrl: './content-form.component.html',
  styleUrl: './content-form.component.scss',
})
export class ContentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly uploadService = inject(UploadService);
  private lastTitleForSlug = '';

  readonly mode = input<'create' | 'edit'>('create');
  readonly type = input.required<ContentType>();
  readonly tags = input<Tag[]>([]);
  readonly initialContent = input<Content | null>(null);
  readonly saved = output<ContentPayload>();
  readonly uploadingCover = signal(false);
  readonly coverUploadError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    short_description: ['', Validators.required],
    cover_image_url: ['', Validators.required],
    content_html: [''],
    status: this.fb.nonNullable.control<ContentStatus>('draft'),
    published_at: [''],
    scheduled_at: [''],
    tag_ids: this.fb.nonNullable.control<number[]>([]),
  });

  constructor() {
    this.applyStatusValidation(this.form.controls.status.value);

    this.form.controls.title.valueChanges.subscribe((title) => {
      const normalizedTitle = (title ?? '').trim();
      const shouldUpdateSlug =
        this.mode() === 'create' || normalizedTitle !== this.lastTitleForSlug;

      if (!shouldUpdateSlug) {
        return;
      }

      this.form.controls.slug.setValue(this.toSlug(normalizedTitle), { emitEvent: false });
      this.lastTitleForSlug = normalizedTitle;
    });

    this.form.controls.status.valueChanges.subscribe((status) => {
      this.applyStatusValidation(status);
    });

    effect(() => {
      const initial = this.initialContent();
      if (!initial) {
        if (this.mode() === 'create') {
          this.form.reset({
            title: '',
            slug: '',
            short_description: '',
            cover_image_url: '',
            content_html: '',
            status: 'draft',
            published_at: '',
            scheduled_at: '',
            tag_ids: [],
          });
          this.lastTitleForSlug = '';
        }
        return;
      }

      this.form.patchValue(
        {
        title: initial.title,
        slug: initial.slug,
        short_description: initial.short_description,
        cover_image_url: initial.cover_image_url,
        content_html: initial.content_html ?? '',
        status: initial.status,
        published_at: initial.published_at ?? '',
        scheduled_at: initial.scheduled_at ?? '',
        tag_ids: initial.tags?.map((tag) => tag.id) ?? [],
        },
        { emitEvent: false },
      );
      this.lastTitleForSlug = initial.title.trim();
    });
  }

  toggleTag(tagId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const current = this.form.controls.tag_ids.value;

    if (checked) {
      this.form.controls.tag_ids.setValue([...new Set([...current, tagId])]);
      return;
    }

    this.form.controls.tag_ids.setValue(current.filter((id) => id !== tagId));
  }

  isTagSelected(tagId: number): boolean {
    return this.form.controls.tag_ids.value.includes(tagId);
  }

  statusIs(status: ContentStatus): boolean {
    return this.form.controls.status.value === status;
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.coverUploadError.set(null);
    this.uploadingCover.set(true);

    this.uploadService
      .uploadCover(file)
      .pipe(
        finalize(() => this.uploadingCover.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (publicUrl) => this.form.controls.cover_image_url.setValue(publicUrl),
        error: () => this.coverUploadError.set('Image upload failed. Please try again.'),
      });

    input.value = '';
  }

  removeCoverImage(): void {
    this.form.controls.cover_image_url.setValue('');
    this.coverUploadError.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const publishedAt =
      value.status === 'published' && value.published_at ? value.published_at : null;
    const scheduledAt =
      value.status === 'scheduled' && value.scheduled_at ? value.scheduled_at : null;

    this.saved.emit({
      content_type: this.type(),
      title: value.title,
      slug: value.slug,
      short_description: value.short_description,
      cover_image_url: value.cover_image_url,
      content_html: value.content_html ? value.content_html : null,
      status: value.status,
      published_at: publishedAt,
      scheduled_at: scheduledAt,
      tag_ids: value.tag_ids,
    });

    if (this.mode() === 'create') {
      this.form.reset({
        title: '',
        slug: '',
        short_description: '',
        cover_image_url: '',
        content_html: '',
        status: 'draft',
        published_at: '',
        scheduled_at: '',
        tag_ids: [],
      });
      this.lastTitleForSlug = '';
    }
  }

  private toSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private applyStatusValidation(status: ContentStatus): void {
    if (status === 'scheduled') {
      this.form.controls.scheduled_at.addValidators(Validators.required);
    } else {
      this.form.controls.scheduled_at.clearValidators();
    }

    this.form.controls.scheduled_at.updateValueAndValidity({ emitEvent: false });
  }
}
