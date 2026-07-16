import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AppUser } from '../../core/models';

@Component({
  selector: 'app-login',
  template: `
<div class="login">
  <!-- LEFT BRAND PANEL -->
  <div class="login-left">
    <div class="login-left-inner">
      <div class="logo-area">
        <div class="logo-icon">
          <svg width="52" height="52" viewBox="0 0 52 52">
            <polygon points="26,2 32,18 48,18 35,28 40,46 26,35 12,46 17,28 4,18 20,18" fill="#C9950E" stroke="#C9950E" stroke-width="1"/>
          </svg>
        </div>
        <h1>BAGMANE</h1>
        <p>Design &amp; Consultant Tracker</p>
      </div>
      <div class="brand-tag">
        <p>Streamlining consultant onboarding and design delivery across all Bagmane Group tech parks.</p>
      </div>
    </div>
  </div>

  <!-- RIGHT LOGIN PANEL -->
  <div class="login-right">
    <div class="login-right-inner">
      <h2>Welcome</h2>
      <p class="subtitle">Enter your credentials to access the portal</p>

      <div class="form-group">
        <label>Email or Username</label>
        <div class="input-wrap">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="7" r="3.5" stroke="#94a3b8" stroke-width="1.5"/><path d="M3 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>
          <input type="text" [(ngModel)]="username" placeholder="Enter your email or username">
        </div>
      </div>

      <div class="form-group">
        <label>Password</label>
        <div class="input-wrap">
          <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="7" width="12" height="9" rx="1.5" stroke="#94a3b8" stroke-width="1.5"/><path d="M6 7V5a3 3 0 016 0v2" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/></svg>
          <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" placeholder="Enter your password">
          <svg class="toggle-pwd" (click)="showPwd=!showPwd" width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="#94a3b8" stroke-width="1.5"/><circle cx="9" cy="9" r="2.5" stroke="#94a3b8" stroke-width="1.5"/></svg>
        </div>
      </div>

      <div class="options-row">
        <label class="remember"><input type="checkbox"> Remember me</label>
        <a class="forgot">Forgot Password?</a>
      </div>

      <button class="signin-btn" (click)="signIn()">Sign In</button>

      <div class="divider"><span>or select a role directly</span></div>

      <div class="role-grid">
        <div class="role-card" *ngFor="let u of users" (click)="loginAs(u)" [style.--c]="u.color">
          <span class="role-badge" [style.background]="u.color + '18'" [style.color]="u.color">{{ u.icon }}</span>
          <span class="role-name">{{ u.name }}</span>
          <span class="role-label">{{ u.roleLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .login { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; }

    /* ===== LEFT ===== */
    .login-left {
      flex: 0 0 42%; background: linear-gradient(170deg, #1a120b 0%, #2d1f13 30%, #3a2a1a 60%, #2d1f13 100%);
      display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
    }
    .login-left::before {
      content: ''; position: absolute; inset: 0; opacity: 0.03;
      background: radial-gradient(circle at 30% 40%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px);
      background-size: 80px 80px, 100px 100px;
    }
    .login-left-inner { position: relative; z-index: 1; padding: 60px 55px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; max-width: 460px; width: 100%; }
    .logo-area { margin-top: 30px; }
    .logo-icon { margin-bottom: 24px; }
    .logo-icon svg { filter: drop-shadow(0 0 20px rgba(201,149,14,0.3)); }
    .logo-area h1 { font-size: 2.4rem; font-weight: 800; color: #fff; margin: 0 0 8px; letter-spacing: 3px; }
    .logo-area p { font-size: 0.92rem; color: rgba(255,255,255,0.55); margin: 0; font-weight: 400; }
    .brand-tag { margin-top: auto; margin-bottom: 30px; }
    .brand-tag p { font-size: 0.85rem; color: rgba(255,255,255,0.35); line-height: 1.7; max-width: 350px; margin: 0; }

    /* ===== RIGHT ===== */
    .login-right {
      flex: 1; display: flex; align-items: center; justify-content: center;
      background: #f4f6f8; padding: 50px 40px; overflow-y: auto;
    }
    .login-right-inner { width: 100%; max-width: 440px; }
    .login-right h2 { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
    .subtitle { font-size: 0.88rem; color: #64748b; margin: 0 0 30px; }

    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #334155; margin-bottom: 6px; }
    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border: 1.5px solid #e2e8f0; border-radius: 8px;
      padding: 0 14px; transition: all 0.2s;
    }
    .input-wrap:focus-within { border-color: #C9950E; box-shadow: 0 0 0 3px rgba(201,149,14,0.08); }
    .input-wrap input {
      flex: 1; border: none; outline: none; padding: 12px 0;
      font-size: 0.9rem; font-family: 'Inter', sans-serif; color: #1a1a2e; background: transparent;
    }
    .input-wrap input::placeholder { color: #cbd5e1; }
    .input-icon { flex-shrink: 0; }
    .toggle-pwd { flex-shrink: 0; cursor: pointer; opacity: 0.5; transition: opacity 0.2s; }
    .toggle-pwd:hover { opacity: 1; }

    .options-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
    .remember { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: #64748b; cursor: pointer; }
    .remember input { width: 16px; height: 16px; accent-color: #C9950E; cursor: pointer; }
    .forgot { font-size: 0.8rem; color: #C9950E; cursor: pointer; text-decoration: none; font-weight: 500; }
    .forgot:hover { text-decoration: underline; }

    .signin-btn {
      width: 100%; padding: 13px; background: #C9950E; color: #fff; border: none;
      border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
      font-family: 'Inter', sans-serif; letter-spacing: 0.3px;
      transition: all 0.2s; box-shadow: 0 2px 8px rgba(201,149,14,0.25);
    }
    .signin-btn:hover { background: #b8870c; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(201,149,14,0.35); }

    .divider { display: flex; align-items: center; gap: 12px; margin: 28px 0 18px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    .divider span { font-size: 0.73rem; color: #94a3b8; white-space: nowrap; }

    .role-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
    .role-card {
      display: flex; align-items: center; gap: 9px; padding: 9px 12px;
      background: #fff; border: 1px solid #e8ecf2; border-radius: 8px; cursor: pointer;
      transition: all 0.15s;
    }
    .role-card:hover { border-color: var(--c); background: #f9fafb; }
    .role-badge {
      width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 0.65rem; font-weight: 700; flex-shrink: 0;
    }
    .role-name { font-size: 0.78rem; font-weight: 600; color: #1a1a2e; }
    .role-label { display: none; }

    @media (max-width: 900px) {
      .login { flex-direction: column; }
      .login-left { flex: 0 0 auto; min-height: 180px; }
      .login-left-inner { padding: 30px; }
      .logo-area h1 { font-size: 1.6rem; }
      .brand-tag { display: none; }
      .login-right { padding: 30px 20px; }
      .role-grid { grid-template-columns: repeat(2, 1fr); }
      .role-label { display: inline; font-size: 0.68rem; color: #94a3b8; margin-left: auto; }
    }

    @media (prefers-color-scheme: dark) {
      .login-right { background: #0f172a; }
      .login-right h2 { color: #f1f5f9; }
      .subtitle { color: #94a3b8; }
      .form-group label { color: #cbd5e1; }
      .input-wrap { background: #1e293b; border-color: #334155; }
      .input-wrap input { color: #f1f5f9; }
      .role-card { background: #1e293b; border-color: #334155; }
      .role-card:hover { background: #253349; }
      .role-name { color: #f1f5f9; }
      .divider::before, .divider::after { background: #334155; }
    }
  `]
})
export class LoginComponent {
  username = 'admin@bagmane.com';
  password = '';
  showPwd = false;

