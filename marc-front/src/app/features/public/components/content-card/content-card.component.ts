import { DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Content } from '../../../../core/models/content.model';

@Component({
  selector: 'app-content-card',
  imports: [RouterLink, DatePipe],
  templateUrl: './content-card.component.html',
  styleUrl: './content-card.component.scss',
})
export class ContentCardComponent {
  readonly content = input.required<Content>();
  readonly detailBasePath = input.required<string>();

  readonly detailUrl = computed(() => `${this.detailBasePath()}/${this.content().slug}`);

  readonly ctaLabel = computed(() =>
    this.content().content_type === 'project' ? 'Ver proyecto' : 'Leer más',
  );

  readonly bestDate = computed(
    () =>
      this.content().published_at ??
      this.content().scheduled_at ??
      this.content().updated_at ??
      this.content().created_at,
  );
}
