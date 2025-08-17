import {Module} from "./module";
import {Opetype} from "./opetype";

export class Operation {

  public id !: number;
  public displayName !: string;
  public operation !: string;
  public module!:Module;
}


