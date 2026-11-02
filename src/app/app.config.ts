import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  MsalInterceptor,
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalService,
  MsalGuard,
  MsalBroadcastService
} from '@azure/msal-angular';

import { PublicClientApplication, InteractionType, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from '@env/environment';

import { routes } from './app.routes';

export function MSALInstanceFactory(){
  return new PublicClientApplication({
    auth:{
      clientId: environment.spaClientId,
      authority: environment.authority,
      redirectUri: 'http://localhost:4200'
    },
    cache:{
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  })
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: [
            'openid',
            'profile',
            `api://${environment.apiClientId}/Records.Read`,
            `api://${environment.apiClientId}/Prescriptions.Write`,
          ]
        }
      }
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          [
            `${environment.apiUrl}/*`,
            [
              `api://${environment.apiClientId}/Records.Read`,
              `api://${environment.apiClientId}/Prescriptions.Write`,
            ]
          ]
        ]),
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};
