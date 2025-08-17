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
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {User} from "../../../entity/user";
import {debounceTime, map, Observable, startWith, Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {SupplierStatus} from "../../../entity/supplier-status";
import {Supplier} from "../../../entity/supplier";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {SupplierPayment} from "../../../entity/supplier-payment";
import {SupplierType} from "../../../entity/supplier-type";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {SupplierPaymentInfo} from "../../../entity/supplier-payment-info";
import {PaymentStatus} from "../../../entity/payment-status";
import {SupplierPaymentItem} from "../../../entity/supplier-payment-item";
import {AvNotificationService} from "@avoraui/av-notifications";

@Component({
  selector: 'app-supplier-payment',
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
    MatSuffix,
    MatTable,
    ReactiveFormsModule,
    MatColumnDef,
    MatHeaderCellDef,
    NgClass,
    MatNoDataRow,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatDatepicker,
    MatDatepickerInput
  ],
  templateUrl: './supplier-payment.component.html',
  styleUrl: './supplier-payment.component.css',
  standalone: true,
})
export class SupplierPaymentComponent implements OnInit, OnDestroy {

  columns: string[] = ['payment-code', 'supplier', 'date', 'amount-details', 'paymentstatus', 'modify/view'];
  headers: string[] = ['Payment Code', 'Supplier', 'Date', 'Amount Details', 'Payment Status', 'Modify / View'];

  columnsDetails: string[] = ['code', 'customer', 'date'];
  headersDetails: string[] = ['Payment Code', 'Customer', 'Date'];

  public serverSearchForm!: FormGroup;
  pdfDtls: boolean = true;

  selectedRow: any;

  paymentStatuses: Array<SupplierStatus> = [];
  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;

  activeSuppliers: Array<Supplier> = [];
  filteredSupplierList!: Observable<Array<Supplier>>;

  supplierPayments: Array<SupplierPayment> = [];
  supplierTypes: Array<SupplierType> = [];
  supplierPayment!: SupplierPayment;
  oldSupplierPayment!: SupplierPayment;

  data!: MatTableDataSource<SupplierPayment>;
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

  dataSubscriber$: Subscription = new Subscription();
  private balanceCalculationSubscription: Subscription | null = null;

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

  supplierPaymentForm!: FormGroup;
  minimumPaymentDate!: Date;

