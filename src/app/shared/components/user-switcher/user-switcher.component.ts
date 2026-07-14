import { Component } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { AppUser } from '../../../core/models';

@Component({
  selector: 'app-user-switcher',
  template: `
    <div class="user-bar">
      <div class="user-bar-left">
        <span class="brand">◆ Bagmane D2</span>
        <span style="color:var(--border);margin:0 8px">|</span>
        <span style="font-size:0.8rem;color:var(--text-secondary)">Consultant Onboarding & Design Tracker</span>
      </div>
      <div class="user-bar-right">
        <select class="form-select" style="width:auto;min-width:220px;padding:6px 12px;font-size:0.8rem" [ngModel]="dataService.getCurrentUser().id" (ngModelChange)="switchUser($event)">
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
    .user-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px; background: var(--bg-card); border-bottom: 1px solid var(--border); font-size: 0.85rem; }
    .user-bar-left { display: flex; align-items: center; gap: 8px; }
    .brand { font-weight: 700; color: var(--primary); font-size: 1rem; letter-spacing: 0.5px; }
    .user-bar-right select { padding: 6px 12px !important; font-size: 0.8rem !important; }
  `]
})
export class UserSwitcherComponent {
  constructor(public dataService: DataService) {}

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
    if (user) this.dataService.switchUser(user);
  }
}
