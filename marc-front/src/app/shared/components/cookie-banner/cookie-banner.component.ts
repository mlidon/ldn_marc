import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-banner',
  imports: [RouterLink],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss',
})
export class CookieBannerComponent implements OnInit {
  visible = false;

  ngOnInit() {
    const consent = localStorage.getItem('cookie_consent');
    this.visible = !consent;
  }

  accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    this.visible = false;
  }

  reject() {
    localStorage.setItem('cookie_consent', 'rejected');
    this.visible = false;
  }
}
