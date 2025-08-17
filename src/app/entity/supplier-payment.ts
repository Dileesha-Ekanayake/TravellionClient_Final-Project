import {Supplier} from "./supplier";
import {User} from "./user";
import {PaymentStatus} from "./payment-status";
import { SupplierPaymentItem } from "./supplier-payment-item";

export class SupplierPayment {

  public id!: number;
  public code!: string;
  public date!: string;
  public previousamount!: number;
  public paidamount!: number;
  public balance!: number;
  public createdon!: string;
  public updatedon!: string;
  public supplier!: Supplier;
  public user!: User;
  public paymentstatus!: PaymentStatus;
  public supplierpaymentitems!: Array<SupplierPaymentItem>;
}
