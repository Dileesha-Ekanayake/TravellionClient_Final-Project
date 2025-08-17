import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DetailViewComponent} from "../../../../util/detail-view/detail-view.component";
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
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {Employee} from "../../../../entity/employee";
import {Subscription} from "rxjs";
import {DataService} from "../../../../services/data.service";
import {AuthorizationManagerService} from "../../../../auth/authorization-manager.service";
import {BreadcrumbService} from "../../../../util/core-services/ui/breadcrumb.service";
import {OperationFeedbackService} from "../../../../util/core-services/feedback/operationfeedback.service";
import {DataServerService} from "../../../../util/detail-view/data-server.service";
import {DatePipe, NgClass} from "@angular/common";
import {ApiEndpoints} from "../../../../services/api-endpoint";
import {ClientPaymentComponent} from "../client-payment/client-payment.component";
import {CustomerPayment} from "../../../../entity/customer-payment";
import {CustomerPaymentType} from "../../../../entity/customer-payment-type";
import {User} from "../../../../entity/user";
import {CustomerPaymentDataShareService} from "../customer-payment-data-share.service";

@Component({
  selector: 'app-client-payment-container',
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
    ClientPaymentComponent,
    MatNoDataRow
  ],
  standalone: true,
  templateUrl: './client-payment-container.component.html',
  styleUrl: './client-payment-container.component.css'
})
export class ClientPaymentContainerComponent implements OnInit, OnDestroy {

  columns: string[] = ['payment-code', 'customer', 'date', 'amount-details', 'paymenttype', 'modify/view'];
  headers: string[] = ['Payment Code', 'Customer', 'Date', 'Amount Details', 'Payment Type', 'Modify / View'];

  columnsDetails: string[] = ['code', 'customer', 'date'];
  headersDetails: string[] = ['Payment Code', 'Customer', 'Date'];

  public serverSearchForm!: FormGroup;
  pdfDtls: boolean = true;

  selectedRow: any;

  paymentTypes: Array<CustomerPaymentType> = [];
  activeUserList: Array<User> = [];

  customerPayments: Array<CustomerPayment> = [];
  customerPayment!: CustomerPayment;
  oldCustomerPayment!: CustomerPayment;

