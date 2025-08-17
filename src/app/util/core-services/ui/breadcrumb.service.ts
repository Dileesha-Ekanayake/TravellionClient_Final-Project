import { Injectable } from '@angular/core';
import { AuthorizationManagerService } from "../../../auth/authorization-manager.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Service for managing breadcrumb navigation in the application.
 * It dynamically updates the breadcrumb trail based on the current route.
 */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {

  private homeUrl: string;

  constructor(
    private authService: AuthorizationManagerService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    this.homeUrl = '/Home/dashboard';
    this.initializeBreadcrumb();
  }

  /**
   * Initializes the breadcrumb component by subscribing to router navigation events.
   * It listens for NavigationEnd events and triggers the extraction of the active route.
   *
   * @return {void} This method does not return a value.
   */
  private initializeBreadcrumb(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.getActiveRoute();
    });
  }

  /**
   * Retrieves the active route's breadcrumb as a sanitized SafeHtml object.
   *
   * This method processes the route's URL segments, determines the corresponding menu item,
   * and builds the breadcrumb representation. The breadcrumb is sanitized for safe rendering.
   *
   * @return {SafeHtml} The sanitized breadcrumb representation of the active route.
   */
  public getActiveRoute(): SafeHtml {
    const urlSegments: string[] = this.getUrlSegments(this.route.root);
    const selectedMenu: any = this.findMainMenuFromUrl(urlSegments);

    const breadcrumb = this.buildBreadcrumb(urlSegments, selectedMenu);
    return this.sanitizer.bypassSecurityTrustHtml(breadcrumb);
  }

  /**
   * Builds a breadcrumb navigation string based on the given URL segments and selected menu.
   *
   * @param {string[]} urlSegments - An array of URL segments representing the parts of the path.
   * @param {any} selectedMenu - The menu item object representing the current or selected menu.
   *                              It is expected to have a "Menu" property.
   * @return {string} The generated breadcrumb navigation string.
   */
  private buildBreadcrumb(urlSegments: string[], selectedMenu: any): string {
    const capitalizedUrl = urlSegments.map(segment => this.capitalizeFirstLetter(segment));
    let breadcrumb = `<a href="${this.homeUrl}">${capitalizedUrl[0]}</a>`; // Start with home link

    // If there's a selected menu, add it after the home
    if (selectedMenu && selectedMenu.Menu) {
      breadcrumb += ` / ${selectedMenu.Menu}`;
    }

    // Use reduce to accumulate the breadcrumb and progressively build the path
    urlSegments.reduce((path, segment, index) => {
      path += `/${segment}`; // Add each segment to form the full path
      if (index > 0) { // Skip the first segment since it's already added
        breadcrumb += ` / <a href="${path}">${capitalizedUrl[index]}</a>`;
      }
      return path; // Return the updated path for the next iteration
    }, ''); // Initialize with an empty string for the path

    return breadcrumb.trim();
  }

  /**
   * Retrieves the URL segments from the provided route and its child routes.
   *
   * @param {ActivatedRoute} route - The Angular route object to extract URL segments from.
   * @return {string[]} An array of strings representing the URL segments.
   */
  private getUrlSegments(route: ActivatedRoute): string[] {
    let segments: string[] = route.snapshot.url.map(segment => segment.path);

    if (route.firstChild) {
      segments = segments.concat(this.getUrlSegments(route.firstChild));
    }
    return segments;
  }

  private findMainMenuFromUrl(urlSegments: string[]): any {
    const menuItemName = urlSegments[1]?.toLowerCase() || null;
    const menus = this.authService.getNavListItem();

    for (const menuGroup of menus) {
      for (const menuItem of menuGroup.MenuItems) {
        if (menuItem.name.toLowerCase() === menuItemName) {
          return menuGroup;
        }
      }
    }

    return null;
  }

  /**
   * Capitalizes the first letter of the provided string and converts the rest of the string to lowercase.
   *
   * @param {string} str - The string to capitalize.
   * @return {string} The modified string with the first letter capitalized and the rest in lowercase.
   */
  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
