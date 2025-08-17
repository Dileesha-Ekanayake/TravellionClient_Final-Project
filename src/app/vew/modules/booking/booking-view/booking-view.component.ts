import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Booking} from "../../../../entity/booking";
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass} from "@angular/common";
import {BookingDataShareService} from "../booking-data-share.service";
import {MatIcon} from "@angular/material/icon";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {MatButton, MatIconButton} from "@angular/material/button";
import {ApiEndpoints} from "../../../../services/api-endpoint";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {Subscription} from "rxjs";
import {MatPaginator} from "@angular/material/paginator";
import {DataService} from "../../../../services/data.service";
import {LoadingService} from "../../../../util/dialog/loading/loading.service";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {BookingStatus} from "../../../../entity/booking-status";
import {OperationFeedbackService} from "../../../../util/core-services/feedback/operationfeedback.service";

@Component({
  selector: 'app-booking-view',
  imports: [
    DatePipe,
    NgClass,
    CurrencyPipe,
    DecimalPipe,
    MatIcon,
    MatButton,
    MatCell,
    MatCellDef,
    MatFormField,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIconButton,
    MatInput,
    MatLabel,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatSuffix,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatNoDataRow
  ],
  templateUrl: './booking-view.component.html',
  styleUrl: './booking-view.component.css',
  standalone: true,
})
export class BookingViewComponent implements OnInit, OnDestroy{


  columns: string[] = ['code', 'guest', 'departuredate', 'enddate', 'bookingstatus', 'modify/view'];
  headers: string[] = ['Number', 'Guest', 'Departure Date', 'End Date', 'Status', 'Modify / View'];

  booking!: Booking | null;
  selectedBookingRow: Booking | null = null;

  @ViewChild('bookingDetailsContainer') bookingDetailsContainer!: ElementRef;

  dataSubscriber$ = new Subscription();
  bookings: Array<Booking> = [];
  filteredBookings: Array<Booking> = [];
  bookingData!: MatTableDataSource<Booking>;
  bookingLoadingImageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isEnableBookingDetailView: boolean = false;
  isEnableBookingGridView: boolean = false;
  isBookingGridView: boolean = false;
  isBookingTableView: boolean = false;

  status!: BookingStatus;

  bookingStatuses: Array<BookingStatus> = [];

  constructor(
   private bookingDataShareService: BookingDataShareService,
   private dataService: DataService,
   private loadingService: LoadingService,
   private operationFeedbackService: OperationFeedbackService,
  ) {
  }

  ngOnInit() {
    this.initialize();
  }

  /**
   * Initializes the component by setting up the display view, creating the view,
   * and subscribing to booking status data from the service. It also handles the
   * fetched data by updating the booking statuses and selecting a default status.
   *
   * @return {void} This method does not return a value.
   */
  initialize(): void {
    this.createView();
    this.setDisplayView('grid')
    this.setBookingGridOrTableView('grid');

    this.dataSubscriber$.add(
      this.dataService.getData<BookingStatus>(ApiEndpoints.paths.bookingStatuses).subscribe({
        next: (bookingStatuses) => {
          this.bookingStatuses = bookingStatuses;
          this.status = this.bookingStatuses[6];
        },
        error: (error) => {
          console.error("Error fetching booking statuses:", error.message);
        },
        complete: () => {
        }
      })
    )
  }

  /**
   * Initializes and prepares the view for display.
   * It sets up necessary configurations, including loading data for the table and defining the URL for the booking loading image.
   *
   * @return {void} This method does not return any value.
   */
  createView(): void {
    this.loadTable('');
    this.bookingLoadingImageURL = 'pending.gif';
  }

  /**
   * Updates and modifies the current booking with the provided booking details.
   * Sends the updated booking data to the shared service and triggers form updates.
   *
   * @param {Booking} booking - The updated booking object containing the new details.
   * @return {void} This method does not return a value.
   */
  modiFyBooking(booking: Booking): void {
    this.bookingDataShareService.sendBookingData(booking);
    this.bookingDataShareService.triggerFillForm();
    this.backToBookings();
  }

  /**
   * Navigates back to the booking list view.
   * Triggers the booking view change, updates the display to grid view,
   * and clears the selected booking row.
   *
   * @return {void} Does not return a value.
   */
  backToBookings(): void {
    this.bookingDataShareService.triggerBookingViewChange();
    this.setDisplayView('grid');
    this.selectedBookingRow = null;
  }

