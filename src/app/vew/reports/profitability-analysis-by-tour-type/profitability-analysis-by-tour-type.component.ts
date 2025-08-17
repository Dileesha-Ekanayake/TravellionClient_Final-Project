import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {Subscription} from "rxjs";
import {TourRevenue} from "./entity/tour-revenue";
import {TourCategories} from "./entity/tour-categories";
import {TourTheme} from "./entity/tour-theme";
import {TourType} from "./entity/tour-type";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {CurrencyPipe} from "@angular/common";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-profitability-analysis-by-tour-type',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    CurrencyPipe,
    AvChartJs
  ],
  templateUrl: './profitability-analysis-by-tour-type.component.html',
  standalone: true,
  styleUrl: './profitability-analysis-by-tour-type.component.css'
})
export class ProfitabilityAnalysisByTourTypeComponent implements OnInit, OnDestroy {

  dataSubscriber$: Subscription = new Subscription();

  tourCategoryData: Array<TourCategories> = [];
  tourCategoryDataSets: any = [];
  tourCategoryLabels: any = [];

  tourThemeData: Array<TourTheme> = [];
  tourThemeDataSets: any = [];
  tourThemeLabels: any = [];

  tourTypeData: Array<TourType> = [];
  tourTypeDataSets: any = [];
  tourTypeLabels: any = [];

  tourTypeRevenueData!: TourRevenue;

  totalBookingTours!: number;
  totalRevenue!: number;
  totalSupplierAmount!: number;

  constructor(
    private dataService: DataService,
  ) {
  }

  ngOnInit() {
    this.initialize();
  }

  initialize(): void {
    this.loadChartData();
  }

  initializeCardValues(data: TourRevenue): void {
    this.totalBookingTours = 0;
    this.totalRevenue = 0;
    this.totalSupplierAmount = 0;

    this.totalBookingTours = data.totalBookings;
    this.totalRevenue = data.totalPaid;
    this.totalSupplierAmount = data.supplierAmount;
  }

  /**
   * Loads chart data for profitability analysis using various parameters such as tour type, tour category, and tour theme.
   * Subscribes to multiple data services, processes the retrieved data, and triggers additional methods for handling or downloading.
   *
   * @return {void} Does not return a value.
   */
  loadChartData(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<TourType>(ApiEndpoints.paths.profitByTourTypeReport).subscribe({
        next: (data) => {
          this.tourTypeData = data;
          this.downloadChartData();
        },
        error: (error) => {
          console.error("Error fetching profitability analysis by tour type: ", error);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourCategories>(ApiEndpoints.paths.profitByTourCategoryReport).subscribe({
        next: (data) => {
          this.tourCategoryData = data;
          this.downloadChartData();
        },
        error: (error) => {
          console.error("Error fetching profitability analysis by tour category: ", error);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourTheme>(ApiEndpoints.paths.profitByTourThemeReport).subscribe({
        next: (data) => {
          this.tourThemeData = data;
          this.downloadChartData();
        },
        error: (error) => {
          console.error("Error fetching profitability analysis by tour theme: ", error);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getDataObject<TourRevenue>(ApiEndpoints.paths.profitByTourRevenueReport).subscribe({
        next: (data) => {
          this.tourTypeRevenueData = data;
          this.initializeCardValues(data);
        },
        error: (error) => {
          console.error("Error fetching profitability analysis by tour type: ", error);
        }
      })
    )
  }

  /**
   * Processes and prepares the chart data for different categories such as tour type, theme, and category.
   * It initializes and maps the data and generates datasets for visual representation,
   * including properties like labels, data, background colors, border colors, and other styling options.
   *
   * @return {void} This method does not return a value.
   */
  downloadChartData(): void {
    if (!this.tourTypeData || !this.tourThemeData || !this.tourCategoryData) {
      this.tourTypeData = [];
      this.tourThemeData = [];
      this.tourCategoryData = [];
      return;
    }

    this.tourTypeLabels = this.tourTypeData.map(tourType => tourType.tourType);
    this.tourThemeLabels = this.tourThemeData.map(tourTheme => tourTheme.tourTheme);
    this.tourCategoryLabels = this.tourCategoryData.map(tourCategory => tourCategory.tourCategory);

    this.tourTypeDataSets = [
      {
        label: 'Revenue ($) by Tour Category',
        data: this.tourTypeData.map(item => item.profit),
        backgroundColor: [
          '#ef4444', // Red for Budget
          '#f59e0b', // Amber for Standard
          '#10b981', // Green for Premium
          '#3b82f6', // Blue for Luxury
          '#8b5cf6'  // Purple (if needed)
        ],
        borderColor: [
          '#dc2626',
          '#d97706',
          '#059669',
          '#2563eb',
          '#7c3aed'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ];

    this.tourThemeDataSets = [
      {
        label: 'Revenue ($) by Tour Theme',
        data: this.tourThemeData.map(item => item.profit),
        backgroundColor: [
          '#ef4444', // Red for Adventure
          '#f59e0b', // Amber for Nature and Wildlife
          '#10b981', // Green for Eco and Conservation
          '#3b82f6', // Blue for Cultural and Heritage
          '#8b5cf6', // Purple for Spiritual and Wellness
          '#f97316', // Orange for Culinary and Lifestyle
          '#06b6d4', // Cyan for Photography and Special Interest
          '#84cc16', // Lime for Romantic and Honeymoon
          '#ec4899'  // Pink for Marine and Coastal
        ],
        borderColor: [
          '#dc2626',
          '#d97706',
          '#059669',
          '#2563eb',
          '#7c3aed',
          '#ea580c',
          '#0891b2',
          '#65a30d',
          '#db2777'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ];

    this.tourCategoryDataSets = [
      {
        label: 'Revenue ($) by Tour Category',
        data: this.tourCategoryData.map(item => item.profit),
        backgroundColor: [
          '#ef4444', // Red for Hill Country Adventure
          '#10b981', // Green for Waterfall Trekking
          '#f59e0b', // Amber for River Rafting
          '#3b82f6', // Blue for Caving Tour
          '#8b5cf6', // Purple for Camping Tour
          '#f97316', // Orange for Whale & Dolphin Watching
          '#06b6d4', // Cyan for Snorkeling & Diving
          '#84cc16', // Lime for Lagoon & Mangrove Boat Safari
          '#ec4899', // Pink for Fishing Village Experience
          '#14b8a6', // Teal for Elephant Transit Home Visit
          '#f43f5e', // Rose for Railway Journey
          '#a855f7', // Violet for Temple & Pilgrimage Tours
          '#22c55e', // Emerald for Historical Monuments Tour
          '#eab308', // Yellow for Ayurveda & Herbal Therapy Tours
          '#6366f1', // Indigo for Spiritual Pilgrimage
          '#fb7185', // Pink for Traditional Cooking Experience
          '#34d399', // Emerald for Spice Garden Tour
          '#fbbf24', // Amber for Festival & Cultural Event Tours
          '#a78bfa', // Light Purple for Honeymoon in Hill Country
          '#60a5fa'  // Light Blue for Private Luxury Safari Gleaming
        ],
        borderColor: [
          '#dc2626',
          '#059669',
          '#d97706',
          '#2563eb',
          '#7c3aed',
          '#ea580c',
          '#0891b2',
          '#65a30d',
          '#db2777',
          '#0f766e',
          '#e11d48',
          '#9333ea',
          '#16a34a',
          '#ca8a04',
          '#4f46e5',
          '#f43f5e',
          '#059669',
          '#f59e0b',
          '#8b5cf6',
          '#3b82f6'
        ],
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }
    ];
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
