import {User} from "./user";
import {Supplier} from "./supplier";
import {AccommodationStatus} from "./accommodation-status";
import {ResidentType} from "./resident-type";
import {Currency} from "./currency";
import {AccommodationCancellationCharge} from "./accommodation-cancellation-charge";
import {AccommodationDiscount} from "./accommodation-discount";
import {AccommodationRoom} from "./accommodation-room";
import { AccommodationType } from "./accommodation-type";
import {StarRate} from "./star-rate";
import {AllLocation} from "./all-location";

export class Accommodation {

  public id!: number;
  public user!: User;
  public supplier!: Supplier;
  public name!: string;
  public location!: string;
  public reference!: string;
  public validfrom!: string;
  public validto!: string;
  public salesfrom!: string;
  public salesto!: string;
  public markup!: number;
  public createdon!: string;
  public updatedon!: string;
  public accommodationstatus!: AccommodationStatus;
  public residenttype!: ResidentType;
  public currency!: Currency;
  public accommodationtype!: AccommodationType;
  public starrating!: StarRate;
  public accommodationcncelationcharges!: Array<AccommodationCancellationCharge>;
  public accommodationdiscounts!: Array<AccommodationDiscount>;
  public accommodationrooms!: Array<AccommodationRoom>;
}
