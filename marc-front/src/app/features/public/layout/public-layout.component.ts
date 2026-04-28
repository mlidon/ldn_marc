import { Component } from '@angular/core';
import {  RouterOutlet } from '@angular/router';
import { Header } from '../../../shared/components/header/header';
import { Footer } from "../../../shared/components/footer/footer";
import { CookieBannerComponent } from '../../../shared/components/cookie-banner/cookie-banner.component';



@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Header, Footer, CookieBannerComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {

}
