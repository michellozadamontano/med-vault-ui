import { Injectable, inject, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

/**
 * Wraps MSAL authentication: instance initialization, redirect handling,
 * and login/logout redirect flows against Microsoft Entra ID.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);

  /** Whether at least one signed-in account exists in the MSAL cache. */
  readonly isAuthenticated = signal(false);

  /**
   * Initializes the MSAL instance and processes any pending redirect response.
   * Must be awaited once at application startup before calling the API.
   */
  async initialize(): Promise<void> {
    await this.msal.instance.initialize();
    const result = await this.msal.instance.handleRedirectPromise();
    if (result?.account) {
      this.msal.instance.setActiveAccount(result.account);
    }
    this.isAuthenticated.set(this.msal.instance.getAllAccounts().length > 0);
  }

  login(): void {
    this.msal.loginRedirect();
  }

  logout(): void {
    this.msal.logoutRedirect();
  }
}
