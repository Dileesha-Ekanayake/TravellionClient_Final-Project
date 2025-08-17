import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

/**
 * LoadingComponent is a standalone Angular component responsible for displaying
 * a loading indicator with a configurable message. It can be used to inform
 * users about ongoing background operations to enhance application usability.
 *
 * This component is typically used within a modal dialog and disables
 * closing the dialog manually until the operation is complete.
 *
 * Dependencies:
 * - MatDialogRef: Manages references to the dialog containing this component.
 * - MAT_DIALOG_DATA: Injects external data into the dialog for configuring
 *   the display message.
 *
 * Properties:
 * - dialogRef: Reference to the dialog that hosts this component.
 * - data: Object containing properties to configure the loading display.
 *
 * Usage:
 * Use this component within a MatDialog to show loading messages and
 * prevent users from interacting with the application until the dialog is closed programmatically.
 */
@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.component.html',
  standalone: true,
  styleUrl: './loading.component.css'
})
export class LoadingComponent {
  constructor(
    public dialogRef: MatDialogRef<LoadingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { displayMessage: string }) {
    this.dialogRef.disableClose = true;
  }
}
