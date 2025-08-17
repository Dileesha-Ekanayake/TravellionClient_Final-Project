import {Component, ElementRef, OnInit, Pipe, PipeTransform, ViewChild} from '@angular/core';
import {CurrencyPipe, DatePipe} from "@angular/common";
import {Tour} from "../../../../entity/tour";
import {TourDataShareService} from "../tour-data-share.service";
import {BreadcrumbService} from "../../../../util/core-services/ui/breadcrumb.service";
import {Router} from "@angular/router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

@Pipe({name: 'filterByDay'})
export class FilterByDayPipe implements PipeTransform {
  transform(items: any[], day: number): any[] {
    return items.filter(item => item.day === day);
  }
}

@Component({
  selector: 'app-tour-view',
  imports: [
    DatePipe,
    FilterByDayPipe,
    CurrencyPipe,
    MatButton,
    MatIcon
  ],
  templateUrl: './tour-view.component.html',
  styleUrl: './tour-view.component.css',
  standalone: true,
})
export class TourViewComponent implements OnInit {

  @ViewChild('tourDetailsContainer') tourDetailsContainer!: ElementRef;

  isEnableTourView: boolean = false;
  tour!: Tour | null;
  breadcrumb: any;


  constructor(
    private breadCrumbService: BreadcrumbService,
    private tourDataShareService: TourDataShareService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.breadcrumb = this.breadCrumbService.getActiveRoute();

    this.initialize();
  }

  initialize(): void {
    this.tour = this.tourDataShareService.getTourData();
    this.isEnableTourView = true;
  }

  /**
   * Retrieves a sorted array of unique days from the tour's accommodations, transfer contracts, and generics.
   *
   * @return {number[]} An array of unique days in ascending order. If no tour is available, returns an empty array.
   */
  getUniqueDays(): number[] {
    const days = new Set<number>();
    if (this.tour) {
      this.tour.touraccommodations.forEach(a => days.add(a.day));
      this.tour.tourtransfercontracts.forEach(t => days.add(t.day));
      this.tour.tourgenerics.forEach(g => days.add(g.day));
      return Array.from(days).sort((a, b) => a - b);
    }
    return [];
  }

  /**
   * Modifies the selected tour by updating the tour data and navigating back to the packages view.
   *
   * @param {Tour} tour - The tour object containing updated information to modify the current tour.
   * @return {void} Does not return a value.
   */
  modiFyTour(tour: Tour): void {
    this.isEnableTourView = false;
    this.tourDataShareService.clearTourData();
    this.tourDataShareService.sendTourData(tour);
    this.backToPackages()
  }

  /**
   * Navigates back to the packages view by performing the following actions:
   * - Disables the tour view.
   * - Clears tour data using the tourDataShareService.
   * - Triggers a tour view change event through the tourDataShareService.
   * - Redirects the application to the "/Home/package" route.
   *
   * @return {void} No return value.
   */
  backToPackages() {
    this.isEnableTourView = false;
    this.tourDataShareService.clearTourData();
    this.tourDataShareService.triggerTourViewChange();
    this.router.navigateByUrl("/Home/package");
  }

  // Method to generate PDF for tour details
  /**
   * Generates a PDF document containing tour details.
   * This method captures the visual representation of the tour details from the specified DOM element,
   * adjusts styles temporarily for formatting, and converts the content into a downloadable
   * multi-page or single-page PDF.
   *
   * @return {void} Does not return a value. The PDF is directly downloaded to the user's device.
   */
  generateTourPDF(): void {
    const element = this.tourDetailsContainer.nativeElement;

    // Temporarily adjust styles for PDF (e.g., remove hover effects, set white background)
    const originalStyles = element.style.cssText;
    element.style.backgroundColor = '#ffffff';
    element.style.boxShadow = 'none';
    element.style.transform = 'none';
    element.style.transition = 'none';

    // Use html2canvas to capture the tour details
    html2canvas(element, {
      scale: 2, // Higher resolution for better quality
      useCORS: true, // Handle cross-origin images
      logging: false,
      backgroundColor: '#ffffff' // Ensure white background
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait', // Portrait for invoice-like format
        unit: 'px',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add header
      pdf.setFontSize(16);
      pdf.setFont('Inter', 'bold');
      pdf.setTextColor(17, 24, 39); // #111827
      pdf.text(`Tour: ${this.tour?.name || 'Tour Details'} (${this.tour?.reference || ''})`, margin, 30);
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // #6b7280
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 50);

      // Add content
      let position = 70;
      const contentHeight = imgHeight;

      if (contentHeight > pageHeight - 100) {
        // Multi-page PDF
        let heightLeft = contentHeight;
        let yPosition = 0;

        while (heightLeft > 0) {
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, Math.min(pageHeight - 100, contentHeight), undefined, 'FAST');
          heightLeft -= pageHeight - 100;
          yPosition += pageHeight - 100;
          position = 70;

          if (heightLeft > 0) {
            pdf.addPage();
            // Add header on new page
            pdf.setFontSize(16);
            pdf.setFont('Inter', 'bold');
            pdf.setTextColor(17, 24, 39);
            pdf.text(`Tour: ${this.tour?.name || 'Tour Details'} (${this.tour?.reference || ''})`, margin, 30);
            pdf.setFontSize(10);
            pdf.setTextColor(107, 114, 128);
            pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 50);
          }
        }
      } else {
        // Single-page PDF
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, contentHeight, undefined, 'FAST');
      }

      // Add footer with page number
      //@ts-ignore
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 50, pageHeight - 20);
      }

      // Save the PDF
      pdf.save(`Tour_${this.tour?.reference || 'details'}_${new Date().toISOString().split('T')[0]}.pdf`);

      // Restore original styles
      element.style.cssText = originalStyles;
    }).catch(error => {
      console.error('Error generating tour PDF:', error);
      // Restore original styles in case of error
      element.style.cssText = originalStyles;
    });
  }


}
