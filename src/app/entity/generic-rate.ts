import {PaxType} from "./pax-type";
import {ResidentType} from "./resident-type";

export class GenericRate {
  public id!: number;
  public amount!: number;
  public paxtype!: PaxType;
  public residenttype!: ResidentType;
}
