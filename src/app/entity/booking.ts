import {BookingStatus} from "./booking-status";
import {BookingPassenger} from "./booking-passenger";
import {BookingAccommodation} from "./booking-accommodation";
import {BookingTransfer} from "./booking-transfer";
import {BookingGeneric} from "./booking-generic";
import {BookingTour} from "./booking-tour";
import {User} from "./user";

export class Booking {

  public id!: number;
  public user!: User;
  public code!: string;
  public grossamount!: number;
  public discountamount!: number;
  public netamount!: number;
  public totalpaid!: number;
  public balance!: number;
  public departuredate!: string;
  public enddate!: string;
  public bookingstatus!: BookingStatus;
  public bookingpassengers!: Array<BookingPassenger>;
  public bookingaccommodations!: Array<BookingAccommodation>;
  public bookingtransfers!: Array<BookingTransfer>;
  public bookinggenerics!: Array<BookingGeneric>;
  public bookingtours!: Array<BookingTour>;

}
