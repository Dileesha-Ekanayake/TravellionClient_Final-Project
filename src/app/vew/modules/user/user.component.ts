import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {User} from "../../../entity/user";
import {Employee} from "../../../entity/employee";
import {UserRole} from "../../../entity/user-role";
import {Role} from "../../../entity/role";
import {UserStatus} from "../../../entity/user-status";
import {UserType} from "../../../entity/user-type";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {Observable, Subscription} from "rxjs";
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {Designation} from "../../../entity/designation";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {UserActiveDeactive} from "../../../entity/user-active-deactive";
import {EmployeeForUserDetails} from "../../../entity/employee-for-user-details";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AvDualListBox} from "@avoraui/av-dual-list-box";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIconButton,
    MatIcon,
    MatDatepickerToggle,
    FormsModule,
    MatSuffix,
    ReactiveFormsModule,
    MatButton,
    MatCell,
    MatCellDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatColumnDef,
    NgClass,
    MatHeaderCellDef,
    DetailViewComponent,
    MatDateRangeInput,
    MatDateRangePicker,
    MatEndDate,
    MatPrefix,
    MatStartDate,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatNoDataRow,
    MatError,
    MatSlideToggle,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvDualListBox,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})

export class UserComponent implements OnInit, OnDestroy {

  columns: string[] = ['photo', 'username', 'usertype', 'userstatus', 'userroles', 'accountLocked', 'modify/view'];
  headers: string[] = ['Photo', 'User Name', 'User Type', 'User Status', 'User Roles', 'DeActive/Active', 'Modify / View'];

  columnsDetails: string[] = ['username', 'usertype', 'userstatus'];
  headersDetails: string[] = ['User Name', 'User Type', 'User Status'];

  statusColors = [
    {value: "Active", color: {background: "#dcfce7", text: "#12512b"}},
    {value: "Deactivated", color: {background: "#fcdcdc", text: "#601515"}},
    {value: "Privileged", color: {background: "#fef9c3", text: "#683c0b"}}
  ];

  employeeStatusColors = [
    {value: "Assigned", color: {background: "#dcfce7", text: "#12512b"}},
    {value: "Unassigned", color: {background: "#fcdcdc", text: "#601515"}},
    {value: "Admin", color: {background: "#fef9c3", text: "#683c0b"}}
  ];

  public serverSearchForm!: FormGroup;
  public userForm!: FormGroup;
  isLinear = false;
  blinkButton: boolean = false;
  loggedEmployee!: any;
  user!: User;
  oldUser!: User;
  pdfDtls: boolean = true;

  selectedRow: any;
  @ViewChild('stepper') stepper!: MatStepper;

  role: string = 'role';
  breadcrumb: any;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  data !: MatTableDataSource<User>;

  defaultImageURL: string = 'default.png';
  imageURL: string = '';

  pwdHide = true;
  pwdConfHide = true;
  temPass: boolean = false;

  enableAdd: boolean = false;
  enableUpdate: boolean = false;
  enableDelete: boolean = false;
  enableEdit: boolean = false;
  enableGoToRecode: boolean = true;
  enableGoToView: boolean = true;

  hasInsertAuthority: boolean = false;
  hasUpdateAuthority: boolean = false;
  hasDeleteAuthority: boolean = false;
  disableSelfModify: boolean = false;
  hasProfileLockAuthority: boolean = false;

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  employees: Array<Employee> = [];
  filteredEmployeeList!: Observable<Array<Employee>>;
  users: Array<User> = [];
  roles: Array<Role> = [];
  userStatuses: Array<UserStatus> = [];
  userTypes: Array<UserType> = [];

  employeeForUserDetails!: EmployeeForUserDetails;

  dataSubscriber$: Subscription = new Subscription();

