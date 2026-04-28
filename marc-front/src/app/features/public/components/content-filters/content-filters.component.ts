import { Component, input, output } from '@angular/core';
import { Tag } from '../../../../core/models/content.model';

@Component({
  selector: 'app-content-filters',
  templateUrl: './content-filters.component.html',
  styleUrl: './content-filters.component.scss',
})
export class ContentFiltersComponent {
  readonly searchPlaceholder = input('Buscar...');
  readonly availableTags = input<Tag[]>([]);
  readonly sortValue = input<'newest' | 'oldest'>('newest');
  readonly selectedTag = input<string | null>('all');
  readonly searchTerm = input('');

  readonly searchTermChange = output<string>();
  readonly selectedTagChange = output<string>();
  readonly sortValueChange = output<'newest' | 'oldest'>();
  readonly clearFilters = output<void>();

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTermChange.emit(value);
  }

  onTagChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedTagChange.emit(value);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'newest' | 'oldest';
    this.sortValueChange.emit(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
