import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-portal-hub',
  template: `
<div class="hub-container">
  <div class="hub-header">
    <div class="eyebrow">Bagmane D2</div>
    <h1>Portal Hub</h1>
    <p>Pick a workspace to open. Each portal loads full-screen. Use the navigation bar to switch between portals.</p>
  </div>
  <div class="portal-grid">
    <div class="portal-card" (click)="openPortal('raise-indent')">
      <div class="card-icon c1">&#x1F4CB;</div>
      <h3>01 - Consultant Onboarding</h3>
      <p>Raise indents, propose consultants, track requests, send kickstart emails. For Indent Raisers.</p>
      <span class="card-badge badge badge-primary">Portal 1</span>
    </div>
    <div class="portal-card" (click)="openPortal('deliverables-tracker')">
      <div class="card-icon c2">&#x1F4E6;</div>
      <h3>02 - Deliverable Assignment</h3>
      <p>Track deliverables across 7 design stages, manage bulk assignments, view stage dashboards.</p>
      <span class="card-badge badge badge-success">Portal</span>
    </div>
    <div class="portal-card" (click)="openPortal('approval-portals')">
      <div class="card-icon c3">&#x2705;</div>
      <h3>03 - Approval Portals</h3>
      <p>5-tier approval: Design Head, MEP Head, Project Head, Liaisoning, MD. Full review workflow.</p>
      <span class="card-badge badge badge-warning">Portal</span>
    </div>
    <div class="portal-card" (click)="openPortal('consultant-stage-tracker')">
      <div class="card-icon c4">&#x1F4CA;</div>
      <h3>04 - Consultant Stage Tracker</h3>
      <p>Matrix view of all consultants across 7 design stages with drill-down capability.</p>
      <span class="card-badge badge badge-info">Portal</span>
    </div>
    <div class="portal-card" (click)="openPortal('consultant-upload')">
      <div class="card-icon c5">&#x1F4E4;</div>
      <h3>05 - Consultant Portal</h3>
      <p>External consultant login to upload deliverables, track revisions, and view submission history.</p>
      <span class="card-badge badge badge-danger">External</span>
    </div>
  </div>
  <div style="display:flex;gap:16px;margin-top:32px;flex-wrap:wrap;justify-content:center">
    <button class="btn btn-outline btn-sm" (click)="openPortal('design-head-approval')">Design Head Portal</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('coordinator-assignment')">Coordinator Portal</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('contract-team-member')">CTM Portal</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('contract-head-approval')">CH Portal</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('cob-tracker')">COB Tracker</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('design-dashboard')">Design Dashboard</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('system-settings')">System Settings</button>
    <button class="btn btn-outline btn-sm" (click)="openPortal('sap-integration')">SAP Integration</button>
  </div>
</div>
`,
  styles: [`
    .hub-container { min-height: calc(100vh - 48px); background: linear-gradient(135deg, var(--bg) 0%, #e8edf5 100%); padding: 60px 40px; display: flex; flex-direction: column; align-items: center; }
    .hub-header { text-align: center; margin-bottom: 48px; }
    .hub-header .eyebrow { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 3px; color: var(--accent); font-weight: 600; }
    .hub-header h1 { font-size: 2.5rem; font-weight: 800; color: var(--primary); margin: 8px 0 4px; }
    .hub-header p { color: var(--text-secondary); font-size: 1rem; max-width: 600px; }
    .portal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; max-width: 1200px; width: 100%; }
    .portal-card { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 32px 28px; cursor: pointer; transition: all 0.3s ease; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
    .portal-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--primary-light); }
    .portal-card .card-icon { font-size: 2rem; margin-bottom: 16px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius); }
    .portal-card .card-icon.c1 { background: #e3f2fd; color: #1565c0; }
    .portal-card .card-icon.c2 { background: #e8f5e9; color: #2e7d32; }
    .portal-card .card-icon.c3 { background: #fff3e0; color: #e65100; }
    .portal-card .card-icon.c4 { background: #f3e5f5; color: #7b1fa2; }
    .portal-card .card-icon.c5 { background: #fce4ec; color: #c62828; }
    .portal-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; color: var(--text); }
    .portal-card p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
    .portal-card .card-badge { position: absolute; top: 16px; right: 16px; }
    @media (max-width:768px) { .hub-container { padding: 30px 16px; } .hub-header h1 { font-size: 1.8rem; } }
  `]
})
export class PortalHubComponent {
  constructor(public router: Router, public dataService: DataService) {}

  openPortal(route: string) {
    this.router.navigate(['/' + route]);
  }
}
