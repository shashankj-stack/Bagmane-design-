import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest, ProposedConsultant, LineItem } from '../../core/models';

@Component({
  selector: 'app-raise-indent',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section">
      <h1>Consultant Onboarding - Raise Indent</h1>
      <p>Portal 1 - Submit new indent requests for consultant onboarding</p>
    </div>
    <div class="btn-group">
      <button class="btn btn-accent" (click)="openRaiseRequestModal()">+ Raise Request</button>
      <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">{{ totalIndents }}</div><div class="stat-label">Total Indents</div></div>
    <div class="stat-card"><div class="stat-value">{{ pendingCount }}</div><div class="stat-label">Pending DH Review</div></div>
    <div class="stat-card"><div class="stat-value">{{ approvedCount }}</div><div class="stat-label">DH Approved</div></div>
    <div class="stat-card"><div class="stat-value">{{ completedCount }}</div><div class="stat-label">Completed</div></div>
  </div>

  <!-- Filter Pills -->
  <div class="filter-pills">
    <span class="filter-pill" [class.active]="personFilter === 'all'" (click)="personFilter = 'all'">All</span>
    <span class="filter-pill" [class.active]="personFilter === 'my'" (click)="personFilter = 'my'">My Requests</span>
    <span class="filter-pill" *ngFor="let p of uniquePeople" [class.active]="personFilter === p" (click)="personFilter = p">{{ p }}</span>
  </div>

  <!-- Filter Bar -->
  <div class="filter-bar">
    <input class="form-input" placeholder="Search by Request ID or name..." [(ngModel)]="searchText" style="min-width:250px">
    <select class="form-select" [(ngModel)]="categoryFilter"><option value="all">All Categories</option><option value="General">General</option><option value="Consultant Onboarding">Consultant Onboarding</option></select>
    <select class="form-select" [(ngModel)]="statusFilter"><option value="all">All Statuses</option><option value="Draft">Draft</option><option value="Pending DH Review">Pending DH Review</option><option value="DH Approved">DH Approved</option><option value="Rejected">Rejected</option><option value="Indent Raised">Indent Raised</option><option value="Accepted">Accepted</option><option value="CH Rejected">CH Rejected</option><option value="Completed">Completed</option></select>
    <button class="btn btn-outline btn-sm" (click)="clearFilters()">Clear</button>
  </div>

  <!-- Table -->
  <div class="table-container">
    <table>
      <thead><tr>
        <th>Indent ID</th><th>Category</th><th>Tech Park</th><th>Building</th><th>Consultant Type</th>
        <th>Request Date/Time</th><th>Raised By</th><th>CTM Assigned</th><th>No. Required</th>
        <th>Scope of Work</th><th>CTH Approval</th><th>Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let indent of filteredIndents" [class.highlight]="indent.raisedBy === dataService.getCurrentUser().name">
          <td><strong>{{ indent.indentId }}</strong></td>
          <td><span class="badge" [class.badge-info]="indent.category==='Consultant Onboarding'" [class.badge-light]="indent.category==='General'">{{ indent.category }}</span></td>
          <td>{{ indent.techPark }}</td>
          <td>{{ indent.buildingNames?.join(', ') }}</td>
          <td>{{ indent.consultantType || '-' }}</td>
          <td class="text-sm">{{ indent.requestDateTime }}</td>
          <td>{{ indent.raisedBy }}</td>
          <td>{{ indent.assignee || '-' }}</td>
          <td>{{ indent.numConsultantsRequired }}</td>
          <td class="text-sm" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ indent.scopeOfWork }}</td>
          <td>
            <span *ngIf="indent.status === 'Completed'" class="badge badge-success">Approved</span>
            <span *ngIf="indent.status === 'CH Rejected'" class="badge badge-danger">Rejected</span>
            <span *ngIf="indent.status !== 'Completed' && indent.status !== 'CH Rejected' && (indent.status === 'Accepted' || indent.chApprovedDateTime)" class="badge badge-warning">Pending</span>
            <span *ngIf="!indent.chApprovedDateTime && indent.status !== 'Accepted'" class="text-sm text-secondary">-</span>
          </td>
          <td><span class="badge" [class]="statusBadgeClass(indent.status)">{{ indent.status }}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-outline btn-sm" (click)="viewDetails(indent)">View</button>
              <button *ngIf="indent.status === 'Draft'" class="btn btn-accent btn-sm" (click)="submitDraft(indent)">Submit</button>
              <button *ngIf="indent.status === 'Completed' && !indent.kickstartSent" class="btn btn-success btn-sm" (click)="sendKickstart(indent)">Send Kickstart</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- CH Approved Section -->
  <div class="section" style="margin-top:32px" *ngIf="chApprovedIndents.length > 0">
    <div class="section-header">
      <h2>Contract Head Approved Indents</h2>
      <span class="badge badge-success">{{ chApprovedIndents.length }} Approved</span>
    </div>
    <div class="table-container">
      <table>
        <thead><tr><th>Indent ID</th><th>Category</th><th>Tech Park</th><th>Building</th><th>Consultant Type</th><th>Scope</th><th>Raised By</th><th>CTM</th><th>WO ID</th><th>CH Approved On</th><th>Kickstart</th><th>View</th></tr></thead>
        <tbody>
          <tr *ngFor="let indent of chApprovedIndents">
            <td><strong>{{ indent.indentId }}</strong></td>
            <td>{{ indent.category }}</td><td>{{ indent.techPark }}</td>
            <td>{{ indent.buildingNames?.join(', ') }}</td><td>{{ indent.consultantType || '-' }}</td>
            <td class="text-sm" style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ indent.scopeOfWork }}</td>
            <td>{{ indent.raisedBy }}</td><td>{{ indent.assignee }}</td>
            <td>{{ indent.woData?.[0]?.woId || '-' }}</td><td class="text-sm">{{ indent.chApprovedDateTime }}</td>
            <td>
              <button *ngIf="!indent.kickstartSent" class="btn btn-success btn-sm" (click)="sendKickstart(indent)">Send Kickstart</button>
              <span *ngIf="indent.kickstartSent" class="badge badge-success">Sent</span>
            </td>
            <td><button class="btn btn-outline btn-sm" (click)="viewDetails(indent)">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Raise Request Modal -->
  <div class="modal-overlay" *ngIf="showRaiseModal" (click)="closeRaiseModal($event)">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h2>Raise New Indent Request</h2>
        <button class="modal-close" (click)="showRaiseModal = false">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Section A: Indent Details -->
        <h3 style="margin-bottom:16px;color:var(--primary)">Section A - Indent Details</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select class="form-select" [(ngModel)]="newIndent.category"><option value="">Select...</option><option value="General">General</option><option value="Consultant Onboarding">Consultant Onboarding</option></select>
          </div>
          <div class="form-group">
            <label class="form-label">Type of Consultant <span class="required" *ngIf="newIndent.category === 'Consultant Onboarding'">*</span></label>
            <select class="form-select" [(ngModel)]="newIndent.consultantType" [disabled]="newIndent.category === 'General'">
              <option value="">Select...</option><option value="Architect">Architect</option><option value="Structural Engineer">Structural Engineer</option><option value="MEP Engineer">MEP Engineer</option><option value="Landscape Architect">Landscape Architect</option><option value="Interior Designer">Interior Designer</option><option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tech Park <span class="required">*</span></label>
            <select class="form-select" [(ngModel)]="newIndent.techPark" (change)="onTechParkChange()">
              <option value="">Select Tech Park...</option><option>Bagmane Tech Park</option><option>Bagmane World Trade Center</option><option>Bagmane Constellation</option><option>Bagmane Capital</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Building(s) <span class="required">*</span></label>
            <select class="form-select" [(ngModel)]="newIndent.buildingNames" multiple style="height:100px">
              <option *ngFor="let b of availableBuildings" [value]="b">{{ b }}</option>
            </select>
            <div class="form-hint">Hold Ctrl/Cmd to select multiple. Or type custom name below.</div>
            <input class="form-input" placeholder="+ Add custom building name" [(ngModel)]="customBuilding" (keyup.enter)="addCustomBuilding()" style="margin-top:6px;font-size:0.8rem">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Scope of Work <span class="required">*</span></label>
          <textarea class="form-textarea" [(ngModel)]="newIndent.scopeOfWork" rows="3" placeholder="Describe the scope of work for this consultancy..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">No. of Consultants Required <span class="required">*</span></label><input class="form-input" type="number" [(ngModel)]="newIndent.numConsultantsRequired" min="1" max="10"></div>
          <div class="form-group"><label class="form-label">RFP Date of Release</label><input class="form-input" type="date" [(ngModel)]="newIndent.rfpDate"></div>
        </div>
        <div class="form-group form-toggle">
          <input type="checkbox" [(ngModel)]="newIndent.mgmtSignOn" id="mgmtSign">
          <label for="mgmtSign">Management Sign-on Required</label>
        </div>
        <div class="form-group" *ngIf="newIndent.mgmtSignOn">
          <label class="form-label">Date of Management Sign-on <span class="required">*</span></label>
          <input class="form-input" type="date" [(ngModel)]="newIndent.mgmtSignOnDate">
        </div>

        <!-- Section B: Proposed Consultants -->
        <h3 style="margin:24px 0 16px;color:var(--primary)">Section B - Proposed Consultants</h3>
        <div *ngFor="let consultant of newIndent.proposedConsultants; let i = index" class="card" style="margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <strong>Consultant {{ i + 1 }}</strong>
            <button class="btn btn-danger btn-sm" (click)="removeConsultant(i)" *ngIf="newIndent.proposedConsultants.length > 1" title="Remove">&times;</button>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Firm Name <span class="required">*</span></label><input class="form-input" [(ngModel)]="consultant.firm" placeholder="Enter firm name" list="firmList"><datalist id="firmList"><option>Artech Studio</option><option>StructWorks India</option><option>MEP Consultants Ltd</option><option>GreenScape Design</option><option>PowerTech Solutions</option><option>InteriorCraft Ltd</option><option>HVAC Pro Solutions</option></datalist></div>
            <div class="form-group"><label class="form-label">Contact Person</label><input class="form-input" [(ngModel)]="consultant.contact" placeholder="Contact name"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Phone</label><input class="form-input" [(ngModel)]="consultant.phone" placeholder="Phone number"></div>
            <div class="form-group"><label class="form-label">Email</label><input class="form-input" [(ngModel)]="consultant.email" placeholder="Email address"></div>
            <div class="form-group"><label class="form-label">Location</label><input class="form-input" [(ngModel)]="consultant.location" placeholder="City"></div>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" (click)="addConsultant()">+ Add Another Consultant</button>

        <!-- Item List -->
        <h3 style="margin:24px 0 16px;color:var(--primary)">Item List (Optional)</h3>
        <div *ngFor="let item of newIndent.itemList; let i = index" class="form-row" style="margin-bottom:8px">
          <div class="form-group"><input class="form-input" [(ngModel)]="item.description" placeholder="Description" style="font-size:0.8rem"></div>
          <div class="form-group"><input class="form-input" type="number" [(ngModel)]="item.quantity" placeholder="Qty" style="font-size:0.8rem;width:80px"></div>
          <div class="form-group"><input class="form-input" [(ngModel)]="item.uom" placeholder="UOM" style="font-size:0.8rem;width:80px"></div>
          <div class="form-group"><input class="form-input" type="date" [(ngModel)]="item.expectedDate" style="font-size:0.8rem"></div>
          <button class="btn btn-danger btn-sm" (click)="removeItem(i)">&times;</button>
        </div>
        <button class="btn btn-outline btn-sm" (click)="addItem()">+ Add Line Item</button>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="saveAsDraft()">Save as Draft</button>
        <button class="btn btn-accent btn-lg" (click)="submitIndent()">Submit Request</button>
      </div>
    </div>
  </div>

  <!-- View Details Modal -->
  <div class="modal-overlay" *ngIf="showDetailsModal" (click)="showDetailsModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h2>{{ selectedIndent?.indentId }} - Indent Details</h2>
        <button class="modal-close" (click)="showDetailsModal = false">&times;</button>
      </div>
      <div class="modal-body" *ngIf="selectedIndent">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Request ID</span><span class="info-value">{{ selectedIndent.indentId }}</span></div>
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ selectedIndent.category }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ selectedIndent.raisedBy }}</span></div>
          <div class="info-item"><span class="info-label">Request Date</span><span class="info-value">{{ selectedIndent.requestDateTime }}</span></div>
          <div class="info-item"><span class="info-label">Consultant Type</span><span class="info-value">{{ selectedIndent.consultantType || '-' }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ selectedIndent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Building(s)</span><span class="info-value">{{ selectedIndent.buildingNames?.join(', ') }}</span></div>
          <div class="info-item"><span class="info-label">No. Required</span><span class="info-value">{{ selectedIndent.numConsultantsRequired }}</span></div>
          <div class="info-item"><span class="info-label">Status</span><span class="info-value"><span class="badge" [class]="statusBadgeClass(selectedIndent.status)">{{ selectedIndent.status }}</span></span></div>
          <div class="info-item"><span class="info-label">DH Approval</span><span class="info-value">{{ selectedIndent.approvedDateTime || 'Pending' }}</span></div>
        </div>
        <h3 style="margin:20px 0 12px">Scope of Work</h3>
        <p style="background:var(--border-light);padding:12px;border-radius:var(--radius-sm)">{{ selectedIndent.scopeOfWork }}</p>
        <div *ngIf="selectedIndent.dhRemarks" class="alert-panel"><strong>DH Remarks:</strong> {{ selectedIndent.dhRemarks }}</div>
        <div *ngIf="selectedIndent.chRemarks" class="alert-panel"><strong>CH Remarks:</strong> {{ selectedIndent.chRemarks }}</div>
        <h3 style="margin:20px 0 12px">Proposed Consultants</h3>
        <div class="card-grid">
          <div class="card" *ngFor="let c of selectedIndent.proposedConsultants">
            <strong>{{ c.firm }}</strong>
            <div class="text-sm text-secondary">Contact: {{ c.contact || '-' }}</div>
            <div class="text-sm text-secondary">Phone: {{ c.phone || '-' }} | Email: {{ c.email || '-' }}</div>
            <div class="text-sm text-secondary">Location: {{ c.location || '-' }}</div>
          </div>
        </div>
        <div *ngIf="selectedIndent.itemList?.length">
          <h3 style="margin:20px 0 12px">Item List</h3>
          <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>UOM</th><th>Expected Date</th></tr></thead>
            <tbody><tr *ngFor="let item of selectedIndent.itemList; let i = index"><td>{{ i+1 }}</td><td>{{ item.description }}</td><td>{{ item.quantity }}</td><td>{{ item.uom }}</td><td>{{ item.expectedDate }}</td></tr></tbody></table>
        </div>
        <h3 style="margin:20px 0 12px">Activity Timeline</h3>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let event of activityTimeline">
            <div style="font-weight:600">{{ event.event }}</div>
            <div class="text-sm text-secondary">{{ event.timestamp }} - {{ event.actor }}</div>
            <div class="text-sm">{{ event.details }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Kickstart Email Modal -->
  <div class="modal-overlay" *ngIf="showKickstartModal" (click)="showKickstartModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Send Kickstart Email</h2><button class="modal-close" (click)="showKickstartModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">To - Consultant Email(s)</label><input class="form-input" [ngModel]="kickstartEmail.to"></div>
        <div class="form-group"><label class="form-label">CC</label><input class="form-input" [(ngModel)]="kickstartEmail.cc" placeholder="Add CC recipients"></div>
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" [ngModel]="kickstartEmail.subject"></div>
        <div class="form-group"><label class="form-label">Email Body</label><textarea class="form-textarea" [(ngModel)]="kickstartEmail.body" rows="8"></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="showKickstartModal = false">Cancel</button>
        <button class="btn btn-accent" (click)="sendKickstartEmail()">Send Email Now</button>
      </div>
    </div>
  </div>
</div>
`,
  styles: [`
    .page-container { padding-bottom: 60px; }
  `]
})
export class RaiseIndentComponent {
  searchText = '';
  categoryFilter = 'all';
  statusFilter = 'all';
  personFilter = 'all';
  showRaiseModal = false;
  showDetailsModal = false;
  showKickstartModal = false;
  selectedIndent: IndentRequest | null = null;
  customBuilding = '';

  newIndent: any = this.getEmptyIndent();
  availableBuildings: string[] = ['Block A', 'Block B', 'Block C', 'Tower A', 'Tower B', 'South Wing', 'North Wing', 'Phase 1', 'Phase 2 Block'];

  kickstartEmail = { to: '', cc: '', subject: '', body: '' };

  indentList: IndentRequest[] = [];

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }

  get filteredIndents(): IndentRequest[] {
    let list = this.indentList;
    if (this.searchText) {
      const s = this.searchText.toLowerCase();
      list = list.filter(i => i.indentId.toLowerCase().includes(s) || i.raisedBy.toLowerCase().includes(s) || i.techPark.toLowerCase().includes(s));
    }
    if (this.categoryFilter !== 'all') list = list.filter(i => i.category === this.categoryFilter);
    if (this.statusFilter !== 'all') list = list.filter(i => i.status === this.statusFilter);
    if (this.personFilter === 'my') list = list.filter(i => i.raisedBy === this.dataService.getCurrentUser().name);
    else if (this.personFilter !== 'all') list = list.filter(i => i.raisedBy === this.personFilter);
    return list;
  }

  get chApprovedIndents(): IndentRequest[] {
    return this.indentList.filter(i => i.status === 'Completed');
  }

  get totalIndents(): number { return this.indentList.length; }
  get pendingCount(): number { return this.indentList.filter(i => i.status === 'Pending DH Review').length; }
  get approvedCount(): number { return this.indentList.filter(i => i.status === 'DH Approved').length; }
  get completedCount(): number { return this.indentList.filter(i => i.status === 'Completed').length; }
  get uniquePeople(): string[] { return [...new Set(this.indentList.map(i => i.raisedBy))]; }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Draft': 'badge-light', 'Pending DH Review': 'badge-warning', 'DH Approved': 'badge-info',
      'Rejected': 'badge-danger', 'Indent Raised': 'badge-primary', 'Accepted': 'badge-info',
      'CH Rejected': 'badge-danger', 'Completed': 'badge-success'
    };
    return map[status] || 'badge-light';
  }

  clearFilters() { this.searchText = ''; this.categoryFilter = 'all'; this.statusFilter = 'all'; this.personFilter = 'all'; }

  getEmptyIndent() {
    return {
      category: '', consultantType: '', techPark: '', buildingNames: [] as string[],
      numConsultantsRequired: 1, scopeOfWork: '', description: '', rfpDate: '',
      mgmtSignOn: false, mgmtSignOnDate: '',
      proposedConsultants: [{ firm: '', contact: '', phone: '', email: '', location: '' }],
      itemList: [] as any[]
    };
  }

  onTechParkChange() { this.newIndent.buildingNames = []; }

  addCustomBuilding() {
    if (this.customBuilding.trim()) {
      if (!this.newIndent.buildingNames.includes(this.customBuilding.trim())) {
        this.newIndent.buildingNames = [...this.newIndent.buildingNames, this.customBuilding.trim()];
      }
      this.customBuilding = '';
    }
  }

  addConsultant() { this.newIndent.proposedConsultants.push({ firm: '', contact: '', phone: '', email: '', location: '' }); }
  removeConsultant(i: number) { if (this.newIndent.proposedConsultants.length > 1) this.newIndent.proposedConsultants.splice(i, 1); }
  addItem() { this.newIndent.itemList.push({ slNo: this.newIndent.itemList.length + 1, description: '', quantity: 1, uom: '', expectedDate: '' }); }
  removeItem(i: number) { this.newIndent.itemList.splice(i, 1); }

  openRaiseRequestModal() { this.newIndent = this.getEmptyIndent(); this.showRaiseModal = true; }

  closeRaiseModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) this.showRaiseModal = false;
  }

  submitIndent() {
    if (!this.newIndent.category || !this.newIndent.techPark || !this.newIndent.buildingNames?.length || !this.newIndent.scopeOfWork) {
      this.dataService.addNotification('Please fill all mandatory fields', 'error');
      return;
    }
    if (this.newIndent.category === 'Consultant Onboarding' && !this.newIndent.consultantType) {
      this.dataService.addNotification('Type of Consultant is required for Consultant Onboarding', 'error');
      return;
    }
    if (!this.newIndent.proposedConsultants[0]?.firm) {
      this.dataService.addNotification('At least one consultant is required', 'error');
      return;
    }
    const indent: IndentRequest = {
      ...this.newIndent,
      raisedBy: this.dataService.getCurrentUser().name,
      status: 'Pending DH Review',
      indentId: '',
      requestDateTime: '',
      mgmtSignOn: this.newIndent.mgmtSignOn || false
    };
    this.dataService.addIndent(indent);
    this.showRaiseModal = false;
  }

  saveAsDraft() {
    const indent: IndentRequest = {
      ...this.newIndent,
      raisedBy: this.dataService.getCurrentUser().name,
      status: 'Draft',
      indentId: '',
      requestDateTime: '',
      mgmtSignOn: this.newIndent.mgmtSignOn || false
    };
    this.dataService.saveDraft(indent);
    this.showRaiseModal = false;
  }

  submitDraft(indent: IndentRequest) {
    this.dataService.submitDraft(indent.indentId);
  }

  viewDetails(indent: IndentRequest) {
    this.selectedIndent = indent;
    this.showDetailsModal = true;
  }

  get activityTimeline() {
    if (!this.selectedIndent) return [];
    return this.dataService.getActivityTimeline(this.selectedIndent.indentId);
  }

  sendKickstart(indent: IndentRequest) {
    this.selectedIndent = indent;
    const consultant = indent.proposedConsultants[0];
    this.kickstartEmail = {
      to: consultant?.email || '',
      cc: '',
      subject: `Kickstart Meeting - ${indent.indentId} - ${indent.techPark} - ${consultant?.firm || ''}`,
      body: `Dear ${consultant?.contact || 'Team'},\n\nThis is to schedule the kickstart meeting for the consultant onboarding of ${consultant?.firm || 'your firm'} for ${indent.techPark} (${indent.buildingNames?.join(', ')}).\n\nAgenda:\n1. Introduction & Project Brief\n2. Scope of Work Review: ${indent.scopeOfWork}\n3. Timeline & Deliverables\n4. Contractual & Commercial Terms\n5. Next Steps\n\nPlease confirm your availability for the meeting.\n\nRegards,\n${this.dataService.getCurrentUser().name}\nBagmane Group`
    };
    this.showKickstartModal = true;
  }

  sendKickstartEmail() {
    if (this.selectedIndent) {
      this.dataService.sendKickstart(this.selectedIndent.indentId);
      this.showKickstartModal = false;
    }
  }
}