  supplierPaymentCode: string = '';
  supplierPaymentDetail!: SupplierPaymentInfo;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public authService: AuthorizationManagerService,
    private breadcrumbService: BreadcrumbService,
    private operationFeedbackService: OperationFeedbackService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private formValidationService: FormValidationService,
    private avNotificationService: AvNotificationService,
  ) {

    this.supplierPaymentForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      suppliertype: new FormControl('', Validators.required),
      supplier: new FormControl(),
      code: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      previousamount: new FormControl('', Validators.required),
      paidamount: new FormControl('', Validators.required),
      balance: new FormControl('', Validators.required),
      paymentstatus: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

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
    this.supplierPaymentDetail = new SupplierPaymentInfo();
    this.minimumPaymentDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 30));
  }

  /**
   * Initializes the component by loading required data and setting up the initial state.
   *
   * This method performs the following tasks:
   * - Loads payment filter fields and configures breadcrumb based on the active route.
   * - Initializes the view and subscribes to relevant data streams to fetch active users, supplier types, and payment statuses.
   * - Filters active users using the autocomplete data filter service.
   * - Sets up form validation and initializes form states.
   * - Configures button states and enables appropriate buttons for the initial setup.
   *
   * @return {void} Does not return a value.
   */
  initialize(): void {

    this.loadPaymentFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.supplierPaymentForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<SupplierType>(ApiEndpoints.paths.supplierTypes).subscribe({
        next: (supplierTypes) => {
          this.supplierTypes = supplierTypes;
        },
        error: (error) => {
          console.error("Error fetching supplier types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<PaymentStatus>(ApiEndpoints.paths.supplierPaymentStatuses).subscribe({
        next: (supplierPaymentStatuses) => {
          this.paymentStatuses = supplierPaymentStatuses;
        },
        error: (error) => {
          console.error("Error fetching supplier statuses : " + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.supplierPaymentForm, this.oldSupplierPayment, this.supplierPayment, 'supplierPayment', ['code', 'previousamount', 'balance'], [], [['date', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);
    this.buttonStates();

  }

  /**
   * Initializes and sets up the view with default values and required data for the form and table.
   * The function sets up various UI elements, loads necessary data, and prepares the view for user interaction.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableForm = true;
    this.isSearchFiledInput = true;
    this.loadTable("");
    this.setLoggedInUser();
    this.setUpPaymentDate();
    this.loadSupplierBySupplierType();
    this.loadCustomerPaymentCode();
    this.loadSupplierPaymentDetail();
    this.setupAutomaticStatusSelection();
  }

  /**
   * Enables or disables the add, update, and delete buttons based on the provided boolean values.
   *
   * @param {boolean} add - Determines whether the add button should be enabled (true) or disabled (false).
   * @param {boolean} upd - Determines whether the update button should be enabled (true) or disabled (false).
   * @param {boolean} del - Determines whether the delete button should be enabled (true) or disabled (false).
   * @return {void} Does not return any value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the states of button-related permissions by checking the user's authority
   * for operations like insert, update, and delete on the 'supplier payment' module.
   *
   * @return {void} Does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('supplier payment', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('supplier payment', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('supplier payment', 'delete');
  }

  /**
   * Sets the logged-in user by retrieving user details using the authService.
   *
   * @return {void} No return value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.supplierPaymentForm, 'user');
  }

  /**
   * Formats and returns a displayable username string for a given user object.
   *
   * This function utilizes the `autoCompleteDataFilterService` to extract
   * and construct a human-readable username from the input user object
   * using a specific property path ('employee.callingname').
   *
   * @param {any} user - The user object containing user-specific details.
   * @returns {string} A formatted username string derived from the user object.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * A function that retrieves and displays the name of a supplier using the specified display logic.
   *
   * @param {any} supplier - The supplier object whose name is to be displayed.
   * @returns {string} The supplier's name as a string.
   */
  displaySupplierName = (supplier: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Supplier>(supplier, ['name']);
  }

  /**
   * Configures the payment date for the supplier payment form by setting the current date in 'yyyy-MM-dd' format.
   *
   * @return {void} Does not return a value.
   */
  setUpPaymentDate(): void {
    this.supplierPaymentForm.controls['date'].patchValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
  }

  /**
   * Subscribes to changes in the 'suppliertype' form control and loads supplier data based on the selected supplier type.
   *
   * The method handles three types of suppliers:
   * - 'Accommodations': Loads active accommodation suppliers.
   * - 'Transfer': Loads active transfer suppliers.
   * - Any other type: Loads a default list of suppliers.
   *
   * @return {void} This method does not return any value.
   */
  loadSupplierBySupplierType(): void {
    this.supplierPaymentForm.controls['suppliertype'].valueChanges.subscribe(value => {
      if (value) {
        if (value.name === 'Accommodations') {
          this.loadSuppliers(ApiEndpoints.paths.activeAccommSuppliersList);
        }
        else if (value.name === 'Transfer') {
          this.loadSuppliers(ApiEndpoints.paths.activeTransferSuppliersList);
        }else {
          this.loadSuppliers(ApiEndpoints.paths.suppliers);
        }
      }
    })
  }

  /**
   * Loads the suppliers from the specified endpoint and processes the data.
   *
   * @param {string} endPoint - The API endpoint to fetch the suppliers from.
   * @return {void} This method does not return any value.
   */
  loadSuppliers(endPoint: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Supplier>(endPoint).subscribe({
        next: (suppliers) => {
          this.activeSuppliers = suppliers;
          this.filteredSupplierList = this.autoCompleteDataFilterService.filterData<Supplier>(this.activeSuppliers, this.supplierPaymentForm, 'supplier', ['name']);
        },
        error: (error) => {
          console.error("Error fetching active suppliers : " + error.message);
        }
      })
    )
  }

  /**
   * Loads the customer payment code based on the value changes of the supplier field in the form.
   * Retrieves the supplier payment code from the data service and assigns it to the form control.
   *
   * @return {void} This method does not return a value.
   */
  loadCustomerPaymentCode(): void {
    this.supplierPaymentForm.controls['supplier'].valueChanges.subscribe(value => {
      if (value) {
        this.dataService.getRefNumber(ApiEndpoints.paths.supplierPaymentCode, 'supplierPaymentCode', value.brno).subscribe({
          next: (data) => {
            this.supplierPaymentCode = data.supplierPaymentCode;
            this.supplierPaymentForm.controls['code'].setValue(this.supplierPaymentCode);
          },
          error: (err) => {
            console.log('Error fetching employee-number:', err);
          }
        });
      }
    })
  }

  /**
   * Loads supplier payment details by subscribing to changes in the supplier field.
   * When a supplier is selected, it fetches the related supplier payment information
   * from the server and updates the local `supplierPaymentDetail` property.
   * Also sets up a reactive balance calculation based on the fetched balance.
   * @return {void} This method does not return any value.
   */
  loadSupplierPaymentDetail(): void {
    this.supplierPaymentForm.controls['supplier'].valueChanges.subscribe(value => {
      if (value) {
        this.dataService.getDataObject<SupplierPaymentInfo>(ApiEndpoints.paths.supplierPaymentInfo, value.brno).subscribe({
          next: (data) => {
            this.supplierPaymentDetail = data;
            this.setupReactiveBalanceCalculation(this.supplierPaymentDetail.balance);
          },
          error: (err) => {
            console.error('Error fetching employee-number:', err);
          }
        })
      }
    })
  }

  /**
   * Configures and handles the reactive balance calculation for the supplier payment form.
   * Subscribes to changes in the "paidamount" control and updates the "balance" control value based on
   * validated conditions and calculations.
   *
   * @param {any} previousBalance The initial previous balance value used to set up calculations.
   * @return {void} This method does not return any value.
   */
  private setupReactiveBalanceCalculation(previousBalance: any): void {
    // Clean up existing subscription first
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
      this.balanceCalculationSubscription = null;
    }

    const previousAmount = Number(previousBalance || 0);
    this.supplierPaymentForm.controls['previousamount'].patchValue(Number(previousAmount).toFixed(2));

    const paidAmount$ = this.supplierPaymentForm.controls['paidamount'].valueChanges;

    this.balanceCalculationSubscription = paidAmount$.pipe(
      startWith(this.supplierPaymentForm.controls['paidamount'].value || 0), // Use current form value instead of 0
      debounceTime(100), // Add debouncing to prevent rapid fire changes
      map(paid => {
        const paidValue = Number(paid || 0);

        // Get a fresh previousAmount value in case it changed
        const currentPreviousAmount = Number(this.supplierPaymentForm.controls['previousamount'].value || 0);

        // Validation: Check for negative values
        if (paidValue < 0) {
          this.avNotificationService.showFailure('Paid amount cannot be negative', {
            theme: "light"
          });
          // Reset to 0 or previous valid value
          this.supplierPaymentForm.controls['paidamount'].patchValue(0, { emitEvent: false });
          return 0;
        }

        // Validation: Check if paid amount exceeds previous amount
        if (paidValue > currentPreviousAmount) {
          this.avNotificationService.showFailure('Paid amount cannot exceed the previous balance', {
            theme: "light"
          });
          // Reset to previous amount or previous valid value
          this.supplierPaymentForm.controls['paidamount'].patchValue(currentPreviousAmount, { emitEvent: false });
          return currentPreviousAmount;
        }

        return paidValue;
      }),
      map(validPaid => {
        // Get a fresh previousAmount value again
        const currentPreviousAmount = Number(this.supplierPaymentForm.controls['previousamount'].value || 0);
        return validPaid - currentPreviousAmount;
      }),
      map(balance => balance.toFixed(2))
    ).subscribe(balance => {
      this.supplierPaymentForm.controls['balance'].patchValue(Math.abs(Number(balance)).toFixed(2));
    });

    // Add to subscriber for cleanup
    this.dataSubscriber$.add(this.balanceCalculationSubscription);
  }

  //========================================================================================================//
  /**
   * Configures automatic status selection for the payment form based on the values of balance,
   * previous amount, and paid amount controls. The method listens to changes in the balance control
   * and sets the payment status accordingly (e.g., Paid, Partial, or Pending).
   *
   * @return {void} Does not return a value. Updates the payment status control based on the logic implemented.
   */
  private setupAutomaticStatusSelection(): void {
    const balanceControl = this.supplierPaymentForm.controls['balance'];
    const previousAmountControl = this.supplierPaymentForm.controls['previousamount'];
    const paidAmountControl = this.supplierPaymentForm.controls['paidamount'];
    const statusControl = this.supplierPaymentForm.controls['paymentstatus'];

    // Listen to balance changes
    this.dataSubscriber$.add(
      balanceControl.valueChanges.subscribe(balance => {
        const balanceValue = Number(balance || 0);
        const previousAmount = Number(previousAmountControl.value || 0);
        const paidAmount = Number(paidAmountControl.value || 0);

        let selectedStatus: any;

        if (balanceValue === 0) {
          // Fully paid - no remaining balance
          selectedStatus = this.paymentStatuses.find(status =>
            status.name.toLowerCase() === 'paid'
          );
        } else if (paidAmount > 0 && balanceValue > 0) {
          // Partially paid - some amount paid but balance remains
          selectedStatus = this.paymentStatuses.find(status =>
            status.name.toLowerCase() === 'partial'
          );
        } else if (paidAmount === 0) {
          // Nothing paid yet - check if overdue or pending
          selectedStatus = this.paymentStatuses.find(status =>
            status.name.toLowerCase() === 'pending'
          );
        } else {
          // Default to pending
          selectedStatus = this.paymentStatuses.find(status =>
            status.name.toLowerCase() === 'pending'
          );
        }

        // Set the status without triggering valueChanges to avoid loops
        if (selectedStatus) {
          statusControl.patchValue(selectedStatus, { emitEvent: false });
        }
      })
    );
  }

  //========================================================================================================//

  /**
   * Loads data into the table based on the given query string and updates the component's state accordingly.
   *
   * @param {string} query - The query string to filter or fetch the data from the server.
   * @return {void} Does not return any value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<SupplierPayment>(ApiEndpoints.paths.supplierPayments, query).subscribe({
        next: (supplierPayments) => {
          this.supplierPayments = supplierPayments;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.supplierPayments);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Loads and formats the payment filter fields by extracting keys from the SupplierPayment object,
   * excluding specific keys and applying formatting. The result is stored in the filterFields property.
   *
   * @return {void} This method does not return a value.
   */
  loadPaymentFilterFields(): void {
    const supplierPayment = new SupplierPayment();
    this.filterFields = Object.keys(supplierPayment)
      .filter(value => !['id', 'supplierpaymentitems'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a string by capitalizing the first letter of each word.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with the first letter of each word capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Configures and loads the appropriate search select options based on the selected filter field value.
   *
   * Updates class properties `isSearchFiledSelect`, `isSearchFiledInput`, and `isSearchFiledDate`
   * to determine the UI state applicable for the selected search field. It also populates the `searchSelectOptions`
   * property with the corresponding options for fields like payment status, user, or supplier.
   *
   * @return {void} This method does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['paymentstatus', 'user', 'supplier'];
    const dateFields = ['date'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      paymentstatus: this.paymentStatuses,
      user: this.activeUsers,
      supplier: this.activeSuppliers,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the data in a table based on the input provided in the event.
   * Updates the filter predicate and applies the filter to the dataset.
   *
   * @param {Event} event - The event triggered by user input, typically from an input element, containing the filter value.
   * @return {void} This method does not return any value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (supplierPayment: SupplierPayment, filter: string) => {
      return (
        filterValue == null ||
        supplierPayment.code.toLowerCase().includes(filterValue) ||
        supplierPayment.supplier.name.toLowerCase().includes(filterValue) ||
        supplierPayment.supplier.brno.toLowerCase().includes(filterValue) ||
        supplierPayment.supplier.address.toLowerCase().includes(filterValue) ||
        supplierPayment.supplier.city.toLowerCase().includes(filterValue) ||
        supplierPayment.user.employee.callingname.toLowerCase().includes(filterValue) ||
        supplierPayment.paymentstatus.name.toLowerCase().includes(filterValue)
      )
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a specific row and assigns it to the internal selectedRow property.
   *
   * @param {SupplierPayment} element - The row object to be selected.
   * @return {void} This method does not return a value.
   */
  selectRow(element: SupplierPayment): void {
    this.selectedRow = element;
    console.log(this.selectedRow);
  }

  /**
   * Resets the current search query to an empty URLSearchParams object.
   *
   * @return {void} This method does not return any value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Performs a search operation based on the input values from the server search form.
   * Validates and structures the query parameters for the search and initiates the data load process.
   *
   * @return {void} This method does not return a value but triggers the table data to load based on the search query.
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
   * Resets the fields in the server search query parameter form to their default values.
   * It clears the values of the input, selection, and date fields in the server search form.
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
   * Clears the current search criteria if any are set and resets the search form.
   * If no search criteria are present, shows a feedback message indicating there is nothing to clear.
   * Otherwise, prompts the user for confirmation before clearing the search fields, resetting the state,
   * and reloading the table.
   *
   * @return {void} No return value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Supplier Payment', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Fills a form with the given supplier payment details.
   *
   * @param {SupplierPayment} supplierPayment - The supplier payment object containing the details to fill the form.
   * @return {void} This method does not return a value.
   */
  fillForm(supplierPayment: SupplierPayment): void {
  }

  /**
   * Loads the payment detail view for the provided supplier payment.
   *
   * @param {SupplierPayment} supplierPayment - The supplier payment object containing details to be displayed.
   * @return {void} This method does not return any value.
   */
  loadPaymentDetailView(supplierPayment: SupplierPayment): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = supplierPayment;
    const data = [
      {Label: "Title", Value: this.selectedRow.code},
      {Label: "Code", Value: this.selectedRow.code},
      {Label: "Date", Value: this.selectedRow.date},
      {Label: "Supplier", Value: this.selectedRow.supplier.name},
      {Label: "Supplier Brno", Value: this.selectedRow.supplier.brno},
      {Label: "Previous Amount", Value: this.selectedRow.previousamount},
      {Label: "Paid Amount", Value: this.selectedRow.paidamount},
      {Label: "Balance", Value: this.selectedRow.balance},
      {Label: "Payment Status", Value: this.selectedRow.paymentstatus.name}
    ];

    this.dataServer.sendData(data);

  }

  /**
   * Loads the payment modification view by setting appropriate flags to control visibility
   * and populates the form with the provided supplier payment details.
   *
   * @param {SupplierPayment} supplierPayment - The payment details to be loaded into the form.
   * @return {void} This method does not return a value.
   */
  loadPaymentModifyView(supplierPayment: SupplierPayment): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(supplierPayment);
  }

  /**
   * Sets the active view for the application.
   *
   * @param {'records' | 'profiles' | 'form'} view - The view to be set. Acceptable values are:
   * - 'records' to activate the record view.
   * - 'profiles' to activate the profile view.
   * - 'form' to activate the form view.
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
   * Clears the current table selection, disables edit mode, and notifies the data server of the cleared selection.
   *
   * @return {void} Does not return any value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Retrieves payment codes and the first payment item from a supplier payment.
   *
   * @param {SupplierPayment} value - The supplier payment object containing payment data.
   * @return {{ paymentCode: string, paymentItem: string }} An object with the payment code and the first payment item.
   */
  getPaymentCodes(value: SupplierPayment): { paymentCode: string, paymentItem: string } {
    const {code, supplierpaymentitems} = value;
    return {paymentCode: code, paymentItem: supplierpaymentitems[0].item};
  }

  /**
   * Retrieves customer details including the supplier code and supplier name based on the provided payment details.
   *
   * @param {SupplierPayment} value - The supplier payment object containing details of the payment and supplier.
   * @return {{supplierCode: string, supplierName: string}} An object containing the supplier code and supplier name.
   */
  getCustomerDetails(value: SupplierPayment): { supplierCode: string, supplierName: string } {
    const {supplier} = value;
    return {supplierCode: supplier.brno, supplierName: supplier.name};
  }

  /**
   * Retrieves the payment details including previous amount, paid amount, and balance for a given supplier payment.
   *
   * @param {SupplierPayment} value - The supplier payment object containing payment information.
   * @return {Object} An object representing the payment details with previous amount, paid amount, and balance.
   */
  getPayments(value: SupplierPayment): { previousAmount: number, paidAmount: number, balance: number } {
    const {previousamount, paidamount, balance} = value;
    return {previousAmount: previousamount, paidAmount: paidamount, balance: balance};
  }

  /**
   * Assigns a CSS class based on the provided balance value.
   *
   * @param {any} value - The input value to evaluate and determine the balance color.
   * @return {string} Returns 'negative-cell' if the balance is non-zero, otherwise returns 'positive-cell'.
   */
  setBalanceColor(value: any): string {
    const balance = Number(value);
    if (balance !== 0) {
      return 'negative-cell';
    }
    return 'positive-cell';
  }

  /**
   * Generates supplier payment data based on the information from the supplier payment form.
   *
   * @return {SupplierPayment} The generated supplier payment object containing supplier details, payment information, and payment items.
   */
  generateSupplierData(): SupplierPayment {
    let supplierPayment = new SupplierPayment();
    supplierPayment.supplierpaymentitems = [];
    const formValues = this.supplierPaymentForm.getRawValue();
    const supplierPaymentItem = new SupplierPaymentItem();
    supplierPaymentItem.item = formValues.suppliertype.name;
    supplierPaymentItem.totalpaid = formValues.paidamount;

    delete formValues.suppliertype;
    supplierPayment.code = formValues.code;
    supplierPayment.date = formValues.date;
    supplierPayment.previousamount = formValues.previousamount;
    supplierPayment.paidamount = formValues.paidamount;
    supplierPayment.balance = formValues.balance;
    supplierPayment.paymentstatus = formValues.paymentstatus;
    supplierPayment.supplier = formValues.supplier;
    supplierPayment.user = formValues.user;
    supplierPayment.supplierpaymentitems.push(supplierPaymentItem);
    console.log(supplierPayment);
    return supplierPayment;
  }

  /**
   * Saves the supplier payment data after validation and confirmation.
   *
   * The method performs the following tasks:
   * - Validates the supplier payment form.
   * - Displays validation errors if present.
   * - Generates supplier payment data and formats it for confirmation.
   * - Shows a confirmation dialog for saving the payment data.
   * - If confirmed, sends the payment data to the API for saving.
   * - Handles the API response, providing feedback and resetting forms as necessary.
   *
   * @return {void} This method does not return any value.
   */
  save(): void {

    const errors = this.formValidationService.getErrors(this.supplierPaymentForm);
    if (errors) {
      this.operationFeedbackService.showErrors("Supplier Payment", "Add", errors);
      return;
    }

    this.supplierPayment = this.generateSupplierData();
    const paymentData = this.operationFeedbackService.formatObjectData(this.supplierPayment, ["code"]);

    this.operationFeedbackService.showConfirmation("Supplier Payment", "Add", paymentData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<SupplierPayment>(ApiEndpoints.paths.supplierPayments, this.supplierPayment)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Supplier Payment", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Supplier Payment", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the current state or performs a specific update operation.
   * This method is typically used to refresh or alter an existing instance
   * of an object or system component.
   *
   * @return {void} Does not return any value.
   */
  update(): void {}

  /**
   * Deletes a specific resource or data entity. The implementation details
   * of this method depend on the specific use case and context where it is applied.
   *
   * @return {void} Does not return any value.
   */
  delete(): void {}

  /**
   * Clears the current payment form if it contains any values. Displays a message if there is nothing to clear.
   * If the form has values, asks for confirmation before clearing the form and reloading it.
   *
   * @return {void} No return value.
   */
  clear(): void {
    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.supplierPaymentForm, ['user', 'date', 'previousamount', 'balance']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Payment', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Payment', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadForms();
      });
  }

  /**
   * Resets and reloads the forms by unsubscribing from existing subscriptions, clearing selections,
   * resetting the form, initializing user and date-related settings, and enabling or disabling appropriate UI buttons.
   *
   * @return {void} This method does not return any value.
   */
  private resetAndReloadForms() {
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
      this.balanceCalculationSubscription = null;
    }
    this.selectedRow = null;
    this.loadTable('');
    this.supplierPaymentForm.reset();
    this.setLoggedInUser();
    this.setUpPaymentDate();
    this.formValidationService.createForm(this.supplierPaymentForm);
    this.enableButtons(true, false, false);
    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Assigns a CSS class string to indicate the status color based on the payment status.
   *
   * @param {PaymentStatus} status - The payment status object containing the name of the status.
   * @return {string} A CSS class string corresponding to the payment status or a default class if the status is not recognized.
   */
  setStatusColor(status: PaymentStatus): string {
    const statusColor: Record<string, string> = {
      pending: 'pending-cell',
      partial: 'partial-cell',
      paid: 'paid-cell',
      overdue: 'overdue-cell',
    }
    const colorClass = statusColor[status.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  ngOnDestroy(): void {
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
    }
    this.dataSubscriber$.unsubscribe();
  }


}
