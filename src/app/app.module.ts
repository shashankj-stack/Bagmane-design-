import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LoginComponent } from './modules/login/login.component';
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
import { ToastComponent } from './shared/components/toast/toast.component';
import { UserSwitcherComponent } from './shared/components/user-switcher/user-switcher.component';

@NgModule({
  declarations: [
    AppComponent, LoginComponent, PortalHubComponent, RaiseIndentComponent,
    DesignHeadApprovalComponent, CoordinatorAssignmentComponent,
    ContractTeamMemberComponent, ContractHeadApprovalComponent,
    CobTrackerComponent, KickstartComponent, DesignDashboardComponent,
    DeliverablesTrackerComponent, ConsultantUploadComponent,
    ConsultantStageTrackerComponent, ApprovalPortalsComponent,
    SystemSettingsComponent, SapIntegrationComponent,
    ToastComponent, UserSwitcherComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, CommonModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