  data!: MatTableDataSource<CustomerPayment>;
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
    private operationFeedbackService: OperationFeedbackService,
    private customerPaymentDataShareService: CustomerPaymentDataShareService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
  ) {

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
    this.customerPaymentDataShareService.triggerFormClear$.subscribe(() => {
      this.clearTableSelection();
      this.selectedRow = null;
      this.enableRecordView = false;
      this.enableDetailView = false;
      this.enableEdit = false;
      this.enableGoToRecode = true;
      this.enableGoToView = true;
      this.enableButtons(true, false, false);
    })
  }

  /**
   * Initializes the component by setting up necessary data, UI states, and subscriptions.
   * This includes loading payment filter fields, setting the breadcrumb trail, creating the view,
   * and fetching user and payment type data from the relevant services.
   *
   * @return {void} This method does not return a value.
   */
  initialize(): void {

    this.loadPaymentFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.users).subscribe({
        next: (users) => {
          this.activeUserList = users;
        },
        error: (error) => {
          console.error("Error while fetching users: ", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<CustomerPaymentType>(ApiEndpoints.paths.customerPaymentTypes).subscribe({
        next: (paymentTypes) => {
          this.paymentTypes = paymentTypes;
        },
        error: (error) => {
          console.error("Error while fetching payment types: ", error.message);
        }
      })
    )

    this.enableButtons(true, false, false);
    this.buttonStates();

  }

  /**
   * Initializes and configures the view by setting default values for image URL, form state, and input field status.
   * Also loads the initial table data.
   *
   * @return {void} This method does not return any value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableForm = true;
    this.isSearchFiledInput = true;
    this.loadTable("");
  }

  /**
   * Enables or disables the buttons for adding, updating, and deleting.
   *
   * @param {boolean} add - Indicates whether the "Add" button should be enabled.
   * @param {boolean} upd - Indicates whether the "Update" button should be enabled.
   * @param {boolean} del - Indicates whether the "Delete" button should be enabled.
   * @return {void} Does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of button authorities by checking the user's operation permissions
   * for insert, update, and delete actions on the 'employee' entity.
   *
   * @return {void} This method does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('employee', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('employee', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('employee', 'delete');
  }

  /**
   * Loads and populates the customer payments data table based on the specified query.
   *
   * @param {string} query - The query string used to filter or fetch the data from the API.
   * @return {void} This method does not return any value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<CustomerPayment>(ApiEndpoints.paths.customerPayments, query).subscribe({
        next: (customerPayments) => {
          this.customerPayments = customerPayments;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.customerPayments);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Loads payment filter fields by extracting and formatting the relevant properties
   * from the `CustomerPayment` object, excluding specific fields like 'id',
   * 'customerpaymentinformations', and 'customerpaymentreceipts'.
   *
   * @return {void} Does not return a value; updates the `filterFields` property of the instance.
   */
  loadPaymentFilterFields(): void {
    const customerPayment = new CustomerPayment();
    this.filterFields = Object.keys(customerPayment)
      .filter(value => !['id', 'customerpaymentinformations', 'customerpaymentreceipts'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string field such that the first letter of each word is capitalized.
   *
   * @param {string} field - The string field to format.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Determines the type of search input (select, input, or date) based on the selected filter field value
   * and loads relevant options for select fields if applicable.
   *
   * @return {void} This method does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['paymenttype', 'user'];
    const dateFields = ['date'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      paymettype: this.paymentTypes,
      user: this.activeUserList,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the table based on the input value provided by the user.
   * The filter checks if the input value matches specific fields in the customer payment data.
   *
   * @param {Event} event - The input event triggered by the user, typically from a search field,
   *                        which contains the value used for filtering the table.
   * @return {void} This method does not return any value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (customerPayment: CustomerPayment, filter: string) => {
      return (
        filterValue == null ||
        customerPayment.code.toLowerCase().includes(filterValue) ||
        customerPayment.customer.callingname.toLowerCase().includes(filterValue) ||
        customerPayment.customer.fullname.toLowerCase().includes(filterValue) ||
        customerPayment.date.toLowerCase().includes(filterValue) ||
        customerPayment.paymenttype.name.toLowerCase().includes(filterValue)
      )
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a row and sets the provided employee as the selected row.
   * Logs the selected employee to the console.
   *
   * @param {Employee} element - The employee object to be set as the selected row.
   * @return {void} This method does not return a value.
   */
  selectRow(element: Employee): void {
    this.selectedRow = element;
    console.log(this.selectedRow);
  }

  /**
   * Resets the search query by reinitializing it as a new URLSearchParams object.
   *
   * @return {void} No return value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search operation based on the values provided in the server search form.
   * Processes search inputs, filters, and date ranges to construct a query string,
   * then uses it to load data into a table.
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
        this.searchQuery.append(`endDate`, endDate);
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
   * Resets the fields of the server search query form to their default values.
   * Updates the form's values: clears text inputs, resets drop-down selections, and nullifies date fields.
   *
   * @return {void} No value is returned by this method.
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
   * Clears the current search criteria and resets the search form. If no values are present in the form,
   * a message is displayed to indicate there is nothing to clear. If confirmed by the user, the search form
   * is reset, search flags are updated, and the search query is cleared.
   *
   * @return {void} This method does not return a value.
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
   * Fills a form with the details of the provided customer payment data.
   *
   * @param {CustomerPayment} customerPayment - The customer payment data to populate the form with.
   * @return {void} This method does not return a value.
   */
  fillForm(customerPayment: CustomerPayment): void {
    this.enableButtons(false, true, true);
    this.selectedRow = customerPayment;
    this.customerPayment = JSON.parse(JSON.stringify(customerPayment));
    this.oldCustomerPayment = JSON.parse(JSON.stringify(customerPayment));
    this.customerPaymentDataShareService.sendCustomerPaymentData(this.customerPayment);

    // Add delay to ensure a child component is ready
    setTimeout(() => {
      this.customerPaymentDataShareService.triggerFillForm();
    }, 220);
  }

  /**
   * Loads the payment detail view for a given customer payment instance.
   * Initializes and populates the payment data for rendering in the view.
   *
   * @param {CustomerPayment} customerPayment - The customer payment instance containing payment details to be displayed.
   * @return {void} This method does not return a value.
   */
  loadPaymentDetailView(customerPayment: CustomerPayment): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = customerPayment;
    const data = [
      {Label: "Title", Value: this.selectedRow.code},
      {Label: "Code", Value: this.selectedRow.code},
      {Label: "Booking", Value: this.selectedRow.booking.code},
      {Label: "Customer", Value: this.selectedRow.customer.callingname},
      {Label: "Previous Amount", Value: this.selectedRow.previousamount},
      {Label: "Paid Amount", Value: this.selectedRow.paidamount},
      {Label: "Balance", Value: this.selectedRow.balance},
      {Label: "Payment Type", Value: this.selectedRow.paymenttype.name}
    ];

    this.dataServer.sendData(data);

  }

  /**
   * Loads the payment modification view and sets the required view states.
   *
   * @param {CustomerPayment} customerPayment - The customer payment data to populate the form with.
   * @return {void}
   */
  loadPaymentModifyView(customerPayment: CustomerPayment): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(customerPayment);
  }

  /**
   * Updates the current view of the application based on the specified view mode.
   * Changes internal properties to enable or disable different views and refreshes the table accordingly.
   *
   * @param {('records'|'profiles'|'form')} view - The view mode to set. Valid values are 'records', 'profiles', and 'form'.
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
   * Clears the current table selection by disabling edit mode,
   * resetting the selected row, and sending null data to the server.
   *
   * @return {void} No value is returned.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Retrieves payment and booking codes from a CustomerPayment object.
   *
   * @param {CustomerPayment} value - The CustomerPayment object containing payment and booking details.
   * @return {{ paymentCode: string, bookingCode: string }} An object containing the payment code and booking code.
   */
  getPaymentCodes(value: CustomerPayment): { paymentCode: string, bookingCode: string } {
    const {code, booking} = value;
    return {paymentCode: code, bookingCode: booking.code};
  }

  /**
   * Retrieves the customer's details including the code and name from the provided payment data.
   *
   * @param {CustomerPayment} value - The customer payment object containing customer information.
   * @return {{customerCode: string, customerName: string}} An object containing the customer's code and name.
   */
  getCustomerDetails(value: CustomerPayment): { customerCode: string, customerName: string } {
    const {customer} = value;
    return {customerCode: customer.code, customerName: customer.callingname};
  }

  /**
   * Retrieves payment details including previous amount, paid amount, and balance based on the provided customer payment information.
   *
   * @param {CustomerPayment} value - The customer payment data which includes booking details.
   * @return {Object} An object containing payment details:
   *                  - previousAmount: The amount previously calculated or outstanding.
   *                  - paidAmount: The total amount paid so far.
   *                  - balance: The remaining balance.
   */
  getPayments(value: CustomerPayment): { previousAmount: number, paidAmount: number, balance: number } {
    const {booking} = value;
    return {previousAmount: booking.netamount, paidAmount: booking.totalpaid, balance: booking.balance};
  }

  /**
   * Sets the balance color based on the provided value.
   *
   * @param {any} value - The input value used to determine the balance color. It is converted to a number internally.
   * @return {string} Returns 'negative-cell' if the balance is non-zero, otherwise returns 'positive-cell'.
   */
  setBalanceColor(value: any): string {
    const balance = Number(value);
    if (balance !== 0) {
      return 'negative-cell';
    }
    return 'positive-cell';
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
  }

}
