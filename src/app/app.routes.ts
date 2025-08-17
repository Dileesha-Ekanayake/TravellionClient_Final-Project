import { Routes } from '@angular/router';
import {MainwindowComponent} from "./vew/mainwindow/mainwindow.component";
import {LoginComponent} from "./vew/login/login.component";
import {HomeComponent} from "./vew/home/home.component";
import {authGuard} from "./auth/auth.guard";
import {DashboardComponent} from "./vew/modules/dashboard/dashboard.component";

export const routes: Routes = [
  {path: "home", component: HomeComponent},
  {path: "", redirectTo: 'home', pathMatch: 'full'},
  {path: "login", component: LoginComponent},
  {
    path: "Home",
    component: MainwindowComponent,
    children: [
      {path: "dashboard", component: DashboardComponent},
      {path: "employee", loadComponent: () => import('./vew/modules/employee/employee.component').then(c => c.EmployeeComponent)},
      {path: "user", loadComponent: () => import('./vew/modules/user/user.component').then(c => c.UserComponent)},
      {path: "privilege", loadComponent: () => import('./vew/modules/privilege/privilege.component').then(c =>  c.PrivilegeComponent)},
      {path: "operation", loadComponent: () => import('./vew/modules/operation/operation.component').then(c =>  c.OperationComponent)},
      {path: "supplier", loadComponent: () => import('./vew/modules/supplier/supplier.component').then(c => c.SupplierComponent)},
      {path: "setup details", loadComponent: () => import('./vew/modules/setup-details/setup-details.component').then(c => c.SetupDetailsComponent)},
      {path: "accommodation", loadComponent: () => import('./vew/modules/accommodations/accommodations.component').then(c => c.AccommodationsComponent)},
      {path: "city", loadComponent: () => import('./vew/modules/city/city.component').then(c => c.CityComponent)},
      {path: "location", loadComponent: () => import('./vew/modules/travel-location/travel-location.component').then(c => c.TravelLocationComponent)},
      {path: "transfer", loadComponent: () => import('./vew/modules/transfers/transfers.component').then(c => c.TransfersComponent)},
      {path: "generic", loadComponent: () => import('./vew/modules/generic/generic.component').then(c => c.GenericComponent)},
      {path: "client", loadComponent: () => import('./vew/modules/client/client.component').then(c => c.ClientComponent)},
      {path: "package", loadComponent: () => import('./vew/modules/tour/tour.component').then(c => c.TourComponent)},
      {path: "booking", loadComponent: () => import('./vew/modules/booking/booking.component').then(c => c.BookingComponent)},
      {path: "client payment", loadComponent: () => import('./vew/modules/client-payment/client-payment-container/client-payment-container.component').then(c => c.ClientPaymentContainerComponent)},
      {path: "supplier payment", loadComponent: () => import('./vew/modules/supplier-payment/supplier-payment.component').then(c => c.SupplierPaymentComponent)}, {path: "report-view", loadComponent: () => import('./vew/reports/report-container/report-container.component').then(c => c.ReportContainerComponent)},
      {path: "user-profile", loadComponent: () => import('./vew/userprofile/userprofile.component').then(c => c.UserprofileComponent)},
      {path: "tour/package/view", loadComponent: () => import('./vew/modules/tour/tour-view/tour-view.component').then(c => c.TourViewComponent)},
      {path: "/Home/booking", redirectTo: 'booking', pathMatch: 'full'},
      {path: "/Home/package", redirectTo: 'package', pathMatch: 'full'},
      {path: "/Home/client", redirectTo: 'client', pathMatch: 'full'},
      {path: "/Home/client payment", redirectTo: 'client payment', pathMatch: 'full'},

    ], canActivate: [authGuard]
  }

];
