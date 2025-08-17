import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {Subscription} from "rxjs";
import {IncomeAndRevenue} from "./entity/income-and-revenue";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {CurrencyPipe, DatePipe} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-income-and-revenue',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
    MatIcon,
    MatLabel,
    MatStartDate,
    MatSuffix,
    MatButton,
    ReactiveFormsModule,
    CurrencyPipe,
    MatSelect,
    MatOption,
    AvChartJs
  ],
  templateUrl: './income-and-revenue.component.html',
  standalone: true,
  styleUrl: './income-and-revenue.component.css'
})
export class IncomeAndRevenueComponent implements OnInit, OnDestroy {

  dataSubscriber$: Subscription = new Subscription();

  incomeAndRevenueData: Array<IncomeAndRevenue> = [];


  incomeAndRevenueDatasets: any = [];
  incomeAndRevenueLabels: any = [];

  dataQuery!: string;

  searchForm!: FormGroup;
  startOfYear!: Date;
  endOfMonth!: Date;

  totalBookingCount!: number;
  totalIncome!: number;

  types: any = ['Accommodation', 'Transfer', 'Generic', 'Tour'];

  selectedReportType: string = '';

  constructor(
    private datePipe: DatePipe,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
  ) {

    this.searchForm = this.formBuilder.group({
      startDate: [''],
      endDate: [''],
      type: new FormControl(''),
    })
    const today = new Date();
    this.startOfYear = new Date(today.getFullYear(), 0, 1);
    this.endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.dataQuery =
      "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd') +
      "&type=" + this.selectedReportType;

  }

  ngOnInit() {

    this.initialize();

    this.searchForm.valueChanges.subscribe(form => {
      const startDate = this.datePipe.transform(form.startDate, 'yyyy-MM-dd');
      const endDate = this.datePipe.transform(form.endDate, 'yyyy-MM-dd');
      const type = form.type;
      if (startDate && endDate && type) {
        this.dataQuery = "?startDate=" + startDate + "&endDate=" + endDate + "&type=" +type;
        this.loadingIncomeAndRevenue(this.dataQuery);
      }
    })
  }

  initialize(): void {
    this.loadingIncomeAndRevenue(this.dataQuery);
  }

