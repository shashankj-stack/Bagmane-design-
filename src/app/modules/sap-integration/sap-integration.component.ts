import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { SapSyncStatus } from '../../core/models';

@Component({
  selector: 'app-sap-integration',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>SAP Integration</h1><p>Monitor work order synchronization with SAP system</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">{{ syncedCount }}</div><div class="stat-label">Synced</div></div>
    <div class="stat-card"><div class="stat-value">{{ pendingCount }}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card"><div class="stat-value">{{ failedCount }}</div><div class="stat-label">Failed</div></div>
  </div>

  <div class="section">
    <div class="section-header">
      <h2>Work Order Sync Status</h2>
      <button class="btn btn-accent btn-sm" (click)="syncAll()">Sync All Pending</button>
    </div>
    <div class="table-container">
      <table><thead><tr><th>Indent ID</th><th>WO ID</th><th>Sync Status</th><th>Last Sync</th><th>Error</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of syncStatuses">
            <td><strong>{{ s.indentId }}</strong></td><td>{{ s.woId }}</td>
            <td><span class="badge" [class.badge-success]="s.syncStatus==='Synced'" [class.badge-warning]="s.syncStatus==='Pending'" [class.badge-danger]="s.syncStatus==='Failed'">{{ s.syncStatus }}</span></td>
            <td class="text-sm">{{ s.lastSyncDateTime || '-' }}</td>
            <td class="text-sm" [style.color]="s.errorMessage ? 'var(--danger)' : ''">{{ s.errorMessage || '-' }}</td>
            <td>
              <button class="btn btn-outline btn-sm" (click)="syncOne(s)" [disabled]="s.syncStatus === 'Synced'">
                {{ s.syncStatus === 'Failed' ? 'Retry' : 'Sync' }}
              </button>
            </td>
          </tr>
        </tbody></table>
    </div>
  </div>

  <div class="card" style="margin-top:24px">
    <h2>Sync Log</h2>
    <p class="text-sm text-secondary" style="margin:8px 0">Recent synchronization activity</p>
    <div *ngFor="let log of syncLogs" style="padding:8px 0;border-bottom:1px solid var(--border-light)">
      <span class="badge" [class.badge-success]="log.status==='Synced'" [class.badge-danger]="log.status==='Failed'" style="margin-right:8px">{{ log.status }}</span>
      <span class="text-sm">{{ log.message }}</span>
      <span class="text-xs text-secondary" style="margin-left:12px">{{ log.timestamp }}</span>
    </div>
  </div>
</div>
`,
  styles: []
})
export class SapIntegrationComponent implements OnInit {
  syncStatuses: SapSyncStatus[] = [];
  syncLogs: { status: string; message: string; timestamp: string }[] = [];

  constructor(public router: Router, public dataService: DataService) {}

  ngOnInit() {
    this.syncStatuses = this.dataService.getSapSyncStatuses();
  }

  get syncedCount() { return this.syncStatuses.filter(s => s.syncStatus === 'Synced').length; }
  get pendingCount() { return this.syncStatuses.filter(s => s.syncStatus === 'Pending').length; }
  get failedCount() { return this.syncStatuses.filter(s => s.syncStatus === 'Failed').length; }

  syncOne(s: SapSyncStatus) {
    const now = new Date().toLocaleString();
    s.syncStatus = 'Synced';
    s.lastSyncDateTime = now;
    this.syncLogs.unshift({ status: 'Synced', message: `${s.indentId} / ${s.woId} synced successfully`, timestamp: now });
    this.dataService.addNotification(`${s.indentId} synced to SAP`, 'success');
  }

  syncAll() {
    this.syncStatuses.filter(s => s.syncStatus !== 'Synced').forEach(s => this.syncOne(s));
  }
}
