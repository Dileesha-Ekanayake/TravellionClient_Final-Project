import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from "@angular/core";
import { AuthorizationManagerService } from "./authorization-manager.service";
import {catchError, throwError} from "rxjs";

/**
 * JwtInterceptor is an implementation of the `HttpInterceptorFn` interface used to intercept and modify outgoing HTTP requests
 * in order to include a JSON Web Token (JWT) in the `Authorization` header when the user is authenticated.
 *
 * This interceptor also handles error scenarios such as unauthorized (401) HTTP responses by logging out the user.
 *
 * Behavior:
 * - Retrieves the JWT token from local storage, where it is expected to be stored under the key `authToken`.
 * - Checks if the user is authenticated through an injected instance of `AuthorizationManagerService`.
 * - If authenticated and a valid JWT token exists, clones the request and adds the `Authorization` header with the token.
 * - If the user is not authenticated or no token is available, invokes the logout method of `AuthorizationManagerService` and allows the request to pass through unaltered.
 * - On receiving a 401 HTTP error response, logs out the user and propagates the error.
 *
 * Dependencies:
 * - AuthorizationManagerService: Used to determine user authentication status and handle logout functionality.
 *
 * Note:
 * - The interceptor assumes that the JWT token is stored in the browser's local storage with the key `authToken`.
 * - When no JWT token is available or the user is not authenticated, a warning is logged, and the user is logged out.
 * - Handles HTTP errors using RxJS operators `catchError` and `throwError`.
 *
 * @param request The outgoing `HttpRequest` to be intercepted.
 * @param next The next interceptor in the chain or the final request handler.
 * @returns An observable of the HTTP response with the modifications applied, or an error if an HTTP failure occurs.
 */
export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthorizationManagerService);
  // @ts-ignore
  const jwtToken = localStorage.getItem('authToken');

  if (authService.isAuthenticated() && jwtToken) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${jwtToken}`
      }
    });
  } else {
    console.warn("User not authenticated. Logging out...");
    authService.logout();
    return next(request);
  }

  return next(request).pipe(
    catchError(err => {
      if (err.status === 401) {
        console.warn("Unauthorized request. Logging out...");
        authService.logout();
      }
      return throwError(() => err);
    })
  );
};
