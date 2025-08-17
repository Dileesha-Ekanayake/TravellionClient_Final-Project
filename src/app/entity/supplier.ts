import {User} from "./user";
import {SupplierType} from "./supplier-type";
import {SupplierStatus} from "./supplier-status";

export class Supplier {

  public id !: number;
  public user!: User;
  public brno!: string;
  public name !: string;
  public photo !: string;
  public mobile !: string;
  public land !: string;
  public email !: string;
  public address !: string;
  public city !: string;
  public state !: string;
  public country !: string;
  public zipcode !: string;
  public bankAccount !: string;
  public description !: string;
  public createdon !: string;
  public updatedon !: string;
  public suppliertype !: SupplierType;
  public supplierstatus !: SupplierStatus;

}
