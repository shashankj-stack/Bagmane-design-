import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Deliverable, DesignStage, FinalStatus } from '../../core/models';

@Component({
  selector: 'app-deliverables-tracker',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Deliverables Tracker</h1><p>Track deliverables across 7 design stages with multi-tier approval workflow</p></div>
    <div class="btn-group">
      <button class="btn btn-accent btn-sm" (click)="openAddDeliverable()">+ Add Deliverable</button>
      <button class="btn btn-outline btn-sm" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
    </div>
  </div>

  <!-- Stage Dashboards -->
  <div class="stats-row">
    <div class="stat-card"><div class="stat-value">{{ completedCount }}</div><div class="stat-label">Completed</div></div>
    <div class="stat-card"><div class="stat-value">{{ inProgressCount }}</div><div class="stat-label">In Progress</div></div>
    <div class="stat-card"><div class="stat-value">{{ pendingCount }}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card"><div class="stat-value">{{ notStartedCount }}</div><div class="stat-label">Not Started</div></div>
  </div>

  <!-- Group Filter Pills -->
  <div class="filter-pills">
    <span class="filter-pill" [class.active]="groupFilter === 'all'" (click)="groupFilter = 'all'">All ({{ deliverables.length }})</span>
    <span class="filter-pill" *ngFor="let g of uniqueGroups" [class.active]="groupFilter === g" (click)="groupFilter = g">{{ g }} ({{ countByGroup(g) }})</span>
  </div>

  <!-- Bulk Actions -->
  <div class="filter-bar" *ngIf="selectedIds.length > 0">
    <span><strong>{{ selectedIds.length }}</strong> items selected</span>
    <button class="btn btn-accent btn-sm" (click)="bulkAssign()">Assign to Selected</button>
    <button class="btn btn-outline btn-sm" (click)="selectedIds = []">Clear Selection</button>
  </div>

  <!-- Deliverables Table -->
  <div class="table-container">
    <table>
      <thead><tr>
        <th><input type="checkbox" (change)="toggleSelectAll($event)" [checked]="allSelected"></th>
        <th>Project</th><th>Consultant</th><th>Stage</th><th>Group</th><th>Floor</th>
        <th>Deliverable Name</th><th>Work Initiated</th><th>Submitted</th><th>Due Date</th>
        <th>Delay</th><th>Time Taken</th><th>Rev No</th><th>Submission</th>
        <th>Design Team</th><th>Design Head</th><th>MEP</th><th>Project Head</th><th>Liaison</th><th>MD</th>
        <th>IFC Status</th><th>Final Status</th><th>Actions</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let d of filteredDeliverables">
          <td><input type="checkbox" [checked]="selectedIds.includes(d.id)" (change)="toggleSelect(d.id)"></td>
          <td>{{ d.projectName }}</td><td>{{ d.consultant }}</td>
          <td><span class="badge badge-light">{{ d.stage }}</span></td>
          <td><span class="pill">{{ d.group || '-' }}</span></td>
          <td>{{ d.floor || '-' }}</td>
          <td><strong>{{ d.deliverableName }}</strong></td>
          <td class="text-sm">{{ d.workInitiatedDate }}</td>
          <td class="text-sm">{{ d.submittedDate || '-' }}</td>
          <td class="text-sm">{{ d.dueDate }}</td>
          <td><span *ngIf="d.delay" class="badge badge-danger">{{ d.delay }}d</span><span *ngIf="!d.delay">-</span></td>
          <td class="text-sm">{{ d.timeTaken || '-' }}</td>
          <td>Rev {{ d.revNo }}</td>
          <td><span class="badge" [class.badge-success]="d.submissionStatus==='Submitted'" [class.badge-info]="d.submissionStatus==='Submitted'" [class.badge-warning]="d.submissionStatus==='Pending'" [class.badge-light]="d.submissionStatus==='Pending'">{{ d.submissionStatus }}</span></td>
          <td><span class="badge" [class.badge-success]="d.designTeamApproval==='Approved'" [class.badge-danger]="d.designTeamApproval==='Rejected'" [class.badge-light]="d.designTeamApproval==='Pending'">{{ d.designTeamApproval }}</span></td>
          <td><span class="badge" [class.badge-success]="d.designHeadApproval==='Approved'" [class.badge-danger]="d.designHeadApproval==='Rejected'" [class.badge-light]="d.designHeadApproval==='Pending'">{{ d.designHeadApproval }}</span></td>
          <td><span class="badge" [class.badge-success]="d.mepApproval==='Approved'" [class.badge-danger]="d.mepApproval==='Rejected'" [class.badge-light]="d.mepApproval==='Pending'">{{ d.mepApproval }}</span></td>
          <td><span class="badge" [class.badge-success]="d.projectHeadApproval==='Approved'" [class.badge-danger]="d.projectHeadApproval==='Rejected'" [class.badge-light]="d.projectHeadApproval==='Pending'">{{ d.projectHeadApproval }}</span></td>
          <td><span class="badge" [class.badge-success]="d.liaisonApproval==='Approved'" [class.badge-danger]="d.liaisonApproval==='Rejected'" [class.badge-light]="d.liaisonApproval==='Pending'">{{ d.liaisonApproval }}</span></td>
          <td><span class="badge" [class.badge-success]="d.mdApproval==='Approved'" [class.badge-danger]="d.mdApproval==='Rejected'" [class.badge-light]="d.mdApproval==='Pending'">{{ d.mdApproval }}</span></td>
          <td><span *ngIf="d.ifcStatus" class="badge badge-info">{{ d.ifcStatus }}</span><span *ngIf="!d.ifcStatus">-</span></td>
          <td><span class="badge" [class.badge-success]="d.finalStatus==='Approved'||d.finalStatus==='Fully Approved'" [class.badge-warning]="d.finalStatus==='In Review'" [class.badge-danger]="d.finalStatus==='Needs Revision'||d.finalStatus==='Delayed'" [class.badge-info]="d.finalStatus==='On Track'">{{ d.finalStatus }}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-outline btn-sm" (click)="viewDetails(d)">View</button>
              <button class="btn btn-outline btn-sm" (click)="editDeliverable(d)">Edit</button>
              <button class="btn btn-warning btn-sm" (click)="sendReminder(d)">Notify</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Detail Modal -->
  <div class="modal-overlay" *ngIf="showDetailModal && detailDeliverable" (click)="showDetailModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ detailDeliverable.deliverableName }}</h2><button class="modal-close" (click)="showDetailModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Project</span><span class="info-value">{{ detailDeliverable.projectName }}</span></div>
          <div class="info-item"><span class="info-label">Consultant</span><span class="info-value">{{ detailDeliverable.consultant }}</span></div>
          <div class="info-item"><span class="info-label">Stage</span><span class="info-value">{{ detailDeliverable.stage }}</span></div>
          <div class="info-item"><span class="info-label">Floor</span><span class="info-value">{{ detailDeliverable.floor || '-' }}</span></div>
          <div class="info-item"><span class="info-label">Work Initiated</span><span class="info-value">{{ detailDeliverable.workInitiatedDate }}</span></div>
          <div class="info-item"><span class="info-label">Submitted</span><span class="info-value">{{ detailDeliverable.submittedDate || 'Not submitted' }}</span></div>
          <div class="info-item"><span class="info-label">Due Date</span><span class="info-value">{{ detailDeliverable.dueDate }}</span></div>
          <div class="info-item"><span class="info-label">Revision</span><span class="info-value">Rev {{ detailDeliverable.revNo }}</span></div>
        </div>
        <div *ngIf="detailDeliverable.documents?.length" style="margin-top:16px">
          <h3>Documents</h3>
          <div *ngFor="let doc of detailDeliverable.documents" class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <span>{{ doc.fileName }} ({{ (doc.fileSize / 1000000).toFixed(1) }} MB)</span>
            <button class="btn btn-outline btn-sm">Download</button>
          </div>
        </div>
        <h3 style="margin:16px 0 8px">Approval Timeline</h3>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let c of detailDeliverable.comments">
            <div style="font-weight:600">{{ c.author }} ({{ c.role }}) - {{ c.type }}</div>
            <div class="text-sm text-secondary">{{ c.timestamp }}</div>
            <div class="text-sm">{{ c.text }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Deliverable Modal -->
  <div class="modal-overlay" *ngIf="showAddModal" (click)="showAddModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ editingDeliverable ? 'Edit' : 'Add' }} Deliverable</h2><button class="modal-close" (click)="showAddModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Consultant <span class="required">*</span></label>
            <select class="form-select" [(ngModel)]="newDeliverable.consultant"><option value="">Select...</option><option>Artech Studio</option><option>MEP Consultants Ltd</option><option>StructWorks India</option><option>GreenScape Design</option><option>PowerTech Solutions</option></select></div>
          <div class="form-group"><label class="form-label">Deliverable Name <span class="required">*</span></label><input class="form-input" [(ngModel)]="newDeliverable.deliverableName"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Stage <span class="required">*</span></label>
            <select class="form-select" [(ngModel)]="newDeliverable.stage"><option value="">Select...</option><option>Pre-Concept</option><option>Concept</option><option>Schematic</option><option>Detailed</option><option>GFC</option><option>Sanction</option><option>Tender</option></select></div>
          <div class="form-group"><label class="form-label">Floor</label><input class="form-input" [(ngModel)]="newDeliverable.floor"></div>
          <div class="form-group"><label class="form-label">Project</label>
            <select class="form-select" [(ngModel)]="newDeliverable.projectName"><option>Bagmane Tech Park</option><option>Bagmane World Trade Center</option><option>Bagmane Constellation</option><option>Bagmane Capital</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Work Initiated Date</label><input class="form-input" type="date" [(ngModel)]="newDeliverable.workInitiatedDate"></div>
          <div class="form-group"><label class="form-label">Submitted Date</label><input class="form-input" type="date" [(ngModel)]="newDeliverable.submittedDate"></div>
          <div class="form-group"><label class="form-label">Due Date <span class="required">*</span></label><input class="form-input" type="date" [(ngModel)]="newDeliverable.dueDate"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Submission Status</label>
            <select class="form-select" [(ngModel)]="newDeliverable.submissionStatus"><option value="Pending">Pending</option><option value="Submitted">Submitted</option></select></div>
          <div class="form-group"><label class="form-label">IFC Status</label><input class="form-input" [(ngModel)]="newDeliverable.ifcStatus"></div>
          <div class="form-group"><label class="form-label">IFC Date</label><input class="form-input" type="date" [(ngModel)]="newDeliverable.ifcDate"></div>
        </div>
        <div class="form-group"><label class="form-label">Upload Documents</label>
          <div class="dropzone" style="padding:20px"><p>Drag & drop files here or click to browse</p></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="showAddModal = false">Cancel</button>
        <button class="btn btn-accent" (click)="saveDeliverable()">{{ editingDeliverable ? 'Save Changes' : 'Save' }}</button>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class DeliverablesTrackerComponent implements OnInit {
  deliverables: Deliverable[] = [];
  groupFilter = 'all';
  selectedIds: string[] = [];
  showDetailModal = false;
  showAddModal = false;
  detailDeliverable: Deliverable | null = null;
  editingDeliverable = false;
  newDeliverable: any = {};

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.deliverables$.subscribe(v => this.deliverables = v);
  }
  ngOnInit() {}

  get filteredDeliverables(): Deliverable[] {
    if (this.groupFilter === 'all') return this.deliverables;
    return this.deliverables.filter(d => d.group === this.groupFilter);
  }
  get uniqueGroups(): string[] { return [...new Set(this.deliverables.map(d => d.group).filter(Boolean))] as string[]; }
  countByGroup(g: string): number { return this.deliverables.filter(d => d.group === g).length; }
  get completedCount(): number { return this.deliverables.filter(d => d.finalStatus === 'Approved' || d.finalStatus === 'Fully Approved').length; }
  get inProgressCount(): number { return this.deliverables.filter(d => d.finalStatus === 'In Review').length; }
  get pendingCount(): number { return this.deliverables.filter(d => d.finalStatus === 'On Track' || d.submissionStatus === 'Pending').length; }
  get notStartedCount(): number { return this.deliverables.filter(d => !d.workInitiatedDate).length; }
  get allSelected(): boolean { return this.filteredDeliverables.length > 0 && this.selectedIds.length === this.filteredDeliverables.length; }

  toggleSelect(id: string) {
    const idx = this.selectedIds.indexOf(id);
    if (idx === -1) this.selectedIds.push(id);
    else this.selectedIds.splice(idx, 1);
  }
  toggleSelectAll(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds = checked ? this.filteredDeliverables.map(d => d.id) : [];
  }
  bulkAssign() { this.dataService.addNotification(`${this.selectedIds.length} deliverables assigned`, 'success'); this.selectedIds = []; }
  viewDetails(d: Deliverable) { this.detailDeliverable = d; this.showDetailModal = true; }
  sendReminder(d: Deliverable) { this.dataService.addNotification(`Reminder sent for ${d.deliverableName}`, 'info'); }
  openAddDeliverable() {
    this.editingDeliverable = false;
    this.newDeliverable = { consultant: '', deliverableName: '', stage: '', floor: '', projectName: 'Bagmane Tech Park', workInitiatedDate: '', submittedDate: '', dueDate: '', submissionStatus: 'Pending', ifcStatus: '', ifcDate: '' };
    this.showAddModal = true;
  }
  editDeliverable(d: Deliverable) {
    this.editingDeliverable = true;
    this.newDeliverable = { ...d };
    this.showAddModal = true;
  }
  saveDeliverable() {
    if (!this.newDeliverable.deliverableName || !this.newDeliverable.stage || !this.newDeliverable.consultant) {
      this.dataService.addNotification('Please fill mandatory fields', 'error'); return;
    }
    if (this.editingDeliverable) {
      this.dataService.updateDeliverable(this.newDeliverable.id, this.newDeliverable);
      this.dataService.addNotification(`${this.newDeliverable.deliverableName} updated`, 'success');
    } else {
      const d: Deliverable = {
        ...this.newDeliverable, id: '', group: this.newDeliverable.stage === 'Pre-Concept' || this.newDeliverable.stage === 'Concept' || this.newDeliverable.stage === 'Schematic' ? 'Architecture' : 'MEP',
        designTeamApproval: 'Pending', designHeadApproval: 'Pending', mepApproval: 'Pending',
        projectHeadApproval: 'Pending', liaisonApproval: 'Pending', mdApproval: 'Pending',
        finalStatus: 'On Track', revNo: 0, comments: [], documents: [], assignmentDate: new Date().toISOString().split('T')[0]
      };
      this.dataService.addDeliverable(d);
    }
    this.showAddModal = false;
  }
}
