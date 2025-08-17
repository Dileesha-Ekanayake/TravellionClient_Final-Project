import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {DatePipe, NgStyle} from "@angular/common";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";
import {BookingTrend} from "./entity/booking-trend";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatButton} from "@angular/material/button";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-booking-trend',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    NgStyle,
    MatFormField,
    FormsModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatLabel,
    MatStartDate,
    MatSuffix,
    ReactiveFormsModule,
    MatButton,
    AvChartJs
  ],
  templateUrl: './booking-trend.component.html',
  standalone: true,
  styleUrl: './booking-trend.component.css'
})
export class BookingTrendComponent implements OnInit, OnDestroy {

  total = 1200;
  done = 400;
  booked = 400;
  confirmed = 400;

  tooltipConfig = {
    mode: 'index',
    intersect: false,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    titleColor: '#2b2d42',
    bodyColor: '#4a5568',
    borderColor: '#e0e6ed',
    borderWidth: 1,
    padding: 12,
    boxPadding: 6,
    usePointStyle: true,
    displayColors: true,
    callbacks: {
      title: (tooltipItems: any[]) => {
        return tooltipItems[0]?.label || '';
      },
      label: (context: any) => {
        const dataset = context.dataset;
        const value = context.parsed.y || context.raw;
        return `${dataset.label}: ${new Intl.NumberFormat().format(value)} bookings`;
      },
      labelColor: (context: any) => {
        return {
          borderColor: 'transparent',
          backgroundColor: context.dataset.borderColor || '#4361ee',
          borderRadius: 2,
        };
      }
    }
  };

  searchForm!: FormGroup;
  dataSubscriber$: Subscription = new Subscription();

  dataQuery!: string;
  startOfYear!: Date;
  endOfMonth!: Date;

  monthLabels: any = []
  monthlyBookingTrendDataSet: any = [];

  monthlyBookingTrendData: Array<BookingTrend> = [];

  totalBookingCount: number = 0;
  doneBookingCount: number = 0;
  confirmedBookingCount: number = 0;
  partiallyConfirmedBookingCount: number = 0;

  constructor(
    private datePipe: DatePipe,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
  ) {
    this.searchForm = this.formBuilder.group({
      startDate: [''],
      endDate: ['']
    })
    const today = new Date();
    this.startOfYear = new Date(today.getFullYear(), 0, 1);
    this.endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.dataQuery = "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd');

  }

  ngOnInit(): void {
    this.initialize();

    this.searchForm.valueChanges.subscribe(form => {
      const startDate = this.datePipe.transform(form.startDate, 'yyyy-MM-dd');
      const endDate = this.datePipe.transform(form.endDate, 'yyyy-MM-dd');

      if (startDate && endDate) {
        this.dataQuery = "?startDate=" + startDate + "&endDate=" + endDate;
        this.loadTotalBookingTrendData(this.dataQuery);
      }
    })
  }

  initialize(): void {
    this.loadTotalBookingTrendData(this.dataQuery);
  }

