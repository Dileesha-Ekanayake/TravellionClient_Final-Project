import {PickupLocation} from "./pickup-location";
import {DropLocation} from "./drop-location";

export class Transfer {
  public id!: number;
  public isreturn!: boolean;
  public pickuplocations!: Array<PickupLocation>;
  public droplocations!: Array<DropLocation>;
}
