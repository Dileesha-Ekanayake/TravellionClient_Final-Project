import {Province} from "./province";

export class District {
  public id!: number;
  public code!: string;
  public name!: string;
  public province!: Province;
}
