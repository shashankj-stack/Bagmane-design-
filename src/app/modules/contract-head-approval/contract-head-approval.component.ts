import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest } from '../../core/models';

@Component({
  selector: 'app-contract-head-approval',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Contract Head Approval Portal</h1><p>Portal 5 - Review and approve/reject submitted work orders</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>
  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">{{ submittedWos.length }}</div><div class="stat-label">Pending Review</div></div>
    <div class="stat-card"><div class="stat-value">{{ approvedCount }}</div><div class="stat-label">Approved</div></div>
    <div class="stat-card"><div class="stat-value">{{ rejectedCount }}</div><div class="stat-label">Rejected</div></div>
  </div>
  <div class="section-header"><h2>Submitted Work Orders</h2></div>
  <div class="card-grid" *ngIf="submittedWos.length > 0">
    <div class="card" *ngFor="let indent of submittedWos">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <strong>{{ indent.indentId }}</strong>
        <span [class]="indent.status === 'Accepted' ? 'badge badge-warning' : 'badge badge-danger'">{{ indent.status === 'CH Rejected' ? 'CH Rejected' : 'Pending' }}</span>
      </div>
      <div class="info-grid" style="margin-bottom:8px">
        <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ indent.category }}</span></div>
        <div class="info-item"><span class="info-label">Consultant Type</span><span class="info-value">{{ indent.consultantType || '-' }}</span></div>
        <div class="info-item"><span class="info-label">Project</span><span class="info-value">{{ indent.techPark }}</span></div>
        <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ indent.raisedBy }}</span></div>
        <div class="info-item"><span class="info-label">CTM</span><span class="info-value">{{ indent.assignee }}</span></div>
      </div>
      <div *ngIf="indent.woData?.length" style="background:var(--border-light);padding:12px;border-radius:var(--radius-sm);margin-bottom:12px">
        <div *ngFor="let wo of indent.woData" class="text-sm" style="margin-bottom:4px">
          <strong>WO {{ wo.woId }}:</strong> {{ wo.consultantFirm }} | Fee: {{ wo.fee }} | Date: {{ wo.woDate }}
          <div *ngIf="wo.approvalNotes" style="color:var(--text-secondary)">Notes: {{ wo.approvalNotes }}</div>
        </div>
      </div>
      <div *ngIf="activeAction === indent.indentId" style="margin-bottom:8px">
        <textarea class="form-textarea" [(ngModel)]="remarks" [placeholder]="actionType === 'reject' ? 'Remarks mandatory for rejection *' : 'Optional remarks...'" rows="2"></textarea>
        <div class="btn-group" style="margin-top:8px">
          <button class="btn btn-accent btn-sm" (click)="confirmAction(indent)">Confirm {{ actionType === 'reject' ? 'Rejection' : 'Approval' }}</button>
          <button class="btn btn-outline btn-sm" (click)="activeAction = ''">Cancel</button>
        </div>
      </div>
      <div class="btn-group" *ngIf="activeAction !== indent.indentId">
        <button class="btn btn-outline btn-sm" (click)="viewDetails(indent)">View All Details</button>
        <button class="btn btn-success btn-sm" (click)="approve(indent)">Approve & Complete</button>
        <button class="btn btn-danger btn-sm" (click)="rejectPrompt(indent)">Request Revision</button>
      </div>
    </div>
  </div>
  <div *ngIf="submittedWos.length === 0" class="card" style="text-align:center;padding:40px"><p class="text-secondary">No work orders pending review.</p></div>

  <div class="modal-overlay" *ngIf="showDetailModal && detailIndent" (click)="showDetailModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ detailIndent.indentId }} - Full Details</h2><button class="modal-close" (click)="showDetailModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Request ID</span><span class="info-value">{{ detailIndent.indentId }}</span></div>
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ detailIndent.category }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ detailIndent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ detailIndent.raisedBy }}</span></div>
          <div class="info-item"><span class="info-label">CTM</span><span class="info-value">{{ detailIndent.assignee }}</span></div>
          <div class="info-item"><span class="info-label">DH Approved</span><span class="info-value">{{ detailIndent.approvedDateTime }}</span></div>
        </div>
        <h3 style="margin:16px 0 8px">Scope</h3><p style="background:var(--border-light);padding:12px;border-radius:var(--radius-sm)">{{ detailIndent.scopeOfWork }}</p>
        <h3 style="margin:16px 0 8px">Work Orders</h3>
        <table><thead><tr><th>WO ID</th><th>Firm</th><th>Fee</th><th>Date</th><th>Notes</th></tr></thead>
          <tbody><tr *ngFor="let wo of detailIndent.woData"><td>{{ wo.woId }}</td><td>{{ wo.consultantFirm }}</td><td>{{ wo.fee }}</td><td>{{ wo.woDate }}</td><td class="text-sm">{{ wo.remarks || '-' }}</td></tr></tbody></table>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class ContractHeadApprovalComponent {
  indentList: IndentRequest[] = [];
  remarks = '';
  activeAction = '';
  actionType = '';
  approvedCount = 0;
  rejectedCount = 0;
  showDetailModal = false;
  detailIndent: IndentRequest | null = null;

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }

  get submittedWos(): IndentRequest[] {
    return this.indentList.filter(i => i.status === 'Accepted' || i.status === 'CH Rejected');
  }

  approve(indent: IndentRequest) { this.activeAction = indent.indentId; this.actionType = 'approve'; this.remarks = ''; }
  rejectPrompt(indent: IndentRequest) { this.activeAction = indent.indentId; this.actionType = 'reject'; this.remarks = ''; }
  confirmAction(indent: IndentRequest) {
    if (this.actionType === 'reject' && !this.remarks.trim()) { this.dataService.addNotification('Remarks are mandatory for rejection', 'error'); return; }
    if (this.actionType === 'reject') { this.dataService.contractHeadReject(indent.indentId, this.remarks); this.rejectedCount++; }
    else { this.dataService.contractHeadApprove(indent.indentId, this.remarks); this.approvedCount++; }
    this.activeAction = ''; this.remarks = '';
  }
  viewDetails(indent: IndentRequest) { this.detailIndent = indent; this.showDetailModal = true; }
}
