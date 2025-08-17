import {Privilege} from "./privilege";

export class SavedPrivilege {
  privileges: Array<Privilege>;

  constructor() {
    this.privileges = [];
  }
}
