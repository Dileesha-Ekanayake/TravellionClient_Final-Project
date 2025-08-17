import {Component, enableProdMode} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatDateFormats, provideNativeDateAdapter} from "@angular/material/core";
import {AuthorizationManagerService} from "./auth/authorization-manager.service";

const formats: MatDateFormats = {
  parse: {
    dateInput: 'yyyy-MM-dd',
  },
  display: {
    dateInput: 'yyyy-MM-dd',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'yyyy-MM-dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
    selector: 'app-root',
    providers: [provideNativeDateAdapter(formats)],
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'ClientApp';

  constructor(private authService: AuthorizationManagerService) {
    this.authService.initializeMenuState();
    this.authService.getAuth(this.authService.getUsername());
  }
}
