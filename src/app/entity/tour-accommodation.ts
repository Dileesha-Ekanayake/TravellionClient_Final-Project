import { Accommodation } from "./accommodation";
import {TourAccommodationRoom} from "./tour-accommodation-room";

export class TourAccommodation {

  public id!: number;
  public day!: number;
  public accommodation!: Accommodation;
  public touraccommodationrooms!: Array<TourAccommodationRoom>;
}
