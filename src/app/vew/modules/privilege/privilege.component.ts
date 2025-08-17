import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelActionRow,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatButton} from "@angular/material/button";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from "@angular/material/table";
import {Subscription} from "rxjs";
import {Module} from "../../../entity/module";
import {Role} from "../../../entity/role";
import {Operation} from "../../../entity/operation";
import {Privilege} from "../../../entity/privilege";
import {MatIcon} from "@angular/material/icon";
import {MatSuffix} from "@angular/material/form-field";
import {SavedPrivilege} from "../../../entity/saved-privilege";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";

export type PrivilegeMap = Record<number, Record<number, Set<number>>>;

@Component({
  selector: 'app-privilege',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatAccordion,
    MatSlideToggle,
    MatExpansionPanelActionRow,
    MatButton,
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIcon,
    MatSuffix
  ],
  templateUrl: './privilege.component.html',
  styleUrl: './privilege.component.css'
})

export class PrivilegeComponent implements OnInit, OnDestroy {

  breadcrumb: any;
  roles: Role[] = [];
  modules: Module[] = [];
  operations: Operation[] = [];
  privileges: Privilege[] = [];
  displayedColumns: string[] = ['actions'];

  originalPrivileges: Privilege[] = [];

  selectedRoles: Role[] = [];
  selectedPanel: number | null = null;

  private subscription: Subscription = new Subscription();

  iconList: any = {
    'employee': 'person',
    'user': 'supervisor_account',
    'operation': 'vpn_key',
    'privilege': 'lock',
    'supplier': 'domain',
    'setup details': 'table_chart',
    'accommodation': 'hotel',
    'city': 'location_city',
    'location': 'location_on',
    'transfer': 'commute',
    'generic': 'map',
    'client': 'person',
    'package': 'card_travel',
    'booking': 'event',
    'client payment': 'account_balance_wallet',
    'supplier payment': 'receipt_long',
  };

  constructor(
    private breadcrumbService: BreadcrumbService,
    private dataService: DataService,
    private operationFeedBackService: OperationFeedbackService,
  ) {
  }

