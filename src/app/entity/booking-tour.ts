import {Booking} from "./booking";
import {Tour} from "./tour";
import {BookingItemStatus} from "./booking-item-status";

export class BookingTour {

  public id!: number;
  public booking!: Booking;
  public tourcontract!: Tour;
  public totalamount!: number;
  public bookingitemstatus!: BookingItemStatus;
}
