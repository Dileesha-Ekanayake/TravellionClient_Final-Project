import {Booking} from "./booking";
import {Customer} from "./customer";
import {CustomerPaymentType} from "./customer-payment-type";
import {User} from "./user";
import {CustomerPaymentInformation} from "./customer-payment-information";
import {CustomerPaymentReceipt} from "./customer-payment-receipt";

export class CustomerPayment {

  public id!: number;
  public user!: User;
  public code!: string;
  public date!: string;
  public booking!: Booking;
  public customer!: Customer;
  public previousamount!: number;
  public paidamount!: number;
  public balance!: number;
  public paymenttype!: CustomerPaymentType;
  public customerpaymentinformations!: Array<CustomerPaymentInformation>;
  public customerpaymentreceipts!: Array<CustomerPaymentReceipt>;
}
