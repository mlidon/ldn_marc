import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive} from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly theme = inject(ThemeService);
  readonly darkMode = this.theme.darkMode;
  menuOpen:boolean = false;

  constructor() {
    this.theme.init();
  }

  // Theme
  toggleTheme(): void {
    this.theme.toggle();
  }

  
  // Menu phone
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
