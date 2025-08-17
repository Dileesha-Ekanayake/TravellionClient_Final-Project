import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter} from "@angular/material/core";
import {MatButton} from "@angular/material/button";
import {DatePipe} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {Subscription} from "rxjs";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MonthlyTourSummary} from "./entity/monthly-tour-summary";
import {TotalTourCount} from "./entity/total-tour-count";
import {AvChartJs} from "@avoraui/av-chart-js";

// Custom date formats for month/year display
export const MONTH_YEAR_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

// Custom Date Adapter to handle month/year selection
export class MonthYearDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'MMM YYYY') {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    }
    return super.format(date, displayFormat);
  }
}

@Component({
  selector: 'app-monthly-tour-summary',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    MatFormField,
    MatLabel,
    MatDatepickerToggle,
    ReactiveFormsModule,
    MatSuffix,
    MatButton,
    MatDateRangeInput,
    MatDateRangePicker,
    MatEndDate,
    MatStartDate,
    AvChartJs
  ],
  templateUrl: './monthly-tour-summary.component.html',
  styleUrl: './monthly-tour-summary.component.css',
  standalone: true,
  providers: [
    {
      provide: DateAdapter,
      useClass: MonthYearDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MONTH_YEAR_FORMATS
    }
  ]
})

export class MonthlyTourSummaryComponent implements OnInit {

  tourDistributionLabels = ['Safari Adventure', 'Great Island Hiking', 'Takep Cultural Adventure'];
  tourDistributionDatasets = [{
    data: [45, 35, 20],
    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
    borderWidth: 0
  }];
  monthlyBookingToursCountData: Array<MonthlyTourSummary> = [];


  dataSubscriber$: Subscription = new Subscription();
  totalTourSummary!: TotalTourCount;
  monthlyBookingToursDatasets: any = [];
  monthlyTourSummaryLabels: any = [];

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
        this.loadingMonthlyTourSummary(this.dataQuery);
      }
    })
  }

  initialize(): void {
    this.loadTotalBookingTourCount();
    this.loadingMonthlyTourSummary(this.dataQuery);
  }

  /**
   * Loads the total booking tour count by making a request to the defined API endpoint
   * and assigns the fetched data to the totalTourSummary property.
   *
   * @return {void} This method does not return any value.
   */
  loadTotalBookingTourCount(): void {
    this.dataSubscriber$.add(
      this.dataService.getDataObject<TotalTourCount>(ApiEndpoints.paths.totalBookingTourCountReport).subscribe({
        next: (data) => {
          this.totalTourSummary = data;
        },
        error: (error) => {
          console.log("Error fetching total booking tour count: ", error);
        }
      })
    )
  }

  /**
   * Loads the monthly tour summary data based on the provided search query,
   * updates the chart visualization and triggers change detection.
   *
   * @param {string} searchQuery - The query string to filter the monthly tour summary data.
   * @return {void} This method does not return a value.
   */
  loadingMonthlyTourSummary(searchQuery: string): void {
     this.dataSubscriber$.add(
      this.dataService.getData<MonthlyTourSummary>(ApiEndpoints.paths.monthlyBookingTourCountReport, searchQuery).subscribe({
        next: (data) => {
          this.monthlyBookingToursCountData = data;
          if (this.monthlyBookingToursCountData && this.monthlyBookingToursCountData.length > 0) {
            this.drawMonthlyBookingToursChartCustom();
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error("Error fetching monthly booking tour count: ", error);
        }
      })
    );
  }

  /**
   * Draws a customized chart for monthly booking tours data. This method processes
   * the provided monthly tour data, sorts it by month, and generates chart labels
   * and datasets for displaying total tours and pending tours in a graphical representation.
   *
   * @return {void} No return value. The method updates chart labels and datasets used in the chart.
   */
  drawMonthlyBookingToursChartCustom(): void {
    if (!this.monthlyBookingToursCountData || this.monthlyBookingToursCountData.length === 0) {
      this.monthlyTourSummaryLabels = [];
      this.monthlyBookingToursDatasets = [];
      return;
    }

    const sortedData = this.monthlyBookingToursCountData.sort((a, b) => {
      return new Date(a.month + '-01').getTime() - new Date(b.month + '-01').getTime();
    });

    this.monthlyTourSummaryLabels = sortedData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    this.monthlyBookingToursDatasets = [
      {
        label: 'Total Tours',
        data: this.monthlyBookingToursCountData.map(item => item.totalTourCount || 0),
        backgroundColor: '#3B82F6',
        borderColor: '#1E40AF',
        borderWidth: 2,
        hoverBackgroundColor: '#2563EB',
        hoverBorderColor: '#1D4ED8'
      },
      {
        label: 'Pending Tours',
        data: this.monthlyBookingToursCountData.map(item => item.pendingTourCount || 0),
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 2,
        hoverBackgroundColor: '#EAB308',
        hoverBorderColor: '#CA8A04'
      }
    ];

  }

  /**
   * Retrieves the total count of tours from the total tour summary.
   * If the total tour summary is undefined or does not contain a count,
   * it returns 0 as the default value.
   *
   * @return {number} The total number of tours.
   */
  get totalTourCount(): number {
    return this.totalTourSummary?.totalTourCount || 0;
  }

  /**
   * Retrieves the count of pending tours from the total tour summary.
   *
   * @return {number} The number of pending tours; returns 0 if total tour summary is not defined or pending count is unavailable.
   */
  get pendingTourCount(): number {
    return this.totalTourSummary?.pendingTourCount || 0;
  }

  /**
   * Clears the current state of the search form and resets it to default values.
   * It also sets the data query based on the start of the year and end of the current month,
   * then triggers the loading of the monthly tour summary data.
   *
   * @return {void} No return value.
   */
  clear(): void {
    this.searchForm.reset();
    this.dataQuery = "?startDate=" + this.datePipe.transform(this.startOfYear, 'yyyy-MM-dd') +
      "&endDate=" + this.datePipe.transform(this.endOfMonth, 'yyyy-MM-dd');
    this.loadingMonthlyTourSummary(this.dataQuery);
  }
}
