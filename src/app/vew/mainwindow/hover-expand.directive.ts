import {Directive, HostListener} from '@angular/core';
import {MatExpansionPanel} from "@angular/material/expansion";

/**
 * A directive that enables automatic expansion and collapsing of a
 * Material Design Expansion Panel when the mouse enters or leaves the element.
 * This directive specifically targets an element with the appHoverExpand attribute.
 *
 * The directive listens for mouseenter and mouseleave events on the host element.
 * Upon a mouseenter event, it triggers the associated MatExpansionPanel to open.
 * Upon a mouseleave event, it triggers the associated MatExpansionPanel to close.
 *
 * This directive is built as a standalone Angular component.
 */
@Directive({
  selector: '[appHoverExpand]',
  standalone: true
})
export class HoverExpandDirective {

  constructor(private expansionPanel: MatExpansionPanel) { }

  /**
   * Listener method that triggers when the mouse enters the host element.
   * It opens the associated expansion panel.
   *
   * @return {void} No return value as the method performs an action.
   */
  @HostListener('mouseenter') onMouseEnter(): void {
    this.expansionPanel.open();
  }

  /**
   * Handles the mouse leave event on the host element.
   * This method triggers the closing of the associated expansion panel.
   *
   * @return {void} Does not return a value.
   */
  @HostListener('mouseleave') onMouseLeave(): void {
    this.expansionPanel.close();
  }
}
