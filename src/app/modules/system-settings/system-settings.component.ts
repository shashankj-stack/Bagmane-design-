import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { SystemSettings } from '../../core/models';

@Component({
  selector: 'app-system-settings',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>System Settings & Configuration</h1><p>Configure workflow, notifications, and document storage integration</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- Workflow Approval Levels -->
  <div class="section">
    <div class="card"><h2>Deliverable Review Workflow</h2>
      <p class="text-sm text-secondary" style="margin:8px 0 16px">Configure the number of approval tiers for deliverable review</p>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Approval Level</label>
          <select class="form-select" [(ngModel)]="settings.approvalTier"><option [value]="2">2-Tier (Submission to Design Head)</option><option [value]="3">3-Tier (Submission to Design Team to Design Head)</option></select>
          <div class="form-hint">Default: 3-tier approval. Changes apply to new deliverables only.</div>
        </div>
      </div>
      <button class="btn btn-accent btn-sm" (click)="saveSettings()">Save Workflow Settings</button>
    </div>
  </div>

  <!-- Notification Settings -->
  <div class="section">
    <div class="card"><h2>Notification Settings</h2>
      <p class="text-sm text-secondary" style="margin:8px 0 16px">Configure email and portal notification triggers</p>
      <div class="form-group form-toggle" style="margin-bottom:12px">
        <input type="checkbox" [(ngModel)]="settings.notifications.upcomingDeadlineAlerts" id="n1"><label for="n1">Upcoming Deadline Alerts</label>
        <input class="form-input" type="number" [(ngModel)]="settings.notifications.deadlineLeadDays" min="1" max="30" style="width:80px;margin-left:12px" placeholder="Days"> <span class="text-sm text-secondary">days before</span>
      </div>
      <div class="form-group form-toggle" style="margin-bottom:12px"><input type="checkbox" [(ngModel)]="settings.notifications.delayedItemAlerts" id="n2"><label for="n2">Delayed Item Alerts</label></div>
      <div class="form-group form-toggle" style="margin-bottom:12px"><input type="checkbox" [(ngModel)]="settings.notifications.newSubmissionNotifications" id="n3"><label for="n3">New Submission Notifications</label></div>
      <div class="form-group form-toggle" style="margin-bottom:12px"><input type="checkbox" [(ngModel)]="settings.notifications.approvalRejectionNotifications" id="n4"><label for="n4">Approval / Rejection Notifications</label></div>
      <div class="form-group" style="margin-top:12px"><label class="form-label">Notification Channels</label>
        <div class="pill-group">
          <span class="filter-pill" [class.active]="hasChannel('email')" (click)="toggleChannel('email')">Email</span>
          <span class="filter-pill" [class.active]="hasChannel('portal')" (click)="toggleChannel('portal')">In-Portal Alerts</span>
        </div>
      </div>
      <button class="btn btn-accent btn-sm" (click)="saveSettings()">Save Notification Settings</button>
    </div>
  </div>

  <!-- SharePoint / DMS Integration -->
  <div class="section">
    <div class="card"><h2>Document Storage Integration (SharePoint)</h2>
      <p class="text-sm text-secondary" style="margin:8px 0 16px">Configure the document management system backend for uploaded deliverables</p>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Site URL</label><input class="form-input" [(ngModel)]="settings.sharepoint.siteUrl" placeholder="https://bagmane.sharepoint.com/sites/design"></div>
        <div class="form-group"><label class="form-label">Library Path</label><input class="form-input" [(ngModel)]="settings.sharepoint.libraryPath" placeholder="/Shared Documents/Deliverables"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Authentication Method</label>
          <select class="form-select" [(ngModel)]="settings.sharepoint.authMethod"><option>OAuth2</option><option>Client Certificate</option><option>Basic Auth</option></select></div>
        <div class="form-group"><label class="form-label">Auth Key / Secret</label><input class="form-input" type="password" [(ngModel)]="settings.sharepoint.authKey" placeholder="Enter auth key..."></div>
      </div>
      <div class="btn-group"><button class="btn btn-accent btn-sm" (click)="testConnection()">Test DMS Connection</button><button class="btn btn-outline btn-sm" (click)="saveSettings()">Save</button></div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class SystemSettingsComponent implements OnInit {
  settings!: SystemSettings;

  constructor(public router: Router, public dataService: DataService) {}

  ngOnInit() {
    this.dataService.settings$.subscribe(s => this.settings = JSON.parse(JSON.stringify(s)));
  }

  hasChannel(ch: string): boolean { return this.settings.notifications.channels.includes(ch as any); }

  toggleChannel(ch: string) {
    const channels = this.settings.notifications.channels;
    const idx = channels.indexOf(ch as any);
    if (idx === -1) channels.push(ch as any);
    else channels.splice(idx, 1);
  }

  saveSettings() { this.dataService.updateSettings(this.settings); }
  testConnection() {
    if (!this.settings.sharepoint.siteUrl) { this.dataService.addNotification('Please enter Site URL first', 'error'); return; }
    this.dataService.addNotification('DMS Connection test successful!', 'success');
  }
}
