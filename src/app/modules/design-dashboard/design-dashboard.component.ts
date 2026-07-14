import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { DashboardKpi, ProjectCard, SubmissionApprovalData, CriticalAlert, OnboardingDelay, DeliverableDelay, RecentUpdate } from '../../core/models';

@Component({
  selector: 'app-design-dashboard',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Design Dashboard</h1><p>Real-time overview of project design progress, deliverables, and alerts</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Active Projects</div>
      <div class="kpi-value">{{ kpis.activeProjects.count }}</div>
      <div class="kpi-trend up">+{{ kpis.activeProjects.trend }} this month</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">On-Track Deliverables</div>
      <div class="kpi-value">{{ kpis.onTrackDeliverables.percentage }}%</div>
      <div class="kpi-trend up">+{{ kpis.onTrackDeliverables.trend }}%</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Delayed</div>
      <div class="kpi-value">{{ kpis.delayedDeliverables.count }}</div>
      <div class="kpi-trend down">{{ kpis.delayedDeliverables.criticalCount }} critical</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Consultant Rating</div>
      <div class="kpi-value">{{ kpis.consultantPerformance.rating }}/{{ kpis.consultantPerformance.maxRating }}</div>
      <div class="kpi-trend up">Avg rating</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:24px">
    <!-- Active Projects -->
    <div>
      <div class="section-header"><h2>Active Projects</h2></div>
      <div class="card-grid">
        <div class="card" *ngFor="let project of projects" style="cursor:pointer" (click)="router.navigate(['/deliverables-tracker'])">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
            <div><strong>{{ project.projectName }}</strong><div class="text-sm text-secondary">{{ project.location }}</div></div>
            <span class="badge" [class.badge-success]="project.status==='On Track'" [class.badge-warning]="project.status==='At Risk'" [class.badge-danger]="project.status==='Delayed'">{{ project.status }}</span>
          </div>
          <div class="text-sm" style="margin-bottom:8px"><strong>{{ project.activeConsultants }}</strong> active consultants</div>
          <div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" [style.width.%]="project.completionPercentage" [style.background]="project.status==='Delayed'?'var(--danger)':project.status==='At Risk'?'var(--warning)':'var(--success)'"></div></div>
          <div class="text-sm text-secondary">{{ project.completionPercentage }}% complete</div>
          <div *ngIf="project.warningReason" class="text-sm" style="color:var(--warning);margin-top:4px">Warning: {{ project.warningReason }}</div>
        </div>
      </div>
    </div>

    <!-- Critical Alerts -->
    <div>
      <div class="section-header"><h2>Critical Alerts</h2></div>
      <div *ngFor="let alert of criticalAlerts" class="alert-panel" [class.critical]="alert.severity==='critical'">
        <strong>{{ alert.deliverableName }}</strong>
        <div class="text-sm text-secondary">{{ alert.project }} - {{ alert.consultant }}</div>
        <div class="text-sm" [style.color]="alert.severity==='critical'?'var(--danger)':'var(--warning)'">Delayed by <strong>{{ alert.delayDuration }} days</strong></div>
      </div>
    </div>
  </div>

  <!-- Submission vs Approval Chart -->
  <div class="chart-container" style="margin-bottom:24px">
    <div class="chart-title">Submissions vs Approvals (Month-over-Month)</div>
    <div style="display:flex;align-items:flex-end;gap:24px;height:200px;padding:0 20px">
      <div *ngFor="let d of submissionData" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
        <div style="display:flex;gap:4px;align-items:flex-end;height:160px">
          <div [style.height.px]="d.submissions * 4" style="width:20px;background:var(--primary);border-radius:3px 3px 0 0;position:relative" [title]="'Submissions: ' + d.submissions"></div>
          <div [style.height.px]="d.approvals * 4" style="width:20px;background:var(--accent);border-radius:3px 3px 0 0;position:relative" [title]="'Approvals: ' + d.approvals"></div>
        </div>
        <span class="text-xs text-secondary">{{ d.month }}</span>
      </div>
    </div>
    <div style="display:flex;gap:16px;justify-content:center;margin-top:8px">
      <span class="text-sm"><span style="display:inline-block;width:12px;height:12px;background:var(--primary);border-radius:2px;margin-right:4px"></span> Submissions</span>
      <span class="text-sm"><span style="display:inline-block;width:12px;height:12px;background:var(--accent);border-radius:2px;margin-right:4px"></span> Approvals</span>
    </div>
  </div>

  <!-- Delay Tables -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
    <div class="section"><h2>COB Onboarding Delays</h2>
      <div class="table-container"><table><thead><tr><th>Consultant Type</th><th>Raised By</th><th>Pending With</th><th>Delay Days</th></tr></thead>
        <tbody><tr *ngFor="let d of onboardingDelays"><td>{{ d.consultantType }}</td><td>{{ d.raisedBy }}</td><td>{{ d.pendingWith }}</td><td><span class="badge badge-danger">{{ d.delayDays }}d</span></td></tr></tbody></table></div>
    </div>
    <div class="section"><h2>Deliverable Delays</h2>
      <div class="table-container"><table><thead><tr><th>Deliverable</th><th>Days</th><th>Consultant</th><th>Details</th></tr></thead>
        <tbody><tr *ngFor="let d of deliverableDelays"><td>{{ d.deliverableName }}</td><td><span class="badge badge-danger">{{ d.delayDays }}d</span></td><td>{{ d.responsibleConsultant }}</td><td class="text-sm">{{ d.pendingApprovalDetails }}</td></tr></tbody></table></div>
    </div>
  </div>

  <!-- Recent Updates -->
  <div class="section"><h2>Recent Project Updates</h2>
    <div class="card">
      <div *ngFor="let update of recentUpdates" style="padding:10px 0;border-bottom:1px solid var(--border-light);display:flex;align-items:center;gap:12px">
        <span class="badge" [class.badge-success]="update.type==='approval'||update.type==='kickstart'" [class.badge-danger]="update.type==='rejection'" [class.badge-info]="update.type==='indent'" [class.badge-warning]="update.type==='submission'">{{ update.type }}</span>
        <span class="text-sm">{{ update.activity }}</span>
        <span class="text-xs text-secondary" style="margin-left:auto">{{ update.timestamp }}</span>
      </div>
    </div>
  </div>

  <!-- Line Graph (Simple CSS) -->
  <div class="chart-container" style="margin-bottom:24px">
    <div class="chart-title">Deliverables Submitted vs Approved Over Time</div>
    <div style="position:relative;height:180px;border-left:2px solid var(--border);border-bottom:2px solid var(--border);margin:0 20px 20px;padding-top:10px">
      <svg viewBox="0 0 600 160" style="width:100%;height:100%">
        <polyline points="0,120 100,110 200,95 300,85 400,70 500,50 600,40" fill="none" stroke="var(--primary)" stroke-width="2.5" />
        <polyline points="0,140 100,135 200,120 300,115 400,100 500,85 600,70" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <circle cx="0" cy="120" r="4" fill="var(--primary)" /><circle cx="100" cy="110" r="4" fill="var(--primary)" /><circle cx="200" cy="95" r="4" fill="var(--primary)" /><circle cx="300" cy="85" r="4" fill="var(--primary)" /><circle cx="400" cy="70" r="4" fill="var(--primary)" /><circle cx="500" cy="50" r="4" fill="var(--primary)" /><circle cx="600" cy="40" r="4" fill="var(--primary)" />
        <circle cx="0" cy="140" r="4" fill="var(--accent)" /><circle cx="100" cy="135" r="4" fill="var(--accent)" /><circle cx="200" cy="120" r="4" fill="var(--accent)" /><circle cx="300" cy="115" r="4" fill="var(--accent)" /><circle cx="400" cy="100" r="4" fill="var(--accent)" /><circle cx="500" cy="85" r="4" fill="var(--accent)" /><circle cx="600" cy="70" r="4" fill="var(--accent)" />
      </svg>
      <div style="display:flex;justify-content:space-between;padding:0 20px" class="text-xs text-secondary">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
      </div>
    </div>
    <div style="display:flex;gap:16px;justify-content:center">
      <span class="text-sm"><span style="display:inline-block;width:14px;height:3px;background:var(--primary);margin-right:4px;vertical-align:middle"></span> Submitted</span>
      <span class="text-sm"><span style="display:inline-block;width:14px;height:3px;background:var(--accent);margin-right:4px;vertical-align:middle"></span> Approved</span>
    </div>
  </div>
</div>
`,
  styles: [`
    .kpi-card { position: relative; }
    svg { overflow: visible; }
  `]
})
export class DesignDashboardComponent implements OnInit {
  kpis!: DashboardKpi;
  projects: ProjectCard[] = [];
  submissionData: SubmissionApprovalData[] = [];
  criticalAlerts: CriticalAlert[] = [];
  onboardingDelays: OnboardingDelay[] = [];
  deliverableDelays: DeliverableDelay[] = [];
  recentUpdates: RecentUpdate[] = [];

  constructor(public router: Router, public dataService: DataService) {}

  ngOnInit() {
    this.kpis = this.dataService.getDashboardKpis();
    this.projects = this.dataService.getProjectCards();
    this.submissionData = this.dataService.getSubmissionApprovalData();
    this.criticalAlerts = this.dataService.getCriticalAlerts();
    this.onboardingDelays = this.dataService.getOnboardingDelays();
    this.deliverableDelays = this.dataService.getDeliverableDelays();
    this.recentUpdates = this.dataService.getRecentUpdates();
  }
}