  ngOnInit(): void {
    this.initialize();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initialize(): void {
    this.loadInitialData();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
  }

  /**
   * Loads initial data required for the component, including roles, modules, operations,
   * and privileges. The method manages data subscriptions using `this.subscription`
   * and fetches data from the respective API endpoints.
   *
   * @return {void} This method does not return any value.
   */
  private loadInitialData(): void {

    this.subscription.add(
      this.dataService.getData<Role>(ApiEndpoints.paths.roles).subscribe({
        next: (roles) => {
          this.roles = roles;
          this.displayedColumns = ['actions', ...roles.map(role => role.id.toString())];
        },
        error: (err) => console.error("Error fetching roles:", err)
      })
    );

    this.subscription.add(
      this.dataService.getData<Module>(ApiEndpoints.paths.modules).subscribe({
        next: (modules) => {
          this.modules = modules;
        },
        error: (err) => console.error("Error fetching modules:", err)
      })
    );

    this.subscription.add(
      this.dataService.getData<Operation>(ApiEndpoints.paths.operations).subscribe({
        next: (operations) => {
          this.operations = operations;
        },
        error: (err) => console.error("Error fetching operations:", err)
      })
    );

    this.subscription.add(
      this.dataService.getData<Privilege>(ApiEndpoints.paths.privileges).subscribe({
        next: (privileges) => {
          this.privileges = privileges;
          this.originalPrivileges = [...this.privileges];
        },
        error: (err) => console.error("Error fetching privileges:", err)
      })
    );
  }

  /**
   * Retrieves a list of operations associated with the specified module.
   *
   * @param {Module} module - The module for which to retrieve operations.
   * @return {Operation[]} An array of operations linked to the given module.
   */
  getOperationsForModule(module: Module): Operation[] {
    return this.operations.filter(op => op.module.id === module.id);
  }

  /**
   * Checks if the given role has the required privileges for a specific operation on a module.
   *
   * @param {Module} module - The module for which the privilege is being checked.
   * @param {Operation} operation - The operation to check privileges for.
   * @param {Role} role - The role whose privileges are being verified.
   * @return {boolean} True if the role has the required privileges, otherwise false.
   */
  checkPrivilege(module: Module, operation: Operation, role: Role): boolean {
    const authority = `${module.name.toLowerCase()}-${operation.operation.toLowerCase()}`;
    return this.privileges.some(p =>
      p.role.id === role.id &&
      p.module.id === module.id &&
      p.operation?.id === operation.id &&
      p.authority === authority
    );
  }

  /**
   * Updates the privilege for a specific role, module, and operation based on the checked flag.
   *
   * @param {Module} module - The module for which the privilege is being updated.
   * @param {Operation} operation - The operation associated with the module for which the privilege is being updated.
   * @param {Role} role - The role for which the privilege is being updated.
   * @param {boolean} checked - A flag indicating whether the privilege should be added (true) or removed (false).
   * @return {void}
   */
  updatePrivilege(module: Module, operation: Operation, role: Role, checked: boolean): void {
    const authority = `${module.name}-${operation.operation}`;

    if (checked) {
      // Add new privilege if it doesn't exist
      if (!this.checkPrivilege(module, operation, role)) {
        const newPrivilege = new Privilege(authority, role, module, operation);
        this.privileges.push(newPrivilege);
      }
    } else {
      // Remove privilege if it exists
      this.privileges = this.privileges.filter(p =>
        !(p.role.id === role.id &&
          p.module.id === module.id &&
          p.operation?.id === operation.id)
      );
    }
  }

  /**
   * Adds the provided role to the selectedRoles array if it does not already exist.
   *
   * @param {Role} role - The role object to be checked and potentially added to the selectedRoles array.
   * @return {void} Does not return a value.
   */
  getSelectedRoles(role: Role): void {
    const roleExists = this.selectedRoles.some(selectedRole => selectedRole.id === role.id);
    if (!roleExists) {
      this.selectedRoles.push(role);
    }
  }

  /**
   * Saves the module permissions by detecting changes in privileges and updating them accordingly.
   * If no changes are detected, a feedback message is shown to indicate there is nothing to modify.
   * Prompts for confirmation before saving the updated privileges.
   * Updates the data and UI state upon successful save operation.
   *
   * @param {Module} module The module for which permissions are being saved. It includes details like ID and name.
   * @return {void} This method does not return any value.
   */
  saveModulePermissions(module: Module): void {

    const currentModuleId = module.id;
    const originalPrivilegeMap = this.buildPrivilegeMap(this.originalPrivileges);
    const currentPrivilegeMap = this.buildPrivilegeMap(this.privileges);

    const hasPrivilegeChanges = this.hasChanges(originalPrivilegeMap, currentPrivilegeMap);


    if (!hasPrivilegeChanges) {
      this.operationFeedBackService.showMessage("Modify Privileges", "Nothing to modify...!")
      return;
    }

    const savedPrivileges: SavedPrivilege = new SavedPrivilege();
    const filteredPrivileges = this.privileges
      .filter(p => p.module.id === module.id)
      .map(privilege => {
        return new Privilege(
          `${module.name.toLowerCase()}-${privilege.operation?.operation.toLowerCase()}`,
          privilege.role, // Use the existing role from privileges
          module,
          privilege.operation
        );
      });

    savedPrivileges.privileges = filteredPrivileges.length > 0
      ? filteredPrivileges
      : this.selectedRoles.map(role => new Privilege("", role, module, null));

    this.operationFeedBackService.showConfirmation("Privileges", "modify", module.name + " Management")
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<Privilege>(ApiEndpoints.paths.privileges, savedPrivileges.privileges).subscribe({
            next: (response) => {
              const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);
              if (status) {
                this.loadInitialData();
                // Set the panel state after a brief delay to ensure data is loaded
                setTimeout(() => {
                  this.selectedPanel = currentModuleId;
                }, 100);
                this.operationFeedBackService.showStatus("Privilege", "Save", responseMessage);
              }
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
              this.operationFeedBackService.showErrors("Privilege", "Save", responseMessage);
            }
          })
        })
      })
  }

  /**
   * Compares two PrivilegeMap objects, `original` and `current`, to determine if there are any differences
   * in their structure or values.
   *
   * @param {PrivilegeMap} original - The reference PrivilegeMap object to compare against.
   * @param {PrivilegeMap} current - The PrivilegeMap object to compare with the original.
   * @return {boolean} Returns true if there are any changes between the original and current PrivilegeMap objects; otherwise, false.
   */
  hasChanges(original: PrivilegeMap, current: PrivilegeMap): boolean {

    const originalModules = Object.keys(original).map(Number);
    const currentModules = Object.keys(current).map(Number);

    if (originalModules.length !== currentModules.length) {
      return true;
    }else {

    for (const moduleId of originalModules) {
      if (!(moduleId in current)) return true;

      const originalRoles = Object.keys(original[moduleId]).map(Number);
      const currentRoles = Object.keys(current[moduleId]).map(Number);

      if (originalRoles.length !== currentRoles.length) return true;

      for (const roleId of originalRoles) {
        if (!(roleId in current[moduleId])) return true;

        const originalOperations = [...original[moduleId][roleId]];
        const currentOperations = [...current[moduleId][roleId]];

        if (originalOperations.length !== currentOperations.length) return true;

        if (!originalOperations.every((op) => currentOperations.includes(op))) {
          return true;
        }
      }
    }
    }
    return false;
  }

  /**
   * Constructs a privilege map from an array of privileges.
   * Each privilege is organized by module and role, associating operations with roles within modules.
   *
   * @param {Privilege[]} privileges - An array of privilege objects containing module, role, and operation information.
   * @return {PrivilegeMap} A map where module IDs are keys, and values are objects mapping role IDs to sets of operation IDs.
   */
  buildPrivilegeMap(privileges: Privilege[]): PrivilegeMap {
    const privilegeMap: PrivilegeMap = {};

    privileges.forEach(({module, role, operation}) => {
      if (!privilegeMap[module.id]) {
        privilegeMap[module.id] = {};
      }

      if (!privilegeMap[module.id][role.id]) {
        privilegeMap[module.id][role.id] = new Set();
      }
      privilegeMap[module.id][role.id].add(operation?.id ? operation.id : 0);
    });

    return privilegeMap;
  }
}
