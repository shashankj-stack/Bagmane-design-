import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DataService } from './core/services/data.service';

@Component({
  selector: 'app-root',
  template: `
    <!-- LOGIN PAGE: no chrome -->
    <ng-container *ngIf="isLoginPage">
      <router-outlet></router-outlet>
      <app-toast></app-toast>
    </ng-container>

    <!-- AUTHENTICATED: full app chrome -->
    <ng-container *ngIf="!isLoginPage">
      <div class="app-shell">
        <!-- SIDEBAR -->
        <aside class="sidebar">
          <div class="sidebar-brand" (click)="router.navigate(['/portal-hub'])">
            <svg class="sidebar-logo" width="32" height="32" viewBox="0 0 32 32"><rect x="14" y="0" width="5" height="32" rx="1.5" fill="#f59e0b"/><rect x="0" y="14" width="32" height="5" rx="1.5" fill="#f59e0b"/></svg>
            <span class="sidebar-name">Bagmane<span class="sidebar-name-accent">D2</span></span>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-section-label">Onboarding</div>
            <a class="nav-item" [class.active]="isActive('/raise-indent')" (click)="navigate('/raise-indent')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1v16M1 9h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              <span>Raise Indent</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/design-head-approval')" (click)="navigate('/design-head-approval')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 10l3 3 6-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>DH Approval</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/coordinator-assignment')" (click)="navigate('/coordinator-assignment')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <span>Coordinator</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/contract-team-member')" (click)="navigate('/contract-team-member')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 7h6M6 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <span>CTM Portal</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/contract-head-approval')" (click)="navigate('/contract-head-approval')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 6l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>CH Approval</span>
            </a>

            <div class="nav-section-label">Design Tracker</div>
            <a class="nav-item" [class.active]="isActive('/design-dashboard')" (click)="navigate('/design-dashboard')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>Dashboard</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/deliverables-tracker')" (click)="navigate('/deliverables-tracker')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 3h14M2 7h10M2 11h12M2 15h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <span>Deliverables</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/approval-portals')" (click)="navigate('/approval-portals')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M5 9l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Approvals</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/consultant-stage-tracker')" (click)="navigate('/consultant-stage-tracker')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 8l2 2 4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Stage Tracker</span>
            </a>

            <div class="nav-section-label">Management</div>
            <a class="nav-item" [class.active]="isActive('/cob-tracker')" (click)="navigate('/cob-tracker')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="6" height="16" rx="1" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="5" width="6" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/></svg>
              <span>COB Tracker</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/consultant-upload')" (click)="navigate('/consultant-upload')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1v10M5 5l4-4 4 4M2 14v3h14v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>Consultant Portal</span>
            </a>
            <a class="nav-item" [class.active]="isActive('/system-settings')" (click)="navigate('/system-settings')">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M9 1v2.5m0 11V18M1 9h2.5m11 0H18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <span>Settings</span>
            </a>
          </nav>

          <div class="sidebar-footer">
            <div class="sidebar-user">
              <div class="sidebar-avatar">{{ getInitials() }}</div>
              <div class="sidebar-user-info">
                <span class="sidebar-user-name">{{ dataService.getCurrentUser().name }}</span>
                <span class="sidebar-user-role">{{ dataService.getCurrentUser().role }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- MAIN AREA -->
        <main class="main-area">
          <!-- TOP BAR -->
          <header class="topbar">
            <div class="topbar-left">
              <span class="topbar-breadcrumb">{{ getPageTitle() }}</span>
            </div>
            <div class="topbar-right">
              <select class="topbar-role-switch" [ngModel]="dataService.getCurrentUser().id" (ngModelChange)="switchUser($event)">
                <option value="USR-001">Rahul Sharma (IR)</option>
                <option value="USR-002">Vikram Mehta (DH)</option>
                <option value="USR-003">Anjali Nair (COORD)</option>
                <option value="USR-004">Suresh Rao (CTM)</option>
                <option value="USR-005">Deepak Shetty (CH)</option>
                <option value="USR-006">Management (MGMT)</option>
                <option value="USR-007">Kavita Rao (DTR)</option>
                <option value="USR-008">Vikram Patel (EXT)</option>
                <option value="USR-009">Rajesh Kumar (MEPH)</option>
                <option value="USR-010">Sunil Joshi (PH)</option>
                <option value="USR-011">Meera Reddy (LH)</option>
                <option value="USR-012">Arun Bagmane (MD)</option>
                <option value="USR-013">Admin (ADMIN)</option>
              </select>
            </div>
          </header>

          <!-- PAGE CONTENT -->
          <div class="main-content">
            <app-user-switcher style="display:none"></app-user-switcher>
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <app-toast></app-toast>
    </ng-container>
  `,
  styles: [`
    .app-shell { display: flex; height: 100vh; overflow: hidden; }

    /* ═════════ SIDEBAR ═════ */
    .sidebar {
      width: 248px; flex-shrink: 0;
      background: var(--color-surface);
      border-right: 1px solid var(--color-border);
      display: flex; flex-direction: column;
      height: 100vh; position: fixed; left: 0; top: 0; z-index: 200;
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 16px 20px; cursor: pointer;
      border-bottom: 1px solid var(--color-border);
    }
    .sidebar-logo { flex-shrink: 0; }
    .sidebar-name { font-size: 16px; font-weight: 700; color: var(--color-text); letter-spacing: -0.3px; }
    .sidebar-name-accent { color: var(--color-accent); }

    .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 10px; }
    .nav-section-label {
      font-size: 10px; font-weight: 600; color: var(--color-text-tertiary);
      text-transform: uppercase; letter-spacing: 0.08em;
      padding: 12px 12px 6px; margin-top: 4px;
    }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 12px; border-radius: var(--radius-md);
      font-size: 13px; font-weight: 500; color: var(--color-text-secondary);
      cursor: pointer; transition: all 120ms var(--ease-out);
      text-decoration: none; margin-bottom: 1px;
    }
    .nav-item:hover { background: var(--color-surface-hover); color: var(--color-text); }
    .nav-item.active { background: var(--color-bg-secondary); color: var(--color-text); font-weight: 600; }

    .sidebar-footer {
      border-top: 1px solid var(--color-border); padding: 12px 16px;
    }
    .sidebar-user { display: flex; align-items: center; gap: 10px; }
    .sidebar-avatar {
      width: 34px; height: 34px; border-radius: var(--radius-md);
      background: var(--color-brand); color: var(--color-text-inverse);
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .sidebar-user-info { display: flex; flex-direction: column; min-width: 0; }
    .sidebar-user-name { font-size: 13px; font-weight: 600; color: var(--color-text); line-height: 1.3; }
    .sidebar-user-role { font-size: 11px; color: var(--color-text-tertiary); }

    /* ═════════ MAIN ═════ */
    .main-area { flex: 1; margin-left: 248px; display: flex; flex-direction: column; min-height: 100vh; overflow-y: auto; background: var(--color-bg); }

    .topbar {
      height: 52px; flex-shrink: 0;
      background: var(--color-surface); border-bottom: 1px solid var(--color-border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; position: sticky; top: 0; z-index: 100;
    }
    .topbar-breadcrumb { font-size: 14px; font-weight: 600; color: var(--color-text); }
    .topbar-role-switch {
      height: 30px; padding: 0 10px; font-size: 12px;
      border: 1px solid var(--color-border); border-radius: var(--radius-md);
      background: var(--color-surface); color: var(--color-text-secondary);
      cursor: pointer; min-width: 190px;
    }

    .main-content { flex: 1; }

    /* ═════════ RESPONSIVE ═════ */
    @media (max-width: 900px) {
      .sidebar { display: none; }
      .main-area { margin-left: 0; }
    }
  `]
})
export class AppComponent {
  isLoginPage = true;

