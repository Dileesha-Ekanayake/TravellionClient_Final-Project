import {RateType} from "./rate-type";
import {CancellationScheme} from "./cancellation-scheme";

export class AccommodationCancellationCharge {
  public id!: number;
  public amount!: number;
  public ratetype!: RateType;
  public cancellationscheme!: CancellationScheme;
}
