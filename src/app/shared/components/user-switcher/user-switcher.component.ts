import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { AppUser } from '../../../core/models';

@Component({
  selector: 'app-user-switcher',
  template: `
    <div class="user-bar">
      <div class="user-bar-left">
        <span class="brand-mark">Bagmane D2</span>
        <span class="brand-sep"></span>
        <span class="brand-subtitle">Consultant Onboarding & Design Tracker</span>
      </div>
      <div class="user-bar-right">
        <select [ngModel]="dataService.getCurrentUser().id" (ngModelChange)="switchUser($event)" style="min-width:220px">
          <option value="USR-001">Rahul Sharma (Indent Raiser)</option>
          <option value="USR-002">Vikram Mehta (Design Head)</option>
          <option value="USR-003">Anjali Nair (Coordinator)</option>
          <option value="USR-004">Suresh Rao (Contract Team Member)</option>
          <option value="USR-005">Deepak Shetty (Contract Head)</option>
          <option value="USR-006">Management / Admin</option>
          <option value="USR-007">Kavita Rao (Design Team Reviewer)</option>
          <option value="USR-008">Vikram Patel (External Consultant)</option>
          <option value="USR-009">Rajesh Kumar (MEP Head)</option>
          <option value="USR-010">Sunil Joshi (Project Head)</option>
          <option value="USR-011">Meera Reddy (Liaisoning Head)</option>
          <option value="USR-012">Arun Bagmane (Managing Director)</option>
          <option value="USR-013">Admin (System Administrator)</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .user-bar-right select {
      height: 30px; padding: 0 8px; font-size: 12px;
      border: 1px solid var(--color-border); border-radius: 6px;
      background: var(--color-surface); color: var(--color-text-secondary);
    }
  `]
})
export class UserSwitcherComponent {
  constructor(public dataService: DataService, private router: Router) {}

  private roleRouteMap: Record<string, string> = {
    'USR-001': '/raise-indent',        // Indent Raiser -> Portal 1
    'USR-002': '/design-head-approval', // Design Head -> Portal 2
    'USR-003': '/coordinator-assignment', // Coordinator -> Portal 3
    'USR-004': '/contract-team-member',   // CTM -> Portal 4
    'USR-005': '/contract-head-approval', // CH -> Portal 5
    'USR-006': '/cob-tracker',            // Management -> COB Tracker
    'USR-007': '/deliverables-tracker',   // Design Team Reviewer
    'USR-008': '/consultant-upload',      // External Consultant
    'USR-009': '/approval-portals',       // MEP Head
    'USR-010': '/approval-portals',       // Project Head
    'USR-011': '/approval-portals',       // Liaisoning Head
    'USR-012': '/design-dashboard',       // Managing Director
    'USR-013': '/system-settings',        // System Admin
  };

  switchUser(userId: string) {
    const users: Record<string, AppUser> = {
      'USR-001': { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', email: 'rahul.sharma@bagmane.com', portalAccess: ['portal-1','portal-6','portal-7','portal-hub'] },
      'USR-002': { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', email: 'vikram.mehta@bagmane.com', portalAccess: ['portal-2','portal-6','portal-hub','approval-portals'] },
      'USR-003': { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', email: 'anjali.nair@bagmane.com', portalAccess: ['portal-3','portal-6','portal-hub'] },
      'USR-004': { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', email: 'suresh.rao@bagmane.com', portalAccess: ['portal-4','portal-6','portal-hub'] },
      'USR-005': { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', email: 'deepak.shetty@bagmane.com', portalAccess: ['portal-5','portal-6','portal-hub'] },
      'USR-006': { id: 'USR-006', name: 'Management', role: 'MGMT', email: 'mgmt@bagmane.com', portalAccess: ['portal-6','portal-hub','design-dashboard','consultant-stage-tracker'] },
      'USR-007': { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', email: 'kavita.rao@bagmane.com', portalAccess: ['portal-hub','deliverables-tracker','design-dashboard'] },
      'USR-008': { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', email: 'vikram@artech.com', portalAccess: ['portal-hub','consultant-upload'] },
      'USR-009': { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', email: 'rajesh.kumar@bagmane.com', portalAccess: ['portal-hub','approval-portals'] },
      'USR-010': { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', email: 'sunil.joshi@bagmane.com', portalAccess: ['portal-hub','approval-portals'] },
      'USR-011': { id: 'USR-011', name: 'Meera Reddy', role: 'LH', email: 'meera.reddy@bagmane.com', portalAccess: ['portal-hub','approval-portals'] },
      'USR-012': { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', email: 'arun@bagmane.com', portalAccess: ['portal-hub','approval-portals','design-dashboard','cob-tracker'] },
      'USR-013': { id: 'USR-013', name: 'Admin', role: 'ADMIN', email: 'admin@bagmane.com', portalAccess: ['portal-hub','system-settings'] },
    };
    const user = users[userId];
    if (user) {
      this.dataService.switchUser(user);
      // Auto-navigate to the correct portal for this role
      const route = this.roleRouteMap[userId];
      if (route) {
        this.router.navigate([route]);
      }
    }
  }
}
