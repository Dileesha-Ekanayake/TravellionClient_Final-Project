import {User} from "./user";
import {Supplier} from "./supplier";
import {TransferStatus} from "./transfer-status";
import {Currency} from "./currency";
import {TransferCancellationCharge} from "./transfer-cancellation-charge";
import {TransferDiscount} from "./transfer-discount";
import {TransferRates} from "./transfer-rates";
import {Transfer} from "./transfer";
import { TransferType } from "./transfer-type";

export class TransferContract {
  public id!: number;
  public user!: User;
  public supplier!: Supplier;
  public reference!: string;
  public validfrom!: string;
  public validto!: string;
  public salesfrom!: string;
  public salesto!: string;
  public markup!: number;
  public createdon!: string;
  public updatedon!: string;
  public transferstatus!: TransferStatus;
  public transfer!: Transfer;
  public currency!: Currency;
  public transfertype!: TransferType;
  public transfercancellationcharges!: Array<TransferCancellationCharge>;
  public transferdiscounts!: Array<TransferDiscount>;
  public transferrates!: Array<TransferRates>;
}
