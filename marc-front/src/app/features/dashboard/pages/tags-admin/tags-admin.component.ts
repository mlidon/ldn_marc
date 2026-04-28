import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Tag } from '../../../../core/models/content.model';
import { TagService } from '../../../../core/services/tag.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-tags-admin',
  imports: [ReactiveFormsModule, ConfirmDialogComponent],
  templateUrl: './tags-admin.component.html',
  styleUrl: './tags-admin.component.scss',
})
export class TagsAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tagService = inject(TagService);

  readonly tags = signal<Tag[]>([]);
  readonly selectedTag = signal<Tag | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly showConfirmDelete = signal(false);
  readonly selectedTagId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  constructor() {
    this.loadTags();
  }

  select(tag: Tag): void {
    this.selectedTag.set(tag);
    this.form.patchValue({ name: tag.name });
  }

  cancel(): void {
    this.selectedTag.set(null);
    this.form.reset({ name: '' });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const selected = this.selectedTag();
    const name = this.form.getRawValue().name;
    this.saving.set(true);
    this.error.set(null);

    const request = selected
      ? this.tagService.update(selected.id, name)
      : this.tagService.create(name);

    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.cancel();
          this.loadTags();
        },
        error: () => this.error.set('Unable to save tag.'),
      });
  }

  onDeleteClick(id: number): void {
    this.selectedTagId.set(id);
    this.showConfirmDelete.set(true);
  }

  onConfirmDelete(): void {
    const tagId = this.selectedTagId();
    if (tagId === null) {
      return;
    }

    this.closeDeleteDialog();
    this.remove(tagId);
  }

  onCancelDelete(): void {
    this.closeDeleteDialog();
  }

  private remove(id: number): void {
    this.error.set(null);
    this.tagService
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.loadTags(),
        error: () => this.error.set('Unable to delete tag.'),
      });
  }

  private loadTags(): void {
    this.loading.set(true);
    this.error.set(null);
    this.tagService
      .list()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (tags) => this.tags.set(tags),
        error: () => this.error.set('Unable to load tags.'),
      });
  }

  private closeDeleteDialog(): void {
    this.selectedTagId.set(null);
    this.showConfirmDelete.set(false);
  }
}
