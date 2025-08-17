import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatCalendar} from "@angular/material/datepicker";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {CurrencyPipe, DatePipe, NgClass} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";
import {Dashboard} from "./dashboard";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {RecentBooking} from "./RecentBooking";
import {RouterLink} from "@angular/router";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-dashboard',
  imports: [
    MatCard,
    MatCardContent,
    MatGridList,
    MatGridTile,
    MatCalendar,
    MatIcon,
    MatButton,
    NgClass,
    CurrencyPipe,
    RouterLink,
    AvChartJs,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent implements OnInit, OnDestroy {

  breadcrumb: any;

  hasBookingAuthority: boolean = false;
  hasClientPaymentAuthority: boolean = false;
  hasSupplierPaymentAuthority: boolean = false;
  hasTourAuthority: boolean = false;
  hasCustomerAuthority: boolean = false;

  dashboard!: Dashboard;
  dataSubscriber$: Subscription = new Subscription();

  monthlyBookingsRevenueData: Array<any> = [];
  monthlyBookingsCountData: Array<any> = [];

  monthlyBookingsRevenueDatasets: any = [];
  chartLabels: Array<string> = [];

  recentBookingsData: Array<RecentBooking> = [];

  dataQuery!: string;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private dataService: DataService,
    private datePipe: DatePipe,
    private authService: AuthorizationManagerService
  ) {

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // Jan 1st
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    this.dataQuery = "?startDate=" + this.datePipe.transform(startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(endOfMonth, 'yyyy-MM-dd');

  }

  ngOnInit() {
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.initialize();
  }

  /**
   * Initializes the dashboard by calling multiple loading methods and setting up data subscriptions.
   *
   * @return {void} Does not return any value.
   */
  initialize(): void {
    this.loadDashboardCards();
    this.loadBookingsAndRevenueData();
    this.loadBookingsAndCountData();

    this.dataSubscriber$.add(
      this.dataService.getData<RecentBooking>(ApiEndpoints.paths.dashboardRecentBookings).subscribe({
        next: (data) => {
          this.recentBookingsData = data;
        },
        error: (error) => {
          console.log("Error fetching recent bookings data: ", error);
        }
      })
    )

    this.routerLinkStates();
  }

  /**
   * Updates various authorization state properties for router links
   * based on the user's operation authority for specific actions.
   *
   * @return {void} This method does not return a value.
   */
  routerLinkStates(): void {
    this.hasBookingAuthority = this.authService.hasOperationAuthority('booking', 'insert');
    this.hasClientPaymentAuthority = this.authService.hasOperationAuthority('client payment', 'insert');
    this.hasSupplierPaymentAuthority = this.authService.hasOperationAuthority('supplier payment', 'insert');
    this.hasTourAuthority = this.authService.hasOperationAuthority('package', 'insert');
    this.hasCustomerAuthority = this.authService.hasOperationAuthority('customer', 'insert');
  }

  /**
   * Loads and initializes the dashboard cards by fetching data from the specified API endpoint.
   * The method subscribes to a data stream and updates the dashboard object with the retrieved data.
   * Logs an error message if the data retrieval fails.
   *
   * @return {void} Does not return a value.
   */
  loadDashboardCards(): void {
    this.dataSubscriber$.add(
      this.dataService.getDataObject<Dashboard>(ApiEndpoints.paths.dashboardCard).subscribe({
        next: (data) => {
          this.dashboard = data;
        },
        error: (error) => {
          console.log("Error fetching dashboard data: ", error);
        }
      })
    )
  }

  /**
   * Loads bookings and revenue data for the current month by making an API call using the data service.
   * The fetched data is then stored and used to draw the relevant chart.
   * Handles any errors that occur during the API call by logging them to the console.
   *
   * @return {void} This method does not return a value.
   */
  loadBookingsAndRevenueData(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<any>(ApiEndpoints.paths.monthlyBookingsRevenue, this.dataQuery).subscribe({
        next: (data) => {
          this.monthlyBookingsRevenueData = data;
          this.checkAndDrawChart();
        },
        error: (error) => {
          console.log("Error fetching monthly bookings revenue data: ", error);
        }
      })
    )
  }

  /**
   * Loads booking data and count data by subscribing to the data service.
   * Fetches the data from the appropriate API endpoint and manages it.
   * Updates the monthly bookings count data and triggers the chart rendering logic.
   *
   * @return {void} Does not return any value.
   */
  loadBookingsAndCountData(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<any>(ApiEndpoints.paths.monthlyBookingsCount, this.dataQuery).subscribe({
        next: (data) => {
          this.monthlyBookingsCountData = data;
          this.checkAndDrawChart();
        },
        error: (error) => {
          console.log("Error fetching monthly bookings count data: ", error);
        }
      })
    )
  }

  // Helper method to ensure both datasets are loaded before drawing chart
  /**
   * Checks if the data for monthly bookings revenue and monthly bookings count is available.
   * If both datasets are available, it triggers the drawing of the monthly bookings and revenue chart.
   *
   * @return {void} Does not return a value.
   */
  private checkAndDrawChart(): void {
    if (this.monthlyBookingsRevenueData.length > 0 && this.monthlyBookingsCountData.length > 0) {
      this.drawMonthlyBookingsAndRevenueChart();
    }
  }

  /**
   * Renders a chart displaying monthly bookings count and revenue data.
   * Ensures that the datasets are properly sorted by month and formats them for chart rendering.
   * This method updates the `monthlyBookingsRevenueDatasets` with the processed data
   * and generates chart labels based on the sorted datasets.
   *
   * @return {void} Does not return anything; updates internal properties for chart rendering.
   */
  drawMonthlyBookingsAndRevenueChart(): void {
    // Ensure both datasets have data
    if (!this.monthlyBookingsRevenueData.length || !this.monthlyBookingsCountData.length) {
      console.warn('Missing data for chart rendering');
      return;
    }

    // Sort data by month to ensure proper order
    const sortedRevenueData = this.monthlyBookingsRevenueData.sort((a, b) =>
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    const sortedCountData = this.monthlyBookingsCountData.sort((a, b) =>
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    this.monthlyBookingsRevenueDatasets = [
      {
        label: 'Bookings',
        data: sortedCountData.map(item => item.bookingCount || 0),
        borderColor: '#4c6ef5',
        backgroundColor: 'rgba(76, 110, 245, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        yAxisID: 'y' // Primary y-axis for bookings count
      },
      {
        label: 'Revenue ($)',
        data: sortedRevenueData.map(item => item.totalRevenue || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        yAxisID: 'y1' // Secondary y-axis for revenue
      }
    ];

    // Optional: Store chart labels for template use
    this.chartLabels = sortedCountData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

  }

  /**
   * Sets the status color based on the provided status value.
   *
   * @param {any} status - The status value used to determine the corresponding color class.
   * @return {string} - The corresponding color class for the given status, or an empty string if no match is found.
   */
  setStatusColor(status: any): string {
    const statusColor: Record<string, string> = {
      confirmed: 'confirmed',
      "partially confirmed": 'partially-confirmed',
      pending: 'pending',
      cancelled: 'cancelled',
    }
    const colorClass = statusColor[status?.toLowerCase() || ''];
    return colorClass ? colorClass : '';
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
