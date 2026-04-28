import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NeuralHeroComponent } from '../../components/neural-hero/neural-hero.component';

@Component({
  selector: 'app-home',
  imports: [NeuralHeroComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
