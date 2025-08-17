import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {AuthorizationManagerService} from "./authorization-manager.service";

/**
 * A route guard function used to control access to routes based on the user's authentication status.
 *
 * @constant {CanActivateFn} authGuard
 *
 * @param {ActivatedRouteSnapshot} route - The route snapshot that contains the route configuration and parameters.
 * @param {RouterStateSnapshot} state - The router state snapshot that includes the current state of the router.
 *
 * @returns {boolean | UrlTree} - Returns `true` if the user is authenticated and allowed to proceed to the route,
 * otherwise redirects the user to the login page and returns a UrlTree.
 *
 * @throws {Error} May throw an error if dependency injection fails for `AuthorizationManagerService` or `Router`.
 */
export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthorizationManagerService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    console.warn("User is not authenticated. Redirecting to login.");
    return router.navigate(['/login']);
  }
};
