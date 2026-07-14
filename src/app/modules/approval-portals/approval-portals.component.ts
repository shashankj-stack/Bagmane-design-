import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Deliverable } from '../../core/models';

interface ApprovalTab {
  id: string; label: string; role: string;
  kpiLabel1: string; kpiLabel2: string; kpiLabel3: string; kpiLabel4: string;
  approvalTier: string; filterStatus: string;
}

@Component({
  selector: 'app-approval-portals',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Approval Portals</h1><p>5-tier deliverable approval: Design Head -> MEP Head -> Project Head -> Liaisoning -> MD</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- Tab Navigation -->
  <div class="tabs">
    <button class="tab" *ngFor="let tab of tabs" [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
      {{ tab.label }}
      <span class="tab-badge" *ngIf="pendingCount(tab) > 0">{{ pendingCount(tab) }}</span>
    </button>
  </div>

  <!-- KPI Summary Strip -->
  <div class="stats-row">
    <div class="stat-card">
      <div class="stat-value">{{ pendingCount(activeTabConfig) }}</div>
      <div class="stat-label">{{ activeTabConfig.kpiLabel1 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ approvedCount(activeTabConfig) }}</div>
      <div class="stat-label">{{ activeTabConfig.kpiLabel2 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ awaitingPriorCount(activeTabConfig) }}</div>
      <div class="stat-label">{{ activeTabConfig.kpiLabel3 }}</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{{ rejectedCount(activeTabConfig) }}</div>
      <div class="stat-label">{{ activeTabConfig.kpiLabel4 }}</div>
    </div>
  </div>

  <!-- Deliverables Review Table -->
  <div class="table-container">
    <table><thead><tr>
      <th>Consultant</th><th>Deliverable</th><th>Stage</th><th>Floor</th>
      <th>Revision</th><th>Work Initiated</th><th>Due Date</th>
      <th>Submission</th><th>Document</th>
      <th *ngIf="activeTab !== 'design-head'">Design Approval</th>
      <th *ngIf="activeTab === 'mep-head' || activeTab === 'project-head' || activeTab === 'liaisoning' || activeTab === 'md'">MEP Status</th>
      <th *ngIf="activeTab === 'project-head' || activeTab === 'liaisoning' || activeTab === 'md'">Proj Head Status</th>
      <th *ngIf="activeTab === 'liaisoning' || activeTab === 'md'">Liaison Status</th>
      <th *ngIf="activeTab === 'project-head'">IFC Status</th>
      <th *ngIf="activeTab === 'project-head'">IFC Date</th>
      <th>Status</th><th>Decision</th>
    </tr></thead>
    <tbody>
      <tr *ngFor="let d of filteredDeliverables">
        <td>{{ d.consultant }}</td><td><strong>{{ d.deliverableName }}</strong></td>
        <td><span class="badge badge-light">{{ d.stage }}</span></td>
        <td>{{ d.floor || '-' }}</td><td>Rev {{ d.revNo }}</td>
        <td class="text-sm">{{ d.workInitiatedDate }}</td><td class="text-sm">{{ d.dueDate }}</td>
        <td><span class="badge" [class.badge-success]="d.submissionStatus==='Submitted'" [class.badge-warning]="d.submissionStatus==='Pending'">{{ d.submissionStatus }}</span></td>
        <td><a href="#" class="text-sm" style="color:var(--primary)">View Doc</a></td>
        <td *ngIf="activeTab !== 'design-head'">{{ badge(d.designHeadApproval) }}</td>
        <td *ngIf="activeTab === 'mep-head' || activeTab === 'project-head' || activeTab === 'liaisoning' || activeTab === 'md'">{{ badge(d.mepApproval) }}</td>
        <td *ngIf="activeTab === 'project-head' || activeTab === 'liaisoning' || activeTab === 'md'">{{ badge(d.projectHeadApproval) }}</td>
        <td *ngIf="activeTab === 'liaisoning' || activeTab === 'md'">{{ badge(d.liaisonApproval) }}</td>
        <td *ngIf="activeTab === 'project-head'">{{ d.ifcStatus || '-' }}</td>
        <td *ngIf="activeTab === 'project-head'" class="text-sm">{{ d.ifcDate || '-' }}</td>
        <td>{{ badge(getCurrentTierStatus(d)) }}</td>
        <td>
          <div class="btn-group" *ngIf="!showRemarks[d.id]">
            <button class="btn btn-success btn-sm" (click)="approve(d)">Approve</button>
            <button class="btn btn-danger btn-sm" (click)="showRemarks[d.id] = true">Reject</button>
          </div>
          <div *ngIf="showRemarks[d.id]" style="margin-top:4px">
            <textarea class="form-textarea" [(ngModel)]="remarks[d.id]" placeholder="Remarks..." rows="2" style="font-size:0.75rem"></textarea>
            <div class="btn-group" style="margin-top:4px">
              <button class="btn btn-success btn-sm" (click)="confirmApprove(d)">Submit</button>
              <button class="btn btn-outline btn-sm" (click)="cancelRemarks(d)">Cancel</button>
            </div>
          </div>
        </td>
      </tr>
    </tbody></table>
  </div>
  <div *ngIf="filteredDeliverables.length === 0" class="card" style="text-align:center;padding:40px;margin-top:16px">
    <p class="text-secondary">No deliverables pending review.</p>
  </div>
</div>
`,
  styles: []
})
export class ApprovalPortalsComponent implements OnInit {
  activeTab = 'design-head';
  tabs: ApprovalTab[] = [
    { id: 'design-head', label: 'Design Head', role: 'DH', kpiLabel1: 'Pending Approvals', kpiLabel2: 'Approved', kpiLabel3: 'Pending Design', kpiLabel4: 'Rejected', approvalTier: 'design-head', filterStatus: 'designHeadApproval' },
    { id: 'mep-head', label: 'MEP Head', role: 'MEPH', kpiLabel1: 'Awaiting MEP Review', kpiLabel2: 'Approved', kpiLabel3: 'Pending Design Approval', kpiLabel4: 'Rejected', approvalTier: 'mep-head', filterStatus: 'mepApproval' },
    { id: 'project-head', label: 'Project Head', role: 'PH', kpiLabel1: 'Pending Review', kpiLabel2: 'Approved', kpiLabel3: 'Awaiting MEP', kpiLabel4: 'Rejected', approvalTier: 'project-head', filterStatus: 'projectHeadApproval' },
    { id: 'liaisoning', label: 'Liaisoning', role: 'LH', kpiLabel1: 'Pending Review', kpiLabel2: 'Approved', kpiLabel3: 'Awaiting Design', kpiLabel4: 'Rejected', approvalTier: 'liaisoning', filterStatus: 'liaisonApproval' },
    { id: 'md', label: 'MD Approval', role: 'MD', kpiLabel1: 'Pending Review', kpiLabel2: 'Approved', kpiLabel3: 'Awaiting Design', kpiLabel4: 'Rejected', approvalTier: 'md', filterStatus: 'mdApproval' },
  ];
  deliverables: Deliverable[] = [];
  remarks: Record<string, string> = {};
  showRemarks: Record<string, boolean> = {};

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.deliverables$.subscribe(v => this.deliverables = v);
  }
  ngOnInit() {}

  get activeTabConfig(): ApprovalTab { return this.tabs.find(t => t.id === this.activeTab) || this.tabs[0]; }

  get filteredDeliverables(): Deliverable[] {
    const tab = this.activeTabConfig;
    switch (tab.id) {
      case 'design-head': return this.deliverables.filter(d => d.submissionStatus === 'Submitted' && d.designHeadApproval === 'Pending');
      case 'mep-head': return this.deliverables.filter(d => d.designHeadApproval === 'Approved' && d.mepApproval === 'Pending');
      case 'project-head': return this.deliverables.filter(d => d.mepApproval === 'Approved' && d.projectHeadApproval === 'Pending');
      case 'liaisoning': return this.deliverables.filter(d => d.projectHeadApproval === 'Approved' && d.liaisonApproval === 'Pending');
      case 'md': return this.deliverables.filter(d => d.liaisonApproval === 'Approved' && d.mdApproval === 'Pending');
      default: return [];
    }
  }

  pendingCount(tab: ApprovalTab): number {
    switch (tab.id) {
      case 'design-head': return this.deliverables.filter(d => d.submissionStatus === 'Submitted' && d.designHeadApproval === 'Pending').length;
      case 'mep-head': return this.deliverables.filter(d => d.designHeadApproval === 'Approved' && d.mepApproval === 'Pending').length;
      case 'project-head': return this.deliverables.filter(d => d.mepApproval === 'Approved' && d.projectHeadApproval === 'Pending').length;
      case 'liaisoning': return this.deliverables.filter(d => d.projectHeadApproval === 'Approved' && d.liaisonApproval === 'Pending').length;
      case 'md': return this.deliverables.filter(d => d.liaisonApproval === 'Approved' && d.mdApproval === 'Pending').length;
      default: return 0;
    }
  }

  approvedCount(tab: ApprovalTab): number {
    const field = tab.filterStatus as keyof Deliverable;
    return this.deliverables.filter(d => d[field] === 'Approved').length;
  }

  awaitingPriorCount(tab: ApprovalTab): number {
    return this.deliverables.filter(d => d.submissionStatus === 'Submitted' && d.designHeadApproval === 'Pending').length;
  }

  rejectedCount(tab: ApprovalTab): number {
    const field = tab.filterStatus as keyof Deliverable;
    return this.deliverables.filter(d => d[field] === 'Rejected').length;
  }

  getCurrentTierStatus(d: Deliverable): string {
    const tab = this.activeTabConfig;
    const fieldMap: Record<string, keyof Deliverable> = {
      'design-head': 'designHeadApproval', 'mep-head': 'mepApproval',
      'project-head': 'projectHeadApproval', 'liaisoning': 'liaisonApproval', 'md': 'mdApproval'
    };
    return (d[fieldMap[tab.id]] as string) || 'Pending';
  }

  badge(status: string): string { return status || 'Pending'; }

  approve(d: Deliverable) {
    const tab = this.activeTabConfig;
    this.showRemarks[d.id] = true;
    this.remarks[d.id] = '';
  }

  confirmApprove(d: Deliverable) {
    const tab = this.activeTabConfig;
    if (this.showRemarks[d.id] && this.remarks[d.id] && this.remarks[d.id].trim()) {
      this.dataService.approveDeliverable(d.id, tab.approvalTier, this.remarks[d.id]);
    }
    this.showRemarks[d.id] = false;
    this.remarks[d.id] = '';
  }

  cancelRemarks(d: Deliverable) {
    const tab = this.activeTabConfig;
    const remarkVal = this.remarks[d.id];
    if (remarkVal && remarkVal.trim()) {
      this.dataService.rejectDeliverable(d.id, tab.approvalTier, remarkVal);
    }
    this.showRemarks[d.id] = false;
    this.remarks[d.id] = '';
  }
}
