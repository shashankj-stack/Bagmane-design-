import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { IndentRequest, CobMatrixRecord } from '../../core/models';

@Component({
  selector: 'app-cob-tracker',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>COB Tracker</h1><p>Portal 6 - Consolidated view of all onboarding requests across the pipeline</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-label">Total Requests</div><div class="kpi-value">{{ kpiTotal }}</div></div>
    <div class="kpi-card"><div class="kpi-label">Pending DH</div><div class="kpi-value">{{ kpiPendingDH }}</div></div>
    <div class="kpi-card"><div class="kpi-label">DH Approved</div><div class="kpi-value">{{ kpiDHApproved }}</div></div>
    <div class="kpi-card"><div class="kpi-label">Indent Raised</div><div class="kpi-value">{{ kpiIndentRaised }}</div></div>
    <div class="kpi-card"><div class="kpi-label">Accepted/Completed</div><div class="kpi-value">{{ kpiAccepted }}</div></div>
    <div class="kpi-card"><div class="kpi-label">Rejected</div><div class="kpi-value">{{ kpiRejected }}</div></div>
  </div>

  <!-- Filters -->
  <div class="filter-bar">
    <input class="form-input" placeholder="Search Req ID, project, consultant type..." [(ngModel)]="searchText" style="min-width:250px">
    <select class="form-select" [(ngModel)]="categoryFilter"><option value="all">All Categories</option><option value="General">General</option><option value="Consultant Onboarding">Consultant Onboarding</option></select>
    <select class="form-select" [(ngModel)]="statusFilter"><option value="all">All Statuses</option><option value="Pending DH Review">Pending DH Review</option><option value="DH Approved">DH Approved</option><option value="Rejected">Rejected</option><option value="Indent Raised">Indent Raised</option><option value="Accepted">Accepted</option><option value="CH Rejected">CH Rejected</option><option value="Completed">Completed</option></select>
    <select class="form-select" [(ngModel)]="dhStatusFilter"><option value="all">All DH Status</option><option value="DH Approved">DH Approved</option><option value="Pending DH Review">DH Pending</option><option value="Rejected">DH Rejected</option></select>
    <button class="btn btn-outline btn-sm" (click)="clearFilters()">Clear</button>
  </div>

  <!-- Main Tracker Table -->
  <div class="section"><h2>Request Tracker</h2>
    <div class="table-container">
      <table>
        <thead><tr>
          <th>Req ID</th><th>Category</th><th>Tech Park</th><th>Building(s)</th><th>Consultant Type</th>
          <th>Raised By</th><th>Requested Date/Time</th><th>DH Status</th><th>CTM Assigned</th>
          <th>CTM Status</th><th>CTM Accepted Date</th><th>WO Released Date</th><th>CTH Status</th>
          <th>CH Approved Date</th><th>COB TAT</th><th>View</th>
        </tr></thead>
        <tbody>
          <tr *ngFor="let indent of filteredIndents">
            <td><strong>{{ indent.indentId }}</strong></td>
            <td><span class="badge" [class.badge-info]="indent.category==='Consultant Onboarding'" [class.badge-light]="indent.category==='General'">{{ indent.category }}</span></td>
            <td>{{ indent.techPark }}</td>
            <td>{{ (indent.buildingNames || []).join(', ') }}</td>
            <td>{{ indent.consultantType || '-' }}</td>
            <td>{{ indent.raisedBy }}</td>
            <td class="text-sm">{{ indent.requestDateTime }}</td>
            <td><span class="badge" [class.badge-success]="indent.status==='DH Approved'" [class.badge-warning]="indent.status==='Pending DH Review'" [class.badge-danger]="indent.status==='Rejected'">{{ getDhStatus(indent) }}</span></td>
            <td>{{ indent.assignee || '-' }}</td>
            <td><span class="badge" [class]="ctmStatusBadge(indent)">{{ getCtmStatus(indent) }}</span></td>
            <td class="text-sm">{{ indent.ctmAcceptedDateTime || '-' }}</td>
            <td class="text-sm">{{ indent.ctmWoReleasedDateTime || '-' }}</td>
            <td><span class="badge" [class.badge-success]="indent.status==='Completed'" [class.badge-danger]="indent.status==='CH Rejected'" [class.badge-warning]="indent.status==='Accepted'">{{ getCthStatus(indent) }}</span></td>
            <td class="text-sm">{{ indent.chApprovedDateTime || '-' }}</td>
            <td class="text-sm">{{ indent.cobTat || calcTat(indent) }}</td>
            <td><button class="btn btn-outline btn-sm" (click)="viewJourney(indent)">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- COB Matrix -->
  <div class="section" style="margin-top:32px"><h2>Onboarding Records - List View</h2>
    <div class="table-container">
      <table><thead><tr><th>#</th><th>Consultant</th><th>Project</th><th>Status</th><th>Remarks</th></tr></thead>
        <tbody>
          <tr *ngFor="let record of cobMatrix">
            <td>{{ record.id }}</td><td>{{ record.consultant }}</td><td>{{ record.project }}</td>
            <td><span class="badge" [class.badge-success]="record.status==='Completed'" [class.badge-warning]="record.status==='In Progress'" [class.badge-info]="record.status==='Pending DH Review'">{{ record.status }}</span></td>
            <td class="text-sm">{{ record.remarks || '-' }}</td>
          </tr>
        </tbody></table>
    </div>
  </div>

  <!-- Journey Modal -->
  <div class="modal-overlay" *ngIf="showJourneyModal && journeyIndent" (click)="showJourneyModal = false">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <div><h2>{{ journeyIndent.indentId }}</h2><p class="text-sm text-secondary">All stages from raise to approval</p></div>
        <button class="modal-close" (click)="showJourneyModal = false">&times;</button>
      </div>
      <div class="modal-body">
        <div class="info-grid">
          <div class="info-item"><span class="info-label">Category</span><span class="info-value">{{ journeyIndent.category }}</span></div>
          <div class="info-item"><span class="info-label">Tech Park</span><span class="info-value">{{ journeyIndent.techPark }}</span></div>
          <div class="info-item"><span class="info-label">Buildings</span><span class="info-value">{{ (journeyIndent.buildingNames || []).join(', ') }}</span></div>
          <div class="info-item"><span class="info-label">Raised By</span><span class="info-value">{{ journeyIndent.raisedBy }}</span></div>
          <div class="info-item"><span class="info-label">DH Status</span><span class="info-value">{{ journeyIndent.status === 'Rejected' ? 'Rejected' : journeyIndent.approvedDateTime ? 'Approved' : 'Pending' }}</span></div>
          <div class="info-item"><span class="info-label">CTM Assigned</span><span class="info-value">{{ journeyIndent.assignee || '-' }}</span></div>
          <div class="info-item"><span class="info-label">CH Status</span><span class="info-value">{{ journeyIndent.status === 'Completed' ? 'Approved' : journeyIndent.status === 'CH Rejected' ? 'Rejected' : 'Pending' }}</span></div>
        </div>
        <div class="alert-panel" *ngIf="journeyIndent.dhRemarks"><strong>DH Remarks:</strong> {{ journeyIndent.dhRemarks }}</div>
        <div class="alert-panel" *ngIf="journeyIndent.chRemarks"><strong>CH Remarks:</strong> {{ journeyIndent.chRemarks }}</div>
        <div *ngIf="journeyIndent.woData?.length"><h3 style="margin:16px 0 8px">Work Orders</h3>
          <table><thead><tr><th>WO ID</th><th>Firm</th><th>Fee</th><th>Date</th></tr></thead>
            <tbody><tr *ngFor="let wo of journeyIndent.woData"><td>{{ wo.woId }}</td><td>{{ wo.consultantFirm }}</td><td>{{ wo.fee }}</td><td>{{ wo.woDate }}</td></tr></tbody></table>
        </div>
        <h3 style="margin:20px 0 12px">Activity Timeline</h3>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let event of activityTimeline"><div style="font-weight:600">{{ event.event }}</div><div class="text-sm text-secondary">{{ event.timestamp }} - {{ event.actor }}</div><div class="text-sm">{{ event.details }}</div></div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class CobTrackerComponent {
  indentList: IndentRequest[] = [];
  searchText = ''; categoryFilter = 'all'; statusFilter = 'all'; dhStatusFilter = 'all';
  showJourneyModal = false; journeyIndent: IndentRequest | null = null;

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.indents$.subscribe(v => this.indentList = v);
  }

  get filteredIndents(): IndentRequest[] {
    let list = this.indentList;
    if (this.searchText) { const s = this.searchText.toLowerCase(); list = list.filter(i => i.indentId.toLowerCase().includes(s) || i.techPark.toLowerCase().includes(s)); }
    if (this.categoryFilter !== 'all') list = list.filter(i => i.category === this.categoryFilter);
    if (this.statusFilter !== 'all') list = list.filter(i => i.status === this.statusFilter);
    if (this.dhStatusFilter !== 'all') {
      if (this.dhStatusFilter === 'DH Approved') list = list.filter(i => i.approvedDateTime);
      else if (this.dhStatusFilter === 'Pending DH Review') list = list.filter(i => i.status === 'Pending DH Review');
      else if (this.dhStatusFilter === 'Rejected') list = list.filter(i => i.status === 'Rejected');
    }
    return list;
  }

  get kpiTotal() { return this.indentList.length; }
  get kpiPendingDH() { return this.indentList.filter(i => i.status === 'Pending DH Review').length; }
  get kpiDHApproved() { return this.indentList.filter(i => i.status === 'DH Approved').length; }
  get kpiIndentRaised() { return this.indentList.filter(i => i.status === 'Indent Raised').length; }
  get kpiAccepted() { return this.indentList.filter(i => i.status === 'Accepted' || i.status === 'Completed').length; }
  get kpiRejected() { return this.indentList.filter(i => i.status === 'Rejected' || i.status === 'CH Rejected').length; }

  get cobMatrix(): CobMatrixRecord[] { return this.dataService.getCobMatrix(); }

  getDhStatus(indent: IndentRequest): string {
    if (indent.status === 'Rejected') return 'Rejected';
    if (indent.approvedDateTime) return 'DH Approved';
    if (indent.status === 'Pending DH Review') return 'Pending DH Review';
    return 'DH Approved';
  }
  getCtmStatus(indent: IndentRequest): string {
    if (!indent.assignee) return '-';
    if (indent.status === 'Indent Raised') return 'Awaiting Acceptance';
    if (indent.status === 'Accepted') return 'Accepted';
    if (indent.status === 'CH Rejected') return 'CH Rejected';
    if (indent.status === 'Completed') return 'Completed';
    return 'Assigned';
  }
  getCthStatus(indent: IndentRequest): string {
    if (indent.status === 'Completed') return 'Approved';
    if (indent.status === 'CH Rejected') return 'Rejected';
    if (indent.status === 'Accepted') return 'Pending';
    return '-';
  }
  ctmStatusBadge(indent: IndentRequest): string {
    const s = this.getCtmStatus(indent);
    if (s === 'Completed' || s === 'Accepted') return 'badge-success';
    if (s === 'Awaiting Acceptance') return 'badge-warning';
    if (s === 'CH Rejected') return 'badge-danger';
    return 'badge-light';
  }
  calcTat(indent: IndentRequest): string { return indent.requestDateTime ? 'In Progress' : '-'; }

  clearFilters() { this.searchText = ''; this.categoryFilter = 'all'; this.statusFilter = 'all'; this.dhStatusFilter = 'all'; }
  viewJourney(indent: IndentRequest) { this.journeyIndent = indent; this.showJourneyModal = true; }
  get activityTimeline() { return this.journeyIndent ? this.dataService.getActivityTimeline(this.journeyIndent.indentId) : []; }
}
