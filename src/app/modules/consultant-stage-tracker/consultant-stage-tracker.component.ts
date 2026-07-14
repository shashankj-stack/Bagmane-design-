import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { ConsultantStageProgress, StageStatus } from '../../core/models';

@Component({
  selector: 'app-consultant-stage-tracker',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Consultant Stage Tracker</h1><p>Matrix view of all consultants across 7 design stages</p></div>
    <div class="btn-group">
      <input class="form-input" placeholder="Search consultant..." [(ngModel)]="searchText" style="min-width:200px">
      <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
    </div>
  </div>
  <div class="table-container">
    <table>
      <thead><tr>
        <th (click)="sortBy('consultant')" style="cursor:pointer">Consultant {{ sortField === 'consultant' ? (sortAsc ? '^' : 'v') : '' }}</th>
        <th>Pre-Concept</th><th>Concept</th><th>Schematic</th><th>Detailed</th><th>GFC</th><th>Sanction</th><th>Tender</th>
        <th (click)="sortBy('overall')" style="cursor:pointer">Overall {{ sortField === 'overall' ? (sortAsc ? '^' : 'v') : '' }}</th>
      </tr></thead>
      <tbody>
        <tr *ngFor="let row of filteredProgress">
          <td><strong>{{ row.consultant }}</strong></td>
          <td><span class="stage-badge" [class]="stageClass(row.preConcept)" (click)="drillDown(row.consultant, 'Pre-Concept')" style="cursor:pointer">{{ row.preConcept }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.concept)" (click)="drillDown(row.consultant, 'Concept')" style="cursor:pointer">{{ row.concept }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.schematic)" (click)="drillDown(row.consultant, 'Schematic')" style="cursor:pointer">{{ row.schematic }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.detailed)" (click)="drillDown(row.consultant, 'Detailed')" style="cursor:pointer">{{ row.detailed }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.gfc)" (click)="drillDown(row.consultant, 'GFC')" style="cursor:pointer">{{ row.gfc }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.sanction)" (click)="drillDown(row.consultant, 'Sanction')" style="cursor:pointer">{{ row.sanction }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.tender)" (click)="drillDown(row.consultant, 'Tender')" style="cursor:pointer">{{ row.tender }}</span></td>
          <td><span class="stage-badge" [class]="stageClass(row.overall)">{{ row.overall }}</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Drill-down Modal -->
  <div class="modal-overlay" *ngIf="showDrillModal" (click)="showDrillModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>{{ drillConsultant }} - {{ drillStage }} Stage</h2><button class="modal-close" (click)="showDrillModal = false">&times;</button></div>
      <div class="modal-body">
        <div *ngIf="drillDeliverables.length > 0; else noDrillData">
          <div class="card" *ngFor="let d of drillDeliverables" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong>{{ d.deliverableName }}</strong>
              <span class="badge" [class.badge-success]="d.finalStatus==='Approved'||d.finalStatus==='Fully Approved'" [class.badge-warning]="d.finalStatus==='In Review'" [class.badge-danger]="d.finalStatus==='Needs Revision'">{{ d.finalStatus }}</span>
            </div>
            <div class="text-sm text-secondary">Due: {{ d.dueDate }} | Submitted: {{ d.submittedDate || 'Not yet' }}</div>
            <div class="text-sm text-secondary">Design Team: {{ d.designTeamApproval }} | Design Head: {{ d.designHeadApproval }} | MEP: {{ d.mepApproval }}</div>
          </div>
        </div>
        <ng-template #noDrillData><p class="text-secondary">No deliverables found for this consultant at this stage.</p></ng-template>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class ConsultantStageTrackerComponent implements OnInit {
  progress: ConsultantStageProgress[] = [];
  searchText = '';
  sortField = 'consultant';
  sortAsc = true;
  showDrillModal = false;
  drillConsultant = '';
  drillStage = '';
  deliverables: any[] = [];

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.deliverables$.subscribe(v => this.deliverables = v);
  }
  ngOnInit() { this.progress = this.dataService.getConsultantStageProgress(); }

  get filteredProgress(): ConsultantStageProgress[] {
    let list = this.progress;
    if (this.searchText) {
      const s = this.searchText.toLowerCase();
      list = list.filter(r => r.consultant.toLowerCase().includes(s));
    }
    return list.sort((a: any, b: any) => {
      const v = this.sortAsc ? 1 : -1;
      return a[this.sortField] > b[this.sortField] ? v : -v;
    });
  }

  stageClass(status: StageStatus): string {
    const map: Record<StageStatus, string> = {
      'Completed': 'stage-completed', 'In Progress': 'stage-in-progress',
      'Pending': 'stage-pending', 'Not Started': 'stage-not-started'
    };
    return map[status] || 'stage-not-started';
  }

  sortBy(field: string) {
    if (this.sortField === field) this.sortAsc = !this.sortAsc;
    else { this.sortField = field; this.sortAsc = true; }
  }

  drillDown(consultant: string, stage: string) {
    this.drillConsultant = consultant;
    this.drillStage = stage;
    this.showDrillModal = true;
  }

  get drillDeliverables(): any[] {
    return this.deliverables.filter((d: any) => d.consultant === this.drillConsultant && d.stage === this.drillStage);
  }
}
