import {RateType} from "./rate-type";
import {GenericDiscountType} from "./generic-discount-type";

export class GenericDiscount {
  public id!: number;
  public amount!: number;
  public ratetype!: RateType;
  public genericdiscounttype!: GenericDiscountType;
}
