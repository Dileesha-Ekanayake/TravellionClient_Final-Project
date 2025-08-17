import {Role} from "./role";
import {Operation} from "./operation";
import {Module} from "./module";

export class Privilege {
  public id!: number;
  public authority!: string;
  public role!: Role;
  public module!: Module;
  public operation!: Operation | null;

  constructor(authority: string, role: Role, module: Module, operation: Operation | null) {
    this.authority = authority;
    this.role = role;
    this.module = module;
    this.operation = operation !== undefined ? operation : null;
  }
}



