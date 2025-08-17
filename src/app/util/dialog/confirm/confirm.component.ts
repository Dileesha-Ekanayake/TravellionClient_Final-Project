import {Component, Inject, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef} from "@angular/material/dialog";
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {NgClass, NgForOf} from "@angular/common";

/**
 * A reusable confirmation dialog component.
 * This component is used to display a confirmation dialog with customizable message, heading, and button labels.
 * It utilizes Angular Material components for styling and layout.
 *
 * @decorator `@Component`
 *
 * Properties:
 * - `lines`: An array of strings derived from the `message` provided in the dialog data, used to display the message in multiple lines.
 * - `NoButtonText`: Text for the "No" button, defaulting to "Cancel" if not provided.
 * - `YesButtonText`: Text for the "Yes" button, defaulting to "Confirm" if not provided.
 *
 * Constructor:
 * - `dialogRef`: Reference to the dialog component, used to control the dialog (e.g., close it).
 * - `data`: Data passed to the dialog, including the heading, message to display, and optional button text.
 *
 * Lifecycle Hook:
 * - `ngOnInit`: Invoked during the component's initialization. It adds a custom CSS class to the dialog panel and processes the message data.
 *
 * Methods:
 * - `processMessage`: Processes the message passed in the dialog data by splitting it into individual lines and setting default button text if not provided.
 * - `onNoClick`: Closes the dialog with a "false" result when the "No" button is clicked.
 * - `onYesClick`: Closes the dialog with a "true" result when the "Yes" button is clicked.
 */
@Component({
  selector: 'app-confirm',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatDialogActions,
    MatButton,
    NgClass,
  ],
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent implements OnInit {

  lines: string[] = [];
  NoButtonText!: string;
  YesButtonText!: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { heading: string, message: string , buttonsText?: {yes: string, no: string} },
  ) {}

  ngOnInit(): void {
    this.dialogRef.addPanelClass('confirm-dialog');
    this.processMessage();
  }

  /**
   * Processes a message by splitting it into lines and filtering out empty or whitespace-only lines.
   * Additionally, assigns default values to "No" and "Yes" button text if not provided in the data.
   *
   * @return {void} Does not return a value.
   */
  private processMessage(): void {
    this.lines = this.data.message.split('<br>').filter((line: string) => line.trim() !== '');
    this.NoButtonText = this.data.buttonsText?.no || "Cancel";
    this.YesButtonText = this.data.buttonsText?.yes || "Confirm";
  }

  /**
   * Handles the action when the "No" button is clicked.
   * Closes the dialog and passes a value of false to indicate a negative response.
   *
   * @return {void} Does not return a value.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Handles the click event for the "Yes" action.
   * Closes the dialog and returns a confirmation response.
   *
   * @return {void} No return value.
   */
  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
