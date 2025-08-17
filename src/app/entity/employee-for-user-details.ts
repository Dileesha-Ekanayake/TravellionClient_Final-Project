import {Gender} from "./gender";
import {Designation} from "./designation";
import {EmployeeStatus} from "./employee-status";
import {EmployeeType} from "./employee-type";
import {User} from "./user";

export class EmployeeForUserDetails{

  public number !: string;
  public fullname !: string;
  public callingname !: string;
  public photo !: string;
  public mobile !: string;
  public email !: string;
  public gender !: Gender;
  public designation !: Designation;
  public employeetype !: EmployeeType;
  public employeestatus !: EmployeeStatus;
  public dobirth !: string;
  public nic !: string;
  public address !: string;
  public land !: string;
  public createdon !: string;
  public description !: string;
  public users!: Array<User>;
}





