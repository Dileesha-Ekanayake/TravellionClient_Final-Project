import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {CustomerPayment} from "../../../entity/customer-payment";

interface PaymentSaveResponse {
  operation: 'success' | 'failed';
  data: string | null;
}

/**
 * Service responsible for sharing and managing state related to customer payment data.
 * Provides mechanisms to share data between components, trigger specific actions,
 * and notify about operations related to customer payment management.
 */
@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentDataShareService {
  constructor() { }

  /**
   * A reactive data source represented as a BehaviorSubject.
   * This variable holds the current state of customer payment information or null.
   *
   * BehaviorSubject ensures that the latest value is always emitted to new subscribers
   * and retains a default value of `null` if no payment data is provided.
   *
   * The value can be either:
   * - An instance of `CustomerPayment` containing payment details.
   * - `null` indicating no payment data is available.
   */
  private dataSource = new BehaviorSubject<CustomerPayment | null>(null);
  /**
   *
   */
  currentData = this.dataSource.asObservable();

  /**
   * A Subject instance used to emit events or notifications
   * when a payment save action is triggered.
   *
   * This is a reactive programming utility from the RxJS library,
   * which allows multiple subscribers to listen for and react to
   * specific events or triggers related to saving payments.
   *
   * The generic type `void` indicates that no specific value or
   * data payload is emitted when the Subject is triggered.
   */
  private triggerPaymentSaveSubject = new Subject<void>();
  /**
   * Observable that emits values whenever a payment save action is triggered.
   * This stream is derived from the `triggerPaymentSaveSubject` and can be
   * subscribed to by components or services that need to react to payment save events.
   * It should be used as a read-only stream for consumers to observe changes or actions.
   *
   * This observable is used to notify listeners when a payment save should occur.
   */
  public triggerPaymentSave$ = this.triggerPaymentSaveSubject.asObservable();

  /**
   * A subject that notifies subscribers about a form clear event.
   *
   * This subject emits an event when a form clear action is triggered,
   * allowing other components or services to react to this event. It
   * emits a void type, signifying no actual data is carried with the emission.
   *
   * Typically used in scenarios where multiple parts of the application
   * need to be informed about resetting or clearing form data.
   */
  private triggerFormClearSubject = new Subject<void>();
  /**
   * Observable that emits values when a form clear event is triggered.
   *
   * This variable is derived from the `triggerFormClearSubject` as an observable stream.
   * It is typically used to notify or broadcast form reset or clear events to other parts
   * of the application that may need to react or update based on this action.
   *
   * It allows subscribers to listen and respond to form clearing operations without
   * directly modifying the state or invoking the reset operation themselves.
   *
   * @type {Observable}
   */
  public triggerFormClear$ = this.triggerFormClearSubject.asObservable();

  /**
   * Represents a BehaviorSubject that holds the response of a payment save operation.
   * The initial value contains the operation status and optional data payload.
   *
   * @type {BehaviorSubject<PaymentSaveResponse>}
   */
  private paymentSavedResponse = new BehaviorSubject<PaymentSaveResponse>({operation: 'success', data: null});
  /**
   * Represents an Observable that emits events when a payment save operation has been completed.
   * It streams the transformed output of the paymentSavedResponse Subject as an Observable.
   * This can be used to subscribe and react to successful saving of payment data.
   */
  public paymentSaveComplete$ = this.paymentSavedResponse.asObservable();

  /**
   * A subject that triggers the save-and-close operation for a payment model.
   *
   * This subject emits a notification when the save-and-close action for the payment
   * model is initiated. It does not carry any value but serves as a signal to
   * listeners to perform the associated operation.
   *
   * Designed for scenarios where observing or reacting to the payment model save-and-close
   * workflow is required in a reactive system.
   */
  private triggerPaymentSaveAndCloseModelSubject = new Subject<void>();
  /**
   * Observable stream that emits events whenever the "Save and Close" action
   * for a payment operation is triggered. It allows subscribers to react to
   * these events as needed within the application workflow.
   *
   * This observable is derived from an internal subject via `asObservable()`
   * to ensure immutability, providing a read-only interface for external consumers.
   *
   * Designed to be utilized in scenarios requiring reactive configurations
   * or responding to user interactions related to payment save and close actions.
   *
   * @type {Observable<any>} Observable emitting events related to payment save and close action triggers.
   */
  public triggerPaymentSaveAndCloseModel$ = this.triggerPaymentSaveAndCloseModelSubject.asObservable();

  /**
   * A Subject instance utilized for managing and emitting events
   * to trigger the form fill action. This subject does not carry any
   * payload (void) when emitting events.
   *
   * Typically used in reactive programming scenarios where observables
   * are leveraged to respond to events or execute actions. Subscribers
   * to this subject are notified when an action to fill the form is triggered.
   */
  private triggerFillFormSubject = new Subject<void>();
  /**
   * An Observable that emits values indicating the trigger to fill the form.
   *
   * This observable is derived from the `triggerFillFormSubject`, and it emits
   * events whenever the associated subject emits a new value. It can be used to
   * listen for changes and act upon specific triggers for form population.
   *
   * This variable is typically subscribed to by components or services that need
   * to respond when a fill form action should be initiated.
   */
  public triggerFillForm$ = this.triggerFillFormSubject.asObservable();

  /**
   * Sends customer payment data to the specified data source.
   *
   * @param {CustomerPayment} data - The customer payment information to be sent.
   * @return {void} This method does not return any value.
   */
  sendCustomerPaymentData(data: CustomerPayment) {
    this.dataSource.next(data);
  }

  /**
   * Retrieves the customer payment data from the data source.
   *
   * @return {CustomerPayment | null} The customer payment data if available, or null if no data exists.
   */
  getCustomerPaymentData(): CustomerPayment | null {
    return this.dataSource.getValue();
  }

  /**
   * Triggers the payment save process by sending a notification to the associated Subject.
   *
   * @return {void} Does not return any value.
   */
  triggerPaymentSave() {
    this.triggerPaymentSaveSubject.next();
  }

  /**
   * Triggers the clearing of a form by notifying subscribers through the `triggerFormClearSubject`.
   *
   * @return {void} This method does not return a value.
   */
  triggerFormClear() {
    this.triggerFormClearSubject.next();
  }

  /**
   * Notifies the completion status of a payment save operation.
   *
   * @param {'success' | 'failed'} operation - The status of the payment save operation. Use 'success' if the operation succeeded or 'failed' if it failed.
   * @param {string | null} [data=null] - Optional additional data associated with the operation. Can be a string containing relevant information or null if no data is provided.
   * @return {void} This method does not return any value.
   */
  sendPaymentSaveComplete(operation: 'success' | 'failed', data: string | null = null) {
    this.paymentSavedResponse.next({ operation, data });
  }

  /**
   * Method that provides an observable containing the complete response
   * of a payment save operation.
   *
   * @return {Observable<PaymentSaveResponse>} An observable emitting the
   *         PaymentSaveResponse when the payment save operation is completed.
   */
  getPaymentSaveComplete(): Observable<PaymentSaveResponse> {
    return this.paymentSavedResponse.asObservable();
  }

  /**
   * Clears the current customer payment data by setting the related data source to null.
   * This method is used to reset or clear payment information associated
   * with the customer in the application state.
   *
   * @return {void} This method does not return a value.
   */
  clearCustomerPaymentData() {
    this.dataSource.next(null);
  }

  /**
   * Triggers the event to save payment information and close the model dialog.
   *
   * @return {void} Does not return a value.
   */
  triggerPaymentSaveAndCloseModel() {
    this.triggerPaymentSaveAndCloseModelSubject.next();
  }

  /**
   * Triggers an event to fill a form by notifying all observers of the triggerFillFormSubject.
   * This method does not take any input parameters and functions as a notifier mechanism.
   *
   * @return {void} This method does not return a value.
   */
  triggerFillForm() {
    this.triggerFillFormSubject.next();
  }
}
