import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest, WorkOrder } from '../../core/models';

@Component({
  selector: 'app-contract-team-member',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Contract Team Member Portal</h1><p>Portal 4 - Accept/Decline assignments, create work orders</p></div>
    <div class="btn-group">
      <div class="filter-pills">
        <span class="filter-pill" [class.active]="memberFilter === 'my'" (click)="memberFilter = 'my'">My Assignments</span>
        <span class="filter-pill" [class.active]="memberFilter === 'all'" (click)="memberFilter = 'all'">All Members</span>
      </div>
      <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
    </div>
  </div>

  <!-- Assigned Items -->
  <div class="section"><h2>My Assignments</h2>
    <div class="card-grid">
      <div class="card" *ngFor="let indent of myAssignments">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong>{{ indent.indentId }}</strong>
          <span class="badge" [class.badge-warning]="indent.status==='Indent Raised'" [class.badge-info]="indent.status==='Accepted'" [class.badge-danger]="indent.status==='CH Rejected'">{{ indent.status }}</span>
        </div>
        <div class="text-sm"><strong>Consultant Type:</strong> {{ indent.consultantType || '-' }} | <strong>Project:</strong> {{ indent.techPark }}</div>
        <div class="text-sm"><strong>Raised By:</strong> {{ indent.raisedBy }} | <strong>Scope:</strong> {{ (indent.scopeOfWork || '').substring(0, 80) }}...</div>
        <div *ngIf="indent.coordNotes" class="text-sm"><strong>Coordinator Notes:</strong> {{ indent.coordNotes }}</div>
        <div *ngIf="indent.status === 'CH Rejected'" class="alert-panel"><strong>CH Rejected:</strong> {{ indent.chRemarks }}</div>

        <div *ngIf="indent.status === 'Indent Raised'" class="btn-group" style="margin-top:12px">
          <button class="btn btn-success btn-sm" (click)="acceptAssignment(indent)">Accept Assignment</button>
          <button class="btn btn-danger btn-sm" (click)="declinePrompt(indent)">Decline</button>
        </div>

        <div *ngIf="indent.status === 'Accepted' || indent.status === 'CH Rejected'" style="margin-top:12px">
          <div *ngIf="indent.woData?.length">
            <div *ngFor="let wo of indent.woData" class="text-sm" style="background:var(--border-light);padding:8px;border-radius:4px;margin-bottom:4px">
              WO: {{ wo.woId }} | Firm: {{ wo.consultantFirm }} | Fee: {{ wo.fee }} | Date: {{ wo.woDate }}
            </div>
          </div>
          <button class="btn btn-accent btn-sm" (click)="openWoForm(indent)">{{ indent.woData?.length ? 'Re-edit & Resubmit' : 'Edit & Submit' }}</button>
        </div>
      </div>
    </div>
    <div *ngIf="myAssignments.length === 0" class="card" style="text-align:center;padding:40px"><p class="text-secondary">No assignments.</p></div>
  </div>

  <!-- Work Order History -->
  <div class="section"><h2>Work Order History</h2>
    <div class="table-container">
      <table><thead><tr><th>Req ID</th><th>Category</th><th>Tech Park</th><th>Raised By</th><th>Decision Date</th><th>Status</th><th>View</th></tr></thead>
        <tbody>
          <tr *ngFor="let indent of woHistory">
            <td><strong>{{ indent.indentId }}</strong></td><td>{{ indent.category }}</td><td>{{ indent.techPark }}</td>
            <td>{{ indent.raisedBy }}</td><td class="text-sm">{{ indent.ctmWoReleasedDateTime || '-' }}</td>
            <td><span class="badge" [class.badge-success]="indent.status==='Completed'" [class.badge-danger]="indent.status==='CH Rejected'">{{ indent.status }}</span></td>
            <td><button class="btn btn-outline btn-sm" (click)="viewDetails(indent)">View</button></td>
          </tr>
        </tbody></table>
    </div>
  </div>

  <!-- Decline Modal -->
  <div class="modal-overlay" *ngIf="showDeclineModal" (click)="showDeclineModal = false">
    <div class="modal modal-sm" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Decline Assignment</h2><button class="modal-close" (click)="showDeclineModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Reason for declining <span class="required">*</span></label>
        <textarea class="form-textarea" [(ngModel)]="declineReason" rows="3" placeholder="Please provide a reason..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="showDeclineModal = false">Cancel</button>
        <button class="btn btn-danger" (click)="confirmDecline()" [disabled]="!declineReason.trim()">Confirm Decline</button>
      </div>
    </div>
  </div>

  <!-- WO Form Modal -->
  <div class="modal-overlay" *ngIf="showWoModal" (click)="showWoModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Work Order Details - {{ woIndent?.indentId }}</h2><button class="modal-close" (click)="showWoModal = false">&times;</button></div>
      <div class="modal-body">
        <div *ngFor="let slot of woSlots; let i = index" class="card" style="margin-bottom:16px">
          <h3 style="margin-bottom:12px">Consultant Slot {{ i + 1 }}</h3>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Selected Consultant <span class="required">*</span></label>
              <select class="form-select" [(ngModel)]="slot.consultantFirm">
                <option value="">Select...</option>
                <option *ngFor="let c of woIndent?.proposedConsultants" [value]="c.firm">{{ c.firm }}</option>
                <option value="Other">Other (Manual Entry)</option>
              </select>
              <input *ngIf="slot.consultantFirm === 'Other'" class="form-input" [(ngModel)]="slot.customFirm" placeholder="Enter firm name" style="margin-top:6px">
            </div>
            <div class="form-group"><label class="form-label">WO ID <span class="required">*</span></label><input class="form-input" [(ngModel)]="slot.woId" placeholder="e.g. WO-001"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">WO Release Date <span class="required">*</span></label><input class="form-input" type="date" [(ngModel)]="slot.woDate"></div>
            <div class="form-group"><label class="form-label">Agreed Fee (INR) <span class="required">*</span></label><input class="form-input" [(ngModel)]="slot.fee" placeholder="e.g. Rs. 15,00,000"></div>
          </div>
          <div class="form-group"><label class="form-label">Approval / Negotiation Notes</label><textarea class="form-textarea" [(ngModel)]="slot.approvalNotes" rows="2"></textarea></div>
        </div>
        <div class="form-group"><label class="form-label">Contract Attachment</label>
          <div class="dropzone" style="padding:20px"><p>Drag & drop or click to upload (PDF, DOCX, Images)</p></div>
        </div>
        <div class="form-group"><label class="form-label">Final Approval Notes</label><textarea class="form-textarea" [(ngModel)]="finalNotes" rows="2" placeholder="Concluding remarks..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="saveWoDraft()">Save Draft</button>
        <button class="btn btn-accent" (click)="submitWorkOrder()">Submit to Contract Head</button>
      </div>
    </div>
  </div>

  <!-- Detail Modal -->
  <div class="modal-overlay" *ngIf="showDetailModal && detailIndent" (click)="showDetailModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ detailIndent.indentId }} - Details</h2><button class="modal-close" (click)="showDetailModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Status</span><span class="info-value">{{ detailIndent.status }}</span></div>
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ detailIndent.category }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ detailIndent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ detailIndent.raisedBy }}</span></div>
        </div>
        <div *ngIf="detailIndent.woData?.length">
          <h3 style="margin:16px 0 8px">Work Orders</h3>
          <table><thead><tr><th>WO ID</th><th>Firm</th><th>Fee</th><th>Date</th><th>Notes</th></tr></thead>
            <tbody><tr *ngFor="let wo of detailIndent.woData"><td>{{ wo.woId }}</td><td>{{ wo.consultantFirm }}</td><td>{{ wo.fee }}</td><td>{{ wo.woDate }}</td><td class="text-sm">{{ wo.remarks || '-' }}</td></tr></tbody></table>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class ContractTeamMemberComponent implements OnInit {
  indentList: IndentRequest[] = [];
  memberFilter = 'my';
  showDeclineModal = false;
  showWoModal = false;
  showDetailModal = false;
  declineIndent: IndentRequest | null = null;
  declineReason = '';
  woIndent: IndentRequest | null = null;
  woSlots: any[] = [];
  finalNotes = '';
  detailIndent: IndentRequest | null = null;

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }
  ngOnInit() {}

  get myAssignments(): IndentRequest[] {
    const name = this.dataService.getCurrentUser().name;
    return this.indentList.filter(i => i.assignee === name && ['Indent Raised', 'Accepted', 'CH Rejected'].includes(i.status));
  }
  get woHistory(): IndentRequest[] {
    const name = this.dataService.getCurrentUser().name;
    return this.indentList.filter(i => i.assignee === name && ['Accepted', 'CH Rejected', 'Completed'].includes(i.status));
  }

  acceptAssignment(indent: IndentRequest) { this.dataService.ctmAccept(indent.indentId); }
  declinePrompt(indent: IndentRequest) { this.declineIndent = indent; this.declineReason = ''; this.showDeclineModal = true; }
  confirmDecline() {
    if (this.declineIndent) { this.dataService.ctmDecline(this.declineIndent.indentId, this.declineReason); this.showDeclineModal = false; }
  }
  openWoForm(indent: IndentRequest) {
    this.woIndent = indent;
    this.woSlots = [];
    for (let i = 0; i < indent.numConsultantsRequired; i++) {
      const existing = indent.woData?.[i];
      this.woSlots.push({
        consultantFirm: existing?.consultantFirm || '', customFirm: '',
        woId: existing?.woId || '', woDate: existing?.woDate || '',
        fee: existing?.fee || '', approvalNotes: existing?.approvalNotes || '', remarks: existing?.remarks || ''
      });
    }
    this.showWoModal = true;
  }
  submitWorkOrder() {
    if (!this.woIndent) return;
    const valid = this.woSlots.every((s: any) => {
      const firm = s.consultantFirm === 'Other' ? s.customFirm : s.consultantFirm;
      return firm && s.woId && s.woDate && s.fee;
    });
    if (!valid) { this.dataService.addNotification('All WO fields are mandatory', 'error'); return; }
    const woData = this.woSlots.map((s: any) => ({
      consultantFirm: s.consultantFirm === 'Other' ? s.customFirm : s.consultantFirm,
      woId: s.woId, woDate: s.woDate, fee: s.fee,
      remarks: s.remarks, approvalNotes: s.approvalNotes,
      finalApprovalNotes: this.finalNotes
    }));
    this.dataService.ctmSubmitWorkOrder(this.woIndent.indentId, woData);
    this.showWoModal = false;
  }
  saveWoDraft() { this.dataService.addNotification('WO draft saved', 'success'); this.showWoModal = false; }
  viewDetails(indent: IndentRequest) { this.detailIndent = indent; this.showDetailModal = true; }
}
