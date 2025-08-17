import {BookingTransfer} from "./booking-transfer";

export class BookingTransferDetail {

  public id!: number;
  public bookingtranfer!: BookingTransfer;
  public pickuplocation!: string;
  public droplocation!: string;
  public paxtype!: string;
  public paxcount!: number;
  public totalamount!: number;
}
