import {Component} from '@angular/core';
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
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {AvChartJs} from "@avoraui/av-chart-js";

@Component({
  selector: 'app-peak-season-demand-forecast',
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
    MatOption,
    MatSelect,
    MatStartDate,
    MatSuffix,
    AvChartJs
  ],
  templateUrl: './peak-season-demand-forecast.component.html',
  standalone: true,
  styleUrl: './peak-season-demand-forecast.component.css'
})
export class PeakSeasonDemandForecastComponent {

  tourCategories = ['Budget', 'Standard', 'Premium', 'Luxury'];
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  doughnutLabels = ['Current Capacity', 'Peak Season Need', 'Off-Season Surplus'];

  lineDatasets = [
    {
      label: '2024 Actual',
      data: [120, 150, 280, 450, 520, 680, 850, 920, 600, 400, 250, 180],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#1d4ed8',
      pointBorderWidth: 2,
      pointRadius: 6,
    },
    {
      label: '2025 Forecast',
      data: [140, 180, 320, 580, 650, 820, 1100, 1200, 780, 520, 300, 220],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      borderDash: [5, 5],
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#059669',
      pointBorderWidth: 2,
      pointRadius: 6,
    }
  ];

  doughnutDatasets = [
    {
      label: 'Capacity Distribution',
      data: [60, 25, 15],
      backgroundColor: [
        '#3b82f6',
        '#ef4444',
        '#10b981'
      ],
      borderColor: [
        '#1d4ed8',
        '#dc2626',
        '#059669'
      ],
      borderWidth: 3,
      hoverOffset: 10
    }
  ];


}
