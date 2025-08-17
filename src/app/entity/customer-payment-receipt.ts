import {CustomerPayment} from "./customer-payment";

export class CustomerPaymentReceipt {

  public id!: number;
  public receipt!: string;
  public customerpayment!: CustomerPayment;
}