  /**
   * Loads the total booking trend data based on the provided search query.
   * This method fetches data from the data service, processes the response, and updates relevant properties and the chart.
   *
   * @param {string} searchQuery - The search query string used to filter booking trend data.
   * @return {void}
   */
  loadTotalBookingTrendData(searchQuery: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<BookingTrend>(ApiEndpoints.paths.monthlyBookingsTrend, searchQuery).subscribe({
        next: (bookingTrends) => {
          this.monthlyBookingTrendData = bookingTrends;
          this.initializeCardValues(this.monthlyBookingTrendData);
          this.drawBookingTrendChartCustom();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching monthly booking trend data: ", error);
        }
      })
    )
  }

  /**
   * Draws a custom booking trend chart based on the available monthly booking trend data.
   * If no data is available, it clears the chart labels and data set.
   *
   * This method processes the `monthlyBookingTrendData`, sorts it by month in ascending order,
   * and generates corresponding chart data with appropriate labels, colors, and chart types.
   *
   * @return {void} Does not return any value. Updates relevant properties to render the chart.
   */
  drawBookingTrendChartCustom(): void {
    if (!this.monthlyBookingTrendData || this.monthlyBookingTrendData.length === 0) {
      this.monthLabels = [];
      this.monthlyBookingTrendDataSet = [];
      return;
    }

    const sortedData = this.monthlyBookingTrendData.sort((a, b) => {
      return new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime();
    })

    this.monthLabels = sortedData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', {month: 'short'});
    });

    this.monthlyBookingTrendDataSet = [
      {
        label: 'Total',
        data: this.monthlyBookingTrendData.map(item => item.totalCount),
        backgroundColor: '#3B82F6',            // blue-500
        borderColor: '#1E40AF',               // blue-900
        borderWidth: 1,
        type: 'bar',
        fill: false,
        borderRadius: 6,                      // Apply border radius explicitly
        hoverBackgroundColor: '#2563EB',
        hoverBorderColor: '#1D4ED8'
      },
      {
        label: 'Done',
        data: this.monthlyBookingTrendData.map(item => item.doneCount),
        backgroundColor: 'transparent',
        borderColor: '#22C55E',
        borderWidth: 2,
        type: 'line',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#22C55E',
        pointBorderColor: '#166534',
        pointRadius: 4
      },
      {
        label: 'Confirmed',
        data: this.monthlyBookingTrendData.map(item => item.confirmCount),
        backgroundColor: 'transparent',
        borderColor: '#FACC15',
        borderWidth: 2,
        type: 'line',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#FACC15',
        pointBorderColor: '#A16207',
        pointRadius: 4
      },
      {
        label: 'Partially Confirmed',
        data: this.monthlyBookingTrendData.map(item => item.partiallyConfirmCount),
        backgroundColor: 'transparent',
        borderColor: '#FB923C',
        borderWidth: 2,
        type: 'line',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#FB923C',
        pointBorderColor: '#C2410C',
        pointRadius: 4
      }
    ]

  }

  /**
   * Initializes the card values by calculating and updating booking counts based on the provided monthly booking trend data.
   *
   * @param {Array<BookingTrend>} monthlyBookingTrendData - An array of objects representing the monthly booking trend data, where each object contains data such as total count, done count, confirm count, and partially confirm count.
   * @return {void} This method does not return a value; it updates the booking counts as part of its operation.
   */
  initializeCardValues(monthlyBookingTrendData: Array<BookingTrend>): void {
    this.totalBookingCount = 0;
    this.doneBookingCount = 0;
    this.confirmedBookingCount = 0;
    this.partiallyConfirmedBookingCount = 0;
    monthlyBookingTrendData.map(item => {
      this.totalBookingCount += item.totalCount;
    })
    monthlyBookingTrendData.map(item => {
      this.doneBookingCount += item.doneCount;
    })
    monthlyBookingTrendData.map(item => {
      this.confirmedBookingCount += item.confirmCount;
    })
    monthlyBookingTrendData.map(item => {
      this.partiallyConfirmedBookingCount += item.partiallyConfirmCount;
    })
  }

  /**
   * Calculates the percentage of done bookings relative to the total.
   *
   * @return {number} The percentage of completed bookings as a number between 0 and 100.
   */
  get donePercent(): number {
    return (this.doneBookingCount / this.total) * 100;
  }

  /**
   * Calculates and returns the percentage of confirmed bookings.
   *
   * @return {number} The percentage of confirmed bookings as a number.
   */
  get confirmPercent(): number {
    return (this.confirmedBookingCount / this.total) * 100;
  }

  /**
   * Calculates and returns the percentage of bookings that are partially confirmed.
   *
   * @return {number} The percentage of partially confirmed bookings.
   */
  get partiallyConfirmedPercent(): number {
    return (this.partiallyConfirmedBookingCount / this.total) * 100;
  }

  /**
   * Clears the current search form and resets the data query parameters
   * to default values based on the start of the year and the end of the month.
   * Subsequently, it loads the total booking trend data using the updated query.
   *
   * @return {void} This method does not return a value.
   */
  clear(): void {
    this.searchForm.reset();
    this.dataQuery = "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd');
    this.loadTotalBookingTrendData(this.dataQuery);
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }
}
