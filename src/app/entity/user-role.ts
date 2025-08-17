import {Role} from "./role";
import {User} from "./user";

export class UserRole {

  public role !: Role;

  constructor(role:Role) {
    this.role=role;
  }

}


