import { Component, OnInit, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from './core/services/auth.service';
import { MedVaultApiService } from './core/services/med-vault-api.service';

const SAMPLE_PATIENT_ID = '0195f3a0-7b12-7000-8000-000000000001';

const STEP_UP_POLICY_REASON =
  'Rejected by the `RequireStepUpMfaOrPasskey` policy if the token does not contain `mfa` or `fido` in the `amr` claim.';

@Component({
  selector: 'app-root',
  imports: [
    JsonPipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(MedVaultApiService);

  readonly apiResult = signal<unknown>({ info: 'Log in and run an IAM test' });
  readonly loading = signal(false);

  ngOnInit(): void {
    void this.auth.initialize().then(() => {
      // Automatic JIT synchronization upon return from login
      if (this.auth.isAuthenticated()) {
        this.syncProfile();
      }
    });
  }

  syncProfile(): void {
    this.execute(this.api.syncProfile());
  }

  readPatientRecord(): void {
    this.execute(this.api.readPatientRecord(SAMPLE_PATIENT_ID));
  }

  issuePrescription(): void {
    this.execute(
      this.api.issuePrescription({
        patientId: SAMPLE_PATIENT_ID,
        medicationCode: 'RX-OXY-10MG',
        dosageMg: 10,
      }),
      STEP_UP_POLICY_REASON,
    );
  }

  private execute(request$: Observable<unknown>, stepUpReason?: string): void {
    this.loading.set(true);
    request$
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.apiResult.set(res),
        error: (err: HttpErrorResponse) =>
          this.apiResult.set(
            err.error ??
              (stepUpReason
                ? { status: err.status, reason: stepUpReason, detail: err.message }
                : err.message),
          ),
      });
  }
}
