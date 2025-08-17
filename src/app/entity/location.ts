import {User} from "./user";
import {City} from "./city";

export class Location {
  public id!: number;
  public user!: User;
  public code!: string;
  public name!: string;
  public photo!: string;
  public description!: string;
  public createdon!: string;
  public updatedon!: string;
  public city!: City;
}
