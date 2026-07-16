import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <app-user-switcher *ngIf="!isLoginPage"></app-user-switcher>
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class AppComponent {
  title = 'Bagmane COB & Design Tracker';
  isLoginPage = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.isLoginPage = e.url === '/' || e.url === '/login' || e.urlAfterRedirects === '/' || e.urlAfterRedirects === '/login';
    });
  }
}
