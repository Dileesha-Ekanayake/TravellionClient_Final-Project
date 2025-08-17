import {District} from "./district";
import {Airport} from "./airport";
import {Port} from "./port";
import {User} from "./user";

export class City {
  public id!: number;
  public user!: User;
  public name!: string;
  public photo!: string;
  public code!: string;
  public createdon!: string;
  public updatedon!: string;
  public district!: District;
  public airports!: Array<Airport>;
  public ports!: Array<Port>;
}
