import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface IssuePrescriptionRequest {
  patientId: string;
  medicationCode: string;
  dosageMg: number;
}

/**
 * Encapsulates all outbound HTTP calls to the MedVault backend
 * (.NET 10 + FastEndpoints). Bearer tokens are attached by MsalInterceptor.
 */
@Injectable({ providedIn: 'root' })
export class MedVaultApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Just-in-time synchronization of the caller's DDD profile. */
  syncProfile(): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/identity/sync`, {});
  }

  /** Reads the clinical record for a patient (RBAC + ABAC protected). */
  readPatientRecord(patientId: string): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/patients/${patientId}/record`);
  }

  /** Issues a controlled prescription (requires step-up MFA/Passkey). */
  issuePrescription(request: IssuePrescriptionRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/prescriptions`, request);
  }
}
