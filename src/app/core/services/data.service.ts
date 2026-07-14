import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  IndentRequest, IndentStatus, Deliverable, CtmWorkload, FileAttachment,
  DashboardKpi, ProjectCard, SubmissionApprovalData, CriticalAlert,
  OnboardingDelay, DeliverableDelay, RecentUpdate, CobMatrixRecord,
  ConsultantStageProgress, SystemSettings, SapSyncStatus, ActionPoint,
  AppNotification, ActivityEvent, DesignStage, SubmissionStatus,
  ApprovalStatus, FinalStatus, AppUser, UserRole
} from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {

  // ==================== Indent Requests ====================
  private indentsSubject = new BehaviorSubject<IndentRequest[]>(this.getSeedIndents());
  indents$ = this.indentsSubject.asObservable();

  // ==================== Deliverables ====================
  private deliverablesSubject = new BehaviorSubject<Deliverable[]>(this.getSeedDeliverables());
  deliverables$ = this.deliverablesSubject.asObservable();

  // ==================== Workload ====================
  private workloadSubject = new BehaviorSubject<CtmWorkload[]>(this.getSeedWorkload());
  workload$ = this.workloadSubject.asObservable();

  // ==================== Notifications ====================
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  // ==================== Current User ====================
  private currentUserSubject = new BehaviorSubject<AppUser>({
    id: 'USR-001',
    name: 'Rahul Sharma',
    role: 'IR',
    email: 'rahul.sharma@bagmane.com',
    portalAccess: ['portal-1', 'portal-6', 'portal-7', 'portal-hub']
  });
  currentUser$ = this.currentUserSubject.asObservable();

  // ==================== Settings ====================
  private settingsSubject = new BehaviorSubject<SystemSettings>({
    approvalTier: 3,
    notifications: {
      upcomingDeadlineAlerts: true,
      deadlineLeadDays: 7,
      delayedItemAlerts: true,
      newSubmissionNotifications: true,
      approvalRejectionNotifications: true,
      channels: ['email', 'portal']
    },
    sharepoint: { siteUrl: '', libraryPath: '', authMethod: 'OAuth2' }
  });
  settings$ = this.settingsSubject.asObservable();

  private nextIndentId = 105;

  // ==================== INDENT CRUD ====================
  getIndents(): Observable<IndentRequest[]> { return this.indents$; }

  getIndentById(id: string): IndentRequest | undefined {
    return this.indentsSubject.value.find(i => i.indentId === id);
  }

  addIndent(indent: IndentRequest): void {
    const current = this.indentsSubject.value;
    indent.indentId = `CB-${String(this.nextIndentId++).padStart(3, '0')}`;
    indent.requestDateTime = this.now();
    indent.status = indent.status || 'Pending DH Review';
    this.indentsSubject.next([...current, indent]);
    this.addNotification(`Indent ${indent.indentId} submitted successfully`, 'success');
    this.addActivity({ event: 'Indent Raised', timestamp: this.now(), actor: indent.raisedBy, details: `Indent ${indent.indentId} created` });
  }

  updateIndent(id: string, updates: Partial<IndentRequest>): void {
    const current = this.indentsSubject.value;
    const idx = current.findIndex(i => i.indentId === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      this.indentsSubject.next([...current]);
    }
  }

  saveDraft(indent: IndentRequest): void {
    indent.indentId = `CB-${String(this.nextIndentId++).padStart(3, '0')}`;
    indent.requestDateTime = this.now();
    indent.status = 'Draft';
    this.indentsSubject.next([...this.indentsSubject.value, indent]);
    this.addNotification('Draft saved successfully', 'success');
  }

  submitDraft(id: string): void {
    this.updateIndent(id, { status: 'Pending DH Review', requestDateTime: this.now() });
    this.addNotification(`Indent ${id} submitted to Design Head`, 'success');
  }

  // ==================== APPROVAL ACTIONS ====================
  designHeadApprove(id: string, remarks?: string): void {
    this.updateIndent(id, {
      status: 'DH Approved',
      dhRemarks: remarks,
      approvedDateTime: this.now()
    });
    this.addNotification(`Indent ${id} approved by Design Head`, 'success');
    this.addActivity({ event: 'DH Approved', timestamp: this.now(), actor: 'Design Head', details: remarks || 'Approved' });
  }

  designHeadReject(id: string, remarks: string): void {
    this.updateIndent(id, { status: 'Rejected', dhRemarks: remarks });
    this.addNotification(`Indent ${id} rejected by Design Head`, 'error');
    this.addActivity({ event: 'DH Rejected', timestamp: this.now(), actor: 'Design Head', details: remarks });
  }

  coordinatorAssign(id: string, ctmName: string, notes?: string): void {
    this.updateIndent(id, { status: 'Indent Raised', assignee: ctmName, coordNotes: notes, declineReason: '', declinedBy: '' });
    // Update workload
    const wl = this.workloadSubject.value.map(w =>
      w.name === ctmName ? { ...w, handlingCount: w.handlingCount + 1, loadLevel: this.calcLoad(w.handlingCount + 1) } : w
    );
    this.workloadSubject.next(wl);
    this.addNotification(`Indent ${id} assigned to ${ctmName}`, 'success');
    this.addActivity({ event: 'CTM Assigned', timestamp: this.now(), actor: 'Coordinator', details: `Assigned to ${ctmName}` });
  }

  ctmAccept(id: string): void {
    this.updateIndent(id, { status: 'Accepted', ctmAcceptedDateTime: this.now() });
    this.addNotification(`Indent ${id} accepted`, 'success');
    this.addActivity({ event: 'CTM Accepted', timestamp: this.now(), actor: this.currentUserSubject.value.name, details: 'Assignment accepted' });
  }

  ctmDecline(id: string, reason: string): void {
    const ctm = this.currentUserSubject.value.name;
    this.updateIndent(id, { status: 'DH Approved', declineReason: reason, declinedBy: ctm, assignee: '' });
    this.addNotification(`Indent ${id} declined by ${ctm}`, 'info');
    this.addActivity({ event: 'CTM Declined', timestamp: this.now(), actor: ctm, details: reason });
  }

  ctmSubmitWorkOrder(id: string, woData: any[]): void {
    this.updateIndent(id, { woData, ctmWoReleasedDateTime: this.now(), chApprovedDateTime: undefined });
    // status remains 'Accepted' but CH Approval becomes 'Pending'
    this.addNotification('Work order(s) submitted to Contract Head', 'success');
    this.addActivity({ event: 'WO Submitted', timestamp: this.now(), actor: this.currentUserSubject.value.name, details: 'Work order submitted' });
  }

  contractHeadApprove(id: string, remarks?: string): void {
    this.updateIndent(id, { status: 'Completed', chRemarks: remarks, chApprovedDateTime: this.now() });
    this.addNotification(`Work order ${id} approved by Contract Head`, 'success');
    this.addActivity({ event: 'CH Approved', timestamp: this.now(), actor: 'Contract Head', details: remarks || 'Approved' });
  }

  contractHeadReject(id: string, remarks: string): void {
    this.updateIndent(id, { status: 'CH Rejected', chRemarks: remarks });
    this.addNotification(`Work order ${id} rejected by Contract Head`, 'error');
    this.addActivity({ event: 'CH Rejected', timestamp: this.now(), actor: 'Contract Head', details: remarks });
  }

  sendKickstart(id: string): void {
    this.updateIndent(id, { kickstartSent: true, kickstartSentDateTime: this.now() });
    this.addNotification(`Kickstart email sent for ${id}`, 'success');
    this.addActivity({ event: 'Kickstart Sent', timestamp: this.now(), actor: this.currentUserSubject.value.name, details: `Kickstart initiated for ${id}` });
  }

  // ==================== DELIVERABLES CRUD ====================
  getDeliverables(): Observable<Deliverable[]> { return this.deliverables$; }

  addDeliverable(d: Deliverable): void {
    const current = this.deliverablesSubject.value;
    d.id = `DEL-${String(current.length + 1).padStart(3, '0')}`;
    d.finalStatus = 'On Track';
    d.revNo = 0;
    d.comments = [];
    this.deliverablesSubject.next([...current, d]);
    this.addNotification(`Deliverable ${d.deliverableName} added`, 'success');
  }

  updateDeliverable(id: string, updates: Partial<Deliverable>): void {
    const current = this.deliverablesSubject.value;
    const idx = current.findIndex(d => d.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      this.deliverablesSubject.next([...current]);
    }
  }

  approveDeliverable(id: string, tier: string, remarks?: string): void {
    const tierMap: Record<string, { approvalField: keyof Deliverable; nextField?: keyof Deliverable; statusLabel: string }> = {
      'design-team': { approvalField: 'designTeamApproval', nextField: 'designHeadApproval', statusLabel: 'Design Team Approved' },
      'design-head': { approvalField: 'designHeadApproval', nextField: 'mepApproval', statusLabel: 'Design Head Approved' },
      'mep-head': { approvalField: 'mepApproval', nextField: 'projectHeadApproval', statusLabel: 'MEP Approved' },
      'project-head': { approvalField: 'projectHeadApproval', nextField: 'liaisonApproval', statusLabel: 'Project Head Approved' },
      'liaisoning': { approvalField: 'liaisonApproval', nextField: 'mdApproval', statusLabel: 'Liaisoning Approved' },
      'md': { approvalField: 'mdApproval', statusLabel: 'Fully Approved' }
    };
    const config = tierMap[tier];
    if (!config) return;
    const updates: Partial<Deliverable> = { [config.approvalField]: 'Approved' as ApprovalStatus };
    if (tier === 'md') {
      updates.finalStatus = 'Fully Approved';
    } else {
      updates.finalStatus = 'In Review';
    }
    this.updateDeliverable(id, updates);
    this.addDeliverableComment(id, remarks || 'Approved', tier, 'approval');
    this.addNotification(`Deliverable ${id}: ${config.statusLabel}`, 'success');
  }

  rejectDeliverable(id: string, tier: string, remarks: string): void {
    const tierMap: Record<string, keyof Deliverable> = {
      'design-team': 'designTeamApproval',
      'design-head': 'designHeadApproval',
      'mep-head': 'mepApproval',
      'project-head': 'projectHeadApproval',
      'liaisoning': 'liaisonApproval',
      'md': 'mdApproval'
    };
    const field = tierMap[tier];
    if (!field) return;
    const updates: Partial<Deliverable> = {
      [field]: 'Rejected' as ApprovalStatus,
      finalStatus: 'Needs Revision' as FinalStatus
    };
    this.updateDeliverable(id, updates);
    this.addDeliverableComment(id, remarks, tier, 'rejection');
    this.addNotification(`Deliverable ${id} rejected`, 'error');
  }

  addDeliverableComment(id: string, text: string, role: string, type: 'approval' | 'rejection' | 'revision' | 'submission' | 'general'): void {
    const current = this.deliverablesSubject.value;
    const idx = current.findIndex(d => d.id === id);
    if (idx !== -1) {
      const comment = { author: this.currentUserSubject.value.name, role, text, timestamp: this.now(), type };
      current[idx].comments = [...(current[idx].comments || []), comment];
      this.deliverablesSubject.next([...current]);
    }
  }

  submitDeliverableByConsultant(id: string, file: FileAttachment, notes?: string): void {
    const current = this.deliverablesSubject.value;
    const idx = current.findIndex(d => d.id === id);
    if (idx !== -1) {
      current[idx].submissionStatus = 'Submitted';
      current[idx].submittedDate = this.now();
      current[idx].revNo = (current[idx].revNo || 0) + 1;
      current[idx].documents = [...(current[idx].documents || []), file];
      current[idx].finalStatus = 'In Review';
      current[idx].designTeamApproval = 'Pending';
      current[idx].designHeadApproval = 'Pending';
      current[idx].mepApproval = 'Pending';
      current[idx].projectHeadApproval = 'Pending';
      current[idx].liaisonApproval = 'Pending';
      current[idx].mdApproval = 'Pending';
      this.deliverablesSubject.next([...current]);
      this.addNotification(`Deliverable ${id} submitted by consultant`, 'success');
    }
  }

  // ==================== WORKLOAD ====================
  getWorkload(): Observable<CtmWorkload[]> { return this.workload$; }

  // ==================== NOTIFICATIONS ====================
  addNotification(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    const n: AppNotification = {
      id: `NTF-${Date.now()}`,
      message,
      type,
      timestamp: this.now(),
      read: false,
      autoDismiss: type !== 'error'
    };
    this.notificationsSubject.next([...this.notificationsSubject.value, n]);
    if (n.autoDismiss) {
      setTimeout(() => this.dismissNotification(n.id), 3000);
    }
  }

  dismissNotification(id: string): void {
    this.notificationsSubject.next(this.notificationsSubject.value.filter(n => n.id !== id));
  }

  // ==================== USER ====================
  setCurrentUser(user: AppUser): void { this.currentUserSubject.next(user); }
  getCurrentUser(): AppUser { return this.currentUserSubject.value; }

  switchUser(user: AppUser): void {
    this.currentUserSubject.next(user);
    this.addNotification(`Switched to: ${user.name} (${user.role})`, 'info');
  }

  // ==================== SETTINGS ====================
  getSettings(): Observable<SystemSettings> { return this.settings$; }
  updateSettings(settings: Partial<SystemSettings>): void {
    this.settingsSubject.next({ ...this.settingsSubject.value, ...settings });
    this.addNotification('Settings updated successfully', 'success');
  }

  // ==================== KPI / DASHBOARD ====================
  getDashboardKpis(): DashboardKpi {
    const dels = this.deliverablesSubject.value;
    const active = dels.filter(d => d.finalStatus !== 'Fully Approved').length;
    const onTrack = dels.filter(d => d.finalStatus === 'On Track' || d.finalStatus === 'Approved').length;
    const delayed = dels.filter(d => d.finalStatus === 'Delayed' || d.finalStatus === 'Needs Revision').length;
    return {
      activeProjects: { count: 6, trend: 2 },
      onTrackDeliverables: { percentage: active ? Math.round((onTrack / active) * 100) : 0, trend: 5 },
      delayedDeliverables: { count: delayed, criticalCount: dels.filter(d => d.finalStatus === 'Needs Revision').length },
      consultantPerformance: { rating: 4.2, maxRating: 5.0 }
    };
  }

  getProjectCards(): ProjectCard[] {
    return [
      { projectName: 'Bagmane Tech Park - Phase 1', location: 'Whitefield', activeConsultants: 8, completionPercentage: 72, status: 'On Track' },
      { projectName: 'Bagmane World Trade Center', location: 'Marthahalli', activeConsultants: 5, completionPercentage: 45, status: 'At Risk', warningReason: '2 deliverables delayed' },
      { projectName: 'Bagmane Constellation', location: 'Doddanekundi', activeConsultants: 6, completionPercentage: 88, status: 'On Track' },
      { projectName: 'Bagmane Capital', location: 'ORR', activeConsultants: 4, completionPercentage: 30, status: 'Delayed' },
    ];
  }

  getSubmissionApprovalData(): SubmissionApprovalData[] {
    return [
      { month: 'Jan', submissions: 24, approvals: 20 },
      { month: 'Feb', submissions: 30, approvals: 25 },
      { month: 'Mar', submissions: 28, approvals: 28 },
      { month: 'Apr', submissions: 35, approvals: 30 },
      { month: 'May', submissions: 32, approvals: 31 },
      { month: 'Jun', submissions: 38, approvals: 33 },
      { month: 'Jul', submissions: 40, approvals: 36 },
    ];
  }

  getCriticalAlerts(): CriticalAlert[] {
    return [
      { deliverableName: 'Structural Drawings - Block A', project: 'Bagmane WTC', delayDuration: 12, consultant: 'Artech Studio', severity: 'critical' },
      { deliverableName: 'MEP Layout - Floor 5', project: 'Bagmane Tech Park', delayDuration: 7, consultant: 'MEP Consultants Ltd', severity: 'warning' },
      { deliverableName: 'Landscape Plan', project: 'Bagmane Capital', delayDuration: 15, consultant: 'GreenScape Design', severity: 'critical' },
    ];
  }

  getOnboardingDelays(): OnboardingDelay[] {
    return [
      { consultantType: 'Architect', raisedBy: 'Amit Kumar', pendingWith: 'Design Head', delayDays: 5 },
      { consultantType: 'Structural Engineer', raisedBy: 'Priya Singh', pendingWith: 'Contract Head', delayDays: 12 },
    ];
  }

  getDeliverableDelays(): DeliverableDelay[] {
    return [
      { deliverableName: 'Electrical Layout', delayDays: 8, responsibleConsultant: 'PowerTech Solutions', pendingApprovalDetails: 'Pending MEP Head approval' },
      { deliverableName: 'Plumbing Design', delayDays: 3, responsibleConsultant: 'Aqua Design Co', pendingApprovalDetails: 'Pending Design Head review' },
    ];
  }

  getRecentUpdates(): RecentUpdate[] {
    return [
      { activity: 'CB-101: Work Order approved by Contract Head', timestamp: this.now(), type: 'approval', relatedId: 'CB-101' },
      { activity: 'DEL-005: Structural Drawings rejected by Design Head', timestamp: this.now(), type: 'rejection', relatedId: 'DEL-005' },
      { activity: 'CB-103: New indent raised for MEP Consultant', timestamp: this.now(), type: 'indent', relatedId: 'CB-103' },
      { activity: 'DEL-008: Consultant submitted revised drawings', timestamp: this.now(), type: 'submission', relatedId: 'DEL-008' },
      { activity: 'CB-099: Kickstart email sent to architect firm', timestamp: this.now(), type: 'kickstart', relatedId: 'CB-099' },
    ];
  }

  getCobMatrix(): CobMatrixRecord[] {
    return [
      { id: 1, consultant: 'Artech Studio', project: 'Bagmane WTC', status: 'Completed', remarks: 'Fully onboarded' },
      { id: 2, consultant: 'MEP Consultants Ltd', project: 'Bagmane Tech Park', status: 'In Progress', remarks: 'Awaiting CH approval' },
      { id: 3, consultant: 'GreenScape Design', project: 'Bagmane Capital', status: 'Pending DH Review', remarks: '' },
    ];
  }

  getConsultantStageProgress(): ConsultantStageProgress[] {
    return [
      { consultant: 'Artech Studio', preConcept: 'Completed', concept: 'Completed', schematic: 'In Progress', detailed: 'Pending', gfc: 'Not Started', sanction: 'Not Started', tender: 'Not Started', overall: 'In Progress' },
      { consultant: 'MEP Consultants Ltd', preConcept: 'Completed', concept: 'Completed', schematic: 'Completed', detailed: 'In Progress', gfc: 'Pending', sanction: 'Not Started', tender: 'Not Started', overall: 'In Progress' },
      { consultant: 'GreenScape Design', preConcept: 'Completed', concept: 'In Progress', schematic: 'Pending', detailed: 'Not Started', gfc: 'Not Started', sanction: 'Not Started', tender: 'Not Started', overall: 'In Progress' },
      { consultant: 'PowerTech Solutions', preConcept: 'Completed', concept: 'Completed', schematic: 'Completed', detailed: 'Completed', gfc: 'In Progress', sanction: 'Pending', tender: 'Not Started', overall: 'In Progress' },
    ];
  }

  getSapSyncStatuses(): SapSyncStatus[] {
    return [
      { indentId: 'CB-101', woId: 'WO-001', syncStatus: 'Synced', lastSyncDateTime: '14-07-2026 10:30 AM' },
      { indentId: 'CB-102', woId: 'WO-002', syncStatus: 'Pending' },
    ];
  }

  getActionPoints(indentId: string): ActionPoint[] {
    return [
      { id: 'AP-001', indentId, description: 'Confirm meeting schedule with consultant', assignedTo: 'Rahul Sharma', deadline: '20-07-2026', status: 'Open', createdAt: '14-07-2026 09:00 AM' },
    ];
  }

  getActivityTimeline(indentId: string): ActivityEvent[] {
    const indent = this.getIndentById(indentId);
    if (!indent) return [];
    const timeline: ActivityEvent[] = [
      { event: 'Indent Raised', timestamp: indent.requestDateTime, actor: indent.raisedBy, details: `Indent ${indentId} created` },
    ];
    if (indent.approvedDateTime) timeline.push({ event: 'DH Approved', timestamp: indent.approvedDateTime, actor: 'Design Head', details: indent.dhRemarks || 'Approved' });
    if (indent.ctmAcceptedDateTime) timeline.push({ event: 'CTM Accepted', timestamp: indent.ctmAcceptedDateTime, actor: indent.assignee || 'CTM', details: 'Assignment accepted' });
    if (indent.ctmWoReleasedDateTime) timeline.push({ event: 'WO Submitted', timestamp: indent.ctmWoReleasedDateTime, actor: indent.assignee || 'CTM', details: 'Work order submitted to CH' });
    if (indent.chApprovedDateTime) timeline.push({ event: 'CH Approved', timestamp: indent.chApprovedDateTime, actor: 'Contract Head', details: indent.chRemarks || 'Completed' });
    if (indent.kickstartSentDateTime) timeline.push({ event: 'Kickstart Sent', timestamp: indent.kickstartSentDateTime, actor: indent.raisedBy, details: 'Kickstart initiated' });
    return timeline;
  }

  // ==================== HELPERS ====================
  private now(): string {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours() % 12 || 12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  }

  private calcLoad(count: number): CtmWorkload['loadLevel'] {
    if (count >= 3) return 'High';
    if (count === 2) return 'Moderate';
    return 'Light';
  }

  private addActivity(event: ActivityEvent): void {
    // In a real app this would persist; for demo it's stored in-memory
  }

  // ==================== SEED DATA ====================
  private getSeedIndents(): IndentRequest[] {
    return [
      {
        indentId: 'CB-101', category: 'Consultant Onboarding', techPark: 'Bagmane Tech Park', buildingNames: ['Block A', 'Block B'],
        consultantType: 'Architect', numConsultantsRequired: 2, scopeOfWork: 'Complete architectural design for new tech park blocks including façade, layout, and interior planning.',
        mgmtSignOn: true, mgmtSignOnDate: '10-07-2026', raisedBy: 'Amit Kumar', requestDateTime: '12-07-2026 09:30 AM',
        status: 'Completed', assignee: 'Suresh Rao', proposedConsultants: [
          { firm: 'Artech Studio', contact: 'Vikram Patel', phone: '9876543210', email: 'vikram@artech.com', location: 'Bangalore', proposal: true, proposalDate: '08-07-2026' }
        ],
        woData: [{ woId: 'WO-001', consultantFirm: 'Artech Studio', fee: '₹15,00,000', woDate: '13-07-2026', remarks: 'Negotiated to 14.5L', approvalNotes: 'Approved as per budget' }],
        approvedDateTime: '12-07-2026 02:00 PM', chApprovedDateTime: '13-07-2026 04:30 PM', dhRemarks: 'Looks good, proceed', chRemarks: 'Approved',
        ctmAcceptedDateTime: '12-07-2026 03:00 PM', ctmWoReleasedDateTime: '13-07-2026 11:00 AM', kickstartSent: true, kickstartSentDateTime: '14-07-2026 10:00 AM'
      },
      {
        indentId: 'CB-102', category: 'Consultant Onboarding', techPark: 'Bagmane World Trade Center', buildingNames: ['Tower A'],
        consultantType: 'Structural Engineer', numConsultantsRequired: 1, scopeOfWork: 'Structural analysis and design for WTC Tower A including foundation, columns, and beams.',
        mgmtSignOn: false, raisedBy: 'Priya Singh', requestDateTime: '13-07-2026 11:00 AM',
        status: 'Indent Raised', assignee: 'Ravi Menon', proposedConsultants: [
          { firm: 'StructWorks India', contact: 'Anand Gupta', phone: '9988776655', email: 'anand@structworks.com', location: 'Mumbai' }
        ],
        approvedDateTime: '13-07-2026 03:00 PM', dhRemarks: 'Approved for further processing',
        ctmAcceptedDateTime: '13-07-2026 04:00 PM'
      },
      {
        indentId: 'CB-103', category: 'General', techPark: 'Bagmane Capital', buildingNames: ['South Wing'],
        numConsultantsRequired: 3, scopeOfWork: 'General consultancy for interior fit-out, HVAC, and electrical systems.',
        mgmtSignOn: true, mgmtSignOnDate: '14-07-2026', raisedBy: 'Rahul Sharma', requestDateTime: '14-07-2026 08:00 AM',
        status: 'Pending DH Review', proposedConsultants: [
          { firm: 'InteriorCraft Ltd', contact: 'Sneha Das', phone: '8899001122', email: 'sneha@interiorcraft.com', location: 'Bangalore' },
          { firm: 'HVAC Pro Solutions', contact: 'Kiran Rao', phone: '7788990011', email: 'kiran@hvacpro.com', location: 'Hyderabad' }
        ]
      },
      {
        indentId: 'CB-104', category: 'Consultant Onboarding', techPark: 'Bagmane Constellation', buildingNames: ['Phase 2 Block'],
        consultantType: 'Landscape Architect', numConsultantsRequired: 1, scopeOfWork: 'Landscape design for Phase 2 including gardens, water features, and outdoor seating.',
        mgmtSignOn: false, raisedBy: 'Amit Kumar', requestDateTime: '11-07-2026 02:00 PM',
        status: 'DH Approved', proposedConsultants: [
          { firm: 'GreenScape Design', contact: 'Meera Nair', phone: '6677889900', email: 'meera@greenscape.com', location: 'Kochi' }
        ],
        approvedDateTime: '12-07-2026 10:00 AM', dhRemarks: 'Good firm, proceed'
      },
    ];
  }

  private getSeedDeliverables(): Deliverable[] {
    return [
      {
        id: 'DEL-001', projectName: 'Bagmane WTC', consultant: 'Artech Studio', deliverableName: 'Concept Design - Tower A',
        stage: 'Concept', group: 'Architecture', floor: 'All Floors', workInitiatedDate: '01-07-2026', submittedDate: '10-07-2026',
        dueDate: '15-07-2026', submissionStatus: 'Submitted', designTeamApproval: 'Approved', designHeadApproval: 'Approved',
        mepApproval: 'Pending', projectHeadApproval: 'Pending', liaisonApproval: 'Pending', mdApproval: 'Pending',
        finalStatus: 'In Review', revNo: 1, documents: [{ fileName: 'Concept_Design_TowerA_v1.pdf', fileSize: 2500000, fileType: 'pdf', fileUrl: '#DEL-001' }],
        comments: [{ author: 'Design Head', role: 'DH', text: 'Excellent concept, proceed', timestamp: '11-07-2026 02:00 PM', type: 'approval' }],
        assignmentDate: '01-07-2026'
      },
      {
        id: 'DEL-002', projectName: 'Bagmane WTC', consultant: 'StructWorks India', deliverableName: 'Structural Analysis Report',
        stage: 'Schematic', group: 'Structure', floor: 'Basement-GF', workInitiatedDate: '05-07-2026',
        dueDate: '20-07-2026', submissionStatus: 'Pending', designTeamApproval: 'Pending', designHeadApproval: 'Pending',
        mepApproval: 'Pending', projectHeadApproval: 'Pending', liaisonApproval: 'Pending', mdApproval: 'Pending',
        finalStatus: 'On Track', revNo: 0, comments: [], assignmentDate: '05-07-2026'
      },
      {
        id: 'DEL-003', projectName: 'Bagmane Tech Park', consultant: 'MEP Consultants Ltd', deliverableName: 'HVAC Layout - Block A',
        stage: 'Detailed', group: 'MEP', floor: 'Floor 1-5', workInitiatedDate: '03-07-2026', submittedDate: '08-07-2026',
        dueDate: '12-07-2026', delay: 2, submissionStatus: 'Submitted', designTeamApproval: 'Rejected',
        designHeadApproval: 'Pending', mepApproval: 'Pending', projectHeadApproval: 'Pending', liaisonApproval: 'Pending', mdApproval: 'Pending',
        finalStatus: 'Needs Revision', revNo: 1, documents: [{ fileName: 'HVAC_Layout_BlockA_v1.pdf', fileSize: 1800000, fileType: 'pdf', fileUrl: '#DEL-003' }],
        comments: [{ author: 'Design Team', role: 'DTR', text: 'Revise duct routing on Floor 3', timestamp: '09-07-2026 10:00 AM', type: 'rejection' }],
        assignmentDate: '03-07-2026'
      },
      {
        id: 'DEL-004', projectName: 'Bagmane Constellation', consultant: 'GreenScape Design', deliverableName: 'Landscape Master Plan',
        stage: 'Concept', group: 'Landscape', floor: 'Ground Level', workInitiatedDate: '10-07-2026',
        dueDate: '25-07-2026', submissionStatus: 'Pending', designTeamApproval: 'Pending', designHeadApproval: 'Pending',
        mepApproval: 'Pending', projectHeadApproval: 'Pending', liaisonApproval: 'Pending', mdApproval: 'Pending',
        finalStatus: 'On Track', revNo: 0, comments: [], assignmentDate: '10-07-2026'
      },
      {
        id: 'DEL-005', projectName: 'Bagmane Tech Park', consultant: 'Artech Studio', deliverableName: 'Façade Design - Block B',
        stage: 'Detailed', group: 'Architecture', floor: 'All Floors', workInitiatedDate: '01-07-2026', submittedDate: '09-07-2026',
        dueDate: '14-07-2026', submissionStatus: 'Submitted', designTeamApproval: 'Approved', designHeadApproval: 'Approved',
        mepApproval: 'Approved', projectHeadApproval: 'Approved', liaisonApproval: 'Approved', mdApproval: 'Pending',
        finalStatus: 'In Review', revNo: 2, documents: [{ fileName: 'Facade_Design_BlockB_v2.pdf', fileSize: 3200000, fileType: 'pdf', fileUrl: '#DEL-005' }],
        comments: [
          { author: 'Design Head', role: 'DH', text: 'Approved', timestamp: '11-07-2026 03:00 PM', type: 'approval' },
          { author: 'MEP Head', role: 'MEPH', text: 'MEP compliant', timestamp: '12-07-2026 11:00 AM', type: 'approval' },
          { author: 'Project Head', role: 'PH', text: 'IFC approved', timestamp: '13-07-2026 09:00 AM', type: 'approval' },
          { author: 'Liaisoning Head', role: 'LH', text: 'Regulatory check passed', timestamp: '14-07-2026 10:00 AM', type: 'approval' }
        ],
        assignmentDate: '01-07-2026', ifcStatus: 'IFC Issued', ifcDate: '13-07-2026'
      },
    ];
  }

  private getSeedWorkload(): CtmWorkload[] {
    return [
      { name: 'Suresh Rao', role: 'Senior Contract Specialist', handlingCount: 3, completedCount: 12, loadLevel: 'High' },
      { name: 'Ravi Menon', role: 'Contract Specialist', handlingCount: 2, completedCount: 8, loadLevel: 'Moderate' },
      { name: 'Anita Desai', role: 'Contract Specialist', handlingCount: 1, completedCount: 5, loadLevel: 'Light' },
      { name: 'Karthik Iyer', role: 'Junior Contract Specialist', handlingCount: 0, completedCount: 3, loadLevel: 'Light' },
    ];
  }
}
