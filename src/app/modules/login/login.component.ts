import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AppUser } from '../../core/models';

interface UserCard {
  id: string;
  name: string;
  role: string;
  roleLabel: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-login',
  template: `
<div class="login-wrapper">
  <!-- LEFT BRANDING PANEL -->
  <div class="login-brand">
    <div class="brand-overlay"></div>
    <div class="brand-content">
      <div class="brand-top">
        <div class="brand-diamond">&#9670;</div>
        <h1 class="brand-title">Bagmane Design</h1>
        <p class="brand-subtitle">Consultant Onboarding &amp; Design Tracker</p>
      </div>
      <div class="brand-bottom">
        <p class="brand-tagline">Streamlining consultant onboarding and design delivery across all Bagmane tech parks.</p>
        <div class="brand-stats">
          <div class="stat-item"><span class="stat-num">20+</span><span class="stat-lbl">Tech Parks</span></div>
          <div class="stat-item"><span class="stat-num">50+</span><span class="stat-lbl">Consultants</span></div>
          <div class="stat-item"><span class="stat-num">7</span><span class="stat-lbl">Design Stages</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- RIGHT LOGIN PANEL -->
  <div class="login-form">
    <div class="login-form-inner">
      <div class="login-header">
        <h2>Welcome Back</h2>
        <p>Select your role to access the portal</p>
      </div>

      <div class="user-grid">
        <div class="user-card" *ngFor="let user of users" (click)="loginAs(user)" [style.--card-color]="user.color">
          <div class="user-card-icon" [style.background]="user.color + '18'" [style.color]="user.color">
            {{ user.icon }}
          </div>
          <div class="user-card-info">
            <div class="user-card-name">{{ user.name }}</div>
            <div class="user-card-role">{{ user.roleLabel }}</div>
          </div>
          <div class="user-card-arrow">&#8594;</div>
        </div>
      </div>

      <div class="login-footer">
        <span>Bagmane Group &copy; 2026</span>
        <span>Enterprise Portal v1.0</span>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .login-wrapper {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    /* ===== LEFT BRAND PANEL ===== */
    .login-brand {
      flex: 0 0 42%;
      background: linear-gradient(135deg, #0a1628 0%, #132344 30%, #1a3a5c 60%, #1e4d6e 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .brand-overlay {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(232, 168, 23, 0.15) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(44, 82, 130, 0.3) 0%, transparent 50%);
    }

    .brand-overlay::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px);
    }

    .brand-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 50px;
      height: 100%;
      width: 100%;
      max-width: 480px;
    }

    .brand-diamond {
      font-size: 2.4rem;
      color: #e8a817;
      margin-bottom: 20px;
      text-shadow: 0 0 30px rgba(232, 168, 23, 0.4);
    }

    .brand-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-weight: 400;
      letter-spacing: 0.5px;
    }

    .brand-bottom {
      margin-top: auto;
    }

    .brand-tagline {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.55);
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .brand-stats {
      display: flex;
      gap: 32px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-num {
      font-size: 1.6rem;
      font-weight: 700;
      color: #e8a817;
    }

    .stat-lbl {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }

    /* ===== RIGHT LOGIN PANEL ===== */
    .login-form {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fb;
      padding: 40px;
      overflow-y: auto;
    }

    .login-form-inner {
      width: 100%;
      max-width: 620px;
    }

    .login-header {
      margin-bottom: 32px;
      text-align: center;
    }

    .login-header h2 {
      font-size: 1.6rem;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 6px;
    }

    .login-header p {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }

    .user-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 12px;
      max-height: 60vh;
      overflow-y: auto;
      padding: 2px;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      background: #ffffff;
      border: 1.5px solid #e8ecf2;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .user-card:hover {
      border-color: var(--card-color, #1a3a5c);
      background: #fafbfd;
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    }

    .user-card:active {
      transform: translateY(0);
    }

    .user-card-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .user-card-info {
      flex: 1;
      min-width: 0;
    }

    .user-card-name {
      font-size: 0.9rem;
      font-weight: 600;
      color: #1a1a2e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-card-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 1px;
    }

    .user-card-arrow {
      font-size: 1.1rem;
      color: #cbd5e1;
      transition: all 0.2s ease;
    }

    .user-card:hover .user-card-arrow {
      color: var(--card-color, #1a3a5c);
      transform: translateX(3px);
    }

    .login-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
      font-size: 0.75rem;
      color: #94a3b8;
      text-align: center;
    }

    @media (max-width: 900px) {
      .login-wrapper { flex-direction: column; }
      .login-brand { flex: 0 0 auto; min-height: 220px; padding: 30px; }
      .brand-content { padding: 20px 30px; }
      .brand-title { font-size: 1.8rem; }
      .brand-stats { display: none; }
      .login-form { padding: 24px 16px; }
      .user-grid { grid-template-columns: 1fr; max-height: none; }
    }

    @media (prefers-color-scheme: dark) {
      .login-form { background: #0f172a; }
      .login-header h2 { color: #f1f5f9; }
      .login-header p { color: #94a3b8; }
      .user-card { background: #1e293b; border-color: #334155; }
      .user-card:hover { background: #253349; }
      .user-card-name { color: #f1f5f9; }
      .user-card-role { color: #64748b; }
      .login-footer { color: #64748b; }
    }
  `]
})
export class LoginComponent {
  users: UserCard[] = [
    { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', roleLabel: 'Indent Raiser', icon: '📋', color: '#1565c0' },
    { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', roleLabel: 'Design Head', icon: '✅', color: '#2e7d32' },
    { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', roleLabel: 'Coordinator', icon: '📌', color: '#6a1b9a' },
    { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', roleLabel: 'Contract Team Member', icon: '📝', color: '#e65100' },
    { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', roleLabel: 'Contract Head', icon: '🏁', color: '#c62828' },
    { id: 'USR-006', name: 'Management', role: 'MGMT', roleLabel: 'Management / Admin', icon: '📊', color: '#37474f' },
    { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', roleLabel: 'Design Team Reviewer', icon: '🔍', color: '#00838f' },
    { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', roleLabel: 'External Consultant', icon: '📤', color: '#d84315' },
    { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', roleLabel: 'MEP Head', icon: '⚡', color: '#f9a825' },
    { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', roleLabel: 'Project Head', icon: '🏗️', color: '#4527a0' },
    { id: 'USR-011', name: 'Meera Reddy', role: 'LH', roleLabel: 'Liaisoning Head', icon: '📜', color: '#00695c' },
    { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', roleLabel: 'Managing Director', icon: '👔', color: '#0d47a1' },
    { id: 'USR-013', name: 'Admin', role: 'ADMIN', roleLabel: 'System Administrator', icon: '⚙️', color: '#546e7a' },
  ];

  private roleRouteMap: Record<string, string> = {
    'USR-001': '/raise-indent', 'USR-002': '/design-head-approval',
    'USR-003': '/coordinator-assignment', 'USR-004': '/contract-team-member',
    'USR-005': '/contract-head-approval', 'USR-006': '/cob-tracker',
    'USR-007': '/deliverables-tracker', 'USR-008': '/consultant-upload',
    'USR-009': '/approval-portals', 'USR-010': '/approval-portals',
    'USR-011': '/approval-portals', 'USR-012': '/design-dashboard',
    'USR-013': '/system-settings',
  };

  private userMap: Record<string, AppUser> = {
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

  constructor(private router: Router, private dataService: DataService) {}

  loginAs(user: UserCard) {
    const appUser = this.userMap[user.id];
    if (appUser) {
      this.dataService.setCurrentUser(appUser);
      const route = this.roleRouteMap[user.id] || '/portal-hub';
      this.router.navigate([route]);
    }
  }
}