  /**
   * Loads income and revenue data based on the given search query, processes it, and updates the related UI components.
   *
   * @param {string} searchQuery - The search query used to fetch income and revenue data.
   * @return {void} This method does not return a value.
   */
  loadingIncomeAndRevenue(searchQuery: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<IncomeAndRevenue>(ApiEndpoints.paths.inComeAndRevenueReport, searchQuery).subscribe({
        next: (data) => {
          this.incomeAndRevenueData = data;
          this.initializeCardValues(this.incomeAndRevenueData);
          this.drawIncomeAndRevenueChartCustom();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching income and revenue: ", error);
        }
      })
    )
  }

  /**
   * Constructs and populates the necessary data for an income and revenue chart,
   * including labels and datasets based on the monthly income and revenue data.
   * The data is first sorted chronologically, and individual datasets are created for
   * different revenue streams (e.g., tour, accommodation, generic, and transfer revenues).
   * If no data is available, the method initializes empty arrays for labels and datasets.
   *
   * @return {void} This method does not return any value, but updates the
   * labels and datasets used to render the income and revenue chart.
   */
  drawIncomeAndRevenueChartCustom(): void {
    if (!this.incomeAndRevenueData || this.incomeAndRevenueData.length === 0) {
      this.incomeAndRevenueLabels = [];
      this.incomeAndRevenueDatasets = [];
      return;
    }

    const sortedData = this.incomeAndRevenueData.sort((a, b) => {
      return new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime();
    });

    this.incomeAndRevenueLabels = sortedData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    this.incomeAndRevenueDatasets = [
      {
        label: 'Tour Revenue',
        data: this.incomeAndRevenueData.map(item => item.tourRevenue),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true
      },{
        label: 'Accommodation Revenue',
        data: this.incomeAndRevenueData.map(item => item.accommodationRevenue),
        borderColor: '#06d6a0',
        backgroundColor: 'rgba(6, 214, 160, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Generics Revenue',
        data: this.incomeAndRevenueData.map(item => item.genericRevenue),
        borderColor: '#ffc43d',
        backgroundColor: 'rgba(255, 196, 61, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Transfer Revenue',
        data: this.incomeAndRevenueData.map(item => item.transferRevenue),
        borderColor: '#ef476f',
        backgroundColor: 'rgba(239, 71, 111, 0.1)',
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  }

  /**
   * Initializes the values of total bookings and total income by processing the provided income and revenue data.
   *
   * @param {Array<IncomeAndRevenue>} incomeAndRevenueData - An array of objects containing income and revenue details, where each object includes total bookings and total revenue.
   * @return {void} Does not return any value.
   */
  initializeCardValues(incomeAndRevenueData: Array<IncomeAndRevenue>): void {
    this.totalBookingCount = 0;
    this.totalIncome = 0;
    incomeAndRevenueData.forEach(item => {
      this.totalBookingCount += item.totalBookings;
    })

    incomeAndRevenueData.forEach(item => {
      this.totalIncome += item.totalRevenue;
    })
  }

  /**
   * Formats a numeric value into a currency string representation in USD.
   *
   * @param {number} amount - The numeric value to format as currency.
   * @return {string} The formatted currency string.
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Calculates the revenue percentage relative to the maximum revenue
   * from the income and revenue data.
   *
   * @param {number} revenue - The revenue value for which the percentage needs to be calculated.
   * @return {number} The percentage of the given revenue relative to the maximum revenue. Returns 0 if the maximum revenue is 0.
   */
  getRevenuePercentage(revenue: number): number {
    const maxRevenue = Math.max(...this.incomeAndRevenueData.map(item => item.totalRevenue));
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }

  /**
   * Determines the gradient color based on the revenue percentage.
   *
   * @param {number} revenue The revenue value used to calculate the gradient.
   * @return {string} A gradient color string representing the revenue category.
   */
  getRevenueGradient(revenue: number): string {
    const percentage = this.getRevenuePercentage(revenue);
    if (percentage >= 80) {
      return 'linear-gradient(90deg, #27ae60, #2ecc71)'; // Green for high revenue
    } else if (percentage >= 60) {
      return 'linear-gradient(90deg, #f39c12, #e67e22)'; // Orange for medium revenue
    } else {
      return 'linear-gradient(90deg, #e74c3c, #c0392b)'; // Red for low revenue
    }
  }

  // Total calculation methods
  /**
   * Calculates the total number of bookings by summing the `totalBookings` property
   * of each item in the `incomeAndRevenueData` array.
   *
   * @return {number} The total count of bookings.
   */
  getTotalBookings(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.totalBookings, 0);
  }

  /**
   * Calculates and returns the total revenue by summing up the totalRevenue values from the incomeAndRevenueData array.
   *
   * @return {number} The total revenue calculated as a sum of all totalRevenue values in the incomeAndRevenueData array.
   */
  getTotalRevenue(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.totalRevenue, 0);
  }

  /**
   * Calculates and returns the total accommodation revenue.
   *
   * The method iterates over the incomeAndRevenueData array and sums up the accommodationRevenue value of each item.
   *
   * @return {number} The total accommodation revenue.
   */
  getTotalAccommodationRevenue(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.accommodationRevenue, 0);
  }

  /**
   * Calculates the total transfer revenue by summing up the `transferRevenue` property
   * of each item in the `incomeAndRevenueData` array.
   *
   * @return {number} The total transfer revenue.
   */
  getTotalTransferRevenue(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.transferRevenue, 0);
  }

  /**
   * Calculates and returns the total generic revenue from the income and revenue data.
   *
   * @return {number} The total generic revenue.
   */
  getTotalGenericRevenue(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.genericRevenue, 0);
  }

  /**
   * Calculates the total revenue generated from tours by summing up
   * the tour revenue values in the income and revenue data.
   *
   * @return {number} The total revenue from all tours.
   */
  getTotalTourRevenue(): number {
    return this.incomeAndRevenueData.reduce((total, item) => total + item.tourRevenue, 0);
  }

  /**
   * Resets the search form values, constructs a new query string with default
   * date range and selected report type, and triggers the loading of income
   * and revenue data based on the updated query.
   *
   * @return {void} No return value.
   */
  clear(): void {
    this.searchForm.reset();
    this.dataQuery =
      "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd') +
      "&type=" + this.selectedReportType;
    this.loadingIncomeAndRevenue(this.dataQuery);
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
