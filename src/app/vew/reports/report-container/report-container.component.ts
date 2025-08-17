import {Component, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatIcon} from "@angular/material/icon";
import {MatPrefix} from "@angular/material/form-field";
import {MonthlyTourSummaryComponent} from "../monthly-tour-summary/monthly-tour-summary.component";
import {NgClass} from "@angular/common";
import {BookingTrendComponent} from "../booking-trend/booking-trend.component";
import {TourOccupancyComponent} from "../tour-occupancy/tour-occupancy.component";
import {IncomeAndRevenueComponent} from "../income-and-revenue/income-and-revenue.component";
import {PaymentCollectionComponent} from "../payment-collection/payment-collection.component";
import {
  ProfitabilityAnalysisByTourTypeComponent
} from "../profitability-analysis-by-tour-type/profitability-analysis-by-tour-type.component";
import {PeakSeasonDemandForecastComponent} from "../peak-season-demand-forecast/peak-season-demand-forecast.component";

type ReportType =
  'MonthlyTourSummary' |
  'BookingTrend' |
  'TourOccupancy' |
  'IncomeAndRevenue' |
  'PaymentCollection' |
  // 'CancelledToursAndReturns' |
  // 'VehicleUtilization' |
  'ProfitabilityAnalysisByTourType'
  // 'PeakSeasonDemandForecast';
  // 'TourPricingSensitivity' |
  // 'ServiceFeedbackAnalysis';

interface ReportMenuItem {
  name: string;
  icon: string;
  type: ReportType;
}

@Component({
  selector: 'app-report-container',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    MatPrefix,
    MonthlyTourSummaryComponent,
    NgClass,
    BookingTrendComponent,
    TourOccupancyComponent,
    IncomeAndRevenueComponent,
    PaymentCollectionComponent,
    ProfitabilityAnalysisByTourTypeComponent,
    PeakSeasonDemandForecastComponent
  ],
  templateUrl: './report-container.component.html',
  standalone: true,
  styleUrl: './report-container.component.css'
})
export class ReportContainerComponent implements OnInit{

  breadcrumb: any;
  activeReportType: ReportType = 'BookingTrend';
  selectedReportMenuName: string = '';

  isEnableMonthlyTourSummary : boolean = false
  isEnableBookingTrend : boolean = false
  isEnableTourOccupancy : boolean = false
  isEnableIncomeAndRevenue : boolean = false
  isEnablePaymentCollection : boolean = false
  // isCancelledToursAndReturns : boolean = false
  // isEnableVehicleUtilization : boolean = false
  isEnableProfitabilityAnalysisByTourType : boolean = false
  isEnablePeakSeasonDemandForecast : boolean = false
  // isEnableTourPricingSensitivity : boolean = false
  // isEnableServiceFeedbackAnalysis : boolean = false

  /**
   * Represents the side menu configuration for the reports section of an application.
   *
   * Each menu item corresponds to a specific report type and contains metadata such as the name,
   * icon, and type identifier used for interaction and navigation.
   *
   * Properties:
   * - name: The display name of the report in the side menu (e.g., "Booking Trend").
   * - icon: The material design icon name representing the report visually (e.g., "trending_up").
   * - type: A unique identifier or key that specifies the report type programmatically (e.g., "BookingTrend").
   *
   * This variable is an array of objects, where each object defines the details of a menu item.
   * Certain reports may be commented out, indicating they are either under development,
   * deprecated, or intentionally excluded from the menu.
   */
  reportSideMenu: ReportMenuItem[] = [
    { name: 'Booking Trend', icon: 'trending_up', type: 'BookingTrend' },
    { name: 'Monthly Tour Summary', icon: 'calendar_month', type: 'MonthlyTourSummary' },
    { name: 'Tour Occupancy', icon: 'people', type: 'TourOccupancy' },
    { name: 'Income And Revenue', icon: 'attach_money', type: 'IncomeAndRevenue' },
    { name: 'Payment Collection', icon: 'payment', type: 'PaymentCollection' },
    // { name: 'Cancelled Tours And Returns', icon: 'cancel', type: 'CancelledToursAndReturns' },
    // { name: 'Vehicle Utilization', icon: 'directions_bus', type: 'VehicleUtilization' },
    { name: 'Profitability Analysis By Tour Type', icon: 'analytics', type: 'ProfitabilityAnalysisByTourType' },
    // { name: 'Peak Season Demand Forecast', icon: 'insights', type: 'PeakSeasonDemandForecast' },
    // { name: 'Tour Pricing Sensitivity', icon: 'price_change', type: 'TourPricingSensitivity' },
    // { name: 'Service Feedback Analysis', icon: 'rate_review', type: 'ServiceFeedbackAnalysis' }
  ];