  /**
   * Sets the booking view to either grid or table and updates the corresponding flags.
   *
   * @param {'grid' | 'table'} view The view to set for bookings. Accepts either 'grid' or 'table'.
   * @return {void} Does not return a value.
   */
  setBookingGridOrTableView(view: 'grid' | 'table'): void {
    this.isBookingGridView = view === "grid";
    this.isBookingTableView = view === "table";
    view === "table" ? this.loadTable('') : '';
  }

  /**
   * Sets the display view for the booking interface.
   *
   * @param view The type of display view to set.
   *             Can be either 'details' to enable the detailed view
   *             or 'grid' to enable the grid view.
   * @return void
   */
  setDisplayView(view: 'details' | 'grid'): void {
    this.isEnableBookingDetailView = view === 'details';
    this.isEnableBookingGridView = view === 'grid';
  }

  //===========================================Load Bookings And Filtering=========================================================//

  /**
   * Loads booking data into a table based on the provided query string.
   * Updates the data source and handles loading state for the table.
   *
   * @param {string} query - The query string used to fetch data from the server.
   * @return {void} This method does not return a value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Booking>(ApiEndpoints.paths.bookings, query).subscribe({
        next: (bookings) => {
          this.bookings = bookings;
          this.filteredBookings = [...bookings];
          this.bookingLoadingImageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.bookingLoadingImageURL = 'rejected.png';
        },
        complete: (() => {
          this.bookingData = new MatTableDataSource(this.bookings);
          this.bookingData.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Retrieves the name of the lead passenger from the given booking.
   *
   * @param {Booking} booking - The booking object containing passenger information.
   * @return {string} The name of the lead passenger, or an empty string if no lead passenger is found.
   */
  getLeadPassengerName(booking: Booking): string {
    const leadPassenger = booking.bookingpassengers.find(passenger => passenger.leadpassenger);
    return leadPassenger?.name || '';
  }

  /**
   * Filters the booking table based on the user's input from an event.
   *
   * @param {Event} event - The event triggered by the user, typically from an input field.
   * @return {void} This method does not return a value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.filterBookingsGrid(filterValue);
    this.bookingData.filterPredicate = (booknig: Booking, filter: string) => {
      return (
        filterValue == null ||
        booknig.code.toLowerCase().includes(filterValue) ||
        booknig.bookingpassengers.find(passenger => passenger.name.toLowerCase().includes(filterValue))?.name.toLowerCase().includes(filterValue) ||
        booknig.bookingstatus.name.toLowerCase().includes(filterValue) ||
        booknig.departuredate.includes(filterValue) ||
        booknig.enddate.includes(filterValue) ||
        booknig.grossamount.toString().includes(filterValue) ||
        booknig.discountamount.toString().includes(filterValue) ||
        booknig.netamount.toString().includes(filterValue) ||
        booknig.totalpaid.toString().includes(filterValue) ||
        booknig.balance.toString().includes(filterValue)
      )

    };
    this.bookingData.filter = 'filter';
  }

  /**
   * Filters the bookings grid based on the provided filter value. The method updates the `filteredBookings` property with the filtered list of bookings.
   * If the filter value is empty or not provided, all bookings are included in the filtered list.
   *
   * @param {string} filterValue - The string used to filter bookings. It is matched against booking details like code, passenger name, status, dates, and amounts.
   * @return {void} This method does not return any value. It modifies the `filteredBookings` property of the instance.
   */
  filterBookingsGrid(filterValue: string): void {
    if (!filterValue || filterValue.trim() === '') {
      this.filteredBookings = [...this.bookings];
      return;
    }

    this.filteredBookings = this.bookings.filter(booking => {
      return booking.code.toLowerCase().includes(filterValue) ||
        booking.bookingpassengers.some(passenger => passenger.name.toLowerCase().includes(filterValue)) ||
        booking.bookingstatus.name.toLowerCase().includes(filterValue) ||
        booking.departuredate.includes(filterValue) ||
        booking.enddate.includes(filterValue) ||
        booking.grossamount.toString().includes(filterValue) ||
        booking.discountamount.toString().includes(filterValue) ||
        booking.netamount.toString().includes(filterValue) ||
        booking.totalpaid.toString().includes(filterValue) ||
        booking.balance.toString().includes(filterValue);
    });
  }

