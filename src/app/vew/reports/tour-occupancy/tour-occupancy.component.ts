import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {DatePipe, PercentPipe} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {TourOccupancy} from "./entity/tour-occupancy";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatButton} from "@angular/material/button";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-tour-occupancy',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
    MatLabel,
    MatStartDate,
    MatSuffix,
    PercentPipe,
    MatButton,
    ReactiveFormsModule,
    AvChartJs
  ],
  templateUrl: './tour-occupancy.component.html',
  standalone: true,
  styleUrl: './tour-occupancy.component.css'
})
export class TourOccupancyComponent implements OnInit, OnDestroy {
  // Fix the labels to match your data (12 items)
  tourTypeLabels = [
    'City Heritage Walk',
    'Mountain Adventure',
    'Coastal Nature Tour',
    'Urban Food Tour',
    'Wildlife Safari',
    'Rock Climbing Experience',
    'Historical Monuments',
    'Forest Hiking Trail',
    'River Rafting',
    'Cultural Walking Tour',
    'Bird Watching',
    'Sunset Photography'
  ];

  tourData = [
    { name: 'City Heritage Walk', date: '2024-03-15', passengers: 18, capacity: 20, type: 'city' },
    { name: 'Mountain Adventure', date: '2024-03-16', passengers: 12, capacity: 15, type: 'adventure' },
    { name: 'Coastal Nature Tour', date: '2024-03-17', passengers: 25, capacity: 30, type: 'nature' },
    { name: 'Urban Food Tour', date: '2024-03-18', passengers: 22, capacity: 25, type: 'city' },
    { name: 'Wildlife Safari', date: '2024-03-19', passengers: 28, capacity: 35, type: 'nature' },
    { name: 'Rock Climbing Experience', date: '2024-03-20', passengers: 8, capacity: 12, type: 'adventure' },
    { name: 'Historical Monuments', date: '2024-03-21', passengers: 32, capacity: 40, type: 'city' },
    { name: 'Forest Hiking Trail', date: '2024-03-22', passengers: 15, capacity: 18, type: 'nature' },
    { name: 'River Rafting', date: '2024-03-23', passengers: 20, capacity: 24, type: 'adventure' },
    { name: 'Cultural Walking Tour', date: '2024-03-24', passengers: 35, capacity: 45, type: 'city' },
    { name: 'Bird Watching', date: '2024-03-25', passengers: 14, capacity: 16, type: 'nature' },
    { name: 'Sunset Photography', date: '2024-03-26', passengers: 10, capacity: 12, type: 'nature' }
  ];

// Fix the missing 'this' keyword
  tourOccupancySummaryDatasets = [
    {
      label: 'Passengers',
      data: this.tourData.map(tour => tour.passengers),
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      borderRadius: 6
    },
    {
      label: 'Capacity',
      data: this.tourData.map(tour => tour.capacity), // Added 'this'
      backgroundColor: 'rgba(231, 76, 60, 0.3)',
      borderColor: 'rgba(231, 76, 60, 1)',
      borderWidth: 2,
      borderRadius: 6
    }
  ];

  tooltipConfig = {
    callbacks: {
      afterBody: (context: any) => {
        const index = context[0].dataIndex;
        const passengers = this.tourData[index].passengers;
        const capacity = this.tourData[index].capacity;
        const utilization = Math.round((passengers / capacity) * 100);
        return `Utilization: ${utilization}%`;
      }
    }
  };

  dataSubscriber$: Subscription = new Subscription();

  tourOccupancyTourNameLabels: any = [];
  tourOccupancyDataSet: any = [];
  tourOccupancySummaryData: Array<TourOccupancy>= [];

  totalTourBookingCount!: number;
  averageTourUtilization!: number;

  dataQuery!: string;

  searchForm!: FormGroup;
  startOfYear!: Date;
  endOfMonth!: Date;

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

  ngOnInit() {
    this.initialize();

    this.searchForm.valueChanges.subscribe(form => {
      const startDate = this.datePipe.transform(form.startDate, 'yyyy-MM-dd');
      const endDate = this.datePipe.transform(form.endDate, 'yyyy-MM-dd');

      if (startDate && endDate) {
        this.dataQuery = "?startDate=" + startDate + "&endDate=" + endDate;
        this.loadTourOccupancySummaryData(this.dataQuery);
      }
    })
  }

  initialize(): void {
    this.loadTourOccupancySummaryData(this.dataQuery);
  }

