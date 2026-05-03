import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeuralHeroComponent } from '../../components/neural-hero/neural-hero.component';
import { SeoService } from '../../../../core/services/seo.service';


@Component({
  selector: 'app-home',
  imports: [NeuralHeroComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
     this.seo.update({
      title: 'Marc Lidón | Software Developer & AI',
      description:
        'Portfolio de Marc Lidón, desarrollador de software especializado en Angular, Node.js, .NET, Python, Unity e integración de IA aplicada.',
      keywords:
        'Marc Lidón, desarrollador software, Angular, Node.js, .NET, Python, Unity, IA aplicada, frontend, backend',
    });
  }
}
