import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatOption, MatSelect} from "@angular/material/select";
import {DatePipe, NgClass} from "@angular/common";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatButton, MatIconButton} from "@angular/material/button";
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
import {Employee} from "../../../entity/employee";
import {Gender} from "../../../entity/gender";
import {Designation} from "../../../entity/designation";
import {EmployeeStatus} from "../../../entity/employee-status";
import {EmployeeType} from "../../../entity/employee-type";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatIcon} from "@angular/material/icon";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {dobNicValidator} from "../../../util/core-services/validation/dob-nic-validator.service";
import {AvNotificationService} from "@avoraui/av-notifications";
import {AvFilePicker} from "@avoraui/av-file-picker";

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatIcon,
    MatLabel,
    MatSelect,
    MatOption,
    MatDatepickerModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatButton,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatColumnDef,
    MatHeaderRow,
    MatRow,
    MatPaginator,
    NgClass,
    MatCellDef,
    MatHeaderCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatSuffix,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatIconButton,
    MatPrefix,
    DetailViewComponent,
    MatNoDataRow,
    AvFilePicker,
  ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})

export class EmployeeComponent implements OnInit, OnDestroy, AfterViewInit {

  columns: string[] = ['photo', 'number', 'callingname', 'designation', 'employeestatus', 'gender', 'modify/view'];
  headers: string[] = ['Photo', 'Number', 'Employee', 'Designation', 'Status', 'Gender', 'Modify / View'];

  columnsDetails: string[] = ['photo', 'callingname', 'designation'];
  headersDetails: string[] = ['Photo', 'Calling Name', 'Designation'];

  statusColors = [
    {value: "Assigned", color: {background: "#dcfce7", text: "#12512b"}},
    {value: "Unassigned", color: {background: "#fcdcdc", text: "#601515"}},
    {value: "Admin", color: {background: "#fef9c3", text: "#683c0b"}}
  ];

  public serverSearchForm!: FormGroup;
  public employeeForm!: FormGroup;
  isLinear = false;
  blinkButton: boolean = false;
  employee!: Employee;
  oldEmployee!: Employee;
  pdfDtls: boolean = true;

  selectedRow: any;
  @ViewChild('stepper') stepper!: MatStepper;

  employees: Array<Employee> = [];
  data!: MatTableDataSource<Employee>;
  imageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  defaultImageURL: string = 'default.png';

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

  nextEmployeeNumber: string = "";
  genders: Array<Gender> = [];
  designations: Array<Designation> = [];
  employeeStatuses: Array<EmployeeStatus> = [];
  employeeTypes: Array<EmployeeType> = [];

  dataSubscriber$: Subscription = new Subscription();

  minimumBirthYear: Date;
  maximumBirthYear: Date;

