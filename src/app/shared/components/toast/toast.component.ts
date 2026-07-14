import { Component } from '@angular/core';
import { DataService } from '../../../core/services/data.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container">
      <div *ngFor="let n of dataService.notifications$ | async" class="toast toast-{{ n.type }}" (click)="dataService.dismissNotification(n.id)">
        <strong>{{ n.type === 'success' ? '✓' : n.type === 'error' ? '✗' : n.type === 'warning' ? '⚠' : 'ℹ' }}</strong>
        <span>{{ n.message }}</span>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public dataService: DataService) {}
}
