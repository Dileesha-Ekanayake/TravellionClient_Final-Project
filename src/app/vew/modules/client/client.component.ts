import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
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
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSelect} from "@angular/material/select";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Gender} from "../../../entity/gender";
import {Observable, Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {Customer} from "../../../entity/customer";
import {CustomerRelationship} from "../../../entity/customer-relationship";
import {ResidentType} from "../../../entity/resident-type";
import {PaxType} from "../../../entity/pax-type";
import {User} from "../../../entity/user";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {Passenger} from "../../../entity/passenger";
import {CustomerContact} from "../../../entity/customer-contact";
import {CustomerIdentity} from "../../../entity/customer-identity";
import {AvDataTable} from "@avoraui/av-data-table";
import {AvNotificationService} from "@avoraui/av-notifications";

@Component({
  selector: 'app-client',
  imports: [
    DetailViewComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
    MatGridList,
    MatGridTile,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatOption,
    MatPaginator,
    MatPrefix,
    MatRow,
    MatRowDef,
    MatSelect,
    MatStartDate,
    MatStep,
    MatStepLabel,
    MatStepper,
    MatSuffix,
    MatTable,
    ReactiveFormsModule,
    NgClass,
    MatColumnDef,
    MatHeaderCellDef,
    MatNoDataRow,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    FormsModule,
    AvDataTable
  ],
  templateUrl: './client.component.html',
  standalone: true,
  styleUrl: './client.component.css'
})
export class ClientComponent implements OnInit, OnDestroy {

  breadcrumb: any;

  columns: string[] = ['code', 'callingname', 'dobirth', 'residenttype', 'gender', 'modify/view'];
  headers: string[] = ['Code', 'Employee', 'Date of Birth', 'Resident Type', 'Gender', 'Modify / View'];

  columnsDetails: string[] = ['code', 'callingname', 'residenttype'];
  headersDetails: string[] = ['Code', 'Calling Name', 'Resident Type'];

  passengerTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Code', align: 'left' },
    { label: 'Name', align: 'center' },
    { label: 'Age', align: 'center' },
    { label: 'Relationship', align: 'left' },
    { label: 'Resident Type', align: 'left' },
    { label: 'Pax Type', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  passengerTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'code', align: 'left' ,color : '#3182ce'},
    { field: 'name', align: 'center' },
    { field: 'age', align: 'center' },
    { field: 'relationship.name', align: 'left' },
    { field: 'residenttype.name', align: 'left' },
    { field: 'paxtype.name', align: 'left' },
  ];

  customer!: Customer;
  oldCustomer!: Customer;

  customerContact!: CustomerContact;
  oldCustomerContact!: CustomerContact;

  customerIdentity!: CustomerIdentity;
  oldCustomerIdentity!: CustomerIdentity;

  customers: Array<Customer> = [];

  customerRelationships: Array<CustomerRelationship> = [];
  residentTypes: Array<ResidentType> = [];
  paxTypes: Array<PaxType> = [];

  activeUserList: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;

  storePassengers: Array<Passenger> = [];
  private isRemovedPassenger: boolean = false;

  modifiedDataIndex: number = -1;
  modifiedDataId: number = 0;

  public serverSearchForm!: FormGroup;

  public clientForm!: FormGroup;
  public clientContactDetailsForm!: FormGroup;
  public clientIdentityForm!: FormGroup;
  public passengerDetailsForm!: FormGroup;

  isEnableInnerDataModify: boolean = false;
  isFillForm: boolean = false;

  isLinear = false;
  blinkButton: boolean = false;
  pdfDtls: boolean = true;

  selectedRow: any;
  @ViewChild('stepper') stepper!: MatStepper;

  data!: MatTableDataSource<Customer>;
  imageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enableAdd: boolean = false;
  enableUpdate: boolean = false;
  enableDelete: boolean = false;
  enableEdit: boolean = false;
  enableGoToRecode: boolean = true;
  enableGoToView: boolean = true;

  hasInsertAuthority: boolean = false;
  hasUpdateAuthority: boolean = false;
  hasDeleteAuthority: boolean = false;

  nextCustomerCode: string = "";
  genders: Array<Gender> = [];

  dataSubscriber$: Subscription = new Subscription();

  minimumBirthYear: Date;
  maximumBirthYear: Date;

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  searchQuery!: URLSearchParams;

  dummyPassengerCount: number = 0;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public authService: AuthorizationManagerService,
    private breadcrumbService: BreadcrumbService,
    private formValidationService: FormValidationService,
    private operationFeedBackService: OperationFeedbackService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private avNotificationService: AvNotificationService,
  ) {

    this.clientForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      fullname: new FormControl('', Validators.required),
      callingname: new FormControl('', Validators.required),
      dobirth: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      residenttype: new FormControl('', Validators.required),
      passengers: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.clientIdentityForm = this.formBuilder.group({
      nic: new FormControl('', Validators.required),
      passportExpiryDate: new FormControl('', Validators.required),
      passportNo: new FormControl('', Validators.required)
    }, {updateOn: 'change'});

    this.clientContactDetailsForm = this.formBuilder.group({
      mobile: new FormControl('', Validators.required),
      land: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
      emergencyContactNumber: new FormControl('', Validators.required),
      addressLine1: new FormControl('', Validators.required),
      addressLine2: new FormControl('', Validators.required),
      postalCode: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.passengerDetailsForm = this.formBuilder.group({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      age: new FormControl('', Validators.required),
      relationship: new FormControl('', Validators.required),
      residenttype: new FormControl('', Validators.required),
      paxtype: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

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
    this.initialize();

    // this.clientIdentityForm.get('nic')!.valueChanges.subscribe(() => {
    //   this.checkNicDobMismatch();
    // });
    //
    // this.clientForm.get('dobirth')!.valueChanges.subscribe(() => {
    //   this.checkNicDobMismatch();
    // });
  }

  /**
   * Initializes the component by setting up the required data, forms, and state.
   * This method executes multiple tasks including loading customer filter fields,
   * setting up breadcrumbs, fetching and subscribing to data, and configuring forms.
   *
   * @return {void} Does not return a value.
   */
  initialize(): void {

    this.loadCustomerFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.createView();
    this.getCustomerCode();

    this.dataSubscriber$.add(
      this.dataService.getData<Gender>(ApiEndpoints.paths.genders).subscribe({
        next: (genders) => {
          this.genders = genders;
        },
        error: (error) => {
          console.error('Error fetching genders : ' + error.message);
        },
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.users).subscribe({
        next: (users) => {
          this.activeUserList = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUserList, this.clientForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error('Error fetching users : ' + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<ResidentType>(ApiEndpoints.paths.residentTypes).subscribe({
        next: (residentTypes) => {
          this.residentTypes = residentTypes;
        },
        error: (error) => {
          console.error('Error fetching residentTypes : ' + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<PaxType>(ApiEndpoints.paths.paxTypes).subscribe({
        next: (paxTypes) => {
          this.paxTypes = paxTypes;
        },
        error: (error) => {
          console.error('Error fetching paxTypes : ' + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<CustomerRelationship>(ApiEndpoints.paths.customerRelationshipTypes).subscribe({
        next: (relationships) => {
          this.customerRelationships = relationships;
        },
        error: (error) => {
          console.error('Error fetching customerRelationships : ' + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.clientForm, this.oldCustomer, this.customer, 'customer', ['code'], ['description'], [['dobirth', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.clientIdentityForm, this.oldCustomerIdentity, this.customerIdentity, 'customerIdentity', [], ['land'], [['passportExpiryDate', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.clientContactDetailsForm, this.oldCustomerContact, this.customerContact, 'customerContact', [], ['land', 'passport', 'passportExpiryDate', 'passportNo']);
    this.formValidationService.createForm(this.passengerDetailsForm, null, null);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Validates if there is a mismatch between the NIC year and the date of birth (DOB) year provided in the form.
   * If a mismatch is detected, it displays a notification and clears the mismatched fields in the form.
   *
   * @return {void} This method does not return a value.
   */
  private checkNicDobMismatch(): void {
    const nic = this.clientForm.get('dobirth')?.value;
    const dobirth = this.clientIdentityForm.get('nic')?.value;

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

      this.clientForm.patchValue({
        dobirth: ''
      }, { emitEvent: false });
      this.clientIdentityForm.patchValue({
        nic: ''
      })
    }
  }

  /**
   * Extracts and returns the display name for a given user object.
   *
   * The method utilizes the `autoCompleteDataFilterService` to retrieve
   * a specific value associated with the user based on the provided
   * property path 'employee.callingname'.
   *
   * @param {any} user - The user object from which the display name is extracted.
   * @returns {string} The display name of the user based on the specified property path.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Initializes and prepares the view by setting up initial properties and loading necessary data.
   * The method sets default values for certain view properties such as imageURL, form enablement,
   * input field status, and populates the table and user data.
   *
   * @return {void} Indicates that no value is returned by this method.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableForm = true;
    this.isSearchFiledInput = true;
    this.loadTable("");
    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user for the application by fetching user data using the authentication service.
   *
   * @return {void} Does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.clientForm, 'user');
  }

  /**
   * Fetches the next available customer code from the API and updates the form controls with the retrieved code.
   * Handles API response and potential errors appropriately.
   *
   * @return {void} No value is returned as this method performs side effects such as updating form controls and logging errors.
   */
  getCustomerCode(): void {
    this.dataService.getRefNumber(ApiEndpoints.paths.customerCode, 'customerCode').subscribe({
      next: (data) => {
        this.nextCustomerCode = data.customerCode;
      },
      error: (error) => {
        console.error('Error fetching employee-number:', error.message);
      },
      complete: () => {
        this.clientForm.controls['code'].setValue(this.nextCustomerCode);
        this.generatePassengerCode(this.nextCustomerCode);
        this.passengerDetailsForm.controls['code'].disable();
      }
    });
  }

  /**
   * Enables or disables the specified buttons based on the provided boolean values.
   *
   * @param {boolean} add - Determines whether the "Add" button should be enabled (true) or disabled (false).
   * @param {boolean} upd - Determines whether the "Update" button should be enabled (true) or disabled (false).
   * @param {boolean} del - Determines whether the "Delete" button should be enabled (true) or disabled (false).
   * @return {void} This method does not return any value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Determines and sets the authority states for insert, update, and delete operations
   * on the 'client' feature using the authentication service.
   *
   * @return {void} This method does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('client', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('client', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('client', 'delete');
  }

  /**
   * Loads data into a table based on the provided query. Fetches customer data
   * from the data service and updates the table data source, along with a visual
   * indicator for the loading state.
   *
   * @param {string} query The query string used to fetch data for the table.
   * @return {void} Does not return any value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Customer>(ApiEndpoints.paths.customers, query).subscribe({
        next: (customers) => {
          this.customers = customers;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.customers);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Loads and processes the filter fields for the Customer object. The method excludes certain fields
   * from the filter, formats the remaining fields, and assigns them to the `filterFields` property.
   *
   * @return {void} This method does not return a value.
   */
  loadCustomerFilterFields(): void {
    const customer = new Customer();
    this.filterFields = Object.keys(customer)
      .filter(value => !['id', 'passengers', 'customerContacts', 'customerIdentities'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string field by capitalizing the first letter of each word.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Updates the search field type and populates `searchSelectOptions` based on the selected filter field.
   *
   * Determines whether the search field should act as a select, input, or date field based on the selected value.
   * Populates the select options if the field type is recognized as a select field.
   *
   * @return {void} This method does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'gender', 'residenttype'];
    const dateFields = ['dobirth', 'createdon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUserList,
      gender: this.genders,
      residenttype: this.residentTypes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the data table based on the input value from an event.
   * This method modifies the data's filterPredicate to include only the rows that match the filter criteria.
   *
   * @param {Event} event - The input event that triggers the filtering function. The event's target contains the filter value.
   * @return {void} - This method does not return any value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (customer: Customer, filter: string) => {
      return (
        filterValue == null ||
        customer.code.toLowerCase().includes(filterValue) ||
        customer.callingname.toLowerCase().includes(filterValue) ||
        customer.gender.name.toLowerCase().includes(filterValue))
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a row by assigning the provided customer element to the selectedRow property.
   * Logs the selected row to the console.
   *
   * @param {Customer} element - The customer object representing the row to be selected.
   * @return {void} - Does not return a value.
   */
  selectRow(element: Customer): void {
    this.selectedRow = element;
    console.log(this.selectedRow);
  }

  /**
   * Resets the search query by initializing a new URLSearchParams instance.
   * This effectively clears any existing search parameters.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search operation based on the form values provided.
   * Validates the presence of required fields and constructs the search query string.
   * Supports search parameters such as input text, select options, start and end dates.
   * Utilizes services to reset previous search queries, format dates, and fetch results.
   *
   * @return {void} This method does not return any value. It performs actions such as query construction, feedback display, and table loading.
   */
  search(): void {
    const formValues = this.serverSearchForm.value;

    const {searchInput, searchSelect, filterField, searchStartDate, searchEndDate} = formValues;

    if (!filterField) {
      this.operationFeedBackService.showMessage('Search', 'No search values...!');
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
   * Resets the fields of the server search query parameters form to their default values.
   * The following fields are reset:
   * - searchInput: set to an empty string.
   * - searchSelect: set to an empty string.
   * - searchStartDate: set to null.
   * - searchEndDate: set to null.
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
   * Clears the current search criteria from the server search form. If no search values are present,
   * it shows an informational message. If search values are present, it prompts the user with a confirmation dialog
   * before resetting the form and associated search state.
   *
   * @return {void} No return value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedBackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedBackService.showConfirmation('Employee', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Populates the form fields and properties with the provided customer data.
   * Sets up necessary states, validations, and default values to match the provided customer details.
   *
   * @param {Customer} customer - The customer object containing the data to populate the form.
   * @return {void}
   */
  fillForm(customer: Customer): void {
    this.enableButtons(false, true, true);
    this.isEnableInnerDataModify = false;
    this.isFillForm = true;
    this.selectedRow = customer;
    this.customer = JSON.parse(JSON.stringify(customer));
    this.oldCustomer = JSON.parse(JSON.stringify(customer));
    this.generatePassengerCode(this.customer.code);

    this.customerIdentity = JSON.parse(JSON.stringify(customer.customerIdentities[0]));
    this.oldCustomerIdentity = JSON.parse(JSON.stringify(customer.customerIdentities[0]));

    this.customerContact = JSON.parse(JSON.stringify(customer.customerContacts[0]));
    this.oldCustomerContact = JSON.parse(JSON.stringify(customer.customerContacts[0]));

    this.storePassengers = this.customer.passengers ? this.customer.passengers : [];

    this.customer.user = this.activeUserList.find(user => user.id === this.customer.user?.id) ?? this.customer.user;
    this.customer.gender = this.genders.find(gender => gender.id === this.customer.gender?.id) ?? this.customer.gender;
    this.customer.residenttype = this.residentTypes.find(residentType => residentType.id === this.customer.residenttype?.id) ?? this.customer.residenttype;

    if (this.customer.customerIdentities && this.customer.customerIdentities.length > 0) {
      this.clientIdentityForm.patchValue(this.customer.customerIdentities[0]);
    } else {
      this.clientIdentityForm.reset();
    }

    if (this.customer.customerContacts && this.customer.customerContacts.length > 0) {
      this.clientContactDetailsForm.patchValue(this.customer.customerContacts[0]);
    } else {
      this.clientContactDetailsForm.reset();
    }

    this.clientForm.patchValue(this.customer);

    this.formValidationService.createForm(this.clientForm, this.oldCustomer, this.customer);
    this.formValidationService.createForm(this.clientIdentityForm, this.oldCustomerIdentity, this.customerIdentity);
    this.formValidationService.createForm(this.clientContactDetailsForm, this.oldCustomerContact, this.customerContact);
    this.clientForm.markAsPristine();
    this.clientIdentityForm.markAsPristine();
    this.clientContactDetailsForm.markAsPristine();
  }

  /**
   * Handles the submission of personal details from the client form.
   * Validates the input fields and proceeds to the next step in the stepper if all fields are filled.
   *
   * @param {MatStepper} stepper - The material stepper instance that controls the step navigation flow.
   * @return {void} Does not return a value. Moves to the next step in the stepper if all required fields are valid.
   */
  onSubmitPersonalDetails(stepper: MatStepper): void {
    const formValues = this.clientForm.value;
    const {fullname, callingname, gender, dobirth, residenttype} = formValues;
    if (fullname && callingname && gender && dobirth && residenttype) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the submission of identity details. Processes the form values and, if valid, advances the stepper to the next step.
   *
   * @param {MatStepper} stepper - The stepper component controlling the workflow steps.
   * @return {void} No return value.
   */
  onSubmitIdentityDetails(stepper: MatStepper): void {
    const formValues = this.clientIdentityForm.value;
    const {nic} = formValues;
    if (nic) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the submission of contact details and proceeds to the next step if all required fields are filled.
   *
   * @param {MatStepper} stepper - The stepper instance used to navigate to the next step.
   * @return {void} This method does not return any value.
   */
  onSubmitContactDetails(stepper: MatStepper): void {
    const formValues = this.clientContactDetailsForm.value;
    const {mobile, land, email, emergencyContactNumber, addressLine1, addressLine2, postalCode, country, city} = formValues;
    if (mobile && land && email && emergencyContactNumber && addressLine1 && addressLine2 && postalCode && country && city) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the final form submission or resets the stepper if all forms are valid.
   *
   * @param {MatStepper} stepper - The MatStepper instance to be reset upon successful form validation.
   * @return {void} This method does not return a value.
   */
  onSubmitFinal(stepper: MatStepper): void {
    // Handle final form submission or reset
    if (this.clientForm.valid && this.clientIdentityForm.valid && this.clientContactDetailsForm.valid) {
      stepper.reset();
    }
  }

  /**
   * Loads the customer detail view by setting various view properties,
   * preparing formatted customer data, and sending it to the data server.
   *
   * @param {Customer} element - The customer object containing details such as personal, contact, and passenger information.
   * @return {void} This method does not return any value.
   */
  loadCustomerDetailView(element: Customer): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;

    let tables = [];
    if (this.selectedRow.passengers && this.selectedRow.passengers.length > 0){
      tables.push(
        {
          headers: ['Code', 'Name', 'Age', 'Relationship', 'Resident Type', 'Pax Type'],
          columns: ['code', 'name', 'age', 'relationship.name', 'residenttype.name', 'paxtype.name'],
          data: this.selectedRow.passengers || [],
          title: "Passengers"
        }
      );
    }

    const data = [
      {Label: "Title", Value: this.selectedRow.fullname},
      {Label: "Code", Value: this.selectedRow.code},
      {Label: "Calling Name", Value: this.selectedRow.callingname},
      {Label: "Full Name", Value: this.selectedRow.fullname},
      {Label: "Gender", Value: this.selectedRow.gender.name},
      {Label: "Date Of Created", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Date Of Modified", Value: this.datePipe.transform(this.selectedRow.updatedon, 'yyyy-MM-dd, h:mm a')},
    ];

    // Add identity if exists
    if (this.selectedRow.customerIdentities?.[0]) {
      const identity = this.selectedRow.customerIdentities[0];
      data.push({Label: "Identity Type", Value: identity.nic || identity.passportNo || 'N/A'});
      if (identity.passportExpiryDate) {
        data.push({Label: "Passport Expiry", Value: this.datePipe.transform(identity.passportExpiryDate, 'yyyy-MM-dd')});
      }
    }

    // Add contact if exists
    if (this.selectedRow.customerContacts?.[0]) {
      const contact = this.selectedRow.customerContacts[0];
      if (contact.mobile) data.push({Label: "Mobile", Value: contact.mobile});
      if (contact.land) data.push({Label: "Land Phone", Value: contact.land});
      if (contact.email) data.push({Label: "Email", Value: contact.email});
      if (contact.emergencyContactNumber) data.push({Label: "Emergency Contact", Value: contact.emergencyContactNumber});
      if (contact.addressLine1) data.push({Label: "Address", Value: `${contact.addressLine1}${contact.addressLine2 ? ', ' + contact.addressLine2 : ''}`});
      if (contact.city) data.push({Label: "City", Value: contact.city});
      if (contact.country) data.push({Label: "Country", Value: contact.country});
      if (contact.postalCode) data.push({Label: "Postal Code", Value: contact.postalCode});
    }

    data.push({Label: "Description", Value: this.selectedRow.description});
    data.push({Label: "Table", Value: tables});

    this.dataServer.sendData(data);

  }

  /**
   * Configures the view to modify an existing customer's details by populating the form with the given customer's data
   * and adjusting view visibility states.
   *
   * @param {Customer} element The customer object containing the data to be loaded into the modification form.
   * @return {void}
   */
  loadCustomerModifyView(element: Customer): void {
    this.fillForm(element);
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;

  }

  /**
   * Sets the current view of the application to the specified view type.
   *
   * @param {'records' | 'profiles' | 'form'} view - The type of view to set.
   *        Accepts one of the following options:
   *        'records' - Enables the record view.
   *        'profiles' - Enables the profile detail view.
   *        'form' - Enables the form view.
   * @return {void} This method does not return any value.
   */
  setView(view: 'records' | 'profiles' | 'form'): void {
    this.enableRecordView = view === 'records';
    this.enableDetailView = view === 'profiles';
    this.enableForm = view === 'form';
    this.clearTableSelection();
    this.loadTable('');
  }

  //==================================Create a Passenger===========================================//

  /**
   * Creates a new passenger object based on the data from the provided passenger form.
   *
   * @param {FormGroup} passengerForm - The form group containing passenger details such as code, name, age, relationship, resident type, and passenger type.
   * @return {Passenger} A new passenger object populated with the provided details.
   * @throws {Error} Throws an error if the passenger form contains invalid or incomplete data.
   */
  createNewPassenger(passengerForm: FormGroup): Passenger {
    const {code, name, age, relationship, residenttype, paxtype} = passengerForm.value;
    if (!code && !name && !age && !relationship && !residenttype && !paxtype) {
      this.operationFeedBackService.showMessage('Failed', 'Invalid passenger form data');
      throw new Error();
    }

    const newPassenger = new Passenger();
    newPassenger.code = this.passengerDetailsForm.controls['code'].value;
    newPassenger.name = name;
    newPassenger.age = age;
    newPassenger.relationship = relationship;
    newPassenger.residenttype = residenttype;
    newPassenger.paxtype = paxtype;
    return newPassenger;
  }

  /**
   * Updates the passenger data at the specified index with newly created modified passenger details.
   * Ensures no duplicate passenger data exists at the index.
   * Resets the passenger details form after the update.
   *
   * @param {number} index - The index of the passenger in the `storePassengers` array to be updated.
   * @return {void} Does not return any value.
   */
  addModifiedPassenger(index: number): void {
    this.isEnableInnerDataModify = false;
    let modifiedPassenger = this.createNewPassenger(this.passengerDetailsForm);
    modifiedPassenger.id = this.modifiedDataId;
    const existingValues = this.checkExistingPassenger(modifiedPassenger, index);
    if (existingValues !== '') {
      this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
      return;
    }
    this.storePassengers[index] = modifiedPassenger;
    this.storePassengers = [...this.storePassengers];
    this.modifiedDataIndex = -1;
    this.passengerDetailsForm.reset();
    this.generatePassengerCode(this.isEnableInnerDataModify || this.isFillForm ? this.customer.code : this.nextCustomerCode);
  }

  /**
   * Checks if a new passenger's name or code already exists in the store,
   * excluding the passenger at the specified index if provided.
   *
   * @param {Passenger} newPassenger - The passenger object containing the name and code to be checked.
   * @param {number} [index] - Optional index of the passenger to be excluded from the check.
   * @return {string} A message indicating if the passenger name or code already exists, or an empty string if no conflicts are found.
   */
  checkExistingPassenger(newPassenger: Passenger, index?: number): string {
    let existingValue = "";

    // Filter out the airport at the given index
    const filteredPassengers = this.storePassengers.filter((_, i) => i !== index);
    // Check if name or code already exists in filtered data
    const codeExist = filteredPassengers.find(
      passenger => passenger.code.trim().toLowerCase() === newPassenger.code.trim().toLowerCase()
    );
    const nameExist = filteredPassengers.find(
      passenger => passenger.name.trim().toLowerCase() === newPassenger.name.trim().toLowerCase()
    );
    if (nameExist) {
      existingValue += "<br>Passenger name already exists";
    }
    if (codeExist) {
      existingValue += "<br>Passenger code already exists";
    }
    return existingValue;
  }

  /**
   * Modifies the details of a specified passenger based on the provided event object.
   * Updates related dropdown selections and patches the passenger details form with the modified data.
   * Additionally triggers form validation.
   *
   * @param {Object} event - The event containing details about the passenger to be modified.
   * @param {number} event.index - The index of the passenger in the passenger list.
   * @param {Object} event.modifiedItem - The item representing the modified passenger details.
   * @return {void} This method does not return a value.
   */
  modifyPassenger(event: { index: number; modifiedItem: any }): void {
    this.isEnableInnerDataModify = true;
    this.modifiedDataIndex = event.index;
    this.modifiedDataId = event.modifiedItem.id;
    const passenger = this.storePassengers[event.index];
    passenger.relationship = this.customerRelationships.find(relationship => relationship.id === passenger.relationship?.id) ?? passenger.relationship;
    passenger.residenttype = this.residentTypes.find(residentType => residentType.id === passenger.residenttype?.id) ?? passenger.residenttype;
    passenger.paxtype = this.paxTypes.find(paxType => paxType.id === passenger.paxtype?.id) ?? passenger.paxtype;
    this.passengerDetailsForm.patchValue(passenger);
    this.formValidationService.createForm(this.passengerDetailsForm, this.storePassengers[event.index], this.storePassengers[event.index]);
  }

  /**
   * Adds a new passenger based on the data entered in the passenger details form.
   * Handles scenarios for modifying existing passengers or creating completely new entries.
   * Validates for duplicate passenger entries before adding to the storage.
   *
   * @return {void} Does not return a value.
   */
  addNewPassenger() : void {
    if (this.isEnableInnerDataModify) {
      this.addModifiedPassenger(this.modifiedDataIndex);
    } else {
      let newPassenger = this.createNewPassenger(this.passengerDetailsForm);
      const existingValues = this.checkExistingPassenger(newPassenger);
      if (existingValues !== '') {
        this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
        return;
      }
      this.storePassengers = [...this.storePassengers, newPassenger];
      this.passengerDetailsForm.reset();
      this.generatePassengerCode(this.isEnableInnerDataModify || this.isFillForm ? this.customer.code : this.nextCustomerCode);
    }
  }

  /**
   * Clears the passenger data by resetting the form and generating a new passenger code.
   * Adjusts the passenger code generation based on the state of the `isEnableInnerDataModify` and `isFillForm` flags.
   *
   * @return {void} Does not return a value.
   */
  clearPassenger(): void {
    this.passengerDetailsForm.reset();

    if (this.isEnableInnerDataModify || this.isFillForm) {
      this.generatePassengerCode(this.customer.code);
    } else {
      this.generatePassengerCode(this.nextCustomerCode);
    }
    this.isEnableInnerDataModify = false;
    // this.modifiedDataIndex = -1;
  }

  //==================================================================================================================//

  /**
   * Retrieves and processes customer data from the provided form groups, consolidates the data,
   * and returns a Customer object.
   *
   * @param clientForm - The form group containing general customer information.
   * @param clientContactForm - The form group containing customer contact information.
   * @param clientIdentityForm - The form group containing customer identity information.
   * @return A Customer object constructed from the provided form groups.
   */
  private getCustomerData(clientForm: FormGroup, clientContactForm: FormGroup, clientIdentityForm: FormGroup): Customer {
    const clientFormValues = clientForm.getRawValue();
    const clientContactFormValues = clientContactForm.getRawValue();
    const clientIdentityFormValues = clientIdentityForm.getRawValue();

    clientFormValues.user = {
      id: clientFormValues.user.id,
      username: clientFormValues.user.username,
    }
    this.customer = clientFormValues;
    console.log(this.customer.passengers);
    this.customerContact = clientContactFormValues;
    this.customerIdentity = clientIdentityFormValues;

    this.customer.customerContacts = [];
    this.customer.customerIdentities = [];

    this.customer.customerContacts.push(this.customerContact);
    this.customer.customerIdentities.push(this.customerIdentity);

    return this.customer;
  }

  /**
   * Saves customer data after validating the required forms and fields. If validation errors are found,
   * an error message is displayed. If the data is valid, shows a confirmation dialog before proceeding
   * to save the customer data. Handles the response and provides feedback based on the server outcome.
   *
   * @return {void} This method does not return a value. It performs operations such as validation, displaying feedback,
   * saving data, and handling the response.
   */
  save(): void {

    let errors = this.formValidationService.getErrors(this.clientForm, ['description']);
    const contactDetailsErrors = this.formValidationService.getErrors(this.clientContactDetailsForm, ['land'] );
    const identityErrors = this.formValidationService.getErrors(this.clientIdentityForm, ['land', 'passport', 'passportExpiryDate', 'passportNo']);

    if (contactDetailsErrors) {
      errors += '<br>' + contactDetailsErrors;
    }
    if (identityErrors) {
      errors += '<br>' + identityErrors;
    }
    if (errors) {
      this.operationFeedBackService.showErrors("Customer", "Add", errors);
      return;
    }

    const toSaveCustomer = this.getCustomerData(this.clientForm, this.clientContactDetailsForm, this.clientIdentityForm);
    const customerData = this.operationFeedBackService.formatObjectData(toSaveCustomer, ["code", "fullname", "callingname"]);

    this.operationFeedBackService.showConfirmation("Customer", "Add", customerData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<Customer>(ApiEndpoints.paths.customers, toSaveCustomer)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedBackService.showStatus("Customer", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
                this.operationFeedBackService.showErrors("Customer", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the customer data based on the input forms and displays the necessary feedback to the user.
   *
   * The method performs validation on multiple forms, gathers potential errors, and displays them.
   * If validation passes, it gathers updated customer data, confirms the action via the user,
   * and proceeds with the update operation. It then handles the server response and finalizes the update process.
   *
   * @return {void} No return value. The method executes the update operation and manages interactions with the user and the backend.
   */
  update(): void {
    let errors = this.formValidationService.getErrors(this.clientForm, ['description']);
    const contactDetailsErrors = this.formValidationService.getErrors(this.clientContactDetailsForm, ['land'] );
    const identityErrors = this.formValidationService.getErrors(this.clientIdentityForm, ['land', 'passport', 'passportExpiryDate', 'passportNo']);

    if (contactDetailsErrors) {
      errors += '<br>' + contactDetailsErrors;
    }
    if (identityErrors) {
      errors += '<br>' + identityErrors;
    }

    if (errors) {
      this.operationFeedBackService.showErrors("Customer", "Update", errors);
      return;
    }

    const toUpdateCustomer = this.getCustomerData(this.clientForm, this.clientContactDetailsForm, this.clientIdentityForm);
    toUpdateCustomer.id = this.oldCustomer.id;
    toUpdateCustomer.customerContacts[0].id = this.oldCustomerContact.id;
    toUpdateCustomer.customerIdentities[0].id = this.oldCustomerIdentity.id;
    let updates = this.formValidationService.getUpdates(this.clientForm);
    const contactDetailsUpdates = this.formValidationService.getUpdates(this.clientContactDetailsForm);
    const identityUpdates = this.formValidationService.getUpdates(this.clientIdentityForm);

    if (contactDetailsUpdates) {
      updates += '<br>' + contactDetailsUpdates;
    }

    if (identityUpdates) {
      updates += '<br>' + identityUpdates;
    }

    this.operationFeedBackService.showConfirmation('Customer', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.update<Customer>(ApiEndpoints.paths.customers, toUpdateCustomer)
            .subscribe({
              next: (response) => {

                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }

                this.operationFeedBackService.showStatus("Customer", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {

                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);

                this.operationFeedBackService.showErrors("Customer", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes the currently selected customer.
   * This method confirms the user's intent, sends a delete request to the server,
   * and provides feedback on the success or failure of the operation through appropriate notifications.
   *
   * @return {void} Does not return any value.
   */
  delete(): void {

    const customerData = this.operationFeedBackService.formatObjectData(this.customer, ['callingname']);
    this.operationFeedBackService.showConfirmation('Customer', 'Delete', customerData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.customers, this.customer.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }

                this.operationFeedBackService.showStatus("Customer", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
                this.operationFeedBackService.showErrors('Customer', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the form values associated with specific fields and provides appropriate feedback to the user.
   * If there are no values to clear, an informational message is displayed.
   * If there are values to clear, the user is prompted with a confirmation dialog.
   * Upon confirmation, the form values are reset and options are reloaded.
   *
   * @return {void} Does not return any value.
   */
  clear(): void {

    const hasValue = this.operationFeedBackService.hasAnyFormValue(this.clientForm, ['user', 'code']);

    if (!hasValue) {
      this.operationFeedBackService.showMessage('Clear Customer', 'Nothing to clear...!');
      return;
    }

    this.operationFeedBackService.showConfirmation('Customer', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
      })
  }

  /**
   * Clears the current table selection by resetting the selected row to null,
   * disabling the edit mode, and sending a null value to the data server.
   *
   * @return {void} This method does not return a value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets the stepper to its initial state and reloads form options.
   * This method should be used to reinitialize the stepper and associated inputs or configurations.
   *
   * @return {void} No value is returned when the method is executed.
   */
  resetStepper(): void {
    this.resetAndReloadFormOptions();
  }

  /**
   * Resets and reloads form options while initializing all relevant form and state properties.
   *
   * This method performs the following operations:
   * - Resets flags and selections related to the form.
   * - Clears any stored passenger details.
   * - Reinitializes customer and user data.
   * - Resets stepper and form validation for various forms.
   * - Configures form buttons to default states.
   *
   * @return {void} Does not return a value.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.isFillForm = false;
    this.stepper.reset();
    this.storePassengers = [];
    this.getCustomerCode();
    this.loadTable('');
    this.setLoggedInUser();
    this.formValidationService.createForm(this.clientForm);
    this.formValidationService.createForm(this.clientIdentityForm);
    this.formValidationService.createForm(this.clientContactDetailsForm);
    this.formValidationService.createForm(this.passengerDetailsForm);
    this.enableButtons(true, false, false);

    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Generates a passenger code based on the provided customer code and current number of passengers.
   *
   * @param {string} customerCode - The code associated with the customer for which the passenger code is generated.
   * @return {void} This method does not return a value but updates the form control with the generated passenger code.
   */
  generatePassengerCode(customerCode: string): void {
    const nextPassengerNumber = this.storePassengers.length + 1;
    const passengerCode = this.createPassengerCode(customerCode, nextPassengerNumber);
    this.passengerDetailsForm.controls['code'].patchValue(passengerCode);
  }

  /**
   * Removes a passenger from the list and updates relevant data, including the next passenger code.
   *
   * @param {Object} event The event information containing details about the passenger removal.
   * @param {number} event.index The index of the passenger to be removed.
   * @param {number} event.dataSize The current size of the passenger data.
   * @param {any} event.removedItem The data of the removed passenger.
   * @return {void} This method does not return any value.
   */
  removePassenger(event: { index: number; dataSize: number, removedItem: any }): void {
    this.storePassengers.splice(event.index, 1);
    const nextPassengerNumber = event.dataSize === 0 ? 1 : event.dataSize + 1;
    const passengerCode = this.createPassengerCode(this.isEnableInnerDataModify || this.isFillForm ? this.customer.code : this.nextCustomerCode, nextPassengerNumber);
    this.passengerDetailsForm.controls['code'].patchValue(passengerCode);
  }

  /**
   * Generates a unique passenger code by combining the customer code, a prefix,
   * the last two digits of the current year, and a zero-padded passenger number.
   *
   * @param {string} customerCode - The code that identifies the customer.
   * @param {number} passengerNumber - The passenger's sequence number
   * to include in the code.
   * @return {string} A string representing the generated passenger code.
   */
  private createPassengerCode(customerCode: string, passengerNumber: number): string {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const paddedNumber = passengerNumber.toString().padStart(4, '0');
    return `${customerCode}_PAX_${currentYear}_${paddedNumber}`;
  }

  /**
   * Automatically generates a list of dummy passenger objects and stores them.
   * The generated passengers will have default attributes such as age, resident type,
   * pax type, and relationship as specified in the method.
   *
   * @return {void} This method does not return any value. It sets the generated dummy passenger objects to the `storePassengers` property.
   */
  autoGenerateDummyPassengers(): void {
    const passengers = [];
    const defaultPassengerAge = 30;
    const defaultPassengerResidentType = this.residentTypes[0];
    const defaultPassengerPaxType = this.paxTypes[0];
    const defaultPassengerRelationship = this.customerRelationships[3];
    for (let i = 1; i <= this.dummyPassengerCount; i++) {
      const passenger = new Passenger();
      passenger.code = `Dummy-PAX_${i}`;
      // passenger.code = this.createPassengerCode(this.isEnableInnerDataModify || this.isFillForm ? this.customer.code : this.nextCustomerCode, i);
      passenger.name = `Dummy Passenger ${i}`;
      passenger.age = defaultPassengerAge;
      passenger.relationship = defaultPassengerRelationship;
      passenger.residenttype = defaultPassengerResidentType;
      passenger.paxtype = defaultPassengerPaxType;
      passengers.push(passenger);
    }
    this.storePassengers = passengers;
  }

  /**
   * Clears all dummy passengers by resetting the relevant properties and form fields.
   * It also regenerates the passenger code based on the current conditions.
   *
   * @return {void} No return value.
   */
  clearAllDummies(): void {
    this.storePassengers = [];
    this.dummyPassengerCount = 0;
    this.clientForm.get('passengers')?.reset();
    this.generatePassengerCode(this.isEnableInnerDataModify || this.isFillForm ? this.customer.code : this.nextCustomerCode);
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
  }
}
