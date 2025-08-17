import {Booking} from "./booking";
import {BookingAccommodation} from "./booking-accommodation";

export class BookingAccommodationRoom {

  public id!: number;
  public roomtype!: string;
  public paxtype!: string;
  public count!: number;
  public amount!: number;
  public booking!: Booking;
  public bookingaccommodation!: BookingAccommodation;

}
