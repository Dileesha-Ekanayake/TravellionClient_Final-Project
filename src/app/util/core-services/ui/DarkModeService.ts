import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

/**
 * Service responsible for managing dark mode functionality throughout the application.
 * Provides methods to toggle between light and dark mode by adding or removing
 * the appropriate class from the root HTML element.
 *
 * This service keeps track of the current theme state and updates the application's
 * renderer accordingly.
 *
 * The dark mode setting is applied by toggling a CSS class (e.g., 'dark-mode') on the
 * root HTML document element.
 */
@Injectable({
  providedIn: 'root',
})
export class DarkModeService {
  private renderer: Renderer2;
  public isDarkMode = false;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Toggles the application's mode between dark and light themes.
   *
   * @return {void} This method does not return a value.
   */
  toggleMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      //@ts-ignore
      this.renderer.addClass(document.documentElement, 'dark-mode');
    } else {
      //@ts-ignore
      this.renderer.removeClass(document.documentElement, 'dark-mode');
    }
  }
}
