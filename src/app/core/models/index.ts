// ===== Indent Request Entity (Table 106) =====
export interface IndentRequest {
  indentId: string;                    // Auto-generated CB-XXX
  category: 'General' | 'Consultant Onboarding';
  techPark: string;
  buildingNames: string[];
  consultantType?: string;             // Required when category = Consultant Onboarding
  numConsultantsRequired: number;      // 1-10
  scopeOfWork: string;
  description?: string;
  rfpDate?: string;
  mgmtSignOn: boolean;
  mgmtSignOnDate?: string;
  raisedBy: string;
  requestDateTime: string;
  status: IndentStatus;
  assignee?: string;
  proposedConsultants: ProposedConsultant[];
  itemList?: LineItem[];
  woData?: WorkOrder[];
  coordNotes?: string;
  dhRemarks?: string;
  chRemarks?: string;
  approvedDateTime?: string;
  chApprovedDateTime?: string;
  // Extended tracker fields
  ctmAcceptedDateTime?: string;
  ctmWoReleasedDateTime?: string;
  cobTat?: string;
  declineReason?: string;
  declinedBy?: string;
  kickstartSent?: boolean;
  kickstartSentDateTime?: string;
}

export type IndentStatus =
  | 'Draft'
  | 'Pending DH Review'
  | 'DH Approved'
  | 'Rejected'
  | 'Indent Raised'
  | 'Accepted'
  | 'CH Rejected'
  | 'Completed';

// ===== Proposed Consultant (Table 107) =====
export interface ProposedConsultant {
  firm: string;
  contact?: string;
  phone?: string;
  email?: string;
  location?: string;         // Never auto-filled
  proposal?: boolean;
  proposalDate?: string;
}

// ===== Line Item =====
export interface LineItem {
  slNo: number;
  description: string;
  quantity: number;
  uom: string;
  expectedDate: string;
}

// ===== Work Order (Table 108) =====
export interface WorkOrder {
  woId: string;
  consultantFirm: string;
  fee: string;               // Agreed fee (₹)
  woDate: string;            // WO release date
  remarks?: string;
  approvalNotes?: string;
  finalApprovalNotes?: string;
  contractAttachment?: FileAttachment;
}

// ===== File Attachment =====
export interface FileAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

// ===== Deliverable Entity =====
export interface Deliverable {
  id: string;
  projectName: string;
  consultant: string;
  deliverableName: string;
  stage: DesignStage;
  group?: string;
  floor?: string;
  workInitiatedDate: string;
  submittedDate?: string;
  dueDate: string;
  delay?: number;
  timeTaken?: string;
  submissionStatus: SubmissionStatus;
  designTeamApproval: ApprovalStatus;
  designHeadApproval: ApprovalStatus;
  mepApproval: ApprovalStatus;
  projectHeadApproval: ApprovalStatus;
  liaisonApproval: ApprovalStatus;
  mdApproval: ApprovalStatus;
  finalStatus: FinalStatus;
  revNo: number;
  ifcStatus?: string;
  ifcDate?: string;
  documents?: FileAttachment[];
  comments: DeliverableComment[];
  assignmentDate?: string;
  assignmentStatus?: string;
}

export type DesignStage = 'Pre-Concept' | 'Concept' | 'Schematic' | 'Detailed' | 'GFC' | 'Sanction' | 'Tender';
export type SubmissionStatus = 'Pending' | 'Submitted';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type FinalStatus = 'On Track' | 'In Review' | 'Needs Revision' | 'Approved' | 'Delayed' | 'Fully Approved';

export interface DeliverableComment {
  author: string;
  role: string;
  text: string;
  timestamp: string;
  type: 'approval' | 'rejection' | 'revision' | 'submission' | 'general';
}

// ===== CTM Workload =====
export interface CtmWorkload {
  name: string;
  role: string;
  handlingCount: number;
  completedCount: number;
  loadLevel: 'High' | 'Moderate' | 'Light';
}

// ===== User / Role =====
export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  portalAccess: string[];
}

export type UserRole =
  | 'IR' | 'DH' | 'COORD' | 'CTM' | 'CH'
  | 'MGMT' | 'DTR' | 'EXT' | 'ADMIN'
  | 'MEPH' | 'PH' | 'LH' | 'MD';

// ===== Stage Tracker =====
export interface ConsultantStageProgress {
  consultant: string;
  preConcept: StageStatus;
  concept: StageStatus;
  schematic: StageStatus;
  detailed: StageStatus;
  gfc: StageStatus;
  sanction: StageStatus;
  tender: StageStatus;
  overall: StageStatus;
}

export type StageStatus = 'Not Started' | 'Pending' | 'In Progress' | 'Completed';

// ===== System Settings =====
export interface SystemSettings {
  approvalTier: 2 | 3;
  notifications: NotificationSettings;
  sharepoint: SharePointConfig;
}

export interface NotificationSettings {
  upcomingDeadlineAlerts: boolean;
  deadlineLeadDays: number;
  delayedItemAlerts: boolean;
  newSubmissionNotifications: boolean;
  approvalRejectionNotifications: boolean;
  channels: ('email' | 'portal')[];
}

export interface SharePointConfig {
  siteUrl: string;
  libraryPath: string;
  authMethod: string;
  authKey?: string;
}

// ===== Dashboard =====
export interface DashboardKpi {
  activeProjects: { count: number; trend: number };
  onTrackDeliverables: { percentage: number; trend: number };
  delayedDeliverables: { count: number; criticalCount: number };
  consultantPerformance: { rating: number; maxRating: number };
}

export interface ProjectCard {
  projectName: string;
  location: string;
  activeConsultants: number;
  completionPercentage: number;
  status: 'On Track' | 'At Risk' | 'Delayed';
  warningReason?: string;
}

export interface SubmissionApprovalData {
  month: string;
  submissions: number;
  approvals: number;
}

export interface CriticalAlert {
  deliverableName: string;
  project: string;
  delayDuration: number;
  consultant: string;
  severity: 'critical' | 'warning';
}

export interface OnboardingDelay {
  consultantType: string;
  raisedBy: string;
  pendingWith: string;
  delayDays: number;
}

export interface DeliverableDelay {
  deliverableName: string;
  delayDays: number;
  responsibleConsultant: string;
  pendingApprovalDetails: string;
}

export interface RecentUpdate {
  activity: string;
  timestamp: string;
  type: 'indent' | 'approval' | 'rejection' | 'submission' | 'kickstart';
  relatedId: string;
}

// ===== COB Tracker =====
export interface CobMatrixRecord {
  id: number;
  consultant: string;
  project: string;
  status: string;
  remarks?: string;
}

// ===== Activity Timeline =====
export interface ActivityEvent {
  event: string;
  timestamp: string;
  actor: string;
  details: string;
}

// ===== SAP Sync =====
export interface SapSyncStatus {
  indentId: string;
  woId: string;
  syncStatus: 'Synced' | 'Pending' | 'Failed';
  lastSyncDateTime?: string;
  errorMessage?: string;
}

// ===== Notification =====
export interface AppNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
  autoDismiss: boolean;
}

// ===== Action Point =====
export interface ActionPoint {
  id: string;
  indentId: string;
  description: string;
  assignedTo: string;
  deadline: string;
  status: 'Open' | 'In Progress' | 'Closed';
  createdAt: string;
}