  constructor(public router: Router, public dataService: DataService) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.isLoginPage = e.url === '/' || e.url === '/login' || e.urlAfterRedirects === '/' || e.urlAfterRedirects === '/login';
    });
  }

  isActive(path: string): boolean { return this.router.url === path; }
  navigate(path: string) { this.router.navigate([path]); }

  getPageTitle(): string {
    const map: Record<string, string> = {
      '/raise-indent': 'Raise Indent', '/design-head-approval': 'Design Head Approval',
      '/coordinator-assignment': 'Coordinator Assignment', '/contract-team-member': 'CTM Portal',
      '/contract-head-approval': 'Contract Head Approval', '/cob-tracker': 'COB Tracker',
      '/design-dashboard': 'Design Dashboard', '/deliverables-tracker': 'Deliverables Tracker',
      '/consultant-upload': 'Consultant Upload', '/consultant-stage-tracker': 'Consultant Stage Tracker',
      '/approval-portals': 'Approval Portals', '/system-settings': 'System Settings',
      '/sap-integration': 'SAP Integration', '/portal-hub': 'Portal Hub', '/kickstart': 'Kickstart'
    };
    return map[this.router.url] || 'Dashboard';
  }

  getInitials(): string {
    const name = this.dataService.getCurrentUser().name || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  switchUser(userId: string) {
    const users: any = {
      'USR-001': { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', email: 'rahul.sharma@bagmane.com', portalAccess: [] },
      'USR-002': { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', email: 'vikram.mehta@bagmane.com', portalAccess: [] },
      'USR-003': { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', email: 'anjali.nair@bagmane.com', portalAccess: [] },
      'USR-004': { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', email: 'suresh.rao@bagmane.com', portalAccess: [] },
      'USR-005': { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', email: 'deepak.shetty@bagmane.com', portalAccess: [] },
      'USR-006': { id: 'USR-006', name: 'Management', role: 'MGMT', email: 'mgmt@bagmane.com', portalAccess: [] },
      'USR-007': { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', email: 'kavita.rao@bagmane.com', portalAccess: [] },
      'USR-008': { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', email: 'vikram@artech.com', portalAccess: [] },
      'USR-009': { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', email: 'rajesh.kumar@bagmane.com', portalAccess: [] },
      'USR-010': { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', email: 'sunil.joshi@bagmane.com', portalAccess: [] },
      'USR-011': { id: 'USR-011', name: 'Meera Reddy', role: 'LH', email: 'meera.reddy@bagmane.com', portalAccess: [] },
      'USR-012': { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', email: 'arun@bagmane.com', portalAccess: [] },
      'USR-013': { id: 'USR-013', name: 'Admin', role: 'ADMIN', email: 'admin@bagmane.com', portalAccess: [] },
    };
    const user = users[userId];
    if (user) {
      this.dataService.switchUser(user);
      const routeMap: Record<string, string> = {
        'USR-001': '/raise-indent', 'USR-002': '/design-head-approval', 'USR-003': '/coordinator-assignment',
        'USR-004': '/contract-team-member', 'USR-005': '/contract-head-approval', 'USR-006': '/cob-tracker',
        'USR-007': '/deliverables-tracker', 'USR-008': '/consultant-upload', 'USR-009': '/approval-portals',
        'USR-010': '/approval-portals', 'USR-011': '/approval-portals', 'USR-012': '/design-dashboard',
        'USR-013': '/system-settings',
      };
      this.router.navigate([routeMap[userId] || '/portal-hub']);
    }
  }
}
