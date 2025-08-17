import {Injectable} from "@angular/core";
import {debounceTime, map, startWith, Subscription} from "rxjs";
import {FormGroup} from "@angular/forms";
import {AvNotificationService} from "@avoraui/av-notifications";

/**
 * Service responsible for managing form control validations and handling subscriptions
 * to ensure data integrity and consistent UI behavior. Useful for enforcing validation rules
 * such as positive number constraints across various components.
 */
@Injectable({
  providedIn: 'root'
})

export class DataValidationService {

  private subscriptionsMap = new Map<string, Subscription[]>();

  constructor(
    private avNotificationService: AvNotificationService
  ) {}

  /**
   * Sets up validation for form controls to ensure their values are positive numbers
   * and meet specified minimum values. If a control's value is invalid, it resets
   * to the minimum value and optionally triggers a notification or logs a warning.
   *
   * @param componentId A unique identifier for the component using this validation.
   *                    Used to manage subscriptions specific to that component.
   * @param formGroup The FormGroup instance containing the form controls to validate.
   * @param controlConfigs An array of tuples where each tuple contains the control name
   *                       in the form group and the corresponding minimum allowable value
   *                       for that control. For example: ['controlName', minValue].
   * @return {void} This method does not return a value.
   */
  setupPositiveNumberValidation(componentId: string, formGroup: FormGroup, controlConfigs: [string, number][]): void {

    // Get existing subscriptions or create a new array
    const existingSubscriptions = this.subscriptionsMap.get(componentId) || [];
    const newSubscriptions: Subscription[] = [...existingSubscriptions];

    controlConfigs.forEach(([controlName, minValue]) => {
      const control = formGroup.controls[controlName];

      if (!control) {
        console.error(`Control '${controlName}' not found in form group`);
        return;
      }

      const validationSubscription = control.valueChanges.pipe(
        startWith(control.value || 0),
        debounceTime(100),
        map(value => {
          const numericValue = Number(value || 0);

          if (numericValue < minValue) {

            if (this.avNotificationService && this.avNotificationService.showFailure) {
              this.avNotificationService.showFailure(`${controlName} must be greater than or equal to ${minValue}`,{
                theme: "light"
              });
            } else {
              console.warn(`${controlName} must be greater than or equal to ${minValue}`);
            }

            control.reset();
            return minValue;
          }

          return numericValue;
        })
      ).subscribe();

      newSubscriptions.push(validationSubscription);
    });

    // Store subscriptions for this component
    this.subscriptionsMap.set(componentId, newSubscriptions);
  }

  /**
   * Sets up positive number validation for the specified form controls, ensuring that
   * any previous subscriptions for the specified component are cleaned up prior to initialization.
   *
   * @param {string} componentId - The unique identifier for the component whose subscriptions should be managed.
   * @param {FormGroup} formGroup - The reactive form group containing the controls to be validated.
   * @param {[string, number][]} controlConfigs - An array of tuples where each tuple consists of a control name and its corresponding initial value.
   * @return {void} This method does not return a value.
   */
  setupPositiveNumberValidationFresh(componentId: string, formGroup: FormGroup, controlConfigs: [string, number][]): void {
    // Clean up existing subscriptions for this component
    this.cleanupSubscriptions(componentId);

    // Then setup new validation
    this.setupPositiveNumberValidation(componentId, formGroup, controlConfigs);
  }

  /**
   * Cleans up all subscriptions associated with the specified component.
   *
   * @param {string} componentId - The unique identifier of the component whose subscriptions need to be cleaned up.
   * @return {void} This method does not return any value.
   */
  cleanupSubscriptions(componentId: string): void {
    const subscriptions = this.subscriptionsMap.get(componentId);
    if (subscriptions) {
      console.log(`Cleaning up ${subscriptions.length} subscriptions for ${componentId}`);
      subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptionsMap.delete(componentId);
    }
  }

  /**
   * Cleans up all active subscriptions by unsubscribing them and clearing the subscriptions map.
   *
   * @return {void} This method does not return any value.
   */
  cleanupAllSubscriptions(): void {
    this.subscriptionsMap.forEach((subscriptions, componentId) => {
      subscriptions.forEach(sub => sub.unsubscribe());
    });
    this.subscriptionsMap.clear();
  }

  /**
   * Calculates and returns the total count of active subscriptions.
   *
   * @return {number} The total number of active subscriptions.
   */
  getActiveSubscriptionCount(): number {
    let count = 0;
    this.subscriptionsMap.forEach(subscriptions => {
      count += subscriptions.length;
    });
    return count;
  }

}
