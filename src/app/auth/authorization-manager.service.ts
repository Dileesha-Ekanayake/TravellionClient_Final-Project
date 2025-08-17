import {Injectable, OnDestroy} from '@angular/core';
import {jwtDecode} from "jwt-decode";
import {EmployeeForUserDetails} from "../entity/employee-for-user-details";
import {Router} from "@angular/router";
import {StorageLockService} from "./storage-lock.service";
import {DataService} from "../services/data.service";
import {ApiEndpoints} from "../services/api-endpoint";
import {User} from "../entity/user";
import {map} from "rxjs";
import {FormGroup} from "@angular/forms";
import {AvNotificationService} from "@avoraui/av-notifications";

/**
 * Service for managing user authorization, menu visibility, and session handling.
 *
 * This service provides functionality for enabling menus based on user roles,
 * fetching user data, managing local storage states for menu configurations,
 * token-based session validation, and auto-logout scheduling.
 *
 * It is intended to centralize all authorization-related functionalities in the application.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthorizationManagerService implements OnDestroy {

  public imageempurl!: string;
  private logoutTimeout: any;
  employee!: EmployeeForUserDetails;

  private readonly localStorageUserName = 'username';

  Admin = [
    {name: 'Employee', isVisible: false, routerLink: 'employee'},
    {name: 'User', isVisible: false, routerLink: 'user'},
    {name: 'Privilege', isVisible: false, routerLink: 'privilege'},
    // {name: 'Operation', isVisible: false, routerLink: 'operation'}
  ];

  Supplier = [
    {name: 'Supplier', isVisible: false, routerLink: 'supplier'},
  ];

  Configuration = [
    {name: 'Setup Details', isVisible: false, routerLink: 'setup details'},
  ];

  Contract = [
    {name: 'Accommodation', isVisible: false, routerLink: 'accommodation'},
    {name: 'Transfer', isVisible: false, routerLink: 'transfer'},
    {name: 'Generic', isVisible: false, routerLink: 'generic'},
    {name: 'Package', isVisible: false, routerLink: 'package'},
  ];

  Location = [
    {name: 'City', isVisible: false, routerLink: 'city'},
    {name: 'Location', isVisible: false, routerLink: 'location'},
  ];

  Bookings = [
    {name: 'Client', isVisible: false, routerLink: 'client'},
    {name: 'Booking', isVisible: false, routerLink: 'booking'},
  ];

  Payment = [
    {name: 'Client Payment', isVisible: false, routerLink: 'client payment'},
    {name: 'Supplier Payment', isVisible: false, routerLink: 'supplier payment'},
  ]

  /**
   * Retrieves a list of navigation items, each containing a menu name and its associated menu items.
   *
   * @return {Array<Object>} An array of objects where each object represents a navigation list item.
   * Each object contains a `Menu` property (name of the menu) and a `MenuItems` property
   * (associated menu items for the menu).
   */
  getNavListItem() {
    return [
      {Menu: 'Admin', MenuItems: this.Admin},
      {Menu: 'Supplier', MenuItems: this.Supplier},
      {Menu: 'Contract', MenuItems: this.Contract},
      {Menu: 'Configuration', MenuItems: this.Configuration},
      {Menu: 'Location', MenuItems: this.Location},
      {Menu: 'Bookings', MenuItems: this.Bookings},
      {Menu: 'Payment', MenuItems: this.Payment},
    ]
  }

  constructor(
    private dataService: DataService,
    private router: Router,
    private avNotificationService: AvNotificationService,
    private storageLockService: StorageLockService,
  ) {
  }

  /**
   * Enables or disables the visibility of menu items based on the provided module operations.
   *
   * @param {Array<{module: string, operation: string}>} modules - An array of module objects containing a module name and its associated operation.
   * @return {void} This method does not return any value.
   */
  enableMenus(modules: { module: string; operation: string }[]): void {

    const menus = this.getNavListItem();

    menus.forEach(menuGroup => {
      menuGroup.MenuItems.forEach(menuItem => {
        menuItem.isVisible = modules.some(module => module.module.toLowerCase() === menuItem.name.toLowerCase());
      });
    });

    menus.forEach(menuGroup => {
      localStorage.setItem(`${menuGroup.Menu.toLowerCase().trim()+ "Menus"}`, JSON.stringify(menuGroup));
    });

  }

  /**
   * Retrieves and processes authentication details for a given username.
   *
   * @param {string} username - The username for which the authentication data is to be retrieved.
   * @return {void} This method does not return any value.
   */
  getAuth(username: string): void {
    this.setUsername(username);
    this.getEmployeeDataByUserName(username);
    try {
      const authoritiesArray = this.getAuthorities();

      if (authoritiesArray !== undefined && Array.isArray(authoritiesArray)) {
        const authorities = this.extractAuthorities(authoritiesArray);
        this.enableMenus(authorities);
      } else {
        console.log('Authorities are undefined or not an array');
      }

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Extracts and transforms an array of authority strings into an array of objects
   * containing the module and operation segments.
   *
   * @param {string[]} authoritiesArray - An array of strings where each string represents
   *                                       an authority in the format of "module-operation".
   * @return {{ module: string, operation: string }[]} An array of objects where each object
   *                                                   contains the `module` and `operation`
   *                                                   extracted from the input strings.
   */
  extractAuthorities(authoritiesArray: string[]): { module: string; operation: string }[] {
    return authoritiesArray.map(authority => {
      const [module, operation] = authority.split('-');
      return {module, operation};
    });
  }

  /**
   * Fetches employee data by the provided username.
   *
   * @param {string} userName - The username of the employee for whom the data is to be retrieved.
   * @return {void} This method does not return a value but sets the employee data internally.
   */
  getEmployeeDataByUserName(userName: string): void {
    if (userName !== "") {
      const x = this.dataService.getDataObject<EmployeeForUserDetails>(ApiEndpoints.paths.employeeByUsername, userName).subscribe({
        next: data => {
          if (data !== null && data !== undefined){
            this.employee = data;
          } else {
            this.employee = new EmployeeForUserDetails();
            return;
          }
          this.setEmployee(this.employee);
        },
        error: (err) => {
          console.error("Error fetching Employee data : " + JSON.stringify(err));
        },
        complete: () => {
          x.unsubscribe();
        }
      })
    }
  }

  /**
   * Retrieves the decrypted username stored in the local storage.
   *
   * @return {string} The decrypted username.
   */
  getUsername(): string {
    // @ts-ignore
    return this.storageLockService.decrypt(localStorage.getItem(this.localStorageUserName) || '');
  }

  /**
   * Sets the username by encrypting the provided value and storing it in local storage.
   *
   * @param {string} value - The username to be stored.
   * @return {void}
   */
  setUsername(value: string): void {
    // @ts-ignore
    localStorage.setItem(this.localStorageUserName, this.storageLockService.encrypt(value));
  }

  /**
   * Stores the provided employee object in the local storage.
   *
   * @param {any} employee - The employee data to be saved in the local storage.
   * @return {void} No return value.
   */
  setEmployee(employee: any): void {
    // @ts-ignore
    localStorage.setItem('employee', JSON.stringify(employee));
  }

  /**
   * Sets the user profile by retrieving the employee data from local storage,
   * parsing it, and extracting the photo information to update the user profile image.
   * If valid data cannot be retrieved or processed, a default image is used.
   *
   * @return {string} The URL or name of the user profile image, defaulting to 'Admin.png' if no valid image is available.
   */
  setUserProfile(): string {
    //@ts-ignore
    const employee = localStorage.getItem('employee');

    // Check if an employee exists AND isn't the string "undefined" or "null"
    if (employee && employee !== "undefined" && employee !== "null") {
      try {
        const emp = JSON.parse(employee);

        if (emp && emp.photo) {
          try {
            this.imageempurl = atob(emp.photo);
          } catch (error) {
            console.error("Error decoding photo:", error);
            this.imageempurl = 'Admin.png';
          }
        } else {
          this.imageempurl = 'Admin.png';
        }
      } catch (error) {
        console.error("Error parsing employee data:", error);
        this.imageempurl = 'Admin.png';
      }
    } else {
      this.imageempurl = 'Admin.png';
    }

    return this.imageempurl;
  }

  /**
   * Retrieves the authorities from the JSON Web Token (JWT) stored in the application's token storage.
   * The authorities are extracted from the audience (`aud`) claim within the decoded JWT payload.
   * If the token is invalid or the audience claim is not present, it returns null.
   *
   * @return {(string[] | null)} The list of authorities (audience claims) from the decoded token, or null if not available.
   */
  getAuthorities() {
    // const authHeader = localStorage.getItem('Authorization');
    const authHeader = this.getToken();
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decodedToken: { aud?: string[] } = jwtDecode(token);
          return decodedToken.aud || null;
        } catch (error) {
          console.error("Invalid token:", error);
        }
      }
    }
    return null;
  }

  /**
   * Initializes the menu state by fetching the navigation list items,
   * and setting their state from localStorage if a corresponding entry exists.
   * Menu states are stored in localStorage with keys that combine
   * a prefixed string with the menu name.
   *
   * @return {void} Does not return a value.
   */
  initializeMenuState(): void {

    const menus = this.getNavListItem();

    menus.forEach(menuState => {
      // @ts-ignore
      const localStorageState = localStorage.getItem(`${menuState.Menu.toLowerCase().trim()+ "Menus"}`);
      if (localStorageState) {
        menuState.Menu = JSON.parse(localStorageState);
      }
    });
  }

  /**
   * Removes the stored username from the local storage.
   *
   * @return {void} Does not return any value.
   */
  clearUsername(): void {
    // @ts-ignore
    localStorage.removeItem(this.localStorageUserName);
  }

  /**
   * Clears the state of the menu by removing relevant items from localStorage.
   *
   * @return {void} No return value.
   */
  clearMenuState(): void {
    const menus = this.getNavListItem();
    menus.forEach(menu => {
      localStorage.removeItem(`${menu.Menu.toLowerCase().trim()+ "Menus"}`);
    });
  }

  /**
   * Retrieves the authentication token stored in local storage.
   *
   * @return {string | null} The authentication token if available, otherwise null.
   */
  getToken(): string | null {
    // @ts-ignore
    return localStorage.getItem('authToken');
  }

  /**
   * Logs the current user out by navigating to the login page, clearing stored username and menu state,
   * and removing authentication-related data from local storage.
   *
   * @return {void} This method does not return a value.
   */
  logout() {
    this.router.navigateByUrl("login");
    this.clearUsername();
    this.clearMenuState();
    // @ts-ignore
    localStorage.removeItem("authToken");
    // @ts-ignore
    localStorage.removeItem("employee");
    // @ts-ignore
    localStorage.removeItem("selectedMenu");
  }

  /**
   * Schedules an automatic logout based on the expiration time of the decoded JWT token.
   * If the token is valid and contains an expiration time, a timeout is set to trigger a logout action when the token expires.
   * If the token is invalid or has already expired, an immediate logout is triggered.
   *
   * @return {void} This method does not return any value.
   */
  scheduleAutoLogout() {
    try {
      const token = this.getToken() || '';
      const jwtToken = token.split(' ')[1];
      const decodedToken: { exp?: number } = jwtDecode(jwtToken);
      if (decodedToken.exp) {
        const expiresIn = decodedToken.exp * 1000 - Date.now();

        if (expiresIn > 0) {
          this.logoutTimeout = setTimeout(() => {
            this.logout();
          }, expiresIn);
        } else {
          this.logout();
        }
      }
    } catch (error) {
      console.error("Invalid token:", error);
      this.logout();
    }
  }

  /**
   * Checks if the user is authenticated by validating the token.
   * The method verifies the presence and validity of a token,
   * ensures the token hasn't expired, and logs the user out if
   * the token is invalid or missing.
   *
   * @return {boolean} Returns `true` if the user is authenticated; otherwise, `false`.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return false;
    }

    try {
      const jwtToken = token.split(' ')[1];
      const decodedToken: { exp?: number } = jwtDecode(jwtToken);

      if (!decodedToken.exp || decodedToken.exp * 1000 < Date.now()) {
        this.avNotificationService.showWarning('Your session has expired. Please log in again to continue using the app', {
          theme: 'light',
        });
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  /**
   * Determines whether the user has the authority to perform a specified operation within a given module.
   *
   * @param {string} moduleName - Name of the module to check authorization for.
   * @param {string} operationName - Name of the operation to check authorization for.
   * @return {boolean} Returns true if the user has the required authority, otherwise false.
   */
  hasOperationAuthority(moduleName: string, operationName: string) : boolean{
    const authoritiesArray = this.getAuthorities();
    if (authoritiesArray !== undefined && Array.isArray(authoritiesArray)) {
      const authorities = this.extractAuthorities(authoritiesArray);
      return authorities.some(authority => authority.module === moduleName && authority.operation === operationName)
    }
    return false;
  }

  /**
   * Retrieves the logged-in user's details and updates the specified form control.
   * The method fetches a list of active users from the data service, checks if the logged-in user matches any user,
   * and updates the form control with the user details if found. If no user is found, leaves the form control enabled for input.
   *
   * @param {FormGroup} formGroup - The form group containing the control to be updated.
   * @param {string} formControlName - The name of the form control to update or modify.
   * @return {void}
   */

  getLogInUser(formGroup: FormGroup, formControlName: string): void {
    const savedUserName = this.getUsername().toLowerCase();

    this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).pipe(
      map(users => {
        const loggedUser = users.find(user => user.username.toLowerCase() === savedUserName);
        return loggedUser || new User();
      })
    ).subscribe(loggedUser => {
      const control = formGroup.controls[formControlName];

      if (control) {
        if (loggedUser.username) {
          control.patchValue(loggedUser);
          control.disable(); // Disable if user is found
        } else {
          control.enable(); // Enable if no user found (allow input)
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.imageempurl = 'Admin.png';
  }

}
