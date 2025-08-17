import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {MatCard, MatCardContent} from "@angular/material/card";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon} from "@angular/material/icon";
import {CurrencyPipe, DatePipe, PercentPipe} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Subscription} from "rxjs";
import {PaymentCollection} from "./entity/payment-collection";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatButton} from "@angular/material/button";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-payment-collection',
  imports: [
    MatCard,
    MatCardContent,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
    MatGridList,
    MatGridTile,
    MatIcon,
    MatLabel,
    MatStartDate,
    MatSuffix,
    CurrencyPipe,
    PercentPipe,
    MatButton,
    ReactiveFormsModule,
    AvChartJs
  ],
  templateUrl: './payment-collection.component.html',
  standalone: true,
  styleUrl: './payment-collection.component.css'
})
export class PaymentCollectionComponent implements OnInit, OnDestroy {

  dataSubscriber$: Subscription = new Subscription();

  paymentCollectionLineDatasets: any = [];
  paymentCollectionPieDatasets: any = [];
  paymentCollectionPolarDatasets: any = [];

  totalReceivedPayments: number = 0;
  totalPendingPayments: number = 0;
  totalOverduePayments: number = 0;
  collectionRate: number = 0;

  paymentCollectionMonthLabels: any = [];
  paymentCollectionData: Array<PaymentCollection> = [];

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
        this.loadingPaymentCollectionData(this.dataQuery);
      }
    })
  }

  initialize(): void {
    this.loadingPaymentCollectionData(this.dataQuery);
  }

  /**
   * Initializes and calculates the card data based on the payment collection data provided.
   * Updates the total received payments, pending payments, overdue payments, and collection rate.
   *
   * @param {Array<PaymentCollection>} paymentCollectionData The array of payment collection records, where each record contains the payment data.
   * @return {void} Does not return a value, but updates internal properties related to payments and collection rate.
   */
  initializeCardData(paymentCollectionData: Array<PaymentCollection>): void {
    this.totalReceivedPayments = 0;
    this.totalPendingPayments = 0;
    this.totalOverduePayments = 0;
    this.collectionRate = 0;

    paymentCollectionData.forEach(item => {
      this.totalReceivedPayments += item.totalReceivedPayments;
      this.totalPendingPayments += item.totalPendingPayments;
      this.totalOverduePayments += item.totalOverduePayments;
    })

    this.collectionRate = this.totalReceivedPayments / (this.totalReceivedPayments + this.totalPendingPayments);
  }

  /**
   * Loads payment collection data based on the specified search query.
   *
   * @param {string} searchQuery The search query used to fetch payment collection data.
   * @return {void} Does not return any value.
   */
  loadingPaymentCollectionData(searchQuery: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<PaymentCollection>(ApiEndpoints.paths.paymentCollectionReport, searchQuery).subscribe({
        next: (data) => {
          this.paymentCollectionData = data;
          this.drawPaymentCollectionChartCustom();
          this.initializeCardData(this.paymentCollectionData);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Error fetching payment collection data: ", error);
        }
      })
    )
  }

  /**
   * Processes payment collection data to generate labels and datasets for various chart types
   * including line, pie, and polar area charts. It organizes the data in chronological order
   * for the line chart and calculates the total received, pending, and overdue payments for summary
   * datasets.
   *
   * @return {void} This method does not return a value.
   */
  drawPaymentCollectionChartCustom(): void {
    if (!this.paymentCollectionData || this.paymentCollectionData.length === 0) {
      this.paymentCollectionMonthLabels = [];
      this.paymentCollectionLineDatasets = [];
      return;
    }

    const sortedData = this.paymentCollectionData.sort((a, b) => {
      return new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime();
    });

    this.paymentCollectionMonthLabels = sortedData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    this.paymentCollectionLineDatasets = [
      {
        label: 'Received',
        data: this.paymentCollectionData.map(item => item.totalReceivedPayments),
        borderColor: 'rgba(39, 174, 96, 1)',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(39, 174, 96, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }, {
        label: 'Pending',
        data: this.paymentCollectionData.map(item => item.totalPendingPayments),
        borderColor: 'rgba(243, 156, 18, 1)',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(243, 156, 18, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }, {
        label: 'Overdue',
        data: this.paymentCollectionData.map(item => item.totalOverduePayments),
        borderColor: 'rgba(231, 76, 60, 1)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(231, 76, 60, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]

    const totalReceived = this.paymentCollectionData.reduce((sum, item) => sum + (item.totalReceivedPayments || 0), 0);
    const totalPending = this.paymentCollectionData.reduce((sum, item) => sum + (item.totalPendingPayments || 0), 0);
    const totalOverdue = this.paymentCollectionData.reduce((sum, item) => sum + (item.totalOverduePayments || 0), 0);

    this.paymentCollectionPieDatasets = [
      {
        label: 'Payment Summary',
        data: [totalReceived, totalPending, totalOverdue],
        backgroundColor: [
          'rgba(39, 174, 96, 0.8)',
          'rgba(243, 156, 18, 0.8)',
          'rgba(231, 76, 60, 0.8)'
        ],
        borderColor: [
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 3
      }
    ];

    this.paymentCollectionPolarDatasets = [
      {
        label: 'Payment Summary',
        data: [totalReceived, totalPending, totalOverdue],
        backgroundColor: [
          'rgba(39, 174, 96, 0.7)',
          'rgba(243, 156, 18, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(39, 174, 96, 1)',
          'rgba(243, 156, 18, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 2
      }
    ];
  }

  /**
   * Formats a given numeric amount into a currency string using the US Dollar format.
   *
   * @param {number} amount - The numeric value to be formatted as currency.
   * @return {string} The formatted currency string.
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  /**
   * Generates a linear gradient color string based on the provided rate.
   *
   * @param {number} rate - The collection rate determining the gradient color.
   * @return {string} A CSS linear gradient string corresponding to the specified rate.
   */
  getCollectionGradient(rate: number): string {
    if (rate >= 80) {
      return 'linear-gradient(90deg, #27ae60, #2ecc71)'; // Green for excellent collection
    } else if (rate >= 60) {
      return 'linear-gradient(90deg, #f39c12, #e67e22)'; // Orange for good collection
    } else if (rate >= 40) {
      return 'linear-gradient(90deg, #e74c3c, #c0392b)'; // Red for poor collection
    } else {
      return 'linear-gradient(90deg, #8e44ad, #9b59b6)'; // Purple for very poor collection
    }
  }

  /**
   * Determines the color associated with a given collection rate.
   *
   * @param {number} rate - The collection rate percentage used to determine the color.
   * @return {string} The hexadecimal color code representing the associated color.
   */
  getCollectionColor(rate: number): string {
    if (rate >= 80) {
      return '#27ae60'; // Green
    } else if (rate >= 60) {
      return '#f39c12'; // Orange
    } else if (rate >= 40) {
      return '#e74c3c'; // Red
    } else {
      return '#8e44ad'; // Purple
    }
  }

  /**
   * Determines the collection status based on the given rate.
   *
   * @param {number} rate - The rate used to evaluate the collection status.
   * @return {string} The collection status corresponding to the rate. Possible values are 'Excellent', 'Good', 'Poor', or 'Critical'.
   */
  getCollectionStatus(rate: number): string {
    if (rate >= 80) {
      return 'Excellent';
    } else if (rate >= 60) {
      return 'Good';
    } else if (rate >= 40) {
      return 'Poor';
    } else {
      return 'Critical';
    }
  }


  /**
   * Calculates and returns the total amount of payments received.
   *
   * @return {number} The sum of all received payments from the payment collection data.
   */
  getTotalReceivedPayments(): number {
    return this.paymentCollectionData.reduce((total, item) => total + item.totalReceivedPayments, 0);
  }

  /**
   * Calculates and returns the total amount of pending payments from the payment collection data.
   *
   * @return {number} The total of all pending payments.
   */
  getTotalPendingPayments(): number {
    return this.paymentCollectionData.reduce((total, item) => total + item.totalPendingPayments, 0);
  }

  /**
   * Calculates the total amount of overdue payments by summing up the `totalOverduePayments`
   * field from each item in the `paymentCollectionData` array.
   *
   * @return {number} The total sum of overdue payments.
   */
  getTotalOverduePayments(): number {
    return this.paymentCollectionData.reduce((total, item) => total + item.totalOverduePayments, 0);
  }

  /**
   * Calculates the average collection rate from the payment collection data.
   * If no data is available, returns 0.
   *
   * @return {number} The average collection rate rounded to the nearest integer.
   */
  getAverageCollectionRate(): number {
    if (this.paymentCollectionData.length === 0) return 0;
    const totalRate = this.paymentCollectionData.reduce((total, item) => total + item.collectionRate, 0);
    return Math.round(totalRate / this.paymentCollectionData.length);
  }

  /**
   * Resets the search form and initializes the data query string
   * with default start and end dates. Triggers the loading of
   * payment collection data using the updated query string.
   *
   * @return {void} Does not return a value.
   */
  clear(): void {
    this.searchForm.reset();
    this.dataQuery = "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd');
    this.loadingPaymentCollectionData(this.dataQuery);
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
