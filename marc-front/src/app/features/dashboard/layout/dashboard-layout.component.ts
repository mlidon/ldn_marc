import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly theme = inject(ThemeService);
  private readonly collapsedKey = 'dashboard_sidebar_collapsed';

  readonly isMobileView = signal(false);
  readonly isSidebarCollapsed = signal(localStorage.getItem(this.collapsedKey) === 'true');
  readonly isMobileMenuOpen = signal(false);
  readonly darkMode = this.theme.darkMode;

  constructor() {
    this.syncViewportState();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncViewportState();
  }

  toggleSidebar(): void {
    if (this.isMobileView()) {
      this.isMobileMenuOpen.update((value) => !value);
      return;
    }

    const nextValue = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(nextValue);
    localStorage.setItem(this.collapsedKey, String(nextValue));
  }

  closeMobileMenu(): void {
    if (this.isMobileView()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  sidebarExpanded(): boolean {
    return this.isMobileView() ? this.isMobileMenuOpen() : !this.isSidebarCollapsed();
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.closeMobileMenu();
    this.auth.logout();
  }

  private syncViewportState(): void {
    const isMobile = window.matchMedia('(max-width: 980px)').matches;
    this.isMobileView.set(isMobile);

    if (!isMobile) {
      this.isMobileMenuOpen.set(false);
    }
  }
}
