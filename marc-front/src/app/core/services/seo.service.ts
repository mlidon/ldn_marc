import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(config: {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    type?: string;
  }): void {
    this.title.setTitle(config.title);

    this.meta.updateTag({
      name: 'description',
      content: config.description,
    });

    if (config.keywords) {
      this.meta.updateTag({
        name: 'keywords',
        content: config.keywords,
      });
    }

    this.meta.updateTag({
      property: 'og:title',
      content: config.title,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });

    this.meta.updateTag({
      property: 'og:type',
      content: config.type ?? 'website',
    });

    this.meta.updateTag({
      property: 'og:image',
      content: config.image ?? '/assets/preview.png',
    });
  }
}