  //==================================Details View Grid Support Methods=================================//
  /**
   * Calculates the duration of a booking in days based on the departure and end dates.
   *
   * @param {Booking} booking - The booking object containing departure and end dates.
   * @return {number} The duration of the booking in days. Returns 0 if dates are invalid.
   */
  getBookingDuration(booking: Booking): number {
    const departure = new Date(booking.departuredate);
    const end = new Date(booking.enddate);

    // Ensure both dates are valid
    if (isNaN(departure.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    // Calculate difference in milliseconds and convert to days
    const diffInMs = end.getTime() - departure.getTime();
     // Ceil to include the end day
    return Math.abs(Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Calculates and returns the count of various itinerary components in the given booking.
   *
   * @param {Booking} booking - The booking object containing details of accommodations, transfers, generics, and tours.
   * @return {Object} An object containing counts of different itinerary components:
   *         - accommCount: Number of accommodations in the booking.
   *         - transferCount: Number of transfers in the booking.
   *         - genericCount: Number of generic items in the booking.
   *         - tourCount: Number of tours in the booking.
   */
  getItineraryCount(booking: Booking): { accommCount: number, transferCount: number, genericCount: number, tourCount: number } {
    const accommCount = booking.bookingaccommodations.length || 0;
    const transferCount = booking.bookingtransfers.length || 0;
    const genericCount = booking.bookinggenerics.length || 0;
    const tourCount = booking.bookingtours.length || 0;

    return {accommCount, transferCount, genericCount, tourCount};
  }

  /**
   * Selects a booking row and performs related operations like retrieving full booking details and showing a loading indicator.
   *
   * @param {Booking} row - The booking row to be selected.
   * @return {void} This method does not return a value.
   */
  selectRow(row: Booking) {
    this.selectedBookingRow = row;
    this.booking = this.selectedBookingRow;
    this.getFullBookingByBookingCode(row.code);
    this.loadingService.showLoading('Please wait...');
  }

  /**
   * Fetches the full booking information associated with the provided booking code
   * and updates the current booking details view.
   *
   * @param {string} bookingCode - The unique code identifying the booking to retrieve.
   * @return {void} This method does not return a value.
   */
  getFullBookingByBookingCode(bookingCode: string): void {
    this.dataSubscriber$.add(
      this.dataService.getDataObject<Booking>(ApiEndpoints.paths.bookingViews, bookingCode).subscribe({
        next: (booking) => {
          this.booking = booking;
          this.setDisplayView('details');
        },
        error: (error) => {
          console.error("Error fetching booking data:", error.message);
        },
        complete: () => {
          this.loadingService.hideLoading();
        }
      })
    )
  }

  /**
   * Updates the selected booking if a booking row is selected.
   * Displays confirmation dialog before proceeding with the update operation.
   * Informs the user about the status of the operation using feedback messages.
   *
   * @return {void} Does not return a value.
   */
  update(): void {

    if (!this.selectedBookingRow){
      this.operationFeedbackService.showErrors("Booking", "Update", "Please select a booking to update.");
      return;
    }
    const toUpdateBooking = this.selectedBookingRow;

    this.operationFeedbackService.showConfirmation('Booking', 'Update', "Booking Update")
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.dataService.update<Booking>(ApiEndpoints.paths.bookings, toUpdateBooking)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                this.operationFeedbackService.showStatus("Booking", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Booking", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  // Method to generate PDF for tour details
  /**
   * Generates a PDF document containing the booking details displayed in the bookingDetailsContainer.
   * The PDF is created with proper formatting, headers, footers, and pagination as needed.
   * Temporarily modifies the styles of the bookingDetailsContainer for accurate rendering in the PDF.
   * The generated PDF is then automatically downloaded to the user's device.
   *
   * @return {void} Does not return a value.
   */
  generateBookingPDF(): void {
    const element = this.bookingDetailsContainer.nativeElement;

    // Temporarily adjust styles for PDF (e.g., remove hover effects, set white background)
    const originalStyles = element.style.cssText;
    element.style.backgroundColor = '#ffffff';
    element.style.boxShadow = 'none';
    element.style.transform = 'none';
    element.style.transition = 'none';

    // Use html2canvas to capture the booking details
    html2canvas(element, {
      scale: 2, // Higher resolution for better quality
      useCORS: true, // Handle cross-origin images
      logging: false,
      backgroundColor: '#ffffff' // Ensure a white background
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
      pdf.text(`Booking: ${this.booking?.code || 'Booking Details'}})`, margin, 30);
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
            pdf.text(`Booking: ${this.booking?.code || 'Booking Details'}'})`, margin, 30);
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
      pdf.save(`Booking_${this.booking?.code || 'details'}_${new Date().toISOString().split('T')[0]}.pdf`);

      // Restore original styles
      element.style.cssText = originalStyles;
    }).catch(error => {
      console.error('Error generating booking PDF:', error);
      // Restore original styles in case of error
      element.style.cssText = originalStyles;
    });
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }
}
