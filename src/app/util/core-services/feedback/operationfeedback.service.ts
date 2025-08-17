import {Injectable} from '@angular/core';
import {MessageComponent} from "../../dialog/message/message.component";
import {ConfirmComponent} from "../../dialog/confirm/confirm.component";
import {MatDialog} from "@angular/material/dialog";
import {FormGroup} from "@angular/forms";
import {map, Observable} from "rxjs";
import {ServerResponse} from "../../api-response/server-response";

/**
 * A service responsible for handling and displaying feedback operations, including errors,
 * status messages, confirmations, and response handling.
 */
@Injectable({
  providedIn: 'root'
})
export class OperationFeedbackService {

  constructor(
    private matDialog: MatDialog
  ) {
  }

  /**
   * Displays the errors in a dialog box with the specified type and operation details.
   *
   * @param {string} type The type of the entity or operation associated with the errors.
   * @param {string} operation The specific operation being performed (e.g., create, update, delete).
   * @param {string} errors A string containing the details of the errors to be displayed.
   * @return {Observable<void>} An observable that emits when the dialog is closed.
   */
  showErrors(type: string, operation: string, errors: string): Observable<void> {
    return this.matDialog
      .open(MessageComponent, {
        disableClose: true,
        width: '500px',
        data: {
          heading: `Errors - ${type} ${operation}`,
          message: `You have the following errors : <br> ${errors}`
        }
      })
      .afterClosed()
      .pipe(map(() => undefined)); // Convert the emitted value to void
  }

  /**
   * Displays a message dialog with a given heading and message and returns an observable
   * that emits a boolean value when the dialog is closed.
   *
   * @param {string} heading - The title or heading text to be displayed in the dialog.
   * @param {string} message - The main message text to be displayed in the dialog.
   * @return {Observable<boolean>} An observable that emits `false` after the dialog is closed.
   */
  showMessage(heading: string, message: string): Observable<boolean> {
    return this.matDialog.open(MessageComponent, {
      disableClose: true,
      width: '500px',
      data: {
        heading: `${heading}`,
        message: `${message}`
      }
    })
      .afterClosed()
      .pipe(map(() => false));
  }

  /**
   * Displays a confirmation dialog based on the provided parameters and returns an observable resolving to a boolean value.
   * The boolean indicates the user's confirmation (true for "Yes", false for "No").
   *
   * @param {string} [type] - The type of object or operation being confirmed (e.g., "file", "process").
   * @param {string} [operation] - The operation being performed (e.g., "delete", "update", "clear").
   * @param {string} [objectData] - Additional information or data about the object or operation for the user.
   * @param {Object} [buttonsText] - Custom text for the buttons in the dialog box. Consists of "yes" and "no" keys.
   * @param {string} [buttonsText.yes] - Text for the "Yes" button.
   * @param {string} [buttonsText.no] - Text for the "No" button.
   * @param {boolean} [isWaiting] - Indicates if the dialog is shown in a waiting state or specific situation.
   * @returns {Observable<boolean>} An observable that resolves to `true` if the user confirms (clicks "Yes") or `false` if the user cancels (clicks "No").
   */
  showConfirmation(type?: string, operation?: string, objectData?: string, buttonsText?: {yes: string, no: string}, isWaiting?:boolean): Observable<boolean> {
    if (objectData === "") {
      return this.matDialog.open(MessageComponent, {
        disableClose: true,
        width: '500px',
        data: {
          heading: `Confirmation - ${type} ${operation}`,
          message: `Nothing to ${operation} for this ${type}`,
          buttonsText: buttonsText
        }
      })
        .afterClosed()
        .pipe(map(() => false));
    }

    const operationLower = operation?.toLowerCase() || '';

    let heading = '';
    let message = '';

    if (operationLower.includes('log out')) {
      heading = `Confirmation - ${operation}`;
      message = `${objectData}`;
    } else if (operationLower.includes('clear')) {
      heading = `Confirmation - ${type} ${operation}`;
      message = `${objectData}`;
    } else if (isWaiting) {
      heading = `Confirmation - ${type} ${operation}`;
      message = `${objectData}`;
    } else {
      heading = `Confirmation - ${type} ${operation}`;
      message = `Are you sure to ${operation} the following ${type}? <br><br>${objectData}`;
    }

    return this.matDialog.open(ConfirmComponent, {
      disableClose: true,
      width: '500px',
      data: { heading, message , buttonsText}
    })
      .afterClosed()
      .pipe(map(result => result === true));
  }

