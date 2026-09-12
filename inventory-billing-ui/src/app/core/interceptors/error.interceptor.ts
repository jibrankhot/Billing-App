import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';
import { TokenService } from '../auth/services/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          tokenService.clearTokens();

          notificationService.error(
            'Your session has expired. Please login again.'
          );

          router.navigate(['/auth/login']);
          break;

        case 403:
          notificationService.error(
            'You do not have permission to perform this action.'
          );
          break;

        case 404:
          notificationService.error(
            'The requested resource was not found.'
          );
          break;

        case 422:
          notificationService.error(
            'Please check the submitted information.'
          );
          break;

        case 500:
          notificationService.error(
            'A server error occurred. Please try again later.'
          );
          break;

        case 0:
          notificationService.error(
            'Unable to connect to the server.'
          );
          break;

        default:
          notificationService.error(
            error.error?.message ||
            'Something went wrong. Please try again.'
          );
      }

      return throwError(() => error);
    })
  );
};