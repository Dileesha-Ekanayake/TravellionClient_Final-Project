import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatCardContent} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatIcon} from "@angular/material/icon";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatDialog} from "@angular/material/dialog";
import {DataService} from "../../../../services/data.service";
import {AuthorizationManagerService} from "../../../../auth/authorization-manager.service";
import {FormValidationService} from "../../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../../util/core-services/feedback/operationfeedback.service";
import {AsyncPipe, DatePipe} from "@angular/common";
import {CustomerPayment} from "../../../../entity/customer-payment";
import {CustomerPaymentType} from "../../../../entity/customer-payment-type";
import {CustomerPaymentInformation} from "../../../../entity/customer-payment-information";
import {CustomerPaymentReceipt} from "../../../../entity/customer-payment-receipt";
import {CustomerPaymentDataShareService} from "../customer-payment-data-share.service";
import {Customer} from "../../../../entity/customer";
import {Booking} from "../../../../entity/booking";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../../util/core-services/ui/auto-complete-data-filter.service";
import {debounceTime, map, Observable, startWith, Subscription} from "rxjs";
import {ApiEndpoints} from "../../../../services/api-endpoint";
import {BookingDataShareService} from "../../booking/booking-data-share.service";
import {User} from "../../../../entity/user";
import {AvNotificationService} from "@avoraui/av-notifications";
import {AvFilePicker} from "@avoraui/av-file-picker";

@Component({
  selector: 'app-client-payment',
  imports: [
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    ReactiveFormsModule,
    MatIcon,
    MatOption,
    MatSelect,
    FormsModule,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvFilePicker
  ],
  standalone: true,
  templateUrl: './client-payment.component.html',
  styleUrl: './client-payment.component.css'
})
export class ClientPaymentComponent implements OnInit, OnDestroy {

  @Input() showTemporaryPaymentSaveButton: boolean = false;

  defaultPaymentIcon: string = 'payment-receipt-icon.png';

  paymentTypeIcons: any = {
    'Cash': 'attach_money',
    'Credit/Debit Card': 'credit_card',
    'Bank Transfer': 'account_balance',
    'Cheque': 'receipt_long',
    'Mobile Payment': 'qr_code_2',
  };

  enableAdd: boolean = false;
  enableUpdate: boolean = false;
  enableDelete: boolean = false;
  enableEdit: boolean = false;
  enableGoToRecode: boolean = true;
  enableGoToView: boolean = true;

  hasInsertAuthority: boolean = false;
  hasUpdateAuthority: boolean = false;
  hasDeleteAuthority: boolean = false;

  selectedPaymentType: string = '';
  pdfDtls: boolean = true

  customerBooking!: Booking | null;

  customerPaymentForm!: FormGroup;
  customerPaymentInformationForm!: FormGroup;
  customerPaymentReceiptForm!: FormGroup;

  customerPayment!: CustomerPayment;
  oldCustomerPayment!: CustomerPayment;

  nextCustomerPaymentCode!: string;

  customerPaymentInformation!: CustomerPaymentInformation;
  oldCustomerPaymentInformation!: CustomerPaymentInformation;

  customerPaymentReceipt!: CustomerPaymentReceipt;
  oldCustomerPaymentReceipt!: CustomerPaymentReceipt;

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;

  customers: Array<Customer> = [];
  filteredCustomers!: Observable<Array<Customer>>;

  bookings: Array<Booking> = [];
  filteredBookingByCustomerAndNonZeroBalance: Array<Booking> = [];
  filteredBookings!: Observable<Array<Booking>>;

  customerPaymentTypes: Array<CustomerPaymentType> = [];

  minimumPaymentDate: Date;

  dataSubscriber$: Subscription = new Subscription();
  private balanceCalculationSubscription: Subscription | null = null;
  searchQuery!: URLSearchParams;

  isFillForm: boolean = false;