  /**
   * Processes the server response and returns a formatted object containing the response status, message, and additional server information.
   *
   * @param {ServerResponse<any> | null} response The server response object or null if no response is received.
   * @return {Object} An object containing the response status, message, and server information.
   * @return {boolean} return.status Indicates whether the response was successful based on the status code.
   * @return {string} return.responseMessage The response message received from the server.
   * @return {string} return.serverInfo Additional information provided by the server response.
   */
  handleResponse(response: ServerResponse<any> | null): { status: boolean; responseMessage: string; serverInfo: string } {
    if (!response) {
      return {
        status: false,
        responseMessage: "Server Not Found...!",
        serverInfo: "Server Not Found...!"
      };
    }

    const {
      statusCode,
      message = "Unknown response message",
      data = "No additional info available"
    } = response;

    // Extract actual data value by splitting on colon and trimming whitespace
    let actualData = data;
    if (typeof data === 'string' && data.includes(':')) {
      const parts = data.split(':');
      if (parts.length >= 2) {
        actualData = parts[1].trim(); // Get the part after colon and remove whitespace
      }
    }

    return {
      status: statusCode >= 200 && statusCode < 300,
      responseMessage: message,
      serverInfo: actualData
    };
  }

  /**
   * Displays a status dialog with a specific type, operation, and message, and returns an observable that emits once the dialog is closed.
   *
   * @param {string} type - The type of status to display (e.g., success, error, warning).
   * @param {string} operation - The name of the operation associated with the status.
   * @param {string} message - A detailed message to display in the dialog.
   * @return {Observable<void>} An observable that emits when the dialog is closed.
   */
  showStatus(type: string, operation: string, message: string): Observable<void> {
    return this.matDialog
      .open(MessageComponent, {
        disableClose: true,
        width: '500px',
        data: {
          heading: `Status - ${type} ${operation}`,
          message: message
        }
      })
      .afterClosed()
      .pipe(map(() => undefined));
  }

  /**
   * Formats object data by dynamically accessing nested properties based on the provided field names
   * and generating a formatted string with labels and values.
   *
   * @param {any} type - The object containing values to be formatted.
   * @param {string[]} fields - An array of strings representing the paths to the fields
   *                            within the object. Nested fields can be accessed using dot notation.
   * @return {string} A string containing the formatted data with labels and values from the object.
   */
  formatObjectData(type: any, fields: string[]): string {
    // Initialize an empty string to accumulate formatted data
    let message = '';

    // Loop through each field to generate the formatted message
    fields.forEach(field => {
      // Use reduce to access the nested property dynamically
      const value = field.split('.').reduce((o, a) => o && o[a], type);
      // Capitalize the first letter of the field for the label
      const label = field.split('.')[0];
      const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      // Append formatted string to the message
      message += `<br>${formattedLabel} is : ${value}<br>`;
    });

    return message;
  }

  /**
   * Checks if the given form group contains at least one control with a non-empty value,
   * optionally excluding specific controls from the check.
   *
   * @param {FormGroup} form - The form group to check for non-empty values.
   * @param {string[]} [excludeControls=[]] - An array of control names to exclude from the check.
   * @return {boolean} Returns true if at least one control (excluding specified controls) has a non-empty value, otherwise false.
   */
  hasAnyFormValue(form: FormGroup, excludeControls: string[] = []): boolean {
    return Object.entries(form.controls)
      .filter(([key]) => !excludeControls.includes(key))
      .some(([, control]) => {
        const value = control.value;
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'object' && !Array.isArray(value)) {
          return Object.keys(value).length > 0;
        }
        return true;
      });
  }
}