  users = [
    { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', roleLabel: 'Indent Raiser', icon: 'IR', color: '#2563eb' },
    { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', roleLabel: 'Design Head', icon: 'DH', color: '#16a34a' },
    { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', roleLabel: 'Coordinator', icon: 'CO', color: '#7c3aed' },
    { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', roleLabel: 'Contract Team Member', icon: 'CT', color: '#ea580c' },
    { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', roleLabel: 'Contract Head', icon: 'CH', color: '#dc2626' },
    { id: 'USR-006', name: 'Management', role: 'MGMT', roleLabel: 'Management', icon: 'MG', color: '#475569' },
    { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', roleLabel: 'Design Team Reviewer', icon: 'DT', color: '#0891b2' },
    { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', roleLabel: 'External Consultant', icon: 'EC', color: '#d97706' },
    { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', roleLabel: 'MEP Head', icon: 'ME', color: '#ca8a04' },
    { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', roleLabel: 'Project Head', icon: 'PH', color: '#6d28d9' },
    { id: 'USR-011', name: 'Meera Reddy', role: 'LH', roleLabel: 'Liaisoning Head', icon: 'LH', color: '#0d9488' },
    { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', roleLabel: 'Managing Director', icon: 'MD', color: '#1e40af' },
    { id: 'USR-013', name: 'Admin', role: 'ADMIN', roleLabel: 'System Administrator', icon: 'AD', color: '#6b7280' },
  ];

  private roleRouteMap: Record<string, string> = {
    'USR-001': '/raise-indent', 'USR-002': '/design-head-approval', 'USR-003': '/coordinator-assignment',
    'USR-004': '/contract-team-member', 'USR-005': '/contract-head-approval', 'USR-006': '/cob-tracker',
    'USR-007': '/deliverables-tracker', 'USR-008': '/consultant-upload',
    'USR-009': '/approval-portals', 'USR-010': '/approval-portals', 'USR-011': '/approval-portals',
    'USR-012': '/design-dashboard', 'USR-013': '/system-settings',
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

  signIn() {
    if (this.username && this.password) {
      this.dataService.setCurrentUser(this.userMap['USR-001']);
      this.router.navigate(['/raise-indent']);
    }
  }

  loginAs(user: any) {
    const appUser = this.userMap[user.id];
    if (appUser) { this.dataService.setCurrentUser(appUser); this.router.navigate([this.roleRouteMap[user.id] || '/portal-hub']); }
  }
}