  constructor(
    private breadcrumbService: BreadcrumbService,
  ) {
  }

  ngOnInit() {
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.initialize();
  }

  initialize() : void {
    this.selectedReportMenuName = this.reportSideMenu[0].name;
    this.setReportView(this.activeReportType);
  }

  /**
   * Updates the state to enable or disable specific report views based on the provided report type.
   *
   * @param {'MonthlyTourSummary' |
   * 'BookingTrend' |
   * 'TourOccupancy' |
   * 'IncomeAndRevenue' |
   * 'PaymentCollection' |
   * 'CancelledToursAndReturns' |
   * 'VehicleUtilization' |
   * 'ProfitabilityAnalysisByTourType' |
   * 'PeakSeasonDemandForecast' |
   * 'TourPricingSensitivity' |
   * 'ServiceFeedbackAnalysis'} reportType - The type of report to be enabled. It must be one of the predefined report types.
   * @return {void} This method does not return a value.
   */
  setReportView(
    reportType :
      'MonthlyTourSummary' |
      'BookingTrend' |
      'TourOccupancy' |
      'IncomeAndRevenue' |
      'PaymentCollection' |
      'CancelledToursAndReturns' |
      'VehicleUtilization' |
      'ProfitabilityAnalysisByTourType' |
      'PeakSeasonDemandForecast' |
      'TourPricingSensitivity' |
      'ServiceFeedbackAnalysis'
  ) : void {
    this.isEnableMonthlyTourSummary = reportType === 'MonthlyTourSummary';
    this.isEnableBookingTrend = reportType === 'BookingTrend';
    this.isEnableTourOccupancy = reportType === 'TourOccupancy';
    this.isEnableIncomeAndRevenue = reportType === 'IncomeAndRevenue';
    this.isEnablePaymentCollection = reportType === 'PaymentCollection';
    // this.isCancelledToursAndReturns = reportType === 'CancelledToursAndReturns';
    // this.isEnableVehicleUtilization = reportType === 'VehicleUtilization';
    this.isEnableProfitabilityAnalysisByTourType = reportType === 'ProfitabilityAnalysisByTourType';
    // this.isEnablePeakSeasonDemandForecast = reportType === 'PeakSeasonDemandForecast';
    // this.isEnableTourPricingSensitivity = reportType === 'TourPricingSensitivity';
    // this.isEnableServiceFeedbackAnalysis = reportType === 'ServiceFeedbackAnalysis';
  }

  /**
   * Selects the report menu based on the provided report type and menu name.
   *
   * @param {ReportType} reportType - The type of the report to be selected.
   * @param {string} menuName - The name of the menu to be associated with the report.
   * @return {void} This method does not return any value.
   */
  selectReportMenu(reportType: ReportType, menuName: string): void {
    this.activeReportType = reportType;
    this.selectedReportMenuName = menuName;
    this.setReportView(reportType);
  }

  /**
   * Determines the appropriate CSS class for a menu item based on the given report type.
   *
   * @param {ReportType} reportType - The type of the report that is being evaluated.
   * @return {string} The CSS class name ('active-menu' if the given report type matches the active report type, otherwise 'default-cell').
   */
  getMenuItemClass(reportType: ReportType): string {
    return this.activeReportType === reportType ? 'active-menu' : 'default-cell';
  }

}
