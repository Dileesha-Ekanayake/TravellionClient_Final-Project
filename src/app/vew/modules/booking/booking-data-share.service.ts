import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {Booking} from "../../../entity/booking";

/**
 * BookingDataShareService is a service designed to manage and share booking data
 * across different components within the application. It utilizes RxJS BehaviorSubject
 * and Subject to handle state and trigger events for booking-related functionalities.
 */
@Injectable({
  providedIn: 'root'
})

export class BookingDataShareService {

  constructor() { }

  /**
   * A BehaviorSubject instance that represents the data source for booking information,
   * storing either a Booking object or null.
   *
   * The BehaviorSubject provides an initial value of `null` and allows subscribers to
   * receive updates whenever the stored booking data changes. This can be used to
   * propagate booking state across different components or services in the application.
   *
   * @type {BehaviorSubject<(Booking | null)>}
   */
  private dataSource = new BehaviorSubject<Booking | null>(null);
  /**
   * An Observable stream representing the booking data.
   *
   * This variable provides a subscription-based interface to
   * monitor and react to changes in the booking data. It is
   * derived from the data source and emits updated values
   * whenever the data changes.
   *
   * @type {Observable<any>}
   */
  bookingData$ = this.dataSource.asObservable();

  /**
   * A subject that serves as a signal for triggering updates or changes
   * in the booking view. Emits a void event when the state of the booking
   * view needs to change, allowing components or services to subscribe
   * and react accordingly.
   *
   * This Subject does not carry any data and is primarily used for
   * notification of state changes.
   */
  private triggerBookingViewChangeSubject = new Subject<void>();
  /**
   * Observable stream `triggerBookingView$` used to emit changes related to triggering
   * booking views in the application.
   *
   * It acts as a public-facing Observable derived from the internal Subject `triggerBookingViewChangeSubject`,
   * enabling other components or services to subscribe and react to booking view trigger events.
   */
  public triggerBookingView$ = this.triggerBookingViewChangeSubject.asObservable();

  /**
   * A subject that serves as a trigger for filling a form.
   *
   * Emits a void value to notify subscribers when an action related
   * to filling the form should be executed.
   *
   * Typically used for broadcasting when a form needs to be automatically
   * populated or updated.
   *
   * This subject does not carry any data, only emits the event to signal
   * the trigger.
   */
  private triggerFillFormSubject = new Subject<void>();
  /**
   * Observable stream representing the trigger for the form-fill action.
   *
   * This variable is derived from a subject that emits events when an action to
   * auto-fill a form is triggered. Observers can subscribe to this stream to
   * react to the emitted events and handle form filling accordingly.
   *
   * Note: This is a read-only observable and should not be modified directly.
   * Emit values into the corresponding subject to trigger changes in this stream.
   *
   * @type {Observable<any>}
   */
  public triggerFillForm$ = this.triggerFillFormSubject.asObservable();

  /**
   * Sends the booking data to the data source for processing or communication.
   *
   * @param {Booking} data - The booking data to be sent to the data source.
   * @return {void} This method does not return a value.
   */
  sendBookingData(data: Booking) {
    this.dataSource.next(data);
  }

  /**
   * Retrieves booking data from the data source.
   *
   * @return {Booking | null} The current booking data or null if no data is available.
   */
  getBookingData(): Booking | null {
    return this.dataSource.getValue();
  }

  /**
   * Clears the current booking data by setting it to null.
   * Triggers an update on the data source to notify subscribers of the change.
   *
   * @return {void} This method does not return any value.
   */
  clearBookingData() {
    this.dataSource.next(null);
  }

  /**
   * Triggers a change in the booking view by notifying all subscribers of the `triggerBookingViewChangeSubject`.
   * This method is typically used to update or refresh the view whenever a relevant event occurs within the booking process.
   *
   * @return {void} Does not return a value.
   */
  triggerBookingViewChange() {
    this.triggerBookingViewChangeSubject.next();
  }

  /**
   * Triggers the form filling process by emitting a value through the triggerFillFormSubject.
   *
   * @return {void} Does not return any value.
   */
  triggerFillForm() {
    this.triggerFillFormSubject.next();
  }
}
