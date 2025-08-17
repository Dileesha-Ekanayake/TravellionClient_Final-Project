import {Booking} from "./booking";
import {Accommodation} from "./accommodation";
import {BookingItemStatus} from "./booking-item-status";
import {BookingAccommodationRoom} from "./booking-accommodation-room";

export class BookingAccommodation {

  public id!: number;
  public booking!: Booking
  public accommodation!: Accommodation;
  public totalamount!: number;
  public discountamount!: number;
  public fromdatetime!: string;
  public todatetime!: string;
  public supplieramount!: number;
  public bookingitemstatus!: BookingItemStatus;
  public bookingaccommodationrooms!: Array<BookingAccommodationRoom>;

}