  breadcrumb: any;
  result: any;

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  searchQuery!: URLSearchParams;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public authService: AuthorizationManagerService,
    private breadcrumbService: BreadcrumbService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private avNotificationService: AvNotificationService,
  ) {

    this.employeeForm = this.formBuilder.group({
      number: new FormControl('', [Validators.required],),
      fullname: new FormControl('', [Validators.required]),
      callingname: new FormControl('', [Validators.required]),
      photo: new FormControl('', [Validators.required]),
      dobirth: new FormControl('', [Validators.required]),
      nic: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      land: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      employeetype: new FormControl('', [Validators.required]),
      employeestatus: new FormControl('', [Validators.required]),
    }, {
      validators: dobNicValidator,
      updateOn: 'change'
    });

    this.serverSearchForm = this.formBuilder.group({
      searchInput: new FormControl(),
      searchSelect: new FormControl(),
      filterField: new FormControl(),
      searchStartDate: new FormControl(),
      searchEndDate: new FormControl()
    });

    this.minimumBirthYear = new Date(new Date().setFullYear(new Date().getFullYear() - 18));
    this.maximumBirthYear = new Date(new Date().setFullYear(new Date().getFullYear() - 40));

  }

  ngOnInit(): void {
    this.initialize()

    // this.employeeForm.get('nic')!.valueChanges.subscribe(() => {
    //   this.checkNicDobMismatch();
    // });
    //
    // this.employeeForm.get('dobirth')!.valueChanges.subscribe(() => {
    //   this.checkNicDobMismatch();
    // });
  }

  /**
   * Validates whether the NIC and Date of Birth (DOB) provided in the employee form match based on the year.
   * If the NIC year and DOB year do not match, a failure notification is displayed,
   * and the NIC and DOB fields in the form are reset without triggering any additional events.
   *
   * @return {void} Does not return any value.
   */
  private checkNicDobMismatch(): void {
    const nic = this.employeeForm.get('nic')?.value;
    const dobirth = this.employeeForm.get('dobirth')?.value;

    if (!nic || !dobirth) return;

    const birthYear = new Date(dobirth).getFullYear();
    let nicYear = -1;

    if (nic.length === 10) {
      nicYear = parseInt('19' + nic.substring(0, 2), 10);
    } else if (nic.length === 12) {
      nicYear = parseInt(nic.substring(0, 4), 10);
    }

    if (nicYear !== -1 && nicYear !== birthYear) {
      this.avNotificationService.showFailure("NIC and DOB year do not match.", {
        theme: "light"
      });

      this.employeeForm.patchValue({
        nic: '',
        dobirth: ''
      }, { emitEvent: false });
    }
  }



  /**
   * Initializes the component by loading required data, setting up filters, form validations, and button states.
   * It retrieves data for genders, designations, employee types, statuses, and configures the form and UI accordingly.
   *
   * @return {void} This method does not return a value.
   */
  initialize(): void {

    this.loadEmployeeFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.createView();
    this.getEmployeeNumber();

    this.dataSubscriber$.add(
      this.dataService.getData<Gender>(ApiEndpoints.paths.genders).subscribe({
        // next -> is triggered when the HTTP request succeeds (handles the data received) [then in promise]
        // error -> handles failures (like catch in Promises)
        // complete -> runs when finished (useful for cleanup)
        next: (genders) => {
          this.genders = genders;
        },
        error: (err) => {
          console.error('Error fetching genders : ' + err);
        },
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Designation>(ApiEndpoints.paths.designations).subscribe({
        next: (designations) => {
          this.designations = designations;
        },
        error: (err) => {
          console.error('Error fetching Designation : ' + err);
        },
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<EmployeeType>(ApiEndpoints.paths.employeeTypes).subscribe({
        next: (types) => {
          this.employeeTypes = types;
        },
        error: (err) => {
          console.error('Error fetching EmployeeTypes : ' + err);
        },
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<EmployeeStatus>(ApiEndpoints.paths.employeeStatuses).subscribe({
        next: (statuses) => {
          this.employeeStatuses = statuses;
        },
        error: (err) => {
          console.error('Error fetching EmployeeStatuses : ' + err);
        },
      })
    )

    this.formValidationService.createForm(this.employeeForm, this.oldEmployee, this.employee, 'employee', ['number'], ['land', 'photo'], [['dobirth', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Initializes and configures the view by setting up the image URL, enabling the record view,
   * allowing input in the search field, and loading the table data.
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
   * Enables or disables the add, update, and delete buttons based on the provided boolean values.
   *
   * @param {boolean} add - Indicates whether the add button should be enabled or disabled.
   * @param {boolean} upd - Indicates whether the update button should be enabled or disabled.
   * @param {boolean} del - Indicates whether the delete button should be enabled or disabled.
   * @return {void} Does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the component's authority-related properties based on user permissions.
   * This method determines whether the current user has the authority to perform
   * insert, update, or delete operations for the "employee" resource and assigns
   * those values to respective properties.
   *
   * @return {void} Does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('employee', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('employee', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('employee', 'delete');
  }

  /**
   * Loads employee data into a table based on the provided query.
   *
   * @param {string} query - The query string for filtering or searching employees.
   * @return {void} Does not return a value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Employee>(ApiEndpoints.paths.employees, query).subscribe({
        next: (employees) => {
          this.employees = employees;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.employees);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Loads and formats the filterable fields for employee data.
   * This method excludes specific fields such as 'id' and 'photo',
   * retrieves the remaining fields from an Employee object,
   * and applies a formatting function to prepare them for use
   * in employee filters.
   *
   * @return {void} This method does not return a value.
   */
  loadEmployeeFilterFields(): void {
    const employee = new Employee();
    this.filterFields = Object.keys(employee)
      .filter(value => !['id', 'photo'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string by capitalizing the first letter of each word.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with the first letter of each word capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Updates the state and options for the search based on the selected filter field.
   *
   * Determines the type of field selected (`select`, `input`, or `date`) and updates the respective flags.
   * Populates the `searchSelectOptions` array based on the selected field value.
   *
   * @return {void} No value is returned from this method.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['gender', 'designation', 'employeestatus', 'employeetype'];
    const dateFields = ['dobirth', 'createdon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      gender: this.genders,
      designation: this.designations,
      employeestatus: this.employeeStatuses,
      employeetype: this.employeeTypes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the table data based on the input value from the event.
   * Applies a filter predicate to match the specified fields in the employee data against the input value.
   *
   * @param {Event} event - The event object triggered by the user's input action, which contains the filter value.
   * @return {void} This method does not return a value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (employee: Employee, filter: string) => {
      return (
        filterValue == null ||
        employee.number.toLowerCase().includes(filterValue) ||
        employee.callingname.toLowerCase().includes(filterValue) ||
        employee.gender.name.toLowerCase().includes(filterValue) ||
        employee.designation.name.toLowerCase().includes(filterValue) ||
        employee.employeestatus.name.toLowerCase().includes(filterValue))
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a row by assigning the provided Employee element to the selectedRow property.
   * Logs the selected row to the console.
   *
   * @param {Employee} element - The Employee object to select and assign to the row.
   * @return {void} This method does not return a value.
   */
  selectRow(element: Employee): void {
    this.selectedRow = element;
    console.log(this.selectedRow);
  }

  /**
   * Resets the searchQuery property to an empty instance of URLSearchParams.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search operation based on the values provided in the search form.
   * The method retrieves inputs such as search text, selected options, filter fields, and date range,
   * constructs a query, and then updates the table with the search results.
   *
   * @return {void} No return value. The method performs actions such as displaying feedback
   * if no search values are provided, constructing query parameters for the search, and triggering the table loading process.
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
   * Resets the server search query parameter fields by setting default values to the form fields.
   * This includes resetting text inputs, select inputs, and date fields.
   *
   * @return {void} Does not return a value.
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
   * Clears the search form and resets relevant fields and states. If no value is found in the form, a feedback message is shown. If confirmed by the user, the search form is reset, search-related flags are updated, and the table data is reloaded.
   *
   * @return {void} No return value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Employee', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Fills the form with the details of the provided employee and prepares the form for editing.
   *
   * @param {Employee} employee - The employee object containing details to populate the form.
   * @return {void} This method does not return a value.
   */
  fillForm(employee: Employee): void {
    this.enableButtons(false, true, true);
    this.selectedRow = employee;
    this.disableSelfModify = this.disableSelfModifications(employee);
    this.employee = JSON.parse(JSON.stringify(employee));
    this.oldEmployee = JSON.parse(JSON.stringify(employee));

    this.employee.gender = this.genders.find(gender => gender.id === this.employee.gender?.id) ?? this.employee.gender;
    this.employee.designation = this.designations.find(designation => designation.id === this.employee.designation?.id) ?? this.employee.designation;
    this.employee.employeetype = this.employeeTypes.find(type => type.id === this.employee.employeetype?.id) ?? this.employee.employeetype;
    this.employee.employeestatus = this.employeeStatuses.find(status => status.id === this.employee.employeestatus?.id) ?? this.employee.employeestatus;

    this.pdfDtls = true;
    this.employeeForm.patchValue(this.employee);
    this.formValidationService.createForm(this.employeeForm, this.oldEmployee, this.employee);
    this.employeeForm.markAsPristine();
  }

  /**
   * Handles the submission of personal details from the employee form and advances the stepper if all required fields are provided.
   *
   * @param {MatStepper} stepper - The stepper instance used to navigate between form steps.
   * @return {void}
   */
  onSubmitPersonalDetails(stepper: MatStepper): void {
    const formValues = this.employeeForm.value;
    const {fullname, callingname, gender, nic, dobirth} = formValues;
    if (fullname && callingname && gender && nic && dobirth) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the submission of employee contact details and progresses the stepper to the next step if all required fields are provided.
   *
   * @param {MatStepper} stepper - The Angular Material stepper instance used to navigate between steps.
   * @return {void} This method does not return a value.
   */
  onSubmitContactDetails(stepper: MatStepper): void {
    const formValues = this.employeeForm.value;
    const {address, mobile, email} = formValues;
    if (address && mobile && email) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the final step submission or resets the form using the provided stepper.
   *
   * @param {MatStepper} stepper - The stepper instance used to navigate or reset steps.
   * @return {void} - Does not return a value.
   */
  onSubmitFinal(stepper: MatStepper): void {
    // Handle final form submission or reset
    if (this.employeeForm.valid) {
      stepper.reset();
    }
  }

  /**
   * Loads the details of the selected employee into the detail view and updates the UI accordingly.
   *
   * @param {Employee} element - The employee object containing all required information for the detail view.
   * @return {void} This method does not return a value.
   */
  loadEmployeeDetailView(element: Employee): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;
    const data = [
      {Label: "Title", Value: this.selectedRow.fullname},
      {Label: "Number", Value: this.selectedRow.number},
      {Label: "Calling Name", Value: this.selectedRow.callingname},
      {Label: "Full Name", Value: this.selectedRow.fullname},
      {Label: "Photo", Value: this.selectedRow.photo ? this.selectedRow.photo : btoa(this.defaultImageURL)},
      {Label: "Date Of Birth", Value: this.selectedRow.dobirth},
      {Label: "NIC", Value: this.selectedRow.nic},
      {Label: "Address", Value: this.selectedRow.address},
      {Label: "Mobile", Value: this.selectedRow.mobile},
      {Label: "Land", Value: this.selectedRow.land},
      {Label: "Email", Value: this.selectedRow.email},
      {Label: "Date Of Created", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Gender", Value: this.selectedRow.gender.name},
      {Label: "Designation", Value: this.selectedRow.designation.name},
      {Label: "Employee Status", Value: this.selectedRow.employeestatus.name},
      {Label: "Employee Type", Value: this.selectedRow.employeetype.name},
      {Label: "Description", Value: this.selectedRow.description}
    ];

    this.dataServer.sendData(data);

  }

  /**
   * Loads the employee modification view by enabling the form and setting appropriate view flags.
   * The provided employee object is used to populate the form.
   *
   * @param {Employee} element - The employee object containing data to populate the modification form.
   * @return {void} This method does not return a value.
   */
  loadEmployeeModifyView(element: Employee): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Updates the current view to the specified view type, enabling or disabling features accordingly.
   *
   * @param {('records'|'profiles'|'form')} view - The type of view to switch to.
   *                                               'records' enables the record view.
   *                                               'profiles' enables the detail view.
   *                                               'form' enables the form view.
   * @return {void} No return value.
   */
  setView(view: 'records' | 'profiles' | 'form'): void {
    this.enableRecordView = view === 'records';
    this.enableDetailView = view === 'profiles';
    this.enableForm = view === 'form';
    this.clearTableSelection();
    this.loadTable('');
  }

  /**
   * Generates a user icon based on the provided input value.
   *
   * @param {string | null | undefined} value The input value used to generate the user icon.
   *                                          If null or undefined, a default image URL is returned.
   * @return {string} The resulting user icon as a string, or the default image URL if no valid input is provided.
   */
  generateUserIcon(value: string | null | undefined): string {
    if (!value) {
      return this.defaultImageURL;
    }
    return atob(value);
  }

  /**
   * Retrieves the next available employee number from the data service
   * and updates the corresponding control in the employee form.
   *
   * @return {void} This method does not return a value.
   */
  getEmployeeNumber(): void {
    this.dataService.getRefNumber(ApiEndpoints.paths.employeeNumber, 'employeeNumber').subscribe({
      next: (data) => {
        this.nextEmployeeNumber = data.employeeNumber;
        this.employeeForm.controls['number'].setValue(this.nextEmployeeNumber);
      },
      error: (err) => {
        console.error('Error fetching employee-number:', err);
      }
    });
  }

  /**
   * Saves the current employee form data after performing validation checks and confirmation.
   * If validation errors are present, they are displayed and the save process is aborted.
   * If the confirmation is rejected, the save process is aborted as well.
   * Upon successful confirmation, the data is sent to the backend and feedback is provided based on the response.
   *
   * @return {void} Does not return any value.
   */
  save(): void {
    const formValues = this.employeeForm.getRawValue();

    const errors = this.formValidationService.getErrors(this.employeeForm, ['photo', 'land']);
    if (errors) {
      this.operationFeedbackService.showErrors("Employee", "Add", errors);
      return;
    }

    this.employee = formValues;
    const employeeData = this.operationFeedbackService.formatObjectData(this.employee, ["number", "fullname", "callingname"]);

    this.operationFeedbackService.showConfirmation("Employee", "Add", employeeData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<Employee>(ApiEndpoints.paths.employees, this.employee)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedbackService.showStatus("Employee", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Employee", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates an employee record after validating the input form, confirming the action,
   * and communicating with the backend service to persist changes.
   *
   * The method performs the following steps:
   * 1. Validates the form and shows errors if validation fails.
   * 2. Prepares the employee data for update, preserving the existing ID.
   * 3. Displays a confirmation dialog to the user to proceed with the update.
   * 4. Sends the update request to the backend service and handles the response appropriately.
   *
   * The process may involve displaying messages for errors, confirmation dialogs, or
   * status information depending on the outcome of the operations.
   *
   * @return {void} No return value. All operations are internally handled, including UI feedback.
   */
  update(): void {
    // 1. Form Validation
    const errors = this.formValidationService.getErrors(this.employeeForm, ['photo', 'land']);
    if (errors) {
      this.operationFeedbackService.showErrors('Employee', 'Update', errors);
      return;  // Exit if there are errors
    }

    // 2. Prepare Employee Data
    this.employee = this.employeeForm.getRawValue();  // Get form values
    this.employee.id = this.oldEmployee.id;  // Maintain the ID
    const updates = this.formValidationService.getUpdates(this.employeeForm);

    // 3. Show Confirmation Dialog (First Observable)
    this.operationFeedbackService.showConfirmation('Employee', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {  // When dialog closes, we get true or false
          if (!isConfirmed) return;  // If user cancels, stop here

          // 4. Update Employee (Second Observable)
          this.dataService.update<Employee>(ApiEndpoints.paths.employees, this.employee)
            .subscribe({
              next: (response) => {  // When update completes successfully
                // Handle the response
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Employee", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {  // If update fails
                // Handle error response
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                // Show error message
                this.operationFeedbackService.showErrors("Employee", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes an employee record after confirmation from the user. This method formats the employee data, prompts the user for confirmation,
   * performs the delete operation through the data service, and handles the response accordingly. If successful, it reloads form options;
   * otherwise, it displays an error message.
   *
   * @return {void} No value is returned.
   */
  delete(): void {

    const employeeData = this.operationFeedbackService.formatObjectData(this.employee, ['callingname']);
    this.operationFeedbackService.showConfirmation('Employee', 'Delete', employeeData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.employees, this.employee.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Employee", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Employee', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the employee form by resetting its fields and reloading form options
   * if confirmed by the user. Displays feedback messages for empty form or upon
   * confirmation.
   *
   * @return {void} Does not return a value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.employeeForm, ['number']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Employee', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Employee', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
      })
  }

  /**
   * Clears the current table selection, disables editing, and sends null data to the server.
   * The method resets the selection state by setting the selected row to null and prevents further edits by disabling editing.
   * Also communicates the cleared state to the server.
   *
   * @return {void} Does not return a value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets the stepper component and reloads its form options to the default state.
   * This method ensures that the stepper and associated forms are set to their initial configuration.
   *
   * @return {void} Does not return a value.
   */
  resetStepper(): void {
    this.resetAndReloadFormOptions();
  }

  /**
   * Resets the form options to their initial state and reloads necessary configurations.
   *
   * This method performs several actions including resetting form controls, clearing specific variables,
   * reloading data, and updating the state of certain UI elements.
   *
   * @return {void} This method does not return a value.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.stepper.reset();
    this.getEmployeeNumber();
    this.loadTable('');
    this.formValidationService.createForm(this.employeeForm);
    this.enableButtons(true, false, false);

    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Assigns a specific CSS class to a designation based on its name.
   *
   * @param {Designation} designation - The designation object containing the name property.
   * The name is used to determine the corresponding color class.
   * @return {string} The CSS class string associated with the designation or a default class
   * if no match is found.
   */
  setDesignationColor(designation: Designation): string {
    const roleColors: Record<string, string> = {
      admin: 'designation-cell'
    };
    const colorClass = roleColors[designation.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Sets and returns the corresponding color class based on the status of an employee.
   *
   * @param {EmployeeStatus} status - The status object that contains the employee's current status.
   * @return {string} The CSS class name associated with the specified employee status.
   */
  setStatusColor(status: EmployeeStatus): string {
    const statusColor: Record<string, string> = {
      assigned: 'assigned-cell',
      unassigned: 'unassigned-cell'
    }
    const colorClass = statusColor[status.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Disables self-modifications for the given employee based on stored data.
   *
   * @param {Employee} element - The employee object to check against the stored employee data.
   * @return {boolean} Returns true if the employee cannot modify their own data, otherwise false.
   */
  disableSelfModifications(element: Employee): boolean {
    //@ts-ignore
    const employee = localStorage.getItem('employee');
    if (employee) {
      try {
        const storedEmployee = JSON.parse(employee);
        if (typeof storedEmployee === 'object' && storedEmployee !== null && 'number' in storedEmployee) {
          return storedEmployee.number === element.number;
        }
      } catch (error) {
        console.error('Failed to parse stored employee data:', error);
      }
    }
    return false;
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
  }

  ngAfterViewInit(): void {
    // location.reload();
  }

}
