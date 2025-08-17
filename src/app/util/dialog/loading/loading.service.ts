import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {LoadingComponent} from "./loading.component";

/**
 * Service to manage the display of a loading dialog in the application.
 * Responsible for showing and hiding a loading indicator with a customizable message.
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingDialogRef: MatDialogRef<LoadingComponent> | null = null;
  constructor(private dialog: MatDialog) {}

  /**
   * Displays a loading dialog with a specified message. The dialog prevents user interaction and has a backdrop.
   *
   * @param {string} displayMessage - The message to display in the loading dialog.
   * @return {void} Does not return a value.
   */
  showLoading(displayMessage: string) {
    this.loadingDialogRef = this.dialog.open(LoadingComponent, {
      disableClose: true,
      hasBackdrop: true,
      data: {
        displayMessage: `${displayMessage}`
      }
    });
  }

  /**
   * Hides and closes the loading dialog if it is currently displayed.
   * This method checks whether a reference to the loading dialog exists, closes it if open, and resets the reference to null.
   *
   * @return {void} Does not return a value.
   */
  hideLoading() {
    if (this.loadingDialogRef) {
      this.loadingDialogRef.close();
      this.loadingDialogRef = null;
    }
  }
}
