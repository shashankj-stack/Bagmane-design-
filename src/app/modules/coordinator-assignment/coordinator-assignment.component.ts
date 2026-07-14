import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest, CtmWorkload } from '../../core/models';

@Component({
  selector: 'app-coordinator-assignment',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Coordinator Assignment Portal</h1><p>Portal 3 - Assign DH-approved indents to Contract Team Members</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- Team Load -->
  <div class="section"><h2>Team Workload</h2>
    <div class="kpi-grid">
      <div class="kpi-card" *ngFor="let m of workload">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><strong>{{ m.name }}</strong><div class="text-sm text-secondary">{{ m.role }}</div></div>
          <span class="badge" [class.badge-danger]="m.loadLevel==='High'" [class.badge-warning]="m.loadLevel==='Moderate'" [class.badge-success]="m.loadLevel==='Light'">{{ m.loadLevel }}</span>
        </div>
        <div style="display:flex;gap:24px;margin-top:12px">
          <div><span class="text-sm text-secondary">Handling</span><div style="font-size:1.5rem;font-weight:700;color:var(--primary)">{{ m.handlingCount }}</div></div>
          <div><span class="text-sm text-secondary">Completed</span><div style="font-size:1.5rem;font-weight:700;color:var(--success)">{{ m.completedCount }}</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- DH Approved Indents -->
  <div class="section"><h2>DH Approved Indents - Awaiting Assignment</h2>
    <div class="card-grid" *ngIf="dhApprovedIndents.length > 0">
      <div class="card" *ngFor="let indent of dhApprovedIndents">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <strong>{{ indent.indentId }}</strong>
          <span class="badge badge-info">DH Approved</span>
          <span *ngIf="indent.declineReason" class="badge badge-danger">Declined - Reassign</span>
        </div>
        <div class="info-grid" style="margin-bottom:8px">
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ indent.category }}</span></div>
          <div class="info-item"><span class="info-label">Consultant Type</span><span class="info-value">{{ indent.consultantType || '-' }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ indent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ indent.raisedBy }}</span></div>
        </div>
        <div *ngIf="indent.declineReason" class="alert-panel"><strong>Declined by {{ indent.declinedBy }}:</strong> {{ indent.declineReason }}</div>
        <div style="margin-top:12px">
          <select class="form-select" [(ngModel)]="selectedCtm[indent.indentId]" style="margin-bottom:8px">
            <option value="">Select CTM...</option>
            <option *ngFor="let m of workload" [value]="m.name">{{ m.name }} - {{ m.role }} [{{ m.handlingCount }} active] [{{ m.loadLevel }}]</option>
          </select>
          <textarea class="form-textarea" [(ngModel)]="coordNotes[indent.indentId]" placeholder="Optional coordinator notes..." rows="2" style="margin-bottom:8px"></textarea>
          <button class="btn btn-accent btn-sm" (click)="assignCtm(indent)" [disabled]="!selectedCtm[indent.indentId]">Assign & Notify Member</button>
        </div>
      </div>
    </div>
    <div *ngIf="dhApprovedIndents.length === 0" class="card" style="text-align:center;padding:40px">
      <p class="text-secondary">No indents awaiting assignment.</p>
    </div>
  </div>

  <!-- Assignment History -->
  <div class="section"><h2>Assigned Indents History</h2>
    <div class="table-container">
      <table><thead><tr><th>Req ID</th><th>Category</th><th>Tech Park</th><th>Raised By</th><th>Assigned To</th><th>Assigned Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr *ngFor="let indent of assignedIndents">
            <td><strong>{{ indent.indentId }}</strong></td>
            <td>{{ indent.category }}</td><td>{{ indent.techPark }}</td>
            <td>{{ indent.raisedBy }}</td><td>{{ indent.assignee }}</td>
            <td class="text-sm">{{ indent.ctmAcceptedDateTime || indent.approvedDateTime }}</td>
            <td><span class="badge" [class.badge-warning]="indent.status==='Indent Raised'" [class.badge-success]="indent.status==='Completed'" [class.badge-info]="indent.status==='Accepted'">{{ indent.status }}</span></td>
          </tr>
        </tbody></table>
    </div>
  </div>
</div>
`,
  styles: []
})
export class CoordinatorAssignmentComponent implements OnInit {
  indentList: IndentRequest[] = [];
  workload: CtmWorkload[] = [];
  selectedCtm: Record<string, string> = {};
  coordNotes: Record<string, string> = {};

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
    this.dataService.workload$.subscribe(v => this.workload = v);
  }
  ngOnInit() {}

  get dhApprovedIndents(): IndentRequest[] {
    return this.indentList.filter(i => i.status === 'DH Approved');
  }
  get assignedIndents(): IndentRequest[] {
    return this.indentList.filter(i => ['Indent Raised', 'Accepted', 'CH Rejected', 'Completed'].includes(i.status));
  }
  assignCtm(indent: IndentRequest) {
    const ctm = this.selectedCtm[indent.indentId];
    if (!ctm) return;
    this.dataService.coordinatorAssign(indent.indentId, ctm, this.coordNotes[indent.indentId] || '');
    this.selectedCtm[indent.indentId] = '';
    this.coordNotes[indent.indentId] = '';
  }
}
