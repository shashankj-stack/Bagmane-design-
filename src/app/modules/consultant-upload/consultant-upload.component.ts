import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { Deliverable, FileAttachment } from '../../core/models';

@Component({
  selector: 'app-consultant-upload',
  template: `
<div class="page-container">
  <div class="page-header">
    <div class="page-title-section"><h1>Consultant External Upload Portal</h1><p>Upload deliverables, track revisions, and view submission history</p></div>
    <button class="btn btn-outline" (click)="router.navigate(['/portal-hub'])">Back to Hub</button>
  </div>
  <div class="section-header"><h2>My Assigned Deliverables</h2></div>
  <div class="table-container">
    <table><thead><tr><th>Deliverable</th><th>Stage</th><th>Due Date</th><th>Status</th><th>Revision</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let d of deliverables">
          <td><strong>{{ d.deliverableName }}</strong><div class="text-sm text-secondary">{{ d.projectName }}</div></td>
          <td><span class="badge badge-light">{{ d.stage }}</span></td>
          <td class="text-sm">{{ d.dueDate }}</td>
          <td><span class="badge" [class.badge-success]="d.submissionStatus==='Submitted'" [class.badge-warning]="d.submissionStatus==='Pending'">{{ d.submissionStatus }}</span></td>
          <td>Rev {{ d.revNo }}</td>
          <td>
            <div class="btn-group">
              <button *ngIf="d.submissionStatus==='Submitted'" class="btn btn-outline btn-sm" (click)="viewSubmission(d)">View Submission</button>
              <button class="btn btn-accent btn-sm" (click)="openUpload(d)">Upload {{ d.submissionStatus==='Submitted' ? 'Revision' : 'File' }}</button>
            </div>
          </td>
        </tr>
      </tbody></table>
  </div>

  <!-- Upload Modal -->
  <div class="modal-overlay" *ngIf="showUploadModal" (click)="showUploadModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Upload {{ uploadDeliverable?.submissionStatus === 'Submitted' ? 'Revision' : 'Deliverable' }}</h2><button class="modal-close" (click)="showUploadModal = false">&times;</button></div>
      <div class="modal-body">
        <div *ngIf="uploadDeliverable"><strong>{{ uploadDeliverable.deliverableName }}</strong> - {{ uploadDeliverable.stage }} | Due: {{ uploadDeliverable.dueDate }}</div>
        <div class="form-group" style="margin-top:16px"><label class="form-label">Revision Number</label>
          <select class="form-select" [(ngModel)]="revisionNo"><option [value]="(uploadDeliverable?.revNo || 0)">Rev {{ uploadDeliverable?.revNo || 0 }} (Current)</option><option [value]="(uploadDeliverable?.revNo || 0) + 1">Rev {{ (uploadDeliverable?.revNo || 0) + 1 }} (New)</option></select>
        </div>
        <div class="form-group"><label class="form-label">Stage Gate</label>
          <select class="form-select" [(ngModel)]="selectedStage"><option>Concept Design</option><option>Schematic Design</option><option>Tender Documentation</option><option>GFC</option><option>As-Built</option></select>
        </div>
        <div class="form-group">
          <div class="dropzone" style="padding:40px" [class.active]="dragOver" (dragover)="dragOver=true;$event.preventDefault()" (dragleave)="dragOver=false" (drop)="onDrop($event)">
            <p *ngIf="!uploadedFileName">Drag & drop file here, or click to browse</p>
            <p *ngIf="uploadedFileName" style="color:var(--success)">File: {{ uploadedFileName }}</p>
            <input type="file" style="display:none" #fileInput (change)="onFileSelected($event)" accept=".pdf,.docx,.dwg,.jpg,.png">
            <button class="btn btn-outline btn-sm" (click)="fileInput.click()">Browse Files</button>
          </div>
          <div class="form-hint">Accepted formats: PDF, DOCX, DWG, JPG, PNG | Max 50MB</div>
        </div>
        <div class="form-group"><label class="form-label">Comments / Notes</label><textarea class="form-textarea" [(ngModel)]="uploadNotes" rows="3" placeholder="Add any notes about this submission..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" (click)="showUploadModal = false">Cancel</button>
        <button class="btn btn-accent" (click)="submitDeliverable()" [disabled]="!uploadedFileName">Submit Deliverable</button>
      </div>
    </div>
  </div>

  <!-- View Submission Modal -->
  <div class="modal-overlay" *ngIf="showViewModal && viewDeliverable" (click)="showViewModal = false">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header"><h2>Submission History - {{ viewDeliverable.deliverableName }}</h2><button class="modal-close" (click)="showViewModal = false">&times;</button></div>
      <div class="modal-body">
        <div *ngIf="viewDeliverable.documents?.length; else noDocs">
          <div *ngFor="let doc of viewDeliverable.documents; let i = index" class="card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
            <div><strong>Rev {{ i }}</strong>: {{ doc.fileName }} ({{ (doc.fileSize / 1000000).toFixed(1) }} MB)</div>
            <button class="btn btn-outline btn-sm">Download</button>
          </div>
        </div>
        <ng-template #noDocs><p class="text-secondary">No previous submissions.</p></ng-template>
        <h3 style="margin:16px 0 8px">Revision History</h3>
        <div class="timeline">
          <div class="timeline-item" *ngFor="let c of viewDeliverable.comments">
            <div style="font-weight:600">{{ c.type }} by {{ c.author }}</div>
            <div class="text-sm text-secondary">{{ c.timestamp }}</div>
            <div class="text-sm">{{ c.text }}</div>
          </div>
          <div *ngIf="!viewDeliverable.comments?.length" class="text-sm text-secondary">No revision history.</div>
        </div>
      </div>
    </div>
  </div>
</div>
`,
  styles: []
})
export class ConsultantUploadComponent implements OnInit {
  deliverables: Deliverable[] = [];
  showUploadModal = false;
  showViewModal = false;
  uploadDeliverable: Deliverable | null = null;
  viewDeliverable: Deliverable | null = null;
  revisionNo = 0;
  selectedStage = 'Concept Design';
  uploadNotes = '';
  uploadedFileName = '';
  dragOver = false;

  constructor(public router: Router, public dataService: DataService) {
    this.dataService.deliverables$.subscribe(v => this.deliverables = v);
  }
  ngOnInit() {}

  openUpload(d: Deliverable) { this.uploadDeliverable = d; this.revisionNo = d.revNo; this.uploadedFileName = ''; this.uploadNotes = ''; this.showUploadModal = true; }
  viewSubmission(d: Deliverable) { this.viewDeliverable = d; this.showViewModal = true; }
  onFileSelected(event: Event) { const input = event.target as HTMLInputElement; if (input.files?.length) this.uploadedFileName = input.files[0].name; }
  onDrop(event: DragEvent) { event.preventDefault(); this.dragOver = false; if (event.dataTransfer?.files?.length) this.uploadedFileName = event.dataTransfer.files[0].name; }
  submitDeliverable() {
    if (!this.uploadDeliverable || !this.uploadedFileName) return;
    const file: FileAttachment = { fileName: this.uploadedFileName, fileSize: 2500000, fileType: 'pdf', fileUrl: `#${this.uploadDeliverable.id}` };
    this.dataService.submitDeliverableByConsultant(this.uploadDeliverable.id, file, this.uploadNotes);
    this.showUploadModal = false;
  }
}
