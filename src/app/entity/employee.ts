import {Gender} from "./gender";
import {Designation} from "./designation";
import {EmployeeStatus} from "./employee-status";
import {EmployeeType} from "./employee-type";

export class Employee{

  public id !: number;
  public number !: string;
  public fullname !: string;
  public callingname !: string;
  public photo !: string;
  public dobirth !: string;
  public nic !: string;
  public address !: string;
  public mobile !: string;
  public land !: string;
  public email !: string;
  public createdon !: string;
  public description !: string;
  public gender !: Gender;
  public designation !: Designation;
  public employeetype !: EmployeeType;
  public employeestatus !: EmployeeStatus;
}