  searchQuery!: URLSearchParams;

  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private dataService: DataService,
    public authService: AuthorizationManagerService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
  ) {

    this.userForm = this.formBuilder.group({
      employee: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmpassword: new FormControl('', [Validators.required]),
      userstatus: new FormControl('', [Validators.required]),
      usertype: new FormControl('', [Validators.required]),
      descrption: new FormControl('', Validators.required),
      userroles: new FormControl('', [Validators.required])
    });

    this.serverSearchForm = this.formBuilder.group({
      searchInput: new FormControl(),
      searchSelect: new FormControl(),
      filterField: new FormControl(),
      searchStartDate: new FormControl(),
      searchEndDate: new FormControl()
    });
  }

  ngOnInit(): void {
    this.initialize();
  }

  /**
   * Initializes the component by loading necessary data, setting up form validation,
   * and preparing the component state.
   *
   * @return {void} Does not return a value.
   */
  initialize(): void {

    this.loadLoggedEmployee();
    this.loadRoles();
    this.loadUserFilterFields();
    this.createView();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.dataSubscriber$.add(
      this.dataService.getData<UserStatus>(ApiEndpoints.paths.employeeStatuses).subscribe({
        next: (userStatuses) => {
          this.userStatuses = userStatuses;
        },
        error: (err) => {
          console.error('Error fetching userStatuses : ' + err);
        },
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<UserType>(ApiEndpoints.paths.userTypes).subscribe({
        next: (userTypes) => {
          this.userTypes = userTypes;
        },
        error: (err) => {
          console.error('Error fetching userTypes : ' + err);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Employee>(ApiEndpoints.paths.employeeList).subscribe({
        next: (employees) => {
          this.employees = employees;
          this.filteredEmployeeList = this.autoCompleteDataFilterService.filterData<Employee>(this.employees, this.userForm, 'employee', ['callingname']);
        },
        error: (err) => {
          console.error('Error fetching employees : ' + err);
        }
      })
    )

    this.formValidationService.createForm(this.userForm, this.oldUser, this.user, 'user', [], ['description']);
    this.enableButtons(true, false, false);

    this.buttonStates();

    ['password', 'confirmpassword'].forEach(field => {
      const control = this.userForm.get(field);
      if (control) {
        control.valueChanges.subscribe(() => this.verifyPassword());
      }
    });

    ['password', 'confirmpassword'].forEach(field => {
      const control = this.userForm.get(field);
      if (control) {
        control.valueChanges.subscribe(value => {
          if (value === '') {
            this.temPass = false;
          }
        });
      }
    });
  }

  /**
   * Retrieves and returns the 'callingname' property value of a given employee object.
   * The function utilizes the autoCompleteDataFilterService to extract the specified field.
   *
   * @param {any} employee - The employee object from which the 'callingname' property will be retrieved.
   * @returns {string} The 'callingname' value of the employee.
   */
  displayCallingName = (employee: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Employee>(employee, ['callingname']);
  }

  /**
   * Initializes and sets up the view by configuring default settings
   * such as image URLs, enabling views, and initializing the table.
   *
   * @return {void} Does not return a value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.loadTable("");
  }

  /**
   * Loads the roles from the data service and assigns them to the `roles` property.
   * Subscribes to the data service to fetch roles data and handles the response or any errors.
   *
   * @return {void} No return value.
   */
  loadRoles(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Role>(ApiEndpoints.paths.roles).subscribe({
        next: (roles) => {
          this.roles = roles;
        },
        error: (err) => {
          console.error('Error fetching roles : ' + err);
        }
      })
    )
  }

  /**
   * Enables or disables buttons for add, update, and delete functionalities.
   *
   * @param {boolean} add - Indicates whether the "Add" button should be enabled.
   * @param {boolean} upd - Indicates whether the "Update" button should be enabled.
   * @param {boolean} del - Indicates whether the "Delete" button should be enabled.
   * @return {void} This method does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of button-related properties based on the user's operation authority.
   * Determines the user's ability to perform actions such as insert, update, delete, and lock on the 'user' entity.
   *
   * @return {void} This method does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('user', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('user', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('user', 'delete');
    this.hasProfileLockAuthority = this.authService.hasOperationAuthority('user', 'lock');
  }

  /**
   * Loads data into the table and updates related properties.
   * The method fetches user data from the API based on the given query
   * and initializes the table data source with pagination.
   *
   * @param {string} query - The query string to filter or fetch specific user data from the API.
   * @return {void} This method does not return any value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.users, query).subscribe({
        next: (users) => {
          this.users = users;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error('Error fetching users : ' + err);
          this.imageURL = 'rejected.png';
        },
        complete: () => {
          this.data = new MatTableDataSource(this.users);
          this.data.paginator = this.paginator;
        }
      })
    )
  }

  /**
   * Loads and sets the user filter fields by extracting the keys from a User object
   * and excluding specific fields such as 'id', 'password', and 'confirmpassword'.
   * The remaining keys are then formatted using the formatField method.
   *
   * @return {void} This method does not return a value.
   */
  loadUserFilterFields(): void {
    const user = new User();
    this.filterFields = Object.keys(user)
      .filter(value => !['id', 'password', 'confirmpassword'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string by capitalizing the first letter of each word.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Updates the search select, input, and date field states based on the selected filter field value.
   * It determines the type of field (select, input, or date) to display in the search form.
   * Additionally, it populates `searchSelectOptions` if the selected field is applicable.
   *
   * @return {void} This method does not return any value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectedFields = ['employee', 'userstatus', 'usertype', 'userroles'];
    const dateFields = ['createdon', 'updatedon'];

    this.isSearchFiledSelect = selectedFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionMap: Record<string, any> = {
      employee: this.employees,
      userroles: this.roles,
      userstatus: this.userStatuses,
      usertype: this.userTypes
    };

    this.searchSelectOptions = optionMap[selectedValue];
  }

  /**
   * Filters the data table based on user input from an event.
   * Compares the input to various fields of the `User` object to determine matches.
   *
   * @param {Event} event - The event triggered by the user input, typically an `input` or `change` event. The target of the event is expected to be an HTMLInputElement.
   * @return {void} - This method does not return any value; it updates the filter of the existing data table.
   */
  filterTable(event: Event): void {
    // @ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (user: User, filter: string) => {
      return (
        filterValue == null ||
        user.username.toLowerCase().includes(filterValue) ||
        user.usertype.name.toLowerCase().includes(filterValue) ||
        user.userstatus.name.toLowerCase().includes(filterValue) ||
        user.employee.callingname.toLowerCase().includes(filterValue) ||
        user.createdon.includes(filterValue) ||
        user.updatedon.includes(filterValue) ||
        user.userroles.some(userRole => userRole.role.name.toLowerCase().includes(filterValue)));
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a row by assigning the provided User object to the selectedRow property.
   *
   * @param {User} element - The User object representing the row to be selected.
   * @return {void} Does not return any value.
   */
  selectRow(element: User): void {
    this.selectedRow = element;
  }

  /**
   * Resets the search query by initializing a new instance of URLSearchParams.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search operation based on the form input values.
   * It processes the filter field, search input, selection, and date range,
   * then constructs a query string to fetch or filter data appropriately.
   * Displays a feedback message if mandatory fields are not provided.
   *
   * @return {void} This method does not return a value.
   */
  search(): void {
    const formValues = this.serverSearchForm.value;

    const {searchInput, searchSelect, filterField, searchStartDate, searchEndDate} = formValues;

    if (!filterField) {
      this.operationFeedbackService.showMessage('Search', 'No search values...!');
      return;
    }
    let searchField = filterField.toLowerCase();
    this.resetSearchQuery();

    let startDate = searchStartDate ? this.datePipe.transform(new Date(searchStartDate), 'yyyy-MM-dd') : null;
    let endDate = searchEndDate ? this.datePipe.transform(new Date(searchEndDate), 'yyyy-MM-dd') : null;

    if (startDate && endDate) {
      if (startDate === endDate || (!startDate || !endDate)) {
        this.searchQuery.append(searchField, startDate);
      } else {
        this.searchQuery.append(`${searchField}-startDate`, startDate);
        this.searchQuery.append(`${searchField}-endDate`, endDate);
      }
    }
    if (searchInput) {
      this.searchQuery.append(searchField, searchInput);
    } else if (searchSelect) {
      this.searchQuery.append(`${searchField}id`, searchSelect);
    }

    const queryString = this.searchQuery.toString() ? `?${this.searchQuery.toString()}` : "";
    this.loadTable(queryString);
  }

  /**
   * Clears the current search form and associated search state.
   * If the search form has values, prompts the user with a confirmation dialog before clearing.
   * Upon confirmation, the search form is reset, search-related flags are updated, and the table is reloaded.
   *
   * @return {void} Does not return any value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('User', 'Search Clear', 'Are you sure you want to clear the search?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;

        this.serverSearchForm.reset();
        this.isSearchFiledInput = true;
        this.isSearchFiledSelect = false;
        this.isSearchFiledDate = false;
        this.resetSearchQuery();
        this.loadTable('');
      });
  }

  /**
   * Resets the search query parameter fields in the server search form
   * by updating their values to default states.
   *
   * @return {void} No return value as the method resets the form fields internally.
   */
  resetServerSearchQueryParamFields(): void {
    this.serverSearchForm.patchValue({
      searchInput: '',
      searchSelect: '',
      searchStartDate: null,
      searchEndDate: null
    });
  }

  /**
   * Populates the form with the provided user's details and updates the form state, associated data, and validations.
   *
   * @param {User} user - The user object containing the details to fill into the form.
   * @return {void} This method does not return a value.
   */
  fillForm(user: User): void {
    this.enableButtons(false, true, true);
    this.selectedRow = user;

    this.disableSelfModify = this.disableSelfModifications(user.employee);

    this.user = JSON.parse(JSON.stringify(user));
    this.oldUser = JSON.parse(JSON.stringify(user));

    this.user.employee = this.employees.find(employee => employee.id === this.user.employee?.id) ?? this.user.employee;
    this.user.usertype = this.userTypes.find(userType => userType.id === this.user.usertype?.id) ?? this.user.usertype;
    this.user.userstatus = this.userStatuses.find(userStatus => userStatus.id === this.user.userstatus?.id) ?? this.user.userstatus;

    this.pdfDtls = true;

    this.userForm.patchValue(this.user);

    if (!this.userForm.get('password')?.value) {
      this.temPass = true;
      ['password', 'confirmpassword'].forEach(field => {
        this.userForm.controls[field].setValue('TravellionTempPass@25');
      });
    }
    this.formValidationService.createForm(this.userForm, this.oldUser, this.user);
    this.userForm.markAsPristine();
  }

  /**
   * Handles the submission of general details from the form.
   * Proceeds to the next step in the stepper if all required fields are valid.
   *
   * @param {MatStepper} stepper - The stepper instance used for navigating between form steps.
   * @return {void} Does not return a value.
   */
  onSubmitGeneralDetails(stepper: MatStepper): void {
    const formValues = this.userForm.value;
    const {employee, username, password} = formValues;
    if (employee && username && password) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the submission of user roles and progresses to the next step in the stepper if roles are defined.
   *
   * @param {MatStepper} stepper - The stepper component used to navigate through the steps.
   * @return {void} No return value.
   */
  onSubmitUserRoles(stepper: MatStepper): void {
    const formValues = this.userForm.value;
    const {userroles} = formValues;
    if (userroles) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the final form submission or resets the stepper.
   *
   * @param {MatStepper} stepper - The Angular Material stepper instance to control and reset the stepper.
   * @return {void} - This method does not return any value.
   */
  onSubmitFinal(stepper: MatStepper): void {
    // Handle final form submission or reset
    if (this.userForm.valid) {
      stepper.reset();
    }
  }

  /**
   * Loads the user detail view by preparing and sending user-specific data to the data server.
   *
   * @param {User} element The selected user object containing user-specific information.
   * @return {void} Does not return a value.
   */
  loadUserDetailView(element: User): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;
    // this.enableAdd = true;

    this.selectedRow = element;
    const data = [
      {Label: "Title", Value: this.selectedRow.username},
      {Label: "User Name", Value: this.selectedRow.username},
      {Label: "Photo", Value: this.selectedRow.employee.photo ? this.selectedRow.employee.photo : btoa(this.defaultImageURL)},
      {Label: "Password", Value: "********"},
      {Label: "Confirm Password", Value: "********"},
      {Label: "User Roles", Value: this.selectedRow.userroles.map((role: any) => role.role.name).join(', ')},
      {Label: "Date Of Created", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Date Of Updated", Value: this.datePipe.transform(this.selectedRow.updatedon, 'yyyy-MM-dd, h:mm a')},
      {Label: "User Status", Value: this.selectedRow.userstatus.name},
      {Label: "User Type", Value: this.selectedRow.usertype.name},
      {Label: "Description", Value: this.selectedRow.descrption}
    ]
    this.dataServer.sendData(data);
  }

  /**
   * Loads and processes employee details based on the provided user element.
   *
   * @param {Employee} element - The employee input whose details are to be loaded and displayed.
   * @return {void} This method does not return a value.
   */
  loadEmployeeForUserDetails(element: Employee): void {
    if (!element) return;
    this.dataSubscriber$.add(
      this.dataService.getDataObject<EmployeeForUserDetails>(ApiEndpoints.paths.employeeForUserDetails, element?.id).subscribe({
        next: (employee: EmployeeForUserDetails) => {
          this.employeeForUserDetails = employee;
          const data = [
            {Label: "Calling Name", Value: this.employeeForUserDetails.callingname},
            {Label: "Mobile", Value: this.employeeForUserDetails.mobile},
            {Label: "Email", Value: this.employeeForUserDetails.email},
            {Label: "Gender", Value: this.employeeForUserDetails.gender.name},
            {Label: "Designation", Value: this.employeeForUserDetails.designation.name},
            {Label: "Employee Type", Value: this.employeeForUserDetails.employeetype.name},
            {Label: "Employee Status", Value: this.employeeForUserDetails.employeestatus.name},
          ];

          this.dataServer.sendData(data);
        },
        error: (err) => {
          console.log("Error fetching employee : " + err);
        }
      })
    )
  }

  /**
   * Updates the view to the user modification form and populates it with the provided user's data.
   *
   * @param {User} element - The user object containing the data to populate the modification form.
   * @return {void} This method does not return a value.
   */
  loadUserModifyView(element: User): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Sets the current view of the application based on the input parameter.
   *
   * @param {('records' | 'profiles' | 'form')} view - The desired view to be set.
   *     'records' enables the record view,
   *     'profiles' enables the profile detail view,
   *     and 'form' enables the form view.
   * @return {void} This method does not return a value.
   */
  setView(view: 'records' | 'profiles' | 'form'): void {
    this.enableRecordView = view === 'records';
    this.enableDetailView = view === 'profiles';
    this.enableForm = view === 'form';
    this.clearTableSelection();
    this.loadTable('');
  }

  /**
   * Generates and returns an array of user roles based on the input from the form.
   *
   * @return {Array<UserRole>} An array of UserRole objects created from the form data. Items with invalid or missing data will be skipped.
   */
  generateUserRole(): Array<UserRole> {
    const userRolesData = this.userForm.controls['userroles'].value;
    console.log("User roles data from form:", userRolesData); // Debugging

    const userRoles: Array<UserRole> = [];
    userRolesData.forEach((item: any) => {
      if (item.id && item.name) {
        console.log(item.id);
        console.log(item.name);

        const role = new Role(item.id, item.name);
        console.log(item.role);
        const userRole = new UserRole(role);
        userRoles.push(userRole);
      } else {
        console.log("Skipping item without a valid role:", item);
      }
    });
    return userRoles;
  }

  /**
   * Generates a user icon URL based on the provided value or returns a default image URL if no value is given.
   *
   * @param {string | null | undefined} value - The input value used to generate the user icon. Accepts a string, null, or undefined.
   * @return {string} The generated user icon URL if the value is provided, otherwise the default image URL.
   */
  generateUserIcon(value: string | null | undefined): string {
    if (!value) {
      return this.defaultImageURL;
    }
    return atob(value);
  }

  /**
   * Compares the passwords from the form fields and sets an error on the
   * confirmPassword control if they do not match.
   *
   * @return {void} Does not return a value.
   */
  verifyPassword(): void {
    const password = this.userForm.controls['password'].value;
    const confirmPassword = this.userForm.controls['confirmpassword'].value;

    if (password !== confirmPassword) {
      this.userForm.controls['confirmpassword'].setErrors({passwordsNotMatching: true});
    } else {
      this.userForm.controls['confirmpassword'].setErrors(null);
    }
  }

  /**
   * Saves the user form data after performing validation and confirmation processes.
   * If validation errors are present, displays the errors. Otherwise, formats the
   * user data, prompts for confirmation, and handles the save operation.
   *
   * @return {void} Does not return a value.
   */
  save(): void {
    const formValues = this.userForm.getRawValue();

    const errors = this.formValidationService.getErrors(this.userForm, ['description']);
    if (errors) {
      this.operationFeedbackService.showErrors("User", "Add", errors);
      return;
    }

    this.user = formValues;
    //@ts-ignore
    delete this.user.confirmpassword;
    this.user.accountLocked = false;
    this.user.userroles = this.generateUserRole();

    const userData = this.operationFeedbackService.formatObjectData(this.user, ["username"]);

    this.operationFeedbackService.showConfirmation("User", "Add", userData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<User>(ApiEndpoints.paths.users, this.user)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedbackService.showStatus("User", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("User", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the user information based on form data, applying validations and handling confirmation dialogs.
   * Ensures that temporary passwords, roles, and other user-specific fields are managed appropriately.
   * Validates and fetches updates from the form to submit them to the backend. Handles success and error responses.
   *
   * @return {void} This method does not return any value but updates the user data and interacts with backend services.
   */
  update(): void {

    if (!this.userForm.get('password')?.value) {
      this.temPass = true;
      ['password', 'confirmpassword'].forEach(field => {
        this.userForm.controls[field].setValue('TravellionTempPass@25', {emitEvent: false});
      });
    }
    const errors = this.formValidationService.getErrors(this.userForm, ['description', 'confirmpassword']);
    if (errors) {
      this.operationFeedbackService.showErrors('User', 'Update', errors);
      return;
    }
    this.user = this.userForm.getRawValue();
    this.user.accountLocked = false;
    this.user.id = this.oldUser.id;

    // Preserve existing roles if new roles are not valid
    const existingRoles = this.oldUser.userroles || [];
    const newRoles = this.generateUserRole();

    // Check if newRoles has valid roles
    if (newRoles.length > 0) {
      this.user.userroles = newRoles; // Use new roles if available
    } else {
      this.user.userroles = existingRoles; // Keep existing roles if no valid new roles
    }

    //@ts-ignore
    delete this.user.confirmpassword;
    const updates = this.formValidationService.getUpdates(this.userForm);

    // 3. Show Confirmation Dialog (First Observable)
    this.operationFeedbackService.showConfirmation('User', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {  // When dialog closes, we get true or false
          if (!isConfirmed) return;  // If user cancels, stop here

          // 4. Update Employee (Second Observable)
          this.dataService.update<User>(ApiEndpoints.paths.users, this.user)
            .subscribe({
              next: (response) => {  // When update completes successfully
                // Handle the response
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                  this.temPass = false;
                }
                // Show status message
                this.operationFeedbackService.showStatus("User", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {  // If update fails
                // Handle error response
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                // Show error message
                this.operationFeedbackService.showErrors("User", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes the user by performing a series of operations including data formatting, showing a confirmation dialog, and making an API call to remove the user data.
   * Notifies the user of success or error through appropriate feedback methods.
   *
   * @return {void} Does not return any value.
   */
  delete(): void {

    const userData = this.operationFeedbackService.formatObjectData(this.user, ['username']);
    this.operationFeedbackService.showConfirmation('User', 'Delete', userData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.users, this.user.username)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("User", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('User', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the form after user confirmation if there are values to clear.
   *
   * @return {void} This method does not return any value.
   */
  clear(): void {

    const hasValue = Object.entries(this.userForm.controls)
      .filter(([key]) => key != 'userroles')
      .some(([, control]) => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear User', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('User', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
        this.dataServer.sendData(null);
      })
  }

  /**
   * Clears the current table selection by disabling editing, resetting the selected row,
   * and sending a null value to the data server.
   *
   * @return {void} No value is returned by this method.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets the stepper to its initial state and reloads the form options.
   * This method is typically used to clear any progress or customized settings
   * in the stepper and bring it back to its default state.
   * @return {void} No value is returned by this method.
   */
  resetStepper(): void {
    this.resetAndReloadFormOptions();
  }

  /**
   * Resets and reloads options for a form by resetting the internal state, reloading data,
   * and reinitializing the form and associated configurations.
   *
   * @return {void} Does not return any value.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.stepper.reset();
    this.loadTable('');
    this.loadRoles();
    this.formValidationService.createForm(this.userForm);
    this.enableButtons(true, false, false);
    this.dataServer.sendData(null);
    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Constructs a comma-separated string of role names from the provided array of user roles.
   *
   * @param {Array<UserRole>} element - The array of user roles to extract role names from. Each element should contain a role property with a name.
   * @return {string} A string containing the names of the roles, separated by commas.
   */
  displayRoles(element: Array<UserRole>): string {
    return element.map((userrole: UserRole) => userrole.role.name).join(", ");
  }

  /**
   * Assigns a specific CSS color class based on the user's designation.
   *
   * @param {Designation} designation - The user's designation object containing the role name.
   * @return {string} The CSS class name corresponding to the user's role or a default class if not found.
   */
  setUserTypeColor(designation: Designation): string {
    const roleColors: Record<string, string> = {
      privileged: 'privileged-cell'
    };
    const colorClass = roleColors[designation.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Updates and returns the CSS class name corresponding to the user's status.
   *
   * @param {UserStatus} status - An object representing the user's status.
   * @return {string} The class name for the status color, or 'default-cell' if the status is not recognized.
   */
  setStatusColor(status: UserStatus): string {
    const statusColor: Record<string, string> = {
      active: 'active-cell',
      deactivated: 'deactivated-cell'
    }
    const colorClass = statusColor[status.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Disables self-modifications for a given employee by checking if the provided employee matches the one stored locally.
   *
   * @param {Employee} element - The employee object to compare with the stored employee.
   * @return {boolean} Returns true if the employee matches the locally stored employee, otherwise false.
   */
  disableSelfModifications(element: Employee): boolean {
    //@ts-ignore
    const employee = this.getEmployeeFromLocalStorage();
    if (employee) {
      return employee.number === element.number;
    }
    return false;
  }

  /**
   * Loads the logged-in employee data from local storage and assigns it to the loggedEmployee property.
   * If no employee data is found in local storage, no changes are made.
   * @return {void} This method does not return a value.
   */
  loadLoggedEmployee(): void {
    //@ts-ignore
    const employee = this.getEmployeeFromLocalStorage();
    if (employee) {
      this.loggedEmployee = employee;
    }
  }

  /**
   * Retrieves the employee data stored in the local storage as a parsed object.
   * The method checks whether the stored data is an object and contains a 'number' property before returning it.
   * If the data is invalid or cannot be parsed, it returns null.
   *
   * @return {object|null} The parsed employee object if valid, otherwise null.
   */
  getEmployeeFromLocalStorage(): any {
    //@ts-ignore
    const employee = localStorage.getItem('employee');
    if (employee) {
      try {
        const storedEmployee = JSON.parse(employee);
        if (typeof storedEmployee === 'object' && storedEmployee !== null && 'number' in storedEmployee) {
          return storedEmployee;
        }
      } catch (error) {
        console.error('Failed to parse stored employee data:', error);
      }
    }

    return null;
  }

  /**
   * Generates a random password with a specified length. The password includes at least one
   * character from each of the following types: lowercase letters, uppercase letters, numeric digits,
   * and special characters. The remaining characters are randomly selected from all character types.
   * The final password is shuffled to enhance randomness.
   *
   * @param {number} [length=10] The desired length of the generated password. Default is 10.
   * @return {void} This method does not return a value. It directly updates the password and confirm
   *                password fields in the specified user form controls.
   */
  generatePassword(length: number = 10) {
    const characterTypes = [
      {Type: 'lowercaseChars', Characters: 'abcdefghijklmnopqrstuvwxyz'},
      {Type: 'uppercaseChars', Characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'},
      {Type: 'numericChars', Characters: '0123456789'},
      {Type: 'specialChars', Characters: '!@#$%^&*():'}
    ];
    let password = '';
    characterTypes.forEach(type => {
      const randomChar = type.Characters.charAt(Math.floor(Math.random() * type.Characters.length));
      password += randomChar;
    });
    const remaining = length - 4;
    const allChars = characterTypes.map(type => type.Characters).join('');
    for (let i = 0; i < remaining; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    this.userForm.controls['password'].patchValue(password);
    this.userForm.controls['confirmpassword'].patchValue(password);
  }

  /**
   * Toggles the lock status of a user account.
   * Updates the `accountLocked` status of the provided user and persists the changes via a data service.
   *
   * @param {User} element - The user whose account lock status will be toggled.
   * @return {void} This method does not return a value.
   */
  toggleAccountLock(element: User): void {
    const active = element.accountLocked;
    const updatedUser = new UserActiveDeactive()
    updatedUser.username = element.username;
    updatedUser.accountLocked = !active;

    this.dataService.update<UserActiveDeactive>(ApiEndpoints.paths.updateUserLockStatus, updatedUser).subscribe({
      next: (response) => {
        const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);
        if (status) {
          this.loadTable('');
          this.operationFeedbackService.showStatus("User", "Update", responseMessage + " : " + serverInfo);
        }
      },
      error: (error) => {
        const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
        // Show error message
        this.operationFeedbackService.showErrors("User", "Update", responseMessage);
        element.accountLocked = !active;
      }
    });
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
