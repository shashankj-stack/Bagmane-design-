import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PortalHubComponent } from './modules/portal-hub/portal-hub.component';
import { RaiseIndentComponent } from './modules/raise-indent/raise-indent.component';
import { DesignHeadApprovalComponent } from './modules/design-head-approval/design-head-approval.component';
import { CoordinatorAssignmentComponent } from './modules/coordinator-assignment/coordinator-assignment.component';
import { ContractTeamMemberComponent } from './modules/contract-team-member/contract-team-member.component';
import { ContractHeadApprovalComponent } from './modules/contract-head-approval/contract-head-approval.component';
import { CobTrackerComponent } from './modules/cob-tracker/cob-tracker.component';
import { KickstartComponent } from './modules/kickstart/kickstart.component';
import { DesignDashboardComponent } from './modules/design-dashboard/design-dashboard.component';
import { DeliverablesTrackerComponent } from './modules/deliverables-tracker/deliverables-tracker.component';
import { ConsultantUploadComponent } from './modules/consultant-upload/consultant-upload.component';
import { ConsultantStageTrackerComponent } from './modules/consultant-stage-tracker/consultant-stage-tracker.component';
import { ApprovalPortalsComponent } from './modules/approval-portals/approval-portals.component';
import { SystemSettingsComponent } from './modules/system-settings/system-settings.component';
import { SapIntegrationComponent } from './modules/sap-integration/sap-integration.component';

import { LoginComponent } from './modules/login/login.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'portal-hub', component: PortalHubComponent },
  { path: 'raise-indent', component: RaiseIndentComponent },
  { path: 'design-head-approval', component: DesignHeadApprovalComponent },
  { path: 'coordinator-assignment', component: CoordinatorAssignmentComponent },
  { path: 'contract-team-member', component: ContractTeamMemberComponent },
  { path: 'contract-head-approval', component: ContractHeadApprovalComponent },
  { path: 'cob-tracker', component: CobTrackerComponent },
  { path: 'kickstart', component: KickstartComponent },
  { path: 'design-dashboard', component: DesignDashboardComponent },
  { path: 'deliverables-tracker', component: DeliverablesTrackerComponent },
  { path: 'consultant-upload', component: ConsultantUploadComponent },
  { path: 'consultant-stage-tracker', component: ConsultantStageTrackerComponent },
  { path: 'approval-portals', component: ApprovalPortalsComponent },
  { path: 'system-settings', component: SystemSettingsComponent },
  { path: 'sap-integration', component: SapIntegrationComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
