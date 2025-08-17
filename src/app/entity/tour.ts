import {User} from "./user";
import {TourAccommodation} from "./tour-accommodation";
import {TourTransferContact} from "./tour-transfer-contact";
import {TourGeneric} from "./tour-generic";
import {TourType} from "./tour-type";
import {TourCategory} from "./tour-category";
import {TourTheme} from "./tour-theme";
import {TourOccupancy} from "./tour-occupancy";

export class Tour {
  public id!: number;
  public user!: User;
  public name!: string;
  public reference!: string;
  public validfrom!: string;
  public validto!: string;
  public markup!: number;
  public maxpaxcount!: number;
  public salesfrom!: string;
  public salesto!: string;
  public createdon!: string;
  public updatedon!: string;
  public tourtype!: TourType;
  public tourcategory!: TourCategory;
  public tourtheme!: TourTheme;
  public touraccommodations!: Array<TourAccommodation>;
  public tourtransfercontracts!: Array<TourTransferContact>;
  public tourgenerics!: Array<TourGeneric>;
  public touroccupancies!: Array<TourOccupancy>;
}
