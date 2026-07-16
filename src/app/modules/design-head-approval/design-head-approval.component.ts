import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest } from '../../core/models';

@Component({
  selector: 'app-design-head-approval',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section">
      <h1>Design Head Approval Portal</h1>
      <p>Portal 2 - Review and approve/reject pending indent requests</p>
    </div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">{{ pendingRequests.length }}</div><div class="stat-label">Pending Review <span class="tab-badge" *ngIf="pendingRequests.length">{{ pendingRequests.length }}</span></div></div>
    <div class="stat-card"><div class="stat-value">{{ approvedToday }}</div><div class="stat-label">Approved Today</div></div>
    <div class="stat-card"><div class="stat-value">{{ rejectedToday }}</div><div class="stat-label">Rejected Today</div></div>
    <div class="stat-card"><div class="stat-value">{{ totalProcessed }}</div><div class="stat-label">Total Processed</div></div>
  </div>

  <div class="section-header"><h2>Pending Review Cards</h2></div>

  <div class="card-grid" *ngIf="pendingRequests.length > 0">
    <div class="card" *ngFor="let indent of pendingRequests">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
        <div><strong style="font-size:1.1rem">{{ indent.indentId }}</strong>
          <span class="badge" [class.badge-info]="indent.category==='Consultant Onboarding'" [class.badge-light]="indent.category==='General'" style="margin-left:8px">{{ indent.category }}</span>
        </div>
        <span class="badge badge-warning">Pending</span>
      </div>
      <div class="info-grid" style="margin-bottom:12px">
        <div class="info-item"><span class="info-label">Consultant Type</span><span class="info-value">{{ indent.consultantType || '-' }}</span></div>
        <div class="info-item"><span class="info-label">Tech Park / Building</span><span class="info-value">{{ indent.techPark }} / {{ indent.buildingNames?.join(', ') }}</span></div>
        <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ indent.raisedBy }}</span></div>
        <div class="info-item"><span class="info-label">Request Date</span><span class="info-value">{{ indent.requestDateTime }}</span></div>
        <div class="info-item"><span class="info-label">No. Required</span><span class="info-value">{{ indent.numConsultantsRequired }}</span></div>
        <div class="info-item"><span class="info-label">RFP Date</span><span class="info-value">{{ indent.rfpDate || '-' }}</span></div>
      </div>
      <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px;max-height:60px;overflow:hidden"><strong>Scope:</strong> {{ indent.scopeOfWork }}</div>
      <!-- View Details row -->
      <div style="margin-bottom:12px">
        <button class="btn btn-outline btn-sm" (click)="viewDetails(indent)">View Details</button>
      </div>
      <!-- Action buttons in their own clear row -->
      <div style="background:#1a3a5c;padding:16px;border-radius:8px;margin-top:8px">
        <p style="color:#e8a817;font-weight:700;margin-bottom:10px">ACTIONS:</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-success btn-lg" (click)="approve(indent)">Approve</button>
          <button class="btn btn-danger btn-lg" (click)="rejectPrompt(indent)">Reject</button>
          <button class="btn btn-lg" style="background:#e8a817;color:#1a3a5c;font-weight:700" (click)="sendToCoordinator(indent)">Send to Coordinator</button>
        </div>
      </div>
      <!-- Approval remarks -->
      <div *ngIf="activeAction === indent.indentId" style="margin-top:12px">
        <textarea class="form-textarea" [(ngModel)]="remarks" [placeholder]="actionType === 'reject' ? 'Remarks are mandatory for rejection *' : 'Optional remarks...'" rows="2"></textarea>
        <div class="btn-group" style="margin-top:8px">
          <button class="btn btn-accent btn-sm" (click)="confirmAction(indent)">Confirm {{ actionType === 'reject' ? 'Rejection' : 'Approval' }}</button>
          <button class="btn btn-outline btn-sm" (click)="activeAction = ''">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <div *ngIf="pendingRequests.length === 0" class="card" style="text-align:center;padding:40px">
    <p class="text-secondary">No pending requests to review. All caught up!</p>
  </div>

  <!-- Detail Modal -->
  <div class="modal-overlay" *ngIf="showDetailModal" (click)="showDetailModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ detailIndent?.indentId }} - Full Details</h2><button class="modal-close" (click)="showDetailModal = false">&times;</button></div>
      <div class="modal-body" *ngIf="detailIndent">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ detailIndent.category }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ detailIndent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Buildings</span><span class="info-value">{{ detailIndent.buildingNames?.join(', ') }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ detailIndent.raisedBy }}</span></div>
          <div class="info-item"><span class="info-label">Request Date</span><span class="info-value">{{ detailIndent.requestDateTime }}</span></div>
          <div class="info-item"><span class="info-label">Consultants Required</span><span class="info-value">{{ detailIndent.numConsultantsRequired }}</span></div>
        </div>
        <h3 style="margin:16px 0 8px">Scope of Work</h3>
        <p style="background:var(--border-light);padding:12px;border-radius:var(--radius-sm)">{{ detailIndent.scopeOfWork }}</p>
        <h3 style="margin:16px 0 8px">Proposed Consultants</h3>
        <div *ngFor="let c of detailIndent.proposedConsultants" class="card" style="margin-bottom:8px">
          <strong>{{ c.firm }}</strong> | Contact: {{ c.contact || '-' }} | Phone: {{ c.phone || '-' }} | Email: {{ c.email || '-' }} | Location: {{ c.location || '-' }}
        </div>
        <div *ngIf="detailIndent.itemList?.length">
          <h3 style="margin:16px 0 8px">Item List</h3>
          <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>UOM</th><th>Expected Date</th></tr></thead>
          <tbody><tr *ngFor="let item of detailIndent.itemList; let i = index"><td>{{ i+1 }}</td><td>{{ item.description }}</td><td>{{ item.quantity }}</td><td>{{ item.uom }}</td><td>{{ item.expectedDate }}</td></tr></tbody></table>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class DesignHeadApprovalComponent implements OnInit {
  indentList: IndentRequest[] = [];
  remarks = '';
  activeAction = '';
  actionType = '';
  showDetailModal = false;
  detailIndent: IndentRequest | null = null;
  approvedToday = 0;
  rejectedToday = 0;
  totalProcessed = 0;

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }

  ngOnInit() {}

  get pendingRequests(): IndentRequest[] {
    return this.indentList.filter(i => i.status === 'Pending DH Review');
  }

  viewDetails(indent: IndentRequest) { this.detailIndent = indent; this.showDetailModal = true; }

  approve(indent: IndentRequest) { this.activeAction = indent.indentId; this.actionType = 'approve'; this.remarks = ''; }
  rejectPrompt(indent: IndentRequest) { this.activeAction = indent.indentId; this.actionType = 'reject'; this.remarks = ''; }

  sendToCoordinator(indent: IndentRequest) {
    this.dataService.designHeadApprove(indent.indentId);
    this.approvedToday++;
    this.totalProcessed++;
  }

  confirmAction(indent: IndentRequest) {
    if (this.actionType === 'reject' && !this.remarks.trim()) {
      this.dataService.addNotification('Remarks are mandatory for rejection', 'error');
      return;
    }
    if (this.actionType === 'reject') {
      this.dataService.designHeadReject(indent.indentId, this.remarks);
      this.rejectedToday++;
    } else {
      this.dataService.designHeadApprove(indent.indentId, this.remarks);
      this.approvedToday++;
    }
    this.totalProcessed++;
    this.activeAction = '';
    this.remarks = '';
  }
}
