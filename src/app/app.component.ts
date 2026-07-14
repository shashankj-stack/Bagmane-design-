import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<app-user-switcher></app-user-switcher><router-outlet></router-outlet><app-toast></app-toast>`,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class AppComponent { title = 'Bagmane COB & Design Tracker'; }