  @ViewChild('paymentProofFilePicker') paymentProofFilePicker!: TemplateRef<any>;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder,
    public authService: AuthorizationManagerService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private customerPaymentDataShareService: CustomerPaymentDataShareService,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private bookingDataShareService: BookingDataShareService,
    private avNotificationService: AvNotificationService,
  ) {

    this.minimumPaymentDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 30));

    this.customerPaymentForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      booking: new FormControl('', Validators.required),
      customer: new FormControl('', Validators.required),
      customerName: new FormControl('', Validators.required),
      previousamount: new FormControl('', Validators.required),
      paidamount: new FormControl('', Validators.required),
      balance: new FormControl('', Validators.required),
      paymenttype: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.customerPaymentInformationForm = this.formBuilder.group({
      amount: new FormControl('', Validators.required),
      chequenumber: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.customerPaymentReceiptForm = this.formBuilder.group({
      receipt: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

  }

  ngOnInit() {

    this.initialize();

    this.customerPaymentDataShareService.triggerPaymentSave$.subscribe(() => {
      this.savePaymentWithBooking();
    })

    this.customerPaymentDataShareService.triggerFillForm$.subscribe(() => {
      this.fillForm();
    })

    // Set up the form subscription here, but booking processing will happen after customers load
    this.customerPaymentForm.get('customer')?.valueChanges.subscribe(value => {
      if (value && value.fullname) {
        this.customerPaymentForm.controls['customerName'].patchValue(value.fullname);
      }
    })
    this.filterBookingsByCustomerAndNonZeroBalance();
    this.loadPaymentDetailsWithBookingCode();
  }

  /**
   * Initializes the component by setting up data subscriptions, forms, and button states.
   * This method fetches data for active users, customer payment types, customers, and bookings,
   * and processes the retrieved data to populate relevant lists and forms.
   *
   * It also configures form validations and enables/disables buttons based on initial states.
   *
   * @return {void} No return value.
   */
  initialize(): void {

    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.customerPaymentForm, 'user', ['employee.callingname']);
          this.processBookingData();
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<CustomerPaymentType>(ApiEndpoints.paths.customerPaymentTypes).subscribe({
        next: (customerPaymentTypes) => {
          this.customerPaymentTypes = customerPaymentTypes;
          this.processBookingData();
        },
        error: (error) => {
          console.error("Error fetching customer payment types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Customer>(ApiEndpoints.paths.customerList).subscribe({
        next: (customers) => {
          this.customers = customers;
          this.filteredCustomers = this.autoCompleteDataFilterService.filterData<Customer>(this.customers, this.customerPaymentForm, 'customer', ['code']);
          this.processBookingData();
        },
        error: (error) => {
          console.error("Error fetching customers : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Booking>(ApiEndpoints.paths.bookings).subscribe({
        next: (bookings) => {
          this.bookings = bookings;
        },
        error: (error) => {
          console.error("Error fetching bookings : " + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.customerPaymentForm, this.oldCustomerPayment, this.customerPayment, 'customerPayment', ['code', 'customerName', 'previousamount', 'balance'], [], [['date', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.customerPaymentInformationForm, this.oldCustomerPaymentInformation, this.customerPaymentInformation);
    this.formValidationService.createForm(this.customerPaymentReceiptForm, this.oldCustomerPaymentReceipt, this.customerPaymentReceipt);

    this.enableButtons(true, false, false);
    this.buttonStates();
  }

  /**
   * Initializes and configures the view-specific setup for the application.
   * Performs necessary operations such as setting the logged-in user, preparing
   * the payment date, and generating a payment code for the customer.
   *
   * @return {void} No return value is provided.
   */
  createView(): void {
    this.setLoggedInUser();
    this.setUpPaymentDate();
    this.generateCustomerPaymentCode();
    // this.setupReactiveBalanceCalculation(0);
  }

  /**
   * Sets the currently logged-in user by retrieving the user details via the authentication service.
   * The user details are fetched using the provided customer payment form and a specified user identifier.
   *
   * @return {void} This method does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.customerPaymentForm, 'user');
  }

  /**
   * Sets up the payment date by updating the 'date' field in the customer payment form
   * with the current date formatted as 'yyyy-MM-dd'.
   *
   * @return {void} No return value.
   */
  setUpPaymentDate(): void {
    this.customerPaymentForm.controls['date'].patchValue(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
  }

  /**
   * Enables or disables specific buttons based on the provided parameters.
   *
   * @param {boolean} add - A boolean value indicating whether the "add" button should be enabled or disabled.
   * @param {boolean} upd - A boolean value indicating whether the "update" button should be enabled or disabled.
   * @param {boolean} del - A boolean value indicating whether the "delete" button should be enabled or disabled.
   * @return {void} No return value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the states of button-related authorities based on the user's permissions.
   * Utilizes the authentication service to check for operation authority in the context of 'client payment'.
   *
   * @return {void} This method does not return any value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('client payment', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('client payment', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('client payment', 'delete');
  }

  /**
   * Filters the bookings based on the selected customer and ensures that only bookings with a non-zero balance are included.
   * Subscribes to changes in the customer value from the payment form and updates the filtered booking list accordingly.
   *
   * The filtered bookings are derived by checking whether:
   * 1. The booking has a lead passenger matching the selected customer's code.
   * 2. The booking has a non-zero balance.
   *
   * Updates the `filteredBookings` property with the filtered data.
   *
   * @return {void} This method does not return anything; it operates directly on the component's state.
   */
  filterBookingsByCustomerAndNonZeroBalance(): void {
    this.customerPaymentForm.controls['customer'].valueChanges.subscribe(value => {
      if (value) {
        this.filteredBookingByCustomerAndNonZeroBalance = this.bookings.filter(booking => {
          const hasMatchingLeadPassenger = booking.bookingpassengers.some(passenger => passenger.leadpassenger && passenger.code === value.code);
          const hasNonZeroBalance = booking.balance !== 0;
          return hasMatchingLeadPassenger && hasNonZeroBalance;
        });
        this.filteredBookings = this.autoCompleteDataFilterService.filterData<Booking>(this.filteredBookingByCustomerAndNonZeroBalance, this.customerPaymentForm, 'booking', ['code']);
      }
    });
  }

  /**
   * Returns the display name of a user based on the provided user's data properties.
   *
   * This function utilizes the `displayValue` method from the `autoCompleteDataFilterService`
   * to extract and return a user's relevant display name. It specifically targets the
   * `employee.callingname` property of the provided user object.
   *
   * @param {any} user - The user object containing user-related data.
   * @returns {string} The display name of the user.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Retrieves and returns the display value of a customer's code property.
   *
   * @param {any} customer - The customer object containing the required code information.
   * @returns {string} The display value of the customer's code property, formatted using the autoCompleteDataFilterService.
   */
  displayCustomerCode = (customer: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Customer>(customer, ['code']);
  }

  /**
   * Returns a formatted display string for a given booking object by extracting and displaying
   * the 'code' property. This method leverages the displayValue functionality of the
   * autoCompleteDataFilterService to generate the string.
   *
   * @param {any} booking - The booking object containing data to display.
   * @returns {string} The formatted string representing the booking's 'code' property.
   */
  displayBookingCode = (booking: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Booking>(booking, ['code']);
  }

  /**
   * Generates and sets the next customer payment code based on the selected customer value.
   * Listens for changes in the customer value from the customer payment form, retrieves the
   * corresponding payment code from the data service, and updates the form fields accordingly.
   *
   * @return {void} This method does not return a value.
   */
  generateCustomerPaymentCode(): void {
    this.customerPaymentForm.controls['customer'].valueChanges.subscribe(value => {
      if (this.isFillForm) {
        return;
      }
      if (value && value.code) {
        this.dataSubscriber$.add(
          this.dataService.getRefNumber(ApiEndpoints.paths.customerPaymentCode, 'customerPaymentCode', value.code).subscribe({
            next: (data) => {
              this.nextCustomerPaymentCode = data.customerPaymentCode;
              this.customerPaymentForm.controls['code'].patchValue(this.nextCustomerPaymentCode);

              if (value.fullname) {
                this.customerPaymentForm.controls['customerName'].patchValue(value.fullname);
              }
            },
            error: (error) => {
              console.error("Error fetching customer code : " + error.message);
            }
          })
        );
      }
    });
  }

  //==============================Load Payment Details With Booking Code============================//
  /**
   * Loads payment details related to a booking based on the booking code.
   * Subscribes to changes in the booking form control, fetches booking balance details from the server, and calculates the final balance.
   * This method sets up a reactive balance calculation based on the fetched and modified balance values.
   *
   * @return {void} This method does not return a value.
   */
  loadPaymentDetailsWithBookingCode(): void {
    this.customerPaymentForm.controls['booking'].valueChanges.subscribe({
      next: (value) => {
        if (this.isFillForm) {
          return;
        }
        if (value) {
          this.dataSubscriber$.add(
            this.dataService.getDataObject<Booking>(ApiEndpoints.paths.bookingBalance, value.code).subscribe({
              next: (booking) => {
                // Calculate the final balance
                const serverBalance = booking.balance || 0;
                const modifiedBalance = this.customerBooking?.balance || 0;
                const finalBalance = serverBalance + modifiedBalance;
                this.setupReactiveBalanceCalculation(Math.abs(finalBalance));
              },
              error: (error) => {
                console.error("Error fetching booking balance : " + error.message);
              }
            })
          );
        }
      }
    });
  }

  //===============================Calculate Balance===============================================//

  /**
   * Initializes and sets up a reactive balance calculation based on the `previousBalance`
   * and the value changes in the payment form controls. It validates the input values,
   * ensures no negative or exceeding values for payments, and calculates the remaining balance.
   *
   * @param {any} previousBalance - The previous balance provided as input, which will be used
   * to pre-fill the form and calculate the balance dynamically.
   * @return {void} - This method does not return a value. It sets up reactive subscriptions
   * and updates the form controls based on the calculations.
   */
  private setupReactiveBalanceCalculation(previousBalance: any): void {
    // Clean up existing subscription first
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
      this.balanceCalculationSubscription = null;
    }

    const previousAmount = Number(previousBalance || 0);
    this.customerPaymentForm.controls['previousamount'].patchValue(Number(previousAmount).toFixed(2));

    const paidAmount$ = this.customerPaymentForm.controls['paidamount'].valueChanges;

    this.balanceCalculationSubscription = paidAmount$.pipe(
      startWith(this.customerPaymentForm.controls['paidamount'].value || 0), // Use current form value instead of 0
      debounceTime(100), // Add debouncing to prevent rapid fire changes
      map(paid => {
        const paidValue = Number(paid || 0);

        // Get a fresh previousAmount value in case it changed
        const currentPreviousAmount = Number(this.customerPaymentForm.controls['previousamount'].value || 0);

        // Validation: Check for negative values
        if (paidValue < 0) {
          this.avNotificationService.showFailure('Paid amount cannot be negative', {
            theme: "light"
          });
          // Reset to 0 or previous valid value
          this.customerPaymentForm.controls['paidamount'].patchValue(0, { emitEvent: false });
          return 0;
        }

        // Validation: Check if paid amount exceeds previous amount
        if (paidValue > currentPreviousAmount) {
          this.avNotificationService.showFailure('Paid amount cannot exceed the previous balance', {
            theme: "light"
          });
          // Reset to previous amount or previous valid value
          this.customerPaymentForm.controls['paidamount'].patchValue(currentPreviousAmount, { emitEvent: false });
          return currentPreviousAmount;
        }

        return paidValue;
      }),
      map(validPaid => {
        // Get a fresh previousAmount value again
        const currentPreviousAmount = Number(this.customerPaymentForm.controls['previousamount'].value || 0);
        return validPaid - currentPreviousAmount;
      }),
      map(balance => balance.toFixed(2))
    ).subscribe(balance => {
      this.customerPaymentForm.controls['balance'].patchValue(Math.abs(Number(balance)).toFixed(2));
    });

    // Add to subscriber for cleanup
    this.dataSubscriber$.add(this.balanceCalculationSubscription);
  }

  /**
   * Handles the change of the payment type and updates the selected payment type.
   * Additionally, triggers the opening of the payment proof file picker for specific payment types.
   *
   * @param {any} value - The object containing the selected payment type details.
   * @return {void} Does not return any value.
   */
  onPaymentTypeChange(value: any) {
    this.selectedPaymentType = value.value.name;

    if (this.selectedPaymentType === 'Bank Transfer' || this.selectedPaymentType === 'Cheque' || this.selectedPaymentType === 'Mobile Payment') {
      this.openPaymentProofFilePicker();
    }
  }

  /**
   * Opens a dialog window to display the payment proof file picker.
   * This method configures and triggers the file picker dialog with specified options.
   *
   * @return {void} No value is returned by this method.
   */
  openPaymentProofFilePicker(): void {
    this.dialog.open(this.paymentProofFilePicker, {
      width: '500px',
      // disableClose: true,
    })
  }

  /**
   * Generates a customer payment by collecting and validating information from various forms.
   * It creates customer payment records, associates payment information and receipts, and
   * sends the data for further processing or storage.
   *
   * The method ensures required data such as customer, user, and payment type are present
   * before proceeding. It then collects payment information and receipt details, organizes
   * them into appropriate data structures, and triggers events or services to handle
   * the created data.
   *
   * If necessary validation fails, the method shows error feedback and exits without
   * processing further.
   *
   * @return {void} Does not return any value. The method performs side effects such as updating
   * services, triggering events, and storing data locally.
   */
  generateCustomerPayment(): void {
    let customerPayment = new CustomerPayment();
    customerPayment.customerpaymentinformations = [];
    customerPayment.customerpaymentreceipts = [];

    if (this.showPaymentSaveErrors()) {
      return;
    }
    const customerPaymentValues = this.customerPaymentForm.getRawValue();
    const {amount, chequenumber} = this.customerPaymentInformationForm.getRawValue();
    const {receipt} = this.customerPaymentReceiptForm.getRawValue();

    if (!customerPaymentValues.customer || !customerPaymentValues.user || !customerPaymentValues.paymenttype) {
      this.operationFeedbackService.showErrors("Payment", "Save", "Customer, user, or payment type is missing.");
      return;
    }

    customerPaymentValues.user = {
      id: customerPaymentValues.user.id,
      username: customerPaymentValues.user.username
    };
    delete customerPaymentValues.customerName;
    customerPayment = customerPaymentValues;

    if (amount && chequenumber) {
      const info = new CustomerPaymentInformation();
      info.amount = amount;
      info.chequenumber = chequenumber;
      customerPayment.customerpaymentinformations.push(info);
    }

    if (receipt) {
      const paymentReceipt = new CustomerPaymentReceipt();
      paymentReceipt.receipt = receipt;
      customerPayment.customerpaymentreceipts.push(paymentReceipt);
    }

    this.customerPaymentDataShareService.sendCustomerPaymentData(customerPayment);
    this.customerPayment = customerPayment;
    localStorage.setItem('customerPayment', JSON.stringify(this.customerPayment));
    this.customerPaymentDataShareService.triggerPaymentSaveAndCloseModel();
  }

  /**
   * Validates payment form data and displays relevant error messages if there are any issues with the input.
   *
   * The method checks multiple fields and conditions in the payment form, including customer, booking, payment type,
   * paid amount, and associated sub-forms for payment information and receipt. If there are any validation errors,
   * they are collected and displayed using the operation feedback service.
   *
   * @return {boolean} Returns true if there are validation errors and errors are displayed, otherwise false.
   */
  showPaymentSaveErrors(): boolean {
    let errors = this.formValidationService.getErrors(this.customerPaymentForm);

    // Get form values to check specific fields
    const formValues = this.customerPaymentForm.getRawValue();

    // Check if this is the first call with empty data - if so, just return false
    if (!formValues.customer && !formValues.booking && !formValues.paymenttype && !formValues.paidamount) {
      console.log('First call with empty data, skipping validation');
      return false; // Don't show errors for the first empty call
    }

    // Check if fields are actually invalid (not just empty objects)
    if (!formValues.customer) {
      errors += (errors ? '<br>' : '') + 'Customer is required';
    }

    if (!formValues.booking) {
      errors += (errors ? '<br>' : '') + 'Booking is required';
    }

    if (!formValues.paidamount || formValues.paidamount <= 0) {
      errors += (errors ? '<br>' : '') + 'Paid amount must be greater than 0';
    }

    if (!formValues.paymenttype) {
      errors += (errors ? '<br>' : '') + 'Payment type is required';
    }

    if (!formValues.user) {
      errors += (errors ? '<br>' : '') + 'User is required';
    }

    const customerPaymentInformationFormErrors = this.formValidationService.getErrors(
      this.customerPaymentInformationForm,
      ['amount', 'chequenumber']
    );

    const customerPaymentReceiptFormErrors = this.formValidationService.getErrors(
      this.customerPaymentReceiptForm,
      ['receipt']
    );

    if (customerPaymentInformationFormErrors) {
      errors += (errors ? '<br>' : '') + customerPaymentInformationFormErrors;
    }

    if (customerPaymentReceiptFormErrors) {
      errors += (errors ? '<br>' : '') + customerPaymentReceiptFormErrors;
    }

    if (errors) {
      this.operationFeedbackService.showErrors("Payment", "Add", errors);
      return true;
    }

    return false;
  }

  //====================================Fill Form=======================================================//
  /**
   * Fills the customer payment form with the current data and updates all necessary properties and states.
   * This method sets the form to a pristine state, configures form controls, and ensures that the values
   * in the form match the appropriate data from the service and references.
   *
   * @return {void} This method does not return any value.
   */
  fillForm(): void {
    this.isFillForm = true;
    this.enableButtons(false, true, true);

    this.customerPayment = JSON.parse(JSON.stringify(this.customerPaymentDataShareService.getCustomerPaymentData()));
    this.oldCustomerPayment = JSON.parse(JSON.stringify(this.customerPaymentDataShareService.getCustomerPaymentData()));

    this.customerPayment.user = this.activeUsers.find(user => user.id === this.customerPayment.user?.id) ?? this.customerPayment.user;
    this.customerPayment.customer = this.customers.find(customer => customer.code === this.customerPayment.customer?.code) ?? this.customerPayment.customer;
    this.customerPayment.booking = this.bookings.find(booking => booking.code === this.customerPayment.booking?.code) ?? this.customerPayment.booking;
    this.customerPayment.paymenttype = this.customerPaymentTypes.find(paymentType => paymentType.id === this.customerPayment.paymenttype?.id) ?? this.customerPayment.paymenttype;

    this.customerPaymentForm.patchValue(this.customerPayment);
    this.setupReactiveBalanceCalculation(this.customerPayment.previousamount);
    this.formValidationService.setFormControlStates(this.customerPaymentForm, {
      user: {enabled: false, emitEvent: false},
      customer: {enabled: false, emitEvent: false},
      booking: {enabled: false},
      previousamount: {enabled: true},
      balance: {enabled: true}
    });
    this.formValidationService.createForm(this.customerPaymentForm, this.oldCustomerPayment, this.customerPayment);
    this.customerPaymentForm.markAsPristine();
  }

  /**
   * Resets and reloads the forms related to customer payments and associated data.
   * This method ensures all forms are reset, required variables and states are cleared or re-initialized,
   * and form controls are updated to their intended states.
   *
   * @return {void} This method does not return any value.
   */
  resetAndReloadForms(): void {
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
      this.balanceCalculationSubscription = null;
    }

    this.isFillForm = false;
    this.enableButtons(true, false, false);

    this.customerBooking = null;

    this.customerPayment = new CustomerPayment();
    this.customerPaymentInformation = new CustomerPaymentInformation();
    this.customerPaymentReceipt = new CustomerPaymentReceipt();

    this.customerPaymentForm.reset();
    this.customerPaymentInformationForm.reset();
    this.customerPaymentReceiptForm.reset();

    this.enableGoToView = true;
    this.enableGoToRecode = true;

    this.customerPaymentDataShareService.clearCustomerPaymentData();
    this.customerPaymentDataShareService.triggerFormClear();

    this.createView();
    this.formValidationService.createForm(this.customerPaymentForm);
    this.formValidationService.setFormControlStates(this.customerPaymentForm, {
      customer: {enabled: true},
      booking: {enabled: true},
      previousamount: {enabled: false},
      balance: {enabled: false}
    });
    this.formValidationService.createForm(this.customerPaymentInformationForm);
    this.formValidationService.createForm(this.customerPaymentReceiptForm);
  }

  //========================================================Save==============================================//
  /**
   * Saves the customer payment details after necessary validations and user confirmation.
   * Performs feedback operations based on the server's response.
   *
   * @return {void} This method does not return a value.
   */
  save(): void {
    if (this.showPaymentSaveErrors()) {
      return;
    }

    this.generateCustomerPayment();

    const toSavePayment = this.customerPayment;
    console.log(toSavePayment);
    const bookingData = this.operationFeedbackService.formatObjectData(toSavePayment, ["code"]);

    this.operationFeedbackService.showConfirmation('Payment', 'Save', bookingData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<CustomerPayment>(ApiEndpoints.paths.customerPayments, toSavePayment).subscribe({
            next: (response) => {
              const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

              if (status) {
                this.resetAndReloadForms()
                localStorage.removeItem('customerPayment');
              }
              this.operationFeedbackService.showStatus("Payment", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Payment", "Save", responseMessage
              );
            }
          })
        }
      })
  }

  //==========================================Update=========================================================//
  /**
   * Updates the customer's payment information.
   * This method validates the forms, handles updates, and sends a request to update customer payment data.
   * If there are unsaved changes in the forms, they are processed and displayed in a confirmation dialog.
   * If the user confirms the update, the request to update the customer payment is sent to the server.
   * Feedback on the success or failure of the update operation is provided to the user.
   *
   * @return {void} Doesn't return any value.
   */
  update(): void {

    if (this.showPaymentSaveErrors()) {
      return;
    }
    this.generateCustomerPayment();
    const toUpdatePayment = this.customerPayment;

    toUpdatePayment.id = this.oldCustomerPayment.id;

    let updates = this.formValidationService.getUpdates(this.customerPaymentForm);
    const paymentInfoUpdates = this.formValidationService.getUpdates(this.customerPaymentInformationForm);
    const paymentReceiptUpdates = this.formValidationService.getUpdates(this.customerPaymentReceiptForm);
    if (paymentInfoUpdates) {
      updates = '<br>' + paymentInfoUpdates;
    }
    if (paymentReceiptUpdates) {
      updates = '<br>' + paymentReceiptUpdates;
    }

    this.operationFeedbackService.showConfirmation('Payment', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.update<CustomerPayment>(ApiEndpoints.paths.customerPayments, toUpdatePayment)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                  localStorage.removeItem('customerPayment');
                }
                this.operationFeedbackService.showStatus("Payment", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Payment", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  //==========================================Delete=========================================================//

  /**
   * Deletes a customer payment by confirming the action, sending a delete request to the server,
   * and handling the response to provide feedback to the user.
   *
   * @return {void} This method does not return any value. All actions are performed through services and observable subscriptions.
   */
  delete(): void {

    const paymentData = this.operationFeedbackService.formatObjectData(this.customerPayment, ['code']);
    this.operationFeedbackService.showConfirmation('Payment', 'Delete', paymentData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.customerPayments, this.customerPayment.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Payment", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Payment', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  //=================================Process Booking (Payment with Booking)================================================//
  /**
   * Processes and sets up booking data for the customer's payment form.
   * Retrieves booking data, updates form controls with booking and customer details,
   * and sets up balance calculation based on the net amount in the booking information.
   *
   * @return {void} This method does not return a value.
   */
  processBookingData(): void {
    this.customerBooking = this.bookingDataShareService.getBookingData();
    if (this.customerBooking) {
      this.customerPaymentForm.controls['booking'].patchValue(this.customerBooking);
      this.setupReactiveBalanceCalculation(this.customerBooking?.netamount);
      if (this.customerBooking.bookingpassengers && this.customerBooking.bookingpassengers.length > 0) {
        const leadPassenger = this.customerBooking.bookingpassengers.find(bookingPassenger => bookingPassenger.leadpassenger);

        if (leadPassenger && leadPassenger.code) {
          const bookingPassenger = this.customers.find(customer => customer.code === leadPassenger.code);

          if (bookingPassenger) {
            this.customerPaymentForm.controls['customer'].patchValue(bookingPassenger);
          }
        }
      }
    }
  }

  /**
   * Saves a Customer Payment object with corresponding booking information.
   * The method retrieves payment data from the local storage, associates it
   * with the customer's booking information, and sends the data to the server
   * for saving. Upon successful save, it clears the local storage and resets the forms.
   *
   * Handles scenarios where payment data or booking information is not available with proper feedback.
   *
   * @return {void} This method does not return any value.
   */
  savePaymentWithBooking(): void {
    let toSavePayment = new CustomerPayment();
    const rawPayment = localStorage.getItem('customerPayment') ?? '';
    if (rawPayment) {
      toSavePayment = JSON.parse(rawPayment);
    }

    if (!toSavePayment) {
      this.operationFeedbackService.showErrors("Payment", "Save", "Payment creation failed");
      return;
    }

    this.customerBooking = this.bookingDataShareService.getBookingData();

    if (!this.customerBooking) {
      this.operationFeedbackService.showErrors("Payment", "Save", "Booking data not found");
      return;
    }

    toSavePayment.booking = this.customerBooking;

    this.dataService.save<CustomerPayment>(ApiEndpoints.paths.customerPayments, toSavePayment).subscribe({
      next: (response) => {
        const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

        if (status) {
          this.resetAndReloadForms();
          localStorage.removeItem('customerPayment');
          if (responseMessage) {
            this.customerPaymentDataShareService.sendPaymentSaveComplete('success', responseMessage);
          }
          this.customerPaymentDataShareService.clearCustomerPaymentData();
        } else {
          // this.customerPaymentDataShareService.sendPaymentSaveComplete('failed', responseMessage);
        }
      },
      error: (error) => {
        const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
        // this.customerPaymentDataShareService.sendPaymentSaveComplete('failed', `Payment save error: ${responseMessage}`);
      }
    });
  }

  /**
   * Clears the current form by resetting its values and reloading them, if any values are present.
   * If no values are present in the form, it displays a feedback message indicating there is nothing to clear.
   * Prompts user confirmation before clearing the form details.
   *
   * @return {void} Does not return any value.
   */
  clear(): void {
    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.customerPaymentForm, ['user', 'date', 'previousamount', 'balance']);

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
   * Closes the payment process by triggering the save and close model event,
   * and resetting the payment-related forms to their initial states.
   *
   * @return {void} No return value.
   */
  closePayment(): void {
    this.customerPaymentDataShareService.triggerPaymentSaveAndCloseModel();
    this.customerPaymentForm.reset();
    this.customerPaymentInformationForm.reset();
    this.customerPaymentReceiptForm.reset();
  }

  ngOnDestroy() {
    if (this.balanceCalculationSubscription) {
      this.balanceCalculationSubscription.unsubscribe();
      this.balanceCalculationSubscription = null;
    }
    this.dataSubscriber$.unsubscribe();
  }

}
