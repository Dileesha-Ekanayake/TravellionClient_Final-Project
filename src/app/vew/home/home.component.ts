import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {BreadcrumbService} from "../../util/core-services/ui/breadcrumb.service";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-home',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    RouterLink,
    MatFormField,
    MatInput,
    MatLabel,
    MatButton,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
})
export class HomeComponent implements OnInit, AfterViewInit{

  breadcrumb: any;

  currentYear!: number;

  constructor(private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.currentYear = new Date().getFullYear();
  }

  /**
   * A lifecycle hook that is called after a component's view has been fully initialized.
   * This method initializes scrolling to a specific section of the page and sets up
   * an IntersectionObserver to observe elements and toggle their visibility based on
   * their intersection state.
   *
   * The method identifies specific elements within the DOM using predefined selectors
   * and toggles a 'show' CSS class when the elements or their nested targets become
   * visible or leave the viewport.
   *
   * Additionally, this method observes a set of container elements
   * to handle intersection-based visibility for both the containers
   * and their nested elements.
   *
   * @return {void} No return value.
   */
  ngAfterViewInit(): void {
    this.scrollToSection('main-section');
    const elementSelectors = [
      '.palm-leaves-left',
      '.palm-leaves-right',
      '.welcoming-text',
      '.about-us-image',
      '.data-container',
      '.image-gallery',
      '.mvv-card',
      '.timeline',
      '.services-list'
    ];

    /**
     * Creates a new IntersectionObserver instance to monitor the visibility
     * of elements in the viewport and toggle a CSS class based on their intersection state.
     *
     * The observer checks for intersections of the observed elements and a specified set
     * of selectors. If an element or any of its nested child elements matches one of the
     * selectors, it toggles the 'show' CSS class based on the intersection state.
     *
     * Functionality:
     * 1. Toggles the 'show' class if the observed element itself matches a selector.
     * 2. Toggles the 'show' class for nested elements within the observed element that
     *    match a selector.
     *
     * @param {IntersectionObserverEntry[]} entries - Array of entries containing details
     * about the observed elements and their intersection states.
     * @param {string[]} elementSelectors - Array of CSS selectors used to determine which
     * elements should be toggled based on their visibility state.
     *
     * Usage:
     * The observer must be instantiated and elements must be observed manually. It will
     * react to intersection changes for the elements matched by the provided selectors.
     */
      //@ts-ignore
    const observer = new IntersectionObserver(entries => {
        //@ts-ignore
      entries.forEach(entry => {
        elementSelectors.forEach(selector => {
          // Case 1: If entry.target itself matches the selector
          if (entry.target.matches(selector)) {
            entry.target.classList.toggle('show', entry.isIntersecting);
          }

          // Case 2: If the selector is inside entry.target
          const nestedElement = entry.target.querySelector(selector);
          if (nestedElement) {
            nestedElement.classList.toggle('show', entry.isIntersecting);
          }
        });
      });
    });

    // Observe all relevant containers
    const containerSelectors = [
      '.leaves-container',
      '.about-us-container',
      '.data-container',
      '.why-us',
      '.mvv-card',
      '.destinations-list',
      '.services-list'
    ];

    containerSelectors.forEach(containerSelector => {
      //@ts-ignore
      document.querySelectorAll(containerSelector).forEach(element => {
        observer.observe(element);
      });
    });
  }

  /**
   * Scrolls the page to a specific section identified by the provided section ID.
   *
   * @param {string} sectionId - The ID of the section to scroll to.
   * @return {void} This method does not return a value.
   */
  scrollToSection (sectionId: string): void {
    //@ts-ignore
    const selectedSection = document.getElementById(`${sectionId}`);
    if (selectedSection) {
      selectedSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

}
