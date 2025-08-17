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
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Employee} from "../../../entity/employee";
import {Designation} from "../../../entity/designation";
import {EmployeeStatus} from "../../../entity/employee-status";
import {Observable, Subscription} from "rxjs";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {Supplier} from "../../../entity/supplier";
import {SupplierStatus} from "../../../entity/supplier-status";
import {SupplierType} from "../../../entity/supplier-type";
import {User} from "../../../entity/user";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {AvFilePicker} from "@avoraui/av-file-picker";

@Component({
  selector: 'app-supplier',
  standalone: true,
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
    MatNoDataRow,
    MatColumnDef,
    MatHeaderCellDef,
    MatAutocompleteTrigger,
    MatAutocomplete,
    AsyncPipe,
    AvFilePicker
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit, OnDestroy {

  columns: string[] = ['photo', 'brno', 'name', 'suppliertype', 'supplierstatus', 'modify/view'];
  headers: string[] = ['Photo', 'Number', 'Supplier', 'Type', 'Status', 'Modify / View'];

  columnsDetails: string[] = ['photo', 'brno', 'name'];
  headersDetails: string[] = ['Photo', 'BRNo', 'Name'];

  statusColors = [
    {value: "Active", color: {background: "#dcfce7", text: "#12512b"}},
    {value: "Inactive", color: {background: "#fcdcdc", text: "#601515"}},
    {value: "Blacklisted", color: {background: "#fb5656", text: "#400707"}}
  ];

  public serverSearchForm!: FormGroup;
  public supplierForm!: FormGroup;
  isLinear = false;
  blinkButton: boolean = false;
  supplier!: Supplier;
  activeUserList: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  oldSupplier!: Supplier;
  pdfDtls: boolean = true;

  selectedRow: any;
  @ViewChild('stepper') stepper!: MatStepper;

  suppliers: Array<Supplier> = [];
  data!: MatTableDataSource<Supplier>;
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

  nextSupplierBrNumber: string = "";
  supplierStatuses: Array<SupplierStatus> = [];
  supplierTypes: Array<SupplierType> = [];

  private dataSubscriber$ = new Subscription();

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
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
  ) {

    this.supplierForm = this.formBuilder.group({
      user: new FormControl('', [Validators.required],),
      brno: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      photo: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      land: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipcode: new FormControl('', [Validators.required]),
      bankAccount: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      suppliertype: new FormControl('', [Validators.required]),
      supplierstatus: new FormControl('', [Validators.required]),
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
  }

  /**
   * Initializes the necessary data and configurations for the supplier management module.
   * This includes loading filter fields, setting up breadcrumb navigation, initializing views, fetching data from services,
   * and enabling or disabling buttons based on specific conditions.
   *
   * @return {void} Does not return any value.
   */
  initialize(): void {

    this.loadSupplierFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.createView();
    this.getSupplierBrNumber();

    this.dataSubscriber$.add(
      this.dataService.getData<SupplierType>(ApiEndpoints.paths.supplierTypes).subscribe({
        next: (types) => {
          this.supplierTypes = types;
        },
        error: (error) => {
          console.error("Error fetching SupplierTypes : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<SupplierStatus>(ApiEndpoints.paths.supplierStatuses).subscribe({
        next: (status) => {
          this.supplierStatuses = status;
        },
        error: (error) => {
          console.error("Error fetching SupplierStatuses : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUserList = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUserList, this.supplierForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching ActiveUserList : " + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.supplierForm, this.oldSupplier, this.supplier, 'supplier', ['brno'], ['photo', 'description']);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Retrieves and displays the username of a provided user object.
   * The method uses the `autoCompleteDataFilterService` to fetch
   * the display value based on the specified property path.
   *
   * @param {any} user - The user object containing data to extract and display the username.
   * @returns {string} - The formatted username extracted from the user object.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Initializes and configures the view by setting default values for the image URL,
   * enabling the record view, enabling input for the search field, and loading the initial table data.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.loadTable("");

    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user in the application by retrieving the user information
   * through the authentication service.
   *
   * @return {void} Does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.supplierForm, 'user');
  }

  /**
   * Enables or disables buttons based on the passed boolean values.
   *
   * @param {boolean} add - Determines whether the "Add" button should be enabled.
   * @param {boolean} upd - Determines whether the "Update" button should be enabled.
   * @param {boolean} del - Determines whether the "Delete" button should be enabled.
   * @return {void} This method does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of the button permissions based on the user's authority levels
   * for specific operations related to the 'supplier' entity. This method sets the
   * following state variables:
   *
   * - `hasInsertAuthority`: Determines if the user has the authority to insert.
   * - `hasUpdateAuthority`: Determines if the user has the authority to update.
   * - `hasDeleteAuthority`: Determines if the user has the authority to delete.
   *
   * @return {void} Does not return any value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('supplier', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('supplier', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('supplier', 'delete');
  }

  /**
   * Loads data into the table based on the provided query string.
   * Fetches supplier data from the API and populates the table while handling
   * the loading states and potential errors during the data retrieval process.
   *
   * @param {string} query - The query string used to fetch the supplier data.
   * @return {void} This method does not return anything.
   */
  loadTable(query: string): void {

    this.dataSubscriber$.add(
      this.dataService.getData<Supplier>(ApiEndpoints.paths.suppliers, query).subscribe({
        next: (suppliers) => {
          this.suppliers = suppliers;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.suppliers);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Loads and initializes the supplier filter fields by excluding certain fields
   * and formatting the remaining fields for use in filters.
   *
   * @return {void} This method does not return a value.
   */
  loadSupplierFilterFields(): void {
    const supplier = new Supplier();
    this.filterFields = Object.keys(supplier)
      .filter(value => !['id', 'photo'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given field by capitalizing the first letter of each word.
   *
   * @param {string} field - The input string to format.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Updates the search selection options based on the selected filter field value.
   *
   * This method determines the type of search field to display (select, input, or date)
   * and sets the corresponding flag (`isSearchFiledSelect`, `isSearchFiledInput`, `isSearchFiledDate`).
   * It also retrieves the appropriate options for a select field if applicable,
   * using predefined mappings for specific filter field values.
   *
   * @return {void} Does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['suppliertype', 'supplierstatus', 'user'];
    const dateFields = ['createdon', 'updatedon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUserList,
      suppliertype: this.supplierTypes,
      supplierstatus: this.supplierStatuses,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the table data based on the user input provided through the event target.
   *
   * @param {Event} event - The event object triggered by a user action, typically associated with an input field.
   *                      The event target is expected to be an HTMLInputElement containing the filter value.
   * @return {void} This method does not return any value but updates the data filter predicate and applies the filter.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (supplier: Supplier, filter: string) => {
      return (
        filterValue == null ||
        supplier.brno.toLowerCase().includes(filterValue) ||
        supplier.name.toLowerCase().includes(filterValue) ||
        supplier.mobile.toLowerCase().includes(filterValue) ||
        supplier.email.toLowerCase().includes(filterValue) ||
        supplier.suppliertype.name.toLowerCase().includes(filterValue) ||
        supplier.supplierstatus.name.toLowerCase().includes(filterValue))
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a specific row by assigning the provided Employee object to the selectedRow property
   * and logs the selected row to the console.
   *
   * @param {Employee} element - The Employee object representing the row to be selected.
   * @return {void} Does not return any value.
   */
  selectRow(element: Employee): void {
    this.selectedRow = element;
    console.log(this.selectedRow);
  }

  /**
   * Resets the search query to its default state by creating a new instance of URLSearchParams.
   *
   * @return {void} This method does not return anything.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search based on form input values and constructs a query string for server-side filtering.
   * The method processes various input fields such as search text, select dropdown, filter field, and date ranges.
   * It then appends the constructed query string to load filtered data into the table.
   * If no valid filter field is provided, a feedback message is displayed.
   *
   * @return {void} No return value. The results are directly processed and loaded into the table or a feedback message is shown.
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
   * Resets the fields in the server search query parameters form to their default values.
   *
   * @return {void} This method does not return a value.
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
   * Clears the search form and resets related search states. Prompts for confirmation
   * before clearing if there are any values present in the search form.
   *
   * @return {void} This method does not return a value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Supplier', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Populates the form with the provided supplier data and performs related initialization.
   *
   * @param {Supplier} supplier - The supplier object containing the data to be used for populating the form.
   * @return {void} This method does not return any value.
   */
  fillForm(supplier: Supplier): void {
    this.enableButtons(false, true, true);
    this.selectedRow = supplier;
    this.supplier = JSON.parse(JSON.stringify(supplier));
    this.oldSupplier = JSON.parse(JSON.stringify(supplier));

    this.supplier.user = this.activeUserList.find(user => user.id === this.supplier.user?.id) ?? this.supplier.user;
    this.supplier.suppliertype = this.supplierTypes.find(type => type.id === this.supplier.suppliertype?.id) ?? this.supplier.suppliertype;
    this.supplier.supplierstatus = this.supplierStatuses.find(status => status.id === this.supplier.supplierstatus?.id) ?? this.supplier.supplierstatus;

    this.pdfDtls = true;
    this.supplierForm.patchValue(this.supplier);
    this.formValidationService.createForm(this.supplierForm, this.oldSupplier, this.supplier);
    this.supplierForm.markAsPristine();
  }

  /**
   * Handles the submission of personal details from the supplier form.
   * It validates required fields and proceeds to the next step in the stepper if validation is successful.
   *
   * @param {MatStepper} stepper - The stepper instance used to navigate to the next step.
   * @return {void} This method does not return any value.
   */
  onSubmitPersonalDetails(stepper: MatStepper): void {
    const formValues = this.supplierForm.value;
    const {name, bankAccount} = formValues;
    if (name && bankAccount) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the submission of contact details and progresses to the next step if all required fields are filled.
   *
   * @param {MatStepper} stepper - The stepper control used to navigate between steps.
   * @return {void} - This method does not return a value.
   */
  onSubmitContactDetails(stepper: MatStepper): void {
    const formValues = this.supplierForm.value;
    const {mobile, land, email, address} = formValues;
    if (mobile && land && email && address) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Submits the location details if all required fields are filled and advances the stepper to the next step.
   *
   * @param {MatStepper} stepper - The stepper instance used to progress to the next step.
   * @return {void} Does not return a value.
   */
  onSubmitLocationDetails(stepper: MatStepper): void {
    const formValues = this.supplierForm.value;
    const {city, state, country, zipcode} = formValues;
    if (city && state && country && zipcode) {
      this.blinkButton = false;
      stepper.next();
    }
  }

  /**
   * Handles the final form submission or resets the form and stepper.
   *
   * @param {MatStepper} stepper - The Angular Material Stepper instance to be reset upon form validation.
   * @return {void} This method does not return any value.
   */
  onSubmitFinal(stepper: MatStepper): void {
    // Handle final form submission or reset
    if (this.supplierForm.valid) {
      stepper.reset();
    }
  }

  /**
   * Loads the supplier detail view with the provided supplier details, sets necessary state flags,
   * and sends the data to the server for display in the corresponding view.
   *
   * @param {Supplier} element - The supplier object containing details of the supplier to be displayed.
   * @return {void} This method does not return any value.
   */
  loadSupplierDetailView(element: Supplier): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;
    const data = [
      {Label: "Business Number", Value: this.selectedRow.brno},
      {Label: "Title", Value: this.selectedRow.name},
      {Label: "Name", Value: this.selectedRow.name},
      {Label: "Photo", Value: this.selectedRow.photo},
      {Label: "Address", Value: this.selectedRow.address},
      {Label: "City", Value: this.selectedRow.address},
      {Label: "State", Value: this.selectedRow.state},
      {Label: "Country", Value: this.selectedRow.country},
      {Label: "Zip Code", Value: this.selectedRow.zipcode},
      {Label: "Bank Acc", Value: this.selectedRow.bankAccount},
      {Label: "Mobile", Value: this.selectedRow.mobile},
      {Label: "Land", Value: this.selectedRow.land},
      {Label: "Email", Value: this.selectedRow.email},
      {Label: "Date Of Created", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Date Of Updated", Value: this.datePipe.transform(this.selectedRow.updatedon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Supplier Status", Value: this.selectedRow.supplierstatus.name},
      {Label: "Supplier Type", Value: this.selectedRow.suppliertype.name},
      {Label: "Description", Value: this.selectedRow.description}
    ];

    this.dataServer.sendData(data);

  }

  /**
   * Loads the supplier modification view and populates the form with the provided supplier details.
   * Disables other views and enables the form-specific view.
   *
   * @param {Supplier} element - The supplier object containing details to populate in the modification form.
   * @return {void} Does not return a value.
   */
  loadSupplierModifyView(element: Supplier): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Updates the current view of the application to the specified view type
   * and manages related settings and actions accordingly.
   *
   * @param {'records' | 'profiles' | 'form'} view - The type of view to set.
   *        'records' enables the record view, 'profiles' enables the profile
   *        view, and 'form' enables the form view.
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
   * Generates a user icon URI based on the provided value. If the value is null or undefined,
   * it returns the default image URL.
   *
   * @param {string | null | undefined} value - The encoded string to generate a user icon URI,
   * or null/undefined to return the default image URL.
   * @return {string} The generated user icon URI or the default image URL.
   */
  generateUserIcon(value: string | null | undefined): string {
    if (!value) {
      return this.defaultImageURL;
    }
    return atob(value);
  }

  /**
   * Retrieves the next supplier Business Registration (BR) number from the server
   * and updates the supplier form control with the retrieved value.
   *
   * @return {void} This method does not return a value.
   */
  getSupplierBrNumber(): void {
    this.dataService.getRefNumber(ApiEndpoints.paths.supplierBrNumber, 'SupplierBrNumber').subscribe({
      next: (data) => {
        this.nextSupplierBrNumber = data.SupplierBrNumber;
        this.supplierForm.controls['brno'].setValue(this.nextSupplierBrNumber);
      },
      error: (err) => {
        console.error('Error fetching employee-number:', err);
      }
    });
  }

  /**
   * Adds a new supplier based on the form data.
   * Validates the form, formats the data, and sends an API request to save the supplier.
   * Displays relevant feedback to the user based on the operation's success or failure.
   *
   * @return {void} Does not return a value. Executes the necessary operations and provides user feedback.
   */
  add(): void {
    const formValues = this.supplierForm.getRawValue();

    const errors = this.formValidationService.getErrors(this.supplierForm, ['photo', 'land']);
    if (errors) {
      this.operationFeedbackService.showErrors("Supplier", "Save", errors);
      return;
    }
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    this.supplier = formValues;
    const employeeData = this.operationFeedbackService.formatObjectData(this.supplier, ["brno", "name"]);

    this.operationFeedbackService.showConfirmation("Supplier", "Save", employeeData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<Supplier>(ApiEndpoints.paths.suppliers, this.supplier)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedbackService.showStatus("Supplier", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Supplier", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the supplier information by validating the form, preparing the data, and sending the update request to the server.
   * The process includes form validation, confirmation dialog display, sending the update request, and handling success or error responses.
   *
   * @return {void} Does not return any value. Executes a series of steps to handle the update process, including validation, confirmation, server interaction, and feedback display.
   */
  update(): void {
    // 1. Form Validation
    const errors = this.formValidationService.getErrors(this.supplierForm, ['photo', 'land', 'description']);
    if (errors) {
      this.operationFeedbackService.showErrors('Supplier', 'Update', errors);
      return;  // Exit if there are errors
    }

    // 2. Prepare Employee Data
    const formValues = this.supplierForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    this.supplier = formValues;  // Get form values
    this.supplier.id = this.oldSupplier.id;  // Maintain the ID
    const updates = this.formValidationService.getUpdates(this.supplierForm);

    // 3. Show Confirmation Dialog (First Observable)
    this.operationFeedbackService.showConfirmation('Supplier', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {  // When dialog closes, we get true or false
          if (!isConfirmed) return;  // If user cancels, stop here

          // 4. Update Employee (Second Observable)
          this.dataService.update<Supplier>(ApiEndpoints.paths.suppliers, this.supplier)
            .subscribe({
              next: (response) => {  // When update completes successfully
                // Handle the response
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Supplier", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {  // If update fails
                // Handle error response
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                // Show error message
                this.operationFeedbackService.showErrors("Supplier", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes a supplier and performs associated feedback operations.
   *
   * This method formats the supplier data, shows a confirmation dialog to confirm
   * deletion, and if confirmed, initiates the delete operation through the data service.
   * It handles both successful and failed responses, updating the UI and providing
   * user feedback accordingly.
   *
   * @return {void} No return value.
   */
  delete(): void {

    const employeeData = this.operationFeedbackService.formatObjectData(this.supplier, ['brno']);
    this.operationFeedbackService.showConfirmation('Supplier', 'Delete', employeeData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.suppliers, this.supplier.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Supplier", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Supplier', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the supplier form if there are values in the form fields other than 'brno'.
   * If the form fields are empty, it will show a message indicating there is nothing to clear.
   * If there are values, a confirmation dialog will be displayed. Upon confirmation, it resets the form and reloads the form options.
   *
   * @return {void} This method does not return any value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.supplierForm, ['user', 'brno']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Supplier', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Supplier', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
      })
  }

  /**
   * Clears the current table selection by disabling edit mode,
   * resetting the selected row, and sending a null value to the data server.
   *
   * @return {void} No return value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets the stepper to its initial state and reloads form options.
   *
   * @return {void} Does not return a value.
   */
  resetStepper(): void {
    this.resetAndReloadFormOptions();
  }

  /**
   * Resets the form options and reloads required data for the form.
   * The method performs the following actions:
   * - Resets internal flags and selected rows.
   * - Resets the stepper component.
   * - Fetches supplier business registration number.
   * - Reloads the data table with default or specified criteria.
   * - Reinitializes the supplier form using the form validation service.
   * - Adjusts the button states appropriately.
   * - Enables navigation controls for view and record modes.
   *
   * @return {void} This method does not return any value.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.stepper.reset();
    this.setLoggedInUser();
    this.getSupplierBrNumber();
    this.loadTable('');
    this.formValidationService.createForm(this.supplierForm);
    this.enableButtons(true, false, false);

    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Sets the color class designation based on the provided designation object.
   *
   * @param {Designation} designation - The designation object containing the role name.
   * @return {string} - The CSS class name corresponding to the designation's role or a default class if not found.
   */
  setDesignationColor(designation: Designation): string {
    const roleColors: Record<string, string> = {
      admin: 'designation-cell'
    };
    const colorClass = roleColors[designation.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Sets the appropriate CSS class name based on the given employee status.
   *
   * @param {EmployeeStatus} status - The status of the employee, which determines the CSS class.
   * @return {string} The CSS class name corresponding to the given employee status. If the status does not match any predefined status, returns 'default-cell'.
   */
  setStatusColor(status: EmployeeStatus): string {
    const statusColor: Record<string, string> = {
      active: 'active-cell',
      inactive: 'inactive-cell',
      blacklisted: 'blacklisted-cell',
    }
    const colorClass = statusColor[status.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
