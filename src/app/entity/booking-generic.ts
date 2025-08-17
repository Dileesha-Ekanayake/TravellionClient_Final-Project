import {Booking} from "./booking";
import {Generic} from "./generic";
import {BookingItemStatus} from "./booking-item-status";
import {BookingGenericPax} from "./booking-generic-pax";

export class BookingGeneric {

  public id!: number;
  public booking!: Booking;
  public generic!: Generic;
  public discountamount!: number;
  public totalamount!: number;
  public supplieramount!: number;
  public fromdatetime!: string;
  public todatetime!: string;
  public bookingitemstatus!: BookingItemStatus;
  public bookinggenericpaxes!: Array<BookingGenericPax>;

}
