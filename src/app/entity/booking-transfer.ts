import {Booking} from "./booking";
import {TransferContract} from "./transfer-contract";
import {BookingItemStatus} from "./booking-item-status";
import {BookingTransferDetail} from "./booking-transfer-detail";

export class BookingTransfer {

  public id!: number;
  public booking!: Booking;
  public transfercontract!: TransferContract;
  public discountamount!: number;
  public totalamount!: number;
  public supplieramount!: number;
  public fromdatetime!: string;
  public todatetime!: string;
  public bookingitemstatus!: BookingItemStatus;
  public bookingtransferdetails!: Array<BookingTransferDetail>;
}