  /**
   * Loads the tour occupancy summary data based on the provided search query.
   * Fetches the data from an API endpoint and updates the relevant components
   * with the retrieved data.
   *
   * @param {string} searchQuery - The query string used to filter the tour occupancy summary data.
   * @return {void} This method does not return a value.
   */
  loadTourOccupancySummaryData(searchQuery: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<TourOccupancy>(ApiEndpoints.paths.tourOccupancyReport, searchQuery).subscribe({
        next: (data) => {
          this.tourOccupancySummaryData = data;
          this.drawTourOccupancySummaryChartCustom();
          this.initializeTourOccupancyCardValues(this.tourOccupancySummaryData);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching tour occupancy summary: ", error);
        }
      })
    )
  }

  /**
   * Generates a custom chart dataset for tour occupancy summary based on the available data.
   * This method processes the tour occupancy summary data and sets the labels and dataset properties
   * with information such as passenger count and max capacity for tours.
   * If no data is available, it clears the labels and dataset.
   *
   * @return {void} This function does not return a value but modifies the internal properties:
   *                `tourOccupancyTourNameLabels` and `tourOccupancyDataSet`.
   */
  drawTourOccupancySummaryChartCustom(): void {
    if (!this.tourOccupancySummaryData || this.tourOccupancySummaryData.length === 0) {
      this.tourOccupancyTourNameLabels = [];
      this.tourOccupancyDataSet = [];
      return;
    }

    this.tourOccupancyTourNameLabels = this.tourOccupancySummaryData.map(item => item.tourName);

    this.tourOccupancyDataSet = [
      {
        label: 'Passengers',
        data: this.tourOccupancySummaryData.map(tour => tour.totalBookingPassengerCount), // Changed from tourCount to passengers
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Capacity',
        data: this.tourOccupancySummaryData.map(tour => tour.maxpaxcount), // Changed from utilizationRate to capacity
        backgroundColor: 'rgba(231, 76, 60, 0.3)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ];
  }

  /**
   * Initializes the total tour booking count and the average tour utilization rate based on the provided tour occupancy summary data.
   *
   * @param {Array<TourOccupancy>} tourOccupancySummaryData - An array of tour occupancy data objects, each containing information about booking passenger counts, utilization rates, and maximum passenger capacity.
   * @return {void} This method does not return a value.
   */
  initializeTourOccupancyCardValues(tourOccupancySummaryData: Array<TourOccupancy>): void {
    this.totalTourBookingCount = 0;
    this.averageTourUtilization = 0;

    let totalWeightedUtilization = 0;
    let totalMaxPaxCount = 0;

    tourOccupancySummaryData.forEach(tour => {
      this.totalTourBookingCount += tour.totalBookingPassengerCount;

      totalWeightedUtilization += tour.utilizationRate * tour.maxpaxcount;
      totalMaxPaxCount += tour.maxpaxcount;
    });

    this.averageTourUtilization = totalMaxPaxCount > 0
      ? (totalWeightedUtilization / totalMaxPaxCount) / 100
      : 0;
  }

  /**
   * Resets the search form, initializes the `dataQuery` string with default date range values,
   * and reloads the tour occupancy summary data based on the updated query.
   *
   * @return {void} This method does not return any value.
   */
  clear(): void {
    this.searchForm.reset();
    this.dataQuery = "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd');
    this.loadTourOccupancySummaryData(this.dataQuery);
  }

  /**
   * Formats a given year and month into a localized date string.
   *
   * @param {number} year - The year to be formatted.
   * @param {number} month - The month to be formatted (1-based, where 1 represents January and 12 represents December).
   * @return {string} The formatted date string in short month name and full year format (e.g., "Jan 2023").
   */
  formatDate(year: number, month: number): string {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  /**
   * Formats a given year and month name into a string representation.
   *
   * @param {number} year - The year to be formatted.
   * @param {string} monthName - The full name of the month to be included in the formatted string.
   * @return {string} A formatted string that combines the month name and year.
   */
  formatDateWithMonthName(year: number, monthName: string): string {
    return `${monthName} ${year}`;
  }

  /**
   * Determines the color code based on the provided utilization rate.
   *
   * @param {number} utilizationRate - The utilization rate as a percentage.
   * @return {string} The color code representing the utilization level.
   */
  getUtilizationColor(utilizationRate: number): string {
    if (utilizationRate >= 80) {
      return '#27ae60'; // Green for high utilization
    } else if (utilizationRate >= 60) {
      return '#f39c12'; // Orange for medium utilization
    } else {
      return '#e74c3c'; // Red for low utilization
    }
  }

  /**
   * Evaluates the utilization rate and returns the corresponding status.
   *
   * @param {number} utilizationRate - The utilization rate as a percentage (0-100).
   * @return {string} The utilization status, which can be 'Good', 'Fair', or 'Poor'.
   */
  getUtilizationStatus(utilizationRate: number): string {
    if (utilizationRate >= 80) {
      return 'Good';
    } else if (utilizationRate >= 60) {
      return 'Fair';
    } else {
      return 'Poor';
    }
  }
  /**
   * Calculates and returns a color gradient representing the utilization rate.
   *
   * @param {number} utilizationRate - The utilization percentage as a number.
   * @return {string} A CSS linear-gradient string based on the utilization rate.
   */
  getUtilizationGradient(utilizationRate: number): string {
    if (utilizationRate >= 80) {
      return 'linear-gradient(90deg, #27ae60, #2ecc71)';
    } else if (utilizationRate >= 60) {
      return 'linear-gradient(90deg, #f39c12, #e67e22)';
    } else {
      return 'linear-gradient(90deg, #e74c3c, #c0392b)';
    }
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }
}
