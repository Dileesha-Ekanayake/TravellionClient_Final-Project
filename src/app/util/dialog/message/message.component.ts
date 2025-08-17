import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {NgClass} from "@angular/common";

/**
 * MessageComponent is a standalone Angular component designed to display messages within a dialog.
 * The messages can be multi-line and are processed with specific formatting rules.
 *
 * The component is optimized for performance using OnPush change detection strategy.
 * It is configured to be a part of Material Design by utilizing Material Dialog
 * and related components.
 *
 * Features:
 * - Parses and displays message content with support for line breaks.
 * - Supports user interaction to confirm (Yes) or dismiss (No) the dialog.
 * - Uses Angular Material's dialog system for rendering and interaction handling.
 *
 * Decorator Metadata:
 * - selector: 'app-message'
 * - imports: Includes necessary Material Design modules like MatCard, MatButton, etc.
 * - templateUrl: Path to the component's HTML template file.
 * - styleUrl: Path to the component's associated CSS file.
 * - changeDetection: Uses OnPush strategy for improved performance.
 *
 * Properties:
 * - `lines`: Holds processed message lines to display in the dialog.
 *
 * Constructor Parameters:
 * - `dialogRef`: Reference to the dialog instance, allowing for dialog configuration and closure.
 * - `data`: Object containing `heading` and `message` properties provided to the dialog.
 *
 * Public Methods:
 * - `ngOnInit()`: Lifecycle hook called once the component is initialized.
 *                 It adds a custom CSS class to the dialog and processes the message input.
 * - `onNoClick()`: Closes the dialog and returns `false`.
 * - `onYesClick()`: Closes the dialog and returns `true`.
 *
 * Private Methods:
 * - `processMessage()`: Splits the provided message content into individual lines,
 *                       filtering out empty or whitespace-only lines.
 */
@Component({
  selector: 'app-message',
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatDialogActions,
    MatButton,
    NgClass,
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent implements OnInit{

  lines: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { heading: string, message: string }
  ) {}

  ngOnInit(): void {
    this.dialogRef.addPanelClass('message-dialog');
    this.processMessage();
  }

  /**
   * Processes the message string by splitting it into individual lines and filtering out empty or whitespace-only lines.
   * The processed lines are stored in the `lines` property.
   *
   * @return {void} This method does not return a value.
   */
  private processMessage(): void {
    this.lines = this.data.message.split('<br>').filter((line: string) => line.trim() !== '');
  }

  /**
   * Handles the action triggered when the "No" option is selected.
   *
   * @return {void} This method does not return any value.
   */
  onNoClick(): void {
    this.dialogRef.close(false);
  }

  /**
   * Handles the logic when the "Yes" button is clicked.
   * Closes the dialog with a positive confirmation.
   *
   * @return {void} This method does not return any value.
   */
  onYesClick(): void {
    this.dialogRef.close(true);
  }

}
