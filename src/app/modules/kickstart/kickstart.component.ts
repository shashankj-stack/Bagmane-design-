import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest } from '../../core/models';

@Component({
  selector: 'app-kickstart',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Kickstart & Onboarding</h1><p>Send kickstart emails to consultants and manage action points for CH-approved indents</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- CH Approved Indents for Kickstart -->
  <div class="section"><h2>Contract Head Approved Indents</h2>
    <div class="table-container">
      <table><thead><tr><th>Indent ID</th><th>Category</th><th>Tech Park</th><th>Building</th><th>Consultant Type</th><th>Raised By</th><th>CTM</th><th>WO ID</th><th>CH Approved On</th><th>Kickstart</th><th>Action Points</th></tr></thead>
        <tbody>
          <tr *ngFor="let indent of chApprovedIndents">
            <td><strong>{{ indent.indentId }}</strong></td><td>{{ indent.category }}</td><td>{{ indent.techPark }}</td>
            <td>{{ indent.buildingNames?.join(', ') }}</td><td>{{ indent.consultantType || '-' }}</td>
            <td>{{ indent.raisedBy }}</td><td>{{ indent.assignee }}</td>
            <td>{{ indent.woData?.[0]?.woId || '-' }}</td>
            <td class="text-sm">{{ indent.chApprovedDateTime }}</td>
            <td>
              <button *ngIf="!indent.kickstartSent" class="btn btn-success btn-sm" (click)="sendKickstart(indent)">Send Kickstart</button>
              <span *ngIf="indent.kickstartSent" class="badge badge-success">Sent {{ indent.kickstartSentDateTime }}</span>
            </td>
            <td><button class="btn btn-outline btn-sm" (click)="viewActionPoints(indent)">View</button></td>
          </tr>
        </tbody></table>
    </div>
  </div>

  <!-- Kickstart Email Modal -->
  <div class="modal-overlay" *ngIf="showKickstartModal" (click)="showKickstartModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Compose Kickstart Email</h2><button class="modal-close" (click)="showKickstartModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">To - Consultant Email(s)</label><input class="form-input" [(ngModel)]="email.to"></div>
        <div class="form-group"><label class="form-label">CC</label><input class="form-input" [(ngModel)]="email.cc" placeholder="Add CC recipients"></div>
        <div class="form-group"><label class="form-label">Subject</label><input class="form-input" [(ngModel)]="email.subject"></div>
        <div class="form-group"><label class="form-label">Email Body</label><textarea class="form-textarea" [(ngModel)]="email.body" rows="10"></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="showKickstartModal = false">Cancel</button>
        <button class="btn btn-accent" (click)="sendEmail()">Send Email Now</button>
      </div>
    </div>
  </div>

  <!-- Action Points Modal -->
  <div class="modal-overlay" *ngIf="showActionModal" (click)="showActionModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Action Points - {{ actionPointIndent?.indentId }}</h2><button class="modal-close" (click)="showActionModal = false">&times;</button></div>
      <div class="modal-body">
        <div class="card" *ngFor="let ap of actionPoints" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <div><strong>{{ ap.description }}</strong><div class="text-sm text-secondary">Assigned to: {{ ap.assignedTo }} | Deadline: {{ ap.deadline }}</div></div>
          <span class="badge" [class.badge-warning]="ap.status==='Open'" [class.badge-info]="ap.status==='In Progress'" [class.badge-success]="ap.status==='Closed'">{{ ap.status }}</span>
        </div>
        <div *ngIf="!actionPoints.length" class="text-secondary text-sm">No action points yet.</div>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class KickstartComponent {
  indentList: IndentRequest[] = [];
  showKickstartModal = false;
  showActionModal = false;
  kickstartIndent: IndentRequest | null = null;
  actionPointIndent: IndentRequest | null = null;
  email = { to: '', cc: '', subject: '', body: '' };
  actionPoints: any[] = [];

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }

  get chApprovedIndents(): IndentRequest[] {
    return this.indentList.filter(i => i.status === 'Completed');
  }

  sendKickstart(indent: IndentRequest) {
    this.kickstartIndent = indent;
    const c = indent.proposedConsultants[0];
    this.email = {
      to: c?.email || '',
      cc: '',
      subject: `Kickstart Meeting - ${indent.indentId} - ${indent.techPark} - ${c?.firm || ''}`,
      body: `Dear ${c?.contact || 'Team'},\n\nThis is to schedule the kickstart meeting for consultant onboarding.\n\nProject: ${indent.techPark}\nBuildings: ${indent.buildingNames?.join(', ')}\nScope: ${indent.scopeOfWork}\n\nAgenda:\n1. Introduction & Project Brief\n2. Scope of Work Review\n3. Timeline & Deliverables\n4. Commercial Terms\n5. Next Steps\n\nRegards,\n${this.dataService.getCurrentUser().name}`
    };
    this.showKickstartModal = true;
  }

  sendEmail() {
    if (this.kickstartIndent) {
      this.dataService.sendKickstart(this.kickstartIndent.indentId);
      this.showKickstartModal = false;
    }
  }

  viewActionPoints(indent: IndentRequest) {
    this.actionPointIndent = indent;
    this.actionPoints = this.dataService.getActionPoints(indent.indentId);
    this.showActionModal = true;
  }
}
