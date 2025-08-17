import {ApplicationConfig, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors} from "@angular/common/http";
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {AuthorizationManagerService} from "./auth/authorization-manager.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {JwtInterceptor} from "./auth/jwt-interceptor";
import {DatePipe} from "@angular/common";


export const appConfig: ApplicationConfig = {
  providers: [
    DatePipe,
    AuthorizationManagerService,
    provideZoneChangeDetection({ eventCoalescing: true, }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([JwtInterceptor])),
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: LOCALE_ID, useValue: 'en-US' }
  ],
};
