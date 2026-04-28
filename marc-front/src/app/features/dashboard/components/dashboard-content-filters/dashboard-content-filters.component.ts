import { Component, input, output } from '@angular/core';
import { ContentStatus, Tag } from '../../../../core/models/content.model';

@Component({
  selector: 'app-dashboard-content-filters',
  templateUrl: './dashboard-content-filters.component.html',
  styleUrl: './dashboard-content-filters.component.scss',
})
export class DashboardContentFiltersComponent {
  readonly searchPlaceholder = input('Buscar...');
  readonly availableTags = input<Tag[]>([]);
  readonly searchTerm = input('');
  readonly selectedTag = input<string>('all');
  readonly selectedStatus = input<'all' | ContentStatus>('all');
  readonly sortValue = input<'newest' | 'oldest'>('newest');

  readonly searchTermChange = output<string>();
  readonly selectedTagChange = output<string>();
  readonly selectedStatusChange = output<'all' | ContentStatus>();
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

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | ContentStatus;
    this.selectedStatusChange.emit(value);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'newest' | 'oldest';
    this.sortValueChange.emit(value);
  }

  onClear(): void {
    this.clearFilters.emit();
  }
}
