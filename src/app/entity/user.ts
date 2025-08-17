import {UserStatus} from "./user-status";
import {UserRole} from "./user-role";
import {UserType} from "./user-type";
import {Employee} from "./employee";

export class User {

  public id !: number;
  public employee!: Employee;
  public username!: string;
  public password!: string;
  public createdon!: string;
  public updatedon!: string;
  public desciption!: string;
  public accountLocked!: boolean;
  public userstatus!: UserStatus;
  public usertype!: UserType;
  public userroles!: Array<UserRole>;
  public confirmpassword !: string;

  constructor() {
  }

}





