import {Injectable} from '@angular/core';
import {FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {DatePipe} from "@angular/common";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";

/**
 * Service responsible for validating Angular reactive forms.
 * Provides methods to dynamically apply validators, handle form control states,
 * and retrieve errors or field update information for a given form.
 */
@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  regexes: any;

  constructor(
    private dataService: DataService,
    private datePipe: DatePipe,
  ) {
  }

  /**
   * Initializes and configures a form by applying validators, optionally fetching regular expressions based on a given type.
   *
   * @param {FormGroup} form - The Angular FormGroup instance to be configured.
   * @param {any} [oldObject] - The old object that may be compared or used to initialize the form.
   * @param {any} [newObject] - The new object that may be compared or used to initialize the form.
   * @param {string} [type] - An optional type to fetch corresponding regular expressions.
   * @param {string[]} [disabledFields] - An optional array of field names to be disabled in the form.
   * @param {string[]} [optionalFields] - An optional array of field names for which validators might be optional.
   * @param {[formattedControlName: string, formattedPattern: string][]} [formattedFields] - An optional array of pairs specifying control names and their respective formatting patterns.
   * @return {void} This method does not return any value but modifies the provided form by applying configurations and validations.
   */
  createForm(form: FormGroup, oldObject?: any, newObject?: any, type?: string, disabledFields?: string[], optionalFields?: string[], formattedFields?: [formattedControlName: string, formattedPattern: string][]): void {
    if (type) {
      this.dataService.getRegex(ApiEndpoints.paths.regexes, type).subscribe({
        next: (regexes) => {
          this.regexes = regexes;
          this.applyValidators(form, oldObject, newObject, disabledFields, optionalFields, formattedFields);
        },
        error: (error) => {
          console.error('Error fetching regexes:', error);
          this.applyValidators(form, oldObject, newObject, optionalFields, disabledFields, formattedFields);
        }
      })
    } else {
      this.applyValidators(form, oldObject, newObject, optionalFields, disabledFields, formattedFields);
    }
  }

  /**
   * Applies validators to the controls within a provided FormGroup. This method configures and sets
   * necessary validators, manages optional and disabled fields, and formats field values based on
   * specified patterns. It also updates the validity and state of controls in the form.
   *
   * @param {FormGroup} form The form group containing the controls to which validators will be applied.
   * @param {any} [oldObject] Optional. An object representing the original state of the form data, used for tracking changes.
   * @param {any} [newObject] Optional. An object representing the new state of the form data, used for tracking changes.
   * @param {string[]} [disabledFields] Optional. An array of control names that should be disabled in the form.
   * @param {string[]} [optionalFields] Optional. An array of control names that are not mandatory to fill.
   * @param {[string, string][]} [formattedFields] Optional. An array of tuples, where each tuple contains a control name and a formatting pattern to apply to its value.
   * @return {void} Does not return a value.
   */
  private applyValidators(form: FormGroup, oldObject?: any, newObject?: any, disabledFields?: string[], optionalFields?: string[], formattedFields?: [string, string][]): void {
    Object.keys(form.controls).forEach(controlName => {
      const control = form.controls[controlName];
      const validatePatterns = this.regexes?.[controlName]?.['regex'];

      // Check if the control should be disabled
      if (disabledFields?.includes(controlName)) {
        control.disable();
      }

      // Check if the control is optional
      const isOptional = optionalFields?.includes(controlName);

      // Prepare validators array
      const validators: ValidatorFn[] = [];

      // Add validators for Required
      if (!isOptional) {
        validators.push(Validators.required);
      }

      // Add validator Patterns
      if (validatePatterns) {
        validators.push(Validators.pattern(validatePatterns));
      }

      // Set validators to the controls
      control.setValidators(validators.length > 0 ? validators : null);

      // Mark control as touched and update its validity
      control.markAsTouched();
      control.updateValueAndValidity();
    });

    // Mark the form as pristine
    form.markAsPristine();

    // Subscribe to control value changes
    Object.keys(form.controls).forEach(controlName => {
      const control = form.controls[controlName];
      control.valueChanges.subscribe(value => {
        formattedFields?.map(([formattedControlName, formattedPattern]) => {
          if (controlName === formattedControlName) {
            // If dobirth is picked, and it's a Date, format it as 'yyyy-MM-dd'
            if (value instanceof Date) {
              form.controls[controlName].setValue(this.datePipe.transform(value, formattedPattern))
            }
          }
        })
        // Handle change detection for other controls
        if (oldObject && newObject && control.valid) {
          if (value === newObject[controlName]) {
            control.markAsPristine();
          } else {
            control.markAsDirty();
          }
        } else {
          control.markAsPristine();
        }
      });
    });
  }

  /**
   * Retrieves error messages from a given FormGroup based on its controls.
   *
   * @param {FormGroup} form - The form group containing controls to validate for errors.
   * @param {string[]} [optionalFields] - An optional array of control names that should be excluded from error checking.
   * @return {string} A formatted string containing all error messages from the controls, separated by line breaks.
   */
  getErrors(form: FormGroup, optionalFields?: string []): string {
    return Object.keys(form.controls)
      .filter(controlName => !optionalFields?.includes(controlName) && form.controls[controlName].errors) // Get only controls with errors
      .map(controlName => this.regexes[controlName]?.message || `Invalid ${controlName}`) // Use regex message if available
      .join("<br>"); // Join all messages with `<br>`
  }

  /**
   * Generates a summary of updates for form controls that have been marked as dirty.
   *
   * @param {FormGroup} form - The form group containing controls to evaluate for changes.
   * @return {string} A formatted string indicating which controls have been updated.
   */
  getUpdates(form: FormGroup): string {
    return Object.keys(form.controls)
      .filter(controlName => form.controls[controlName].dirty)
      .map(controlName => controlName.charAt(0).toUpperCase() + controlName.slice(1) + " Changed")
      .join("<br>");
  }

  /**
   * Updates the states of form controls in a given form group based on the provided configuration.
   *
   * @param {FormGroup} form - The form group containing the controls to update.
   * @param {{ [controlName: string]: { enabled: boolean, emitEvent?: boolean } }} controlStates - An object specifying the state for each control.
   *    Each key corresponds to a control name, and the value is an object specifying:
   *    - enabled: A boolean indicating whether the control should be enabled or disabled.
   *    - emitEvent: An optional boolean to specify if state change should emit an event. Defaults to true if not provided.
   * @return {void} This method does not return any value.
   */
  setFormControlStates(form: FormGroup, controlStates: { [controlName: string]: { enabled: boolean, emitEvent?: boolean } }): void {
    Object.entries(controlStates).forEach(([controlName, { enabled, emitEvent }]) => {
      const control = form.get(controlName);
      if (control) {
        if (enabled) {
          control.enable({ emitEvent: emitEvent ?? true });
        } else {
          control.disable({ emitEvent: emitEvent ?? true });
        }
      }
    });
  }
}
