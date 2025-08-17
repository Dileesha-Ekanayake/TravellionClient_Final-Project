import {User} from "./user";
import {ResidentType} from "./resident-type";
import {CustomerContact} from "./customer-contact";
import {CustomerIdentity} from "./customer-identity";
import {Passenger} from "./passenger";
import {Gender} from "./gender";

export class Customer {

  public id!: number;
  public user!: User;
  public code!: string;
  public fullname!: string;
  public callingname!: string;
  public dobirth!: string;
  public gender!: Gender;
  public description!: string;
  public residenttype!: ResidentType;
  public createdon!: string;
  public updatedon!: string;
  public customerContacts!: Array<CustomerContact>;
  public customerIdentities!: Array<CustomerIdentity>;
  public passengers!: Array<Passenger>;
}
