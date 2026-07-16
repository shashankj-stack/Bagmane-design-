import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AppUser } from '../../core/models';

interface UserCard {
  id: string; name: string; role: string; roleLabel: string; icon: string; color: string;
}

@Component({
  selector: 'app-login',
  template: `
<div class="login-page">
  <div class="left-panel">
    <div class="left-bg"></div>
    <div class="left-dots"></div>
    <div class="left-content">
      <div class="left-top">
        <div class="logo-svg">
          <svg width="50" height="50" viewBox="0 0 50 50"><rect x="23" y="3" width="8" height="44" rx="2" fill="#C9950E"/><rect x="3" y="23" width="44" height="8" rx="2" fill="#C9950E"/><rect x="11" y="11" width="11" height="11" rx="2" fill="#E8A817" transform="rotate(45 16.5 16.5)"/><rect x="28" y="28" width="11" height="11" rx="2" fill="#E8A817" transform="rotate(45 33.5 33.5)"/></svg>
        </div>
        <h1 class="brand-name">BAGMANE</h1>
        <p class="brand-sub">Design &amp; Consultant Tracker</p>
      </div>
      <div class="left-bottom">
        <p class="brand-desc">Streamlining consultant onboarding and design delivery across all Bagmane Group tech parks.</p>
        <div class="brand-metrics">
          <div class="metric"><span class="metric-num">20+</span><span class="metric-lbl">Tech Parks</span></div>
          <div class="metric"><span class="metric-num">50+</span><span class="metric-lbl">Consultants</span></div>
          <div class="metric"><span class="metric-num">7</span><span class="metric-lbl">Design Stages</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="right-panel">
    <div class="right-inner">
      <div class="right-header">
        <h2>Welcome Back</h2>
        <p>Select your role to access the portal</p>
      </div>
      <div class="user-grid">
        <div class="user-card" *ngFor="let u of users" (click)="loginAs(u)" [style.--c]="u.color">
          <div class="user-icon" [style.background]="u.color + '15'" [style.color]="u.color">{{ u.icon }}</div>
          <div class="user-info">
            <div class="user-name">{{ u.name }}</div>
            <div class="user-role">{{ u.roleLabel }}</div>
          </div>
          <svg class="user-arrow" width="20" height="20" viewBox="0 0 20 20"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        </div>
      </div>
      <div class="right-footer">
        <span>Bagmane Group &copy; 2026 &mdash; Enterprise Portal v1.0</span>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .login-page { display: flex; min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .left-panel {
      flex: 0 0 42%; background: linear-gradient(160deg, #060e1a 0%, #0d1b33 35%, #132544 60%, #1a3a5c 100%);
      position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .left-bg {
      position: absolute; inset: 0;
      background: radial-gradient(ellipse 80% 60% at 25% 45%, rgba(201,149,14,0.12) 0%, transparent 55%),
                  radial-gradient(ellipse 60% 50% at 75% 25%, rgba(26,58,92,0.4) 0%, transparent 50%),
                  radial-gradient(ellipse 40% 30% at 60% 80%, rgba(44,82,130,0.15) 0%, transparent 60%);
    }
    .left-dots {
      position: absolute; inset: 0; opacity: 0.05;
      background-image: radial-gradient(circle at 15% 30%, #fff 1px, transparent 1px),
                        radial-gradient(circle at 42% 62%, #fff 0.8px, transparent 0.8px),
                        radial-gradient(circle at 72% 18%, #fff 1.2px, transparent 1.2px),
                        radial-gradient(circle at 88% 52%, #fff 0.6px, transparent 0.6px),
                        radial-gradient(circle at 28% 78%, #fff 0.9px, transparent 0.9px),
                        radial-gradient(circle at 58% 88%, #fff 1px, transparent 1px),
                        radial-gradient(circle at 92% 82%, #fff 0.7px, transparent 0.7px);
      background-size: 120px 120px, 180px 180px, 150px 150px, 200px 200px, 160px 160px, 140px 140px, 170px 170px;
    }
    .left-content {
      position: relative; z-index: 2; display: flex; flex-direction: column; justify-content: space-between;
      padding: 70px 55px; height: 100%; width: 100%; max-width: 500px;
    }
    .logo-svg { margin-bottom: 28px; }
    .logo-svg svg { filter: drop-shadow(0 0 24px rgba(201,149,14,0.35)); }
    .brand-name { font-size: 2.6rem; font-weight: 800; color: #fff; margin: 0 0 10px; letter-spacing: 2.5px; line-height: 1.15; }
    .brand-sub { font-size: 1rem; color: rgba(255,255,255,0.65); margin: 0; font-weight: 400; letter-spacing: 0.4px; }
    .left-bottom { margin-top: auto; }
    .brand-desc { font-size: 0.88rem; color: rgba(255,255,255,0.45); line-height: 1.65; margin-bottom: 36px; max-width: 380px; }
    .brand-metrics { display: flex; gap: 40px; }
    .metric { display: flex; flex-direction: column; }
    .metric-num { font-size: 1.6rem; font-weight: 700; color: #C9950E; letter-spacing: 0.5px; }
    .metric-lbl { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 3px; }

    .right-panel { flex: 1; display: flex; align-items: center; justify-content: center; background: #f8f9fb; padding: 50px; overflow-y: auto; }
    .right-inner { width: 100%; max-width: 640px; }
    .right-header { margin-bottom: 34px; }
    .right-header h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 5px; letter-spacing: -0.3px; }
    .right-header p { font-size: 0.88rem; color: #64748b; margin: 0; }

    .user-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; max-height: 58vh; overflow-y: auto; padding-right: 4px; }
    .user-grid::-webkit-scrollbar { width: 5px; }
    .user-grid::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

    .user-card {
      display: flex; align-items: center; gap: 14px; padding: 13px 16px;
      background: #fff; border: 1px solid #e8ecf2; border-radius: 12px;
      cursor: pointer; transition: all 0.18s ease;
    }
    .user-card:hover { border-color: var(--c, #1a3a5c); background: #f9fafb; box-shadow: 0 3px 12px rgba(0,0,0,0.05); }
    .user-icon {
      width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; letter-spacing: 0.5px;
    }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 0.88rem; font-weight: 600; color: #0f172a; line-height: 1.3; }
    .user-role { font-size: 0.75rem; color: #94a3b8; margin-top: 1px; }
    .user-arrow { color: #cbd5e1; flex-shrink: 0; transition: all 0.18s ease; }
    .user-card:hover .user-arrow { color: var(--c, #1a3a5c); transform: translateX(2px); }

    .right-footer { margin-top: 32px; text-align: center; font-size: 0.73rem; color: #94a3b8; }

    @media (prefers-color-scheme: dark) {
      .right-panel { background: #0f172a; } .right-header h2 { color: #f1f5f9; }
      .right-header p { color: #94a3b8; } .user-card { background: #1e293b; border-color: #334155; }
      .user-card:hover { background: #253349; } .user-name { color: #f1f5f9; }
      .user-role { color: #64748b; } .right-footer { color: #64748b; }
    }
    @media (max-width: 900px) {
      .login-page { flex-direction: column; } .left-panel { flex: 0 0 auto; min-height: 200px; }
      .left-content { padding: 30px; } .brand-name { font-size: 1.8rem; }
      .brand-metrics { display: none; } .right-panel { padding: 24px 18px; }
      .user-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LoginComponent {
  users: UserCard[] = [
    { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', roleLabel: 'Indent Raiser', icon: 'IR', color: '#2563eb' },
    { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', roleLabel: 'Design Head', icon: 'DH', color: '#16a34a' },
    { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', roleLabel: 'Coordinator', icon: 'CO', color: '#7c3aed' },
    { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', roleLabel: 'Contract Team Member', icon: 'CT', color: '#ea580c' },
    { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', roleLabel: 'Contract Head', icon: 'CH', color: '#dc2626' },
    { id: 'USR-006', name: 'Management', role: 'MGMT', roleLabel: 'Management / Admin', icon: 'MG', color: '#475569' },
    { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', roleLabel: 'Design Team Reviewer', icon: 'DT', color: '#0891b2' },
    { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', roleLabel: 'External Consultant', icon: 'EC', color: '#d97706' },
    { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', roleLabel: 'MEP Head', icon: 'ME', color: '#ca8a04' },
    { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', roleLabel: 'Project Head', icon: 'PH', color: '#6d28d9' },
    { id: 'USR-011', name: 'Meera Reddy', role: 'LH', roleLabel: 'Liaisoning Head', icon: 'LH', color: '#0d9488' },
    { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', roleLabel: 'Managing Director', icon: 'MD', color: '#1e40af' },
    { id: 'USR-013', name: 'Admin', role: 'ADMIN', roleLabel: 'System Administrator', icon: 'AD', color: '#6b7280' },
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
    if (appUser) { this.dataService.setCurrentUser(appUser); this.router.navigate([this.roleRouteMap[user.id] || '/portal-hub']); }
  }
}
