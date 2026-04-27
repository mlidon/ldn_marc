import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkModeState = signal(localStorage.getItem('theme') === 'dark');

  readonly darkMode = this.darkModeState.asReadonly();

  init(): void {
    this.apply(this.darkModeState());
  }

  toggle(): void {
    const nextValue = !this.darkModeState();
    this.darkModeState.set(nextValue);
    this.apply(nextValue);
  }

  private apply(darkMode: boolean): void {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('theme-dark');
      localStorage.setItem('theme', 'dark');
      return;
    }

    root.classList.remove('theme-dark');
    localStorage.setItem('theme', 'light');
  }
}
