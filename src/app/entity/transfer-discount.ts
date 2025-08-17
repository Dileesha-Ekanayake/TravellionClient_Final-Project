import {TransferDiscountType} from "./transfer-discount-type";
import {RateType} from "./rate-type";

export class TransferDiscount {
  public id!: number;
  public amount!: number;
  public transferdiscounttype!: TransferDiscountType;
  public ratetype!: RateType;
}
