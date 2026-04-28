import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { NeuralHeroComponent } from '../../components/neural-hero/neural-hero.component';

@Component({
  selector: 'app-home',
  imports: [NeuralHeroComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);


  ngOnInit(): void {
    this.title.setTitle('Marc Lidón | Software Developer');

    this.meta.updateTag({
      name: 'description',
      content:
        'Portfolio de Marc Lidón, desarrollador de software especializado en Angular, Node.js, .NET, Unity e integración de IA aplicada.',
    });

    this.meta.updateTag({
      name: 'keywords',
      content:
        'Marc Lidón, desarrollador software, Angular, Node.js, .NET, Unity, IA aplicada, frontend, backend',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: 'Marc Lidón | Software Developer',
    });

    this.meta.updateTag({
      property: 'og:description',
      content:
        'Construyo productos digitales combinando frontend, backend, datos e IA aplicada.',
    });
  }
}
