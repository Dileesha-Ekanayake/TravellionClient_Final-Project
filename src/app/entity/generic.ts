import {User} from "./user";
import {GenericRate} from "./generic-rate";
import {GenericCancellationCharge} from "./generic-cancellation-charge";
import {GenericDiscount} from "./generic-discount";
import {GenericStatus} from "./generic-status";
import {GenericType} from "./generic-type";
import {Currency} from "./currency";
import {Supplier} from "./supplier";

export class Generic {
  public id!: number;
  public user!: User;
  public supplier!: Supplier;
  public name!: string;
  public reference!: string;
  public markup!: number;
  public validfrom!: string;
  public validto!: string;
  public salesfrom!: string;
  public salesto!: string;
  public createdon!: string;
  public updatedon!: string;
  public description!: string;
  public genericstatus!: GenericStatus;
  public generictype!: GenericType;
  public currency!: Currency;
  public genericrates!: Array<GenericRate>;
  public genericcancellationcharges!: Array<GenericCancellationCharge>;
  public genericdiscounts!: Array<GenericDiscount>;
}
