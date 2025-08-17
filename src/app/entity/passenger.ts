import {Customer} from "./customer";
import {CustomerRelationship} from "./customer-relationship";
import {ResidentType} from "./resident-type";
import {PaxType} from "./pax-type";

export class Passenger {

  public id!: number;
  public code!: string;
  public name!: string;
  public age!: number;
  public customer!: Customer;
  public relationship!: CustomerRelationship;
  public residenttype!: ResidentType;
  public paxtype!: PaxType;

}
