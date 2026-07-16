import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { AppUser } from '../../core/models';

@Component({
  selector: 'app-login',
  template: `
<div class="login-page">
  <!-- TOP HEADER BAR -->
  <div class="topbar">
    <svg class="topbar-logo" width="140" height="42" viewBox="0 0 140 42">
      <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f0c040"/><stop offset="100%" stop-color="#d4941a"/></linearGradient></defs>
      <polygon points="8,4 30,4 36,25 19,40 2,25" fill="url(#tg)" opacity="1"/>
      <polygon points="14,10 24,10 27,22 19,32 11,22" fill="#1a2240" opacity="0.9"/>
      <text x="44" y="22" font-family="'Inter',sans-serif" font-weight="800" font-size="16" fill="#f0c040" letter-spacing="3">BAGMANE</text>
      <text x="44" y="36" font-family="'Inter',sans-serif" font-weight="400" font-size="8" fill="#c4943c" letter-spacing="2">DESIGN PORTAL</text>
    </svg>
  </div>

  <!-- MAIN CONTENT -->
  <div class="main-area">
    <!-- LEFT BRANDING -->
    <div class="brand-side">
      <div class="brand-inner">
        <div class="brand-logo-mark">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke="#fff" stroke-width="0.5" opacity="0.15"/>
            <polygon points="32,4 38,18 52,18 40,28 46,44 32,34 18,44 24,28 12,18 26,18" fill="#f0c040" opacity="0.95"/>
          </svg>
        </div>
        <h1 class="brand-title">Bagmane</h1>
        <p class="brand-sub">Design &#183; Build &#183; Deliver</p>
        <p class="brand-desc">Streamlining consultant onboarding and design delivery across all Bagmane Group tech parks. A unified platform for managing the complete design lifecycle.</p>
        <div class="brand-stats">
          <div class="bs"><span class="bs-num">20+</span><span>Tech Parks</span></div>
          <div class="bs"><span class="bs-num">50+</span><span>Consultants</span></div>
          <div class="bs"><span class="bs-num">7</span><span>Stages</span></div>
        </div>
      </div>
    </div>

    <!-- RIGHT LOGIN CARD -->
    <div class="login-side">
      <div class="login-card">
        <h2>Welcome</h2>
        <p class="login-sub">Enter your credentials to access the portal</p>

        <div class="field">
          <label>Email or Username</label>
          <div class="input-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="3" stroke="#94a3b8" stroke-width="1.3"/><path d="M3 13.5c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="#94a3b8" stroke-width="1.3" stroke-linecap="round"/></svg>
            <input [(ngModel)]="username" placeholder="Enter your email or username">
          </div>
        </div>

        <div class="field">
          <label>Password</label>
          <div class="input-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="6" width="11" height="8.5" rx="1.5" stroke="#94a3b8" stroke-width="1.3"/><path d="M5 6V4a3 3 0 016 0v2" stroke="#94a3b8" stroke-width="1.3" stroke-linecap="round"/></svg>
            <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" placeholder="Enter your password">
            <svg class="eye" (click)="showPwd=!showPwd" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="#94a3b8" stroke-width="1.3"/><circle cx="8" cy="8" r="2" stroke="#94a3b8" stroke-width="1.3"/></svg>
          </div>
        </div>

        <div class="row">
          <label class="remember"><input type="checkbox"> Remember me</label>
          <a class="forgot">Forgot Password?</a>
        </div>

        <button class="signin" (click)="signIn()">Sign In</button>

        <div class="or"><span>or select a role directly</span></div>

        <div class="role-list">
          <div class="role-item" *ngFor="let u of users" (click)="loginAs(u)" [style.--accent]="u.color">
            <span class="dot" [style.background]="u.color">{{ u.icon }}</span>
            <div class="role-text">
              <span class="rname">{{ u.name }}</span>
              <span class="rrole">{{ u.roleLabel }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .login-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; font-family: 'Inter', sans-serif; }

    .topbar {
      height: 54px; flex-shrink: 0; background: #1a100a;
      display: flex; align-items: center; padding: 0 28px; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .topbar-logo { flex-shrink: 0; }

    .main-area { flex: 1; display: flex; min-height: 0; }

    /* LEFT SIDE */
    .brand-side {
      flex: 0 0 45%; background: linear-gradient(160deg, #087E97 0%, #0a6f86 30%, #08667a 60%, #065d6e 100%);
      display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;
    }
    .brand-side::before {
      content: ''; position: absolute; inset: 0; opacity: 0.04;
      background: radial-gradient(circle at 30% 40%, #fff 1px, transparent 1px),
                  radial-gradient(circle at 70% 60%, #fff 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .brand-inner { position: relative; z-index: 1; padding: 60px 55px; max-width: 480px; }
    .brand-logo-mark { margin-bottom: 28px; }
    .brand-title { font-size: 2.4rem; font-weight: 800; color: #fff; margin: 0 0 6px; letter-spacing: -0.5px; }
    .brand-sub { font-size: 0.95rem; color: rgba(255,255,255,0.65); margin: 0 0 24px; font-weight: 400; }
    .brand-desc { font-size: 0.85rem; color: rgba(255,255,255,0.42); line-height: 1.7; margin-bottom: 36px; }
    .brand-stats { display: flex; gap: 36px; }
    .bs { display: flex; flex-direction: column; gap: 2px; font-size: 0.7rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1px; }
    .bs-num { font-size: 1.6rem; font-weight: 700; color: #f0c040; letter-spacing: 0; }

    /* RIGHT SIDE */
    .login-side { flex: 1; background: #f0f4f7; display: flex; align-items: center; justify-content: center; padding: 40px; overflow-y: auto; }
    .login-card {
      background: #fff; border-radius: 12px; box-shadow: 0 2px 20px rgba(0,0,0,0.06);
      padding: 40px 36px; width: 100%; max-width: 480px;
    }
    .login-card h2 { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 4px; }
    .login-sub { font-size: 0.85rem; color: #64748b; margin: 0 0 28px; }
    .field { margin-bottom: 18px; }
    .field label { display: block; font-size: 0.78rem; font-weight: 600; color: #334155; margin-bottom: 5px; }
    .input-box {
      display: flex; align-items: center; gap: 8px; background: #f8fafc; border: 1.5px solid #e2e8f0;
      border-radius: 6px; padding: 0 12px; transition: all 0.2s;
    }
    .input-box:focus-within { border-color: #087E97; box-shadow: 0 0 0 3px rgba(8,126,151,0.08); }
    .input-box input { flex: 1; border: none; outline: none; background: transparent; padding: 10px 0; font-size: 0.88rem; font-family: 'Inter', sans-serif; color: #0f172a; }
    .input-box input::placeholder { color: #cbd5e1; }
    .eye { cursor: pointer; opacity: 0.4; transition: opacity 0.2s; flex-shrink: 0; }
    .eye:hover { opacity: 0.8; }
    .row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .remember { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #64748b; cursor: pointer; }
    .remember input { width: 15px; height: 15px; accent-color: #087E97; cursor: pointer; }
    .forgot { font-size: 0.78rem; color: #087E97; cursor: pointer; font-weight: 500; }
    .forgot:hover { text-decoration: underline; }
    .signin {
      width: 100%; padding: 12px; background: #087E97; color: #fff; border: none;
      border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
      font-family: 'Inter', sans-serif; transition: all 0.2s;
    }
    .signin:hover { background: #076d84; }

    .or { display: flex; align-items: center; gap: 10px; margin: 22px 0 14px; }
    .or::before, .or::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    .or span { font-size: 0.7rem; color: #94a3b8; white-space: nowrap; }

    .role-list { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .role-item {
      display: flex; align-items: center; gap: 9px; padding: 8px 12px;
      border: 1px solid #f1f5f9; border-radius: 6px; cursor: pointer;
      transition: all 0.15s;
    }
    .role-item:hover { border-color: var(--accent); background: #f8fafc; }
    .dot {
      width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; font-size: 0.6rem; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .role-text { flex: 1; min-width: 0; }
    .rname { display: block; font-weight: 600; color: #0f172a; font-size: 0.82rem; line-height: 1.2; }
    .rrole { color: #94a3b8; font-size: 0.68rem; }

    @media (max-width: 900px) {
      .main-area { flex-direction: column; }
      .brand-side { flex: 0 0 auto; padding: 30px; min-height: 180px; }
      .brand-inner { padding: 20px; }
      .brand-title { font-size: 1.6rem; }
      .brand-desc { display: none; }
      .brand-stats { gap: 20px; }
      .login-side { padding: 20px 16px; align-items: flex-start; }
      .login-card { padding: 24px 20px; }
    }

    @media (prefers-color-scheme: dark) {
      .topbar { background: #0a0806; }
      .login-side { background: #0f172a; }
      .login-card { background: #1e293b; }
      .login-card h2 { color: #f1f5f9; }
      .login-sub { color: #94a3b8; }
      .field label { color: #cbd5e1; }
      .input-box { background: #0f172a; border-color: #334155; }
      .input-box input { color: #f1f5f9; }
      .role-item { border-color: #1e293b; }
      .role-item:hover { background: #253349; }
      .rname { color: #f1f5f9; }
      .or::before, .or::after { background: #334155; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  showPwd = false;

  users = [
    { id: 'USR-001', name: 'Rahul Sharma', role: 'IR', roleLabel: 'Indent Raiser', icon: 'IR', color: '#2563eb' },
    { id: 'USR-002', name: 'Vikram Mehta', role: 'DH', roleLabel: 'Design Head', icon: 'DH', color: '#16a34a' },
    { id: 'USR-003', name: 'Anjali Nair', role: 'COORD', roleLabel: 'Coordinator', icon: 'CO', color: '#7c3aed' },
    { id: 'USR-004', name: 'Suresh Rao', role: 'CTM', roleLabel: 'CTM', icon: 'CT', color: '#ea580c' },
    { id: 'USR-005', name: 'Deepak Shetty', role: 'CH', roleLabel: 'Contract Head', icon: 'CH', color: '#dc2626' },
    { id: 'USR-006', name: 'Management', role: 'MGMT', roleLabel: 'Management', icon: 'MG', color: '#475569' },
    { id: 'USR-007', name: 'Kavita Rao', role: 'DTR', roleLabel: 'Design Reviewer', icon: 'DT', color: '#0891b2' },
    { id: 'USR-008', name: 'Vikram Patel', role: 'EXT', roleLabel: 'Consultant', icon: 'EC', color: '#d97706' },
    { id: 'USR-009', name: 'Rajesh Kumar', role: 'MEPH', roleLabel: 'MEP Head', icon: 'ME', color: '#ca8a04' },
    { id: 'USR-010', name: 'Sunil Joshi', role: 'PH', roleLabel: 'Project Head', icon: 'PH', color: '#6d28d9' },
    { id: 'USR-011', name: 'Meera Reddy', role: 'LH', roleLabel: 'Liaisoning Head', icon: 'LH', color: '#0d9488' },
    { id: 'USR-012', name: 'Arun Bagmane', role: 'MD', roleLabel: 'Managing Director', icon: 'MD', color: '#1e40af' },
    { id: 'USR-013', name: 'Admin', role: 'ADMIN', roleLabel: 'Admin', icon: 'AD', color: '#6b7280' },
  ];

  private roleRouteMap: Record<string, string> = {
    'USR-001': '/raise-indent', 'USR-002': '/design-head-approval', 'USR-003': '/coordinator-assignment',
    'USR-004': '/contract-team-member', 'USR-005': '/contract-head-approval', 'USR-006': '/cob-tracker',
    'USR-007': '/deliverables-tracker', 'USR-008': '/consultant-upload', 'USR-009': '/approval-portals',
    'USR-010': '/approval-portals', 'USR-011': '/approval-portals', 'USR-012': '/design-dashboard',
    'USR-013': '/system-settings',
  };
  private userMap: Record<string, AppUser> = {
    'USR-001': { id:'USR-001', name:'Rahul Sharma', role:'IR', email:'rahul.sharma@bagmane.com', portalAccess:[] },
    'USR-002': { id:'USR-002', name:'Vikram Mehta', role:'DH', email:'vikram.mehta@bagmane.com', portalAccess:[] },
    'USR-003': { id:'USR-003', name:'Anjali Nair', role:'COORD', email:'anjali.nair@bagmane.com', portalAccess:[] },
    'USR-004': { id:'USR-004', name:'Suresh Rao', role:'CTM', email:'suresh.rao@bagmane.com', portalAccess:[] },
    'USR-005': { id:'USR-005', name:'Deepak Shetty', role:'CH', email:'deepak.shetty@bagmane.com', portalAccess:[] },
    'USR-006': { id:'USR-006', name:'Management', role:'MGMT', email:'mgmt@bagmane.com', portalAccess:[] },
    'USR-007': { id:'USR-007', name:'Kavita Rao', role:'DTR', email:'kavita.rao@bagmane.com', portalAccess:[] },
    'USR-008': { id:'USR-008', name:'Vikram Patel', role:'EXT', email:'vikram@artech.com', portalAccess:[] },
    'USR-009': { id:'USR-009', name:'Rajesh Kumar', role:'MEPH', email:'rajesh.kumar@bagmane.com', portalAccess:[] },
    'USR-010': { id:'USR-010', name:'Sunil Joshi', role:'PH', email:'sunil.joshi@bagmane.com', portalAccess:[] },
    'USR-011': { id:'USR-011', name:'Meera Reddy', role:'LH', email:'meera.reddy@bagmane.com', portalAccess:[] },
    'USR-012': { id:'USR-012', name:'Arun Bagmane', role:'MD', email:'arun@bagmane.com', portalAccess:[] },
    'USR-013': { id:'USR-013', name:'Admin', role:'ADMIN', email:'admin@bagmane.com', portalAccess:[] },
  } as any;

  constructor(private router: Router, private dataService: DataService) {}

  signIn() { if(this.username) { this.dataService.setCurrentUser(this.userMap['USR-001']); this.router.navigate(['/raise-indent']); } }
  loginAs(user: any) { const appUser = this.userMap[user.id]; if(appUser) { this.dataService.setCurrentUser(appUser); this.router.navigate([this.roleRouteMap[user.id] || '/portal-hub']); } }
}
