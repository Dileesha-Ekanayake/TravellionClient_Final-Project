import {AfterViewInit, Component, DoCheck, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
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
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {User} from "../../../entity/user";
import {PaxType} from "../../../entity/pax-type";
import {Observable, Subscription} from "rxjs";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {EmployeeStatus} from "../../../entity/employee-status";
import {GenericStatus} from "../../../entity/generic-status";
import {GenericDiscountType} from "../../../entity/generic-discount-type";
import {Generic} from "../../../entity/generic";
import {GenericDiscount} from "../../../entity/generic-discount";
import {GenericCancellationCharge} from "../../../entity/generic-cancellation-charge";
import {GenericRate} from "../../../entity/generic-rate";
import {RateType} from "../../../entity/rate-type";
import {CancellationScheme} from "../../../entity/cancellation-scheme";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {ResidentType} from "../../../entity/resident-type";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {GenericType} from "../../../entity/generic-type";
import {Currency} from "../../../entity/currency";
import {Supplier} from "../../../entity/supplier";
import {DataValidationService} from "../../../util/core-services/validation/data-validation.service";
import {AvDataTable} from "@avoraui/av-data-table";

@Component({
  selector: 'app-generic',
  imports: [
    DetailViewComponent,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
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
    MatButtonToggleGroup,
    MatButtonToggle,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvDataTable
  ],
  templateUrl: './generic.component.html',
  standalone: true,
  styleUrl: './generic.component.css'
})
export class GenericComponent implements OnInit, AfterViewInit, OnDestroy, DoCheck {

  private readonly componentId = 'generic-component';

  breadcrumb: any;
  currentSection = 1;
  selectedRow: any;
  selectedRoomRow: any;
  isEditMode: boolean = false;
  isInnerDataEditMode: boolean = false;
  selectedGenericRow: any;

  private occupancyPaxCounter = 0;
  private isObserverFormInitialized = false;

  columns: string[] = ['reference', 'name', 'validfrom', 'validto', 'salesfrom', 'salesto', 'genericstatus', 'modify/view'];
  headers: string[] = ['Reference', 'Name', 'Valid-From', 'Valid-To', 'Sales-From', 'Sales-To', 'Status', 'Modify / View'];

  columnsDetails: string[] = ['reference', 'name', 'genericstatus'];
  headersDetails: string[] = ['Reference', 'Name', 'Status'];

  discountTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Disc Type', align: 'left'},
    {label: 'Rate Type', align: 'left'},
    {label: 'Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  discountTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'genericdiscounttype.name', align: 'left'},
    {field: 'ratetype.name', align: 'left'},
    {field: 'amount', align: 'left', color: '#3182ce'},
  ]

  cancellationTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Rate Type', align: 'left'},
    {label: 'Scheme', align: 'left'},
    {label: 'Amount', align: 'center'},
    {label: 'Action', align: 'center'}
  ];

  cancellationTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'ratetype.name', align: 'left'},
    {field: 'cancellationscheme.name', align: 'left'},
    {field: 'amount', align: 'center', color: '#3182ce'},
  ]

  rateTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Pax Type', align: 'left'},
    {label: 'Resident Type', align: 'left'},
    {label: 'Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  rateTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'paxtype.name', align: 'left'},
    {field: 'residenttype.name', align: 'left'},
    {field: 'amount', align: 'left', color: '#3182ce'},
  ]

  statusColors = [
    {value: "Active", color: {background: "#d1fcd3", text: "#4CAF50"}},
    {value: "Inactive", color: {background: "#f8c9c5", text: "#F44336"}}
  ];

  generics: Array<Generic> = [];
  data!: MatTableDataSource<Generic>;
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

  isEnableRoomView: boolean = false;

  isEnableCreateTransfer: boolean = false;

  minValidDate!: Date;
  minSaleDate!: Date;
  maxSaleDate!: Date;

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  generic!: Generic;
  oldGeneric!: Generic;

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  suppliers: Array<Supplier> = [];
  filteredSupplierList!: Observable<Array<Supplier>>;

  public genericForm!: FormGroup;
  public genericDiscountForm!: FormGroup;
  public genericCancellationChargesForm!: FormGroup;
  public genericRateForm!: FormGroup;
  public serverSearchForm!: FormGroup;

  // Initially loaded data
  nextGenericRef: string = "";
  genericStatuses: Array<GenericStatus> = [];
  genericTypes: Array<GenericType> = [];
  genericDiscountTypes: Array<GenericDiscountType> = [];
  rateTypes: Array<RateType> = [];
  cancellationSchemes: Array<CancellationScheme> = [];
  paxTypes: Array<PaxType> = [];
  residentTypes: Array<ResidentType> = [];
  currencyTypes: Array<Currency> = [];

  //=======Details for newly created TransferContract=======//
  genericDiscounts: Array<GenericDiscount> = [];
  genericCancellationCharges: Array<GenericCancellationCharge> = [];
  genericRates: Array<GenericRate> = [];

  occupancyCountMap: { [key: number]: number } = {};

  //======================================================//

  dataSubscriber$: Subscription = new Subscription();
  searchQuery!: URLSearchParams;

  constructor(
    private breadCrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private operationFeedbackService: OperationFeedbackService,
    private formValidationService: FormValidationService,
    private authService: AuthorizationManagerService,
    private step: ElementRef,
    private stepAction: ElementRef,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private dataValidationService: DataValidationService,
  ) {

    this.genericForm = this.formBuilder.group({
      user: new FormControl('', [Validators.required]),
      supplier: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      reference: new FormControl('', [Validators.required]),
      validfrom: new FormControl('', [Validators.required]),
      validto: new FormControl('', [Validators.required]),
      salesfrom: new FormControl('', [Validators.required]),
      salesto: new FormControl('', [Validators.required]),
      markup: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      genericstatus: new FormControl('', [Validators.required]),
      generictype: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      genericdiscounts: new FormControl('', [Validators.required]),
      genericcancellationcharges: new FormControl('', [Validators.required]),
      genericrates: new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

    this.genericDiscountForm = this.formBuilder.group({
      amount: new FormControl('', [Validators.required],),
      ratetype: new FormControl('', [Validators.required],),
      genericdiscounttype: new FormControl('', [Validators.required],),
    });

    this.genericCancellationChargesForm = this.formBuilder.group({
      amount: new FormControl('', [Validators.required],),
      ratetype: new FormControl('', [Validators.required],),
      cancellationscheme: new FormControl('', [Validators.required],),
    });

    this.genericRateForm = this.formBuilder.group({
      count: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      paxtype: new FormControl('', [Validators.required]),
    })

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

    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.genericForm, [['markup', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.genericDiscountForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.genericCancellationChargesForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.genericRateForm, [['amount', 0]]);

    this.genericForm.get('salesfrom')?.disable();
    this.genericForm.get('salesto')?.disable();

    this.genericForm.valueChanges.subscribe((form) => {
      this.minSaleDate = form.validfrom;
      this.maxSaleDate = form.validto;

      const salesFromControl = this.genericForm.get('salesfrom');
      const salesToControl = this.genericForm.get('salesto');

      if (form.validfrom && form.validto) {
        salesFromControl?.enable({ emitEvent: false });
        salesToControl?.enable({ emitEvent: false });
      } else {
        salesFromControl?.disable({ emitEvent: false });
        salesToControl?.disable({ emitEvent: false });
      }
    });

  }

  /**
   * A lifecycle hook that is called during every change detection cycle.
   * This method manually checks and handles changes for the component's state to ensure proper initialization
   * of the observer form when `enableForm` is true and the form has not yet been initialized.
   *
   * The method uses a short timeout to delay the initialization logic slightly, guaranteeing that other
   * lifecycle hooks or asynchronous state changes are accounted for before executing.
   *
   * @return {void} Does not return a value.
   */
  ngDoCheck(): void {
    setTimeout(() => {
      if (this.enableForm && !this.isObserverFormInitialized) {
        this.getFormSections();
        this.isObserverFormInitialized = true;
      }
    }, 0.1);
  }

  /**
   * Angular lifecycle hook that is called after a component's view has been fully initialized.
   * Typically used to perform actions that depend on child components or DOM elements being ready.
   * In this method, it triggers the fetching or initialization of form sections.
   *
   * @return {void} Does not return a value.
   */
  ngAfterViewInit(): void {
    this.getFormSections();
  }

  /**
   * Initializes the necessary components, subscribes to multiple data streams, and sets up configurations
   * and form handling for the application. This method handles data fetching, error logging, and service integrations.
   *
   * @return {void} Does not return a value.
   */
  initialize(): void {
    this.breadcrumb = this.breadCrumbService.getActiveRoute();

    this.createView();
    this.generateGenericReference();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.genericForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Supplier>(ApiEndpoints.paths.activeAccommSuppliersList).subscribe({
        next: (suppliers) => {
          this.suppliers = suppliers;
          this.filteredSupplierList = this.autoCompleteDataFilterService.filterData<Supplier>(this.suppliers, this.genericForm, 'supplier', ['name', 'brno']);
        },
        error: (error) => {
          console.error("Error fetching active suppliers : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<RateType>(ApiEndpoints.paths.rateTypes).subscribe({
        next: (rateTypes) => {
          this.rateTypes = rateTypes;
        },
        error: (error) => {
          console.error("Error fetching rate types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<CancellationScheme>(ApiEndpoints.paths.cancellationSchemes).subscribe({
        next: (cancellationSchemes) => {
          this.cancellationSchemes = cancellationSchemes;
        },
        error: (error) => {
          console.error("Error fetching cancellation schemes : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<PaxType>(ApiEndpoints.paths.paxTypes).subscribe({
        next: (paxTypes) => {
          this.paxTypes = paxTypes;
        },
        error: (error) => {
          console.error("Error fetching pax types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<ResidentType>(ApiEndpoints.paths.residentTypes).subscribe({
        next: (residentTypes) => {
          this.residentTypes = residentTypes;
        },
        error: (error) => {
          console.error("Error fetching resident types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<GenericStatus>(ApiEndpoints.paths.genericStatuses).subscribe({
        next: (status) => {
          this.genericStatuses = status
        },
        error: (error) => {
          console.error("Error fetching generic statuses : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<GenericType>(ApiEndpoints.paths.genericTypes).subscribe({
        next: (types) => {
          this.genericTypes = types;
        },
        error: (error) => {
          console.error("Error fetching generic types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<GenericDiscountType>(ApiEndpoints.paths.genericDiscountTypes).subscribe({
        next: (discountypes) => {
          this.genericDiscountTypes = discountypes;
        },
        error: (error) => {
          console.error("Error fetching generic discountTypes : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Currency>(ApiEndpoints.paths.currencies).subscribe({
        next: (currencies) => {
          this.currencyTypes = currencies;
        },
        error: (error) => {
          console.error("Error fetching currencies : " + error.message);
        }
      })
    )

    this.setMinDateForValidAndSale('today', 'today');

    this.formValidationService.createForm(this.genericForm, this.generic, this.oldGeneric, 'generic', ['reference'], [], [['validfrom', 'yyyy-MM-dd'], ['validto', 'yyyy-MM-dd'], ['salesfrom', 'yyyy-MM-dd'], ['salesto', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Extracts and displays the user's name based on the provided user object.
   *
   * This function utilizes a filtering mechanism to retrieve and return the display value
   * of the user's name, specifically using the `employee.callingname` property. The function
   * ensures that the returned string corresponds to the desired naming convention for display purposes.
   *
   * @function
   * @param {any} user - The user object containing details to extract the display name from.
   * @returns {string} - A formatted string representing the user's name based on the specified property.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Formats and returns the display name for a given supplier object using the autoCompleteDataFilterService.
   *
   * @param {any} supplier - The supplier object containing details of the supplier.
   * @returns {string} The formatted display name for the supplier extracted using specified properties.
   */
  displaySupplierName = (supplier: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Supplier>(supplier, ['name']);
  }

  /**
   * Initializes and sets up the view for the component. This includes loading filter fields, setting default values,
   * initializing the table view, and enabling specific component features required for the view.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.loadGenericFilterFields();
    this.imageURL = 'pending.gif';
    this.loadTable("");
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.genericRateForm.controls['count'].patchValue(0);
    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user by retrieving the user details from the authentication service.
   * This method uses the form data provided in the `genericForm` property and identifies the user type as 'user'.
   *
   * @return {void} This method does not return any value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.genericForm, 'user');
  }

  //==================================================================================================================//

  /**
   * Updates the state of button enablement for add, update, and delete actions.
   *
   * @param {boolean} add - Determines whether the add button should be enabled.
   * @param {boolean} upd - Determines whether the update button should be enabled.
   * @param {boolean} del - Determines whether the delete button should be enabled.
   * @return {void} Nothing is returned.
   */
  private enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of button permissions based on the user's authority levels for insert, update, and delete operations.
   * The method checks the user's permissions using the authService and sets corresponding boolean state variables.
   *
   * @return {void} This method does not return a value.
   */
  private buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('generic', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('generic', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('generic', 'delete');
  }

  /**
   * Sets the minimum valid date and sale date based on the provided parameters.
   * If no date is provided or if the provided date is invalid, the current date is used as the default.
   *
   * @param {string} [validFrom] - The starting date for validity in string format. If 'today', sets the current date.
   * @param {string} [saleFrom] - The starting date for sale in string format. If 'today', sets the current date.
   * @return {void} This method does not return any value.
   */
  private setMinDateForValidAndSale(validFrom?: string, saleFrom?: string): void {
    const today = new Date();
    if ((!validFrom && !saleFrom) || validFrom === 'today') {
      this.minValidDate = today;
    } else {
      const validDate = validFrom ? new Date(validFrom) : null;
      this.minValidDate = validDate && !isNaN(validDate.getTime()) ? validDate : today;
    }

    if ((!validFrom && !saleFrom) || saleFrom === 'today') {
      this.minSaleDate = today;
    } else {
      const saleDate = saleFrom ? new Date(saleFrom) : null;
      this.minSaleDate = saleDate && !isNaN(saleDate.getTime()) ? saleDate : today;
    }
  }

  //==================================================================================================================//

  /**
   * Loads the table data based on the provided query string and updates the table, image URL, and paginator.
   *
   * @param {string} query - The query string to fetch the data for the table.
   * @return {void} This method does not return anything. It updates the table data and related properties.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Generic>(ApiEndpoints.paths.generics, query).subscribe({
        next: (generics) => {
          this.generics = generics;
          this.imageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching transfer contracts : " + error.message);
          this.imageURL = 'rejected.png';
        },
        complete: () => {
          this.data = new MatTableDataSource(this.generics);
          this.data.paginator = this.paginator;
        }
      })
    )
  }

  /**
   * Filters the data in a table based on the user's input.
   *
   * @param {Event} event - The event triggered by user interaction, typically an input event. The method extracts the text from the event target to filter the table data.
   * @return {void} This method does not return a value. It modifies the data's filter configuration to apply the filter criteria dynamically.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (generic: Generic, filter: string) => {
      return (
        filterValue == null ||
        generic.user.username.toLowerCase().includes(filter.toLowerCase()) ||
        generic.supplier.name.toLowerCase().includes(filter.toLowerCase()) ||
        generic.reference.toLowerCase().includes(filterValue) ||
        generic.validfrom.includes(filterValue) ||
        generic.validto.includes(filterValue) ||
        generic.salesfrom.includes(filterValue) ||
        generic.salesto.includes(filterValue) ||
        generic.createdon.includes(filterValue) ||
        generic.updatedon.includes(filterValue) ||
        generic.genericstatus.name.toLowerCase().includes(filterValue) ||
        generic.genericdiscounts.some(discount => {
          return discount.genericdiscounttype.name.toLowerCase().includes(filterValue)
        }) ||
        generic.genericcancellationcharges.some(cancellation => {
          return cancellation.cancellationscheme.name.toLowerCase().includes(filterValue)
        }) ||
        generic.genericrates.some(rate => {
          return rate.paxtype.name.toLowerCase().includes(filterValue)
        }) ||
        generic.genericrates.some(rate => {
          return rate.residenttype.name.toLowerCase().includes(filterValue)
        })
      )
    };
    this.data.filter = 'filter';
  }

  //==================================================================================================================//

  /**
   * Loads generic filter fields by extracting keys from a generic object,
   * excluding certain keys, and formatting the result.
   *
   * @return {void} Does not return a value.
   */
  loadGenericFilterFields(): void {
    const generic = new Generic();
    this.filterFields = Object.keys(generic)
      .filter(value => !['id'].includes(value))
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
   * Determines the type of search field (select, input, date) based on the selected filter field value
   * and sets the search select options accordingly.
   *
   * @return {void} This method does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'supplier', 'genericstatus', 'genericdiscounts', 'genericcancellationcharges', 'genericrates'];
    const dateFields = ['validfrom', 'validto', 'salesfrom', 'salesto', 'createdon', 'updatedon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUsers,
      supplier: this.suppliers,
      genericstatus: this.genericStatuses,
      genericdiscounts: this.genericDiscountTypes,
      genericcancellationcharges: this.cancellationSchemes,
      genericrates: this.paxTypes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  //==================================================================================================================//

  /**
   * Resets the current search query to a new instance of URLSearchParams.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Clears the current search filters and resets the search form. Prompts the user for confirmation
   * before performing the clear action. If no search filters are currently applied, displays a message
   * indicating that there's nothing to clear.
   *
   * @return {void} This method does not return any value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Generic', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Executes a search operation based on user input and filters from the `serverSearchForm`.
   * Constructs a query string from the form values, including date ranges and text or selection fields.
   * Applies the query to reload the table data accordingly.
   * Displays a message if no valid search field is provided.
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
   * Resets the search query parameter fields in the server search form to their default values.
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

  //==================================================================================================================//

  /**
   * Fetches a generic reference number from the data service by invoking
   * the appropriate API endpoint. Upon successful retrieval, updates the
   * `nextGenericRef` property and sets the value of the `reference` form control
   * in the `genericForm`. Logs any errors that occur during the process.
   *
   * @return {void} This method does not return a value.
   */
  generateGenericReference(): void {
    this.dataService.getRefNumber(ApiEndpoints.paths.genericRefNumber, 'genericRef').subscribe({
      next: (data) => {
        this.nextGenericRef = data.genericRef;
        this.genericForm.controls['reference'].setValue(this.nextGenericRef);
      },
      error: (err) => {
        console.error('Error fetching employee-number:', err);
      }
    });
  }

  //=====================================================Add Discounts================================================//
  /**
   * Adds a new discount to the list of generic discounts if the provided discount details are valid
   * and the discount type has not already been added.
   * Validates the input data and prevents adding duplicates based on the discount type.
   * If the addition is successful, resets certain forms based on provided criteria.
   *
   * @return {void} Does not return any value.
   */
  addDiscount(): void {
    const {amount, genericdiscounttype, ratetype} = this.genericDiscountForm.value;
    if (amount && !isNaN(amount) && Number(amount) > 0 && genericdiscounttype && ratetype) {
      const alreadyAddedDiscounts = this.genericDiscounts.some(
        discount => discount.genericdiscounttype.id === genericdiscounttype.id
      );
      if (alreadyAddedDiscounts) {
        this.operationFeedbackService.showMessage('Existing', `Discount Type ${genericdiscounttype.name} is Already Exist`);
        return;
      }
      const newDiscount = new GenericDiscount();
      newDiscount.amount = amount;
      newDiscount.genericdiscounttype = genericdiscounttype;
      newDiscount.ratetype = ratetype;
      this.genericDiscounts = [...this.genericDiscounts, newDiscount];
      this.resetTransferContractForms(false, true, false, false, false, false);
    }
  }


  //=====================================================Add Cancellations============================================//
  /**
   * Adds a new cancellation charge to the generic cancellation charges list
   * if it passes validation and does not already exist within the list.
   *
   * Validates the `amount`, `ratetype`, and `cancellationscheme` fields before adding
   * the cancellation charge. If the cancellation scheme already exists in the
   * list, an operation feedback message is displayed and the method terminates.
   * Otherwise, the validated cancellation charge is added to the list, and certain
   * forms are reset accordingly.
   *
   * @return {void} This method does not return any value.
   */
  addCancellationCharge(): void {
    const {amount, ratetype, cancellationscheme} = this.genericCancellationChargesForm.value;
    if (amount && !isNaN(amount) && Number(amount) > 0 && ratetype && cancellationscheme) {
      const alreadyAddedCancellation = this.genericCancellationCharges.some(
        previousCancellation => previousCancellation.cancellationscheme.id === cancellationscheme.id
      );
      if (alreadyAddedCancellation) {
        this.operationFeedbackService.showMessage('Existing', `Cancellation Scheme ${cancellationscheme.name} is Already Exist`);
        return;
      }
      const newCancellationCharges = new GenericCancellationCharge();
      newCancellationCharges.amount = amount;
      newCancellationCharges.ratetype = ratetype;
      newCancellationCharges.cancellationscheme = cancellationscheme;

      this.genericCancellationCharges = [...this.genericCancellationCharges, newCancellationCharges];
      this.resetTransferContractForms(false, false, true, false, false, false);
    }
  }


  //==================================================================================================================//

  //==============================================Transfer Rates======================================================//

  /**
   * Adds a new generic rate for the specified passenger type and resident type.
   *
   * @param {PaxType} paxType - The type of passenger for whom the generic rate is being added.
   * @param {ResidentType} residentType - The residency type associated with the generic rate.
   * @return {void} This method does not return a value.
   */
  addGenericRate(paxType: PaxType, residentType: ResidentType): void {
    const {amount} = this.genericRateForm.value;
    if (amount && paxType) {
      const newGenericRate = this.createNewGenericRate(amount, paxType, residentType);
      this.addGenericRatesToGeneric(newGenericRate);
      // Reset form
      this.resetTransferContractForms(false, false, false, false, false, true);
      this.genericRateForm.controls['count'].setValue(0);
      this.occupancyCountMap[paxType.id] = 0;
      this.occupancyPaxCounter++;
    }
  }

  /**
   * Creates a new GenericRate instance with the provided amount, pax type, and resident type.
   *
   * @param {number} amount - The monetary value for the generic rate.
   * @param {PaxType} paxType - The type of passenger applicable to the rate.
   * @param {ResidentType} residentType - The type of residency applicable to the rate.
   * @return {GenericRate} A new instance of GenericRate with the specified properties.
   */
  createNewGenericRate(amount: number, paxType: PaxType, residentType: ResidentType): GenericRate {
    const newGenericRate = new GenericRate();
    newGenericRate.amount = amount;
    newGenericRate.paxtype = paxType;
    newGenericRate.residenttype = residentType;
    return newGenericRate;
  }

  /**
   * Adds a new generic rate to the list of generic rates. If a rate with the same paxtype
   * and residenttype already exists, no addition is made, and a feedback message is displayed.
   *
   * @param {GenericRate} newGenericRate - The generic rate to be added. It contains properties
   * related to paxtype and residenttype that are used to check for duplicates.
   * @return {void} - Does not return any value.
   */
  addGenericRatesToGeneric(newGenericRate: GenericRate): void {
    if (!this.genericRates) {
      this.genericRates = [];
    }
    const alreadyAddedRates = this.genericRates.some(
      genericRate => genericRate.paxtype.id === newGenericRate.paxtype.id &&
        genericRate.residenttype.id === newGenericRate.residenttype.id
    );
    if (alreadyAddedRates) {
      this.operationFeedbackService.showMessage('Existing', `Rate is Already Exist`);
      return;
    } else {
      this.genericRates = [...this.genericRates, newGenericRate];
    }
  }


  //==================================================================================================================//

  /**
   * Resets specified transfer contract forms to their default state.
   *
   * @param {boolean} generalInfoForm - Indicates whether the general information form should be reset.
   * @param {boolean} discountForm - Indicates whether the discount form should be reset.
   * @param {boolean} cancellationForm - Indicates whether the cancellation charges form should be reset.
   * @param {boolean} pickUpLocForm - Indicates whether the pick-up location form should be reset.
   * @param {boolean} dropLocForm - Indicates whether the drop-off location form should be reset.
   * @param {boolean} transferRate - Indicates whether the transfer rate form should be reset.
   * @return {void} Does not return a value.
   */
  private resetTransferContractForms(generalInfoForm: boolean, discountForm: boolean, cancellationForm: boolean, pickUpLocForm: boolean, dropLocForm: boolean, transferRate: boolean): void {
    if (generalInfoForm) this.genericForm.reset();
    if (discountForm) this.genericDiscountForm.reset();
    if (cancellationForm) this.genericCancellationChargesForm.reset();
    if (transferRate) this.genericRateForm.reset();
  }

  /**
   * Enables or disables the "Create Transfer" button based on the provided parameter.
   *
   * @param {boolean} enable - A boolean value indicating whether to enable (true) or disable (false) the "Create Transfer" button.
   * @return {void}
   */
  private enableTransferCreateButton(enable: boolean): void {
    this.isEnableCreateTransfer = enable;
  }

  /**
   * Initializes an Intersection Observer to monitor sections with the class 'step-section' and determine which section is currently in view.
   * Updates the `currentSection` property based on the ID of the section that becomes visible in the viewport.
   *
   * @return {void} This method does not return a value.
   */
  private getFormSections(): void {
    // Create an Intersection Observer to detect which section is in view
    //@ts-ignore
    const observer = new IntersectionObserver(
      (entries: any) => {
        entries.forEach((entry: any) => {
          // Check if the section is visible (intersecting with viewport)
          if (entry.isIntersecting) {
            this.currentSection = parseInt(entry.target.id.replace('step-', ''), 10);
          }
        });
      },
      // Use the viewport as the reference,  Trigger when 50% of the section is visible
      {root: null, threshold: 0.5}
    );

    // Select all sections with the class 'step-section'
    const sections = this.stepAction.nativeElement.querySelectorAll('.step-section');

    // Observe each section to track its visibility
    //@ts-ignore
    sections.forEach((section) => observer.observe(section));
  }

  /**
   * Configures the edit modes for inner data and main data.
   *
   * @param {boolean} [enableInnerDataEdit] - Indicates whether the inner data edit mode should be enabled. If undefined, no changes are made to the inner data edit mode.
   * @param {boolean} [enableMainDataEdit] - Indicates whether the main data edit mode should be enabled. If undefined, no changes are made to the main data edit mode.
   * @return {void} No value is returned.
   */
  private setEnableEditModes(enableInnerDataEdit?: boolean, enableMainDataEdit?: boolean): void {
    if (enableMainDataEdit !== undefined) {
      this.isEditMode = enableMainDataEdit;
    }
    if (enableInnerDataEdit !== undefined) {
      this.isInnerDataEditMode = enableInnerDataEdit;
    }
  }

  /**
   * Clears the current table selection by disabling edit mode, resetting the selected row,
   * and sending null data to the server to indicate no active selection.
   *
   * @return {void} No return value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets and reloads various forms and application settings to their default states.
   *
   * This method performs the following actions:
   * - Reloads a table with an empty string filter.
   * - Regenerates a generic reference.
   * - Toggles various application state flags, such as enabling/disabling buttons and views.
   * - Resets generic data and row selections.
   * - Updates the state of certain transfer forms and edit modes to their default values.
   * - Resets the generic form and re-applies form validation logic.
   * - Sets minimum date constraints for validity and sale dates in the form.
   *
   * @return {void} This method does not return any value.
   */
  private resetAndReloadForms(): void {
    this.loadTable('');
    this.generateGenericReference();
    this.enableGoToView = true;
    this.enableGoToRecode = true;
    this.resetGenericData();
    this.isEnableRoomView = false;
    this.selectedRoomRow = null;
    this.selectedGenericRow = null;
    this.enableTransferCreateButton(false);
    this.setEnableEditModes(false, false);
    this.enableButtons(true, false, false);
    this.resetTransferContractForms(true, true, true, true, true, true);
    this.genericForm.reset();
    this.setLoggedInUser();
    this.setMinDateForValidAndSale('today', 'today');
    this.formValidationService.createForm(this.genericForm);
  }

  //==================================================================================================================//

  /**
   * Updates the view by setting various states based on the provided view type.
   *
   * @param {'records' | 'profiles' | 'form'} view - The type of view to set.
   *      'records': Enables the record view and disables other views.
   *      'profiles': Enables the profile view and disables other views.
   *      'form': Enables the form view and disables other views.
   * @return {void} This method does not return any value.
   */
  setView(view: 'records' | 'profiles' | 'form'): void {
    this.enableRecordView = view === 'records';
    this.enableDetailView = view === 'profiles';
    this.enableForm = view === 'form';
    if (view === 'records' || view === 'profiles') {
      this.isObserverFormInitialized = false
    }
    this.clearTableSelection();
    this.loadTable('');
  }

  /**
   * Navigates to a specific step in the workflow by adjusting the view to make the step visible.
   *
   * @param {number} stepNumber - The step number to navigate to. Determines which step should be scrolled into view.
   * @return {void} This method does not return a value.
   */
  goToStep(stepNumber: number): void {
    const stepElement = this.step.nativeElement.querySelector(`#step-${stepNumber}`);
    if (stepElement) {
      stepElement.classList.contains('step-2') ?
        stepElement.scrollIntoView({behavior: 'smooth', block: 'nearest'}) :
        stepElement.scrollIntoView({behavior: 'smooth', block: 'start'});
      this.currentSection = stepNumber;
    }
  }

  //==================================================================================================================//

  //==================================================================================================================//

  /**
   * Selects a specific generic row and assigns it to the selectedGenericRow property.
   *
   * @param {Generic} row - The generic row object to be selected.
   * @return {void} This method does not return a value.
   */
  selectGenericRow(row: Generic): void {
    this.selectedGenericRow = row;
  }

  /**
   * Loads and sets up the transfer confirmation modification view for the given generic object.
   * Adjusts visibility of various view elements and populates the form with the provided data.
   *
   * @param {Generic} generic - The generic object containing the data to populate the form.
   * @return {void} Does not return any value.
   */
  loadTransferConModifyView(generic: Generic): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(generic);
  }

  /**
   * Loads the view for modifying a transfer contract.
   *
   * @param {Generic} generic - The object containing the data to populate the transfer contract modification form.
   * @return {void}
   */
  loadTransferContractModifyView(generic: Generic): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(generic);
  }

  //==================================================================================================================//

  /**
   * Loads the details of a transfer contract and updates the view accordingly.
   * This method populates the detail view with data related to the selected contract,
   * including tables for discounts, cancellation charges, and rates if applicable.
   *
   * @param element An object of type Generic representing the selected transfer contract.
   * @return void This method does not return any value.
   */
  loadTransferContractDetailView(element: Generic): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;

    let tables = [];
    if (this.selectedRow.genericdiscounts && this.selectedRow.genericdiscounts.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Discount Type'],
          columns: ['amount', 'genericdiscounttype.name'],
          data: this.selectedRow.genericdiscounts || [],
          title: "Generic Discounts"
        }
      );
    }

    if (this.selectedRow.genericcancellationcharges && this.selectedRow.genericcancellationcharges.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Cancellation Scheme'],
          columns: ['amount', 'cancellationscheme.name'],
          data: this.selectedRow.genericcancellationcharges || [],
          title: "Generic Cancellation"
        }
      );
    }

    if (this.selectedRow.genericrates && this.selectedRow.genericrates.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Rate Type', 'Resident Type'],
          columns: ['amount', 'paxtype.name', 'residenttype.name'],
          data: this.selectedRow.genericrates || [],
          title: "Generic Rates"
        }
      );
    }

    const data = [
      {Label: "Title", Value: this.selectedRow.reference},
      {Label: "Reference", Value: this.selectedRow.reference},
      {Label: "Supplier", Value: this.selectedRow.supplier.name},
      {Label: "Markup", Value: this.selectedRow.markup},
      {Label: "Valid From", Value: this.selectedRow.validfrom},
      {Label: "Valid To", Value: this.selectedRow.validto},
      {Label: "Sale From", Value: this.selectedRow.salesfrom},
      {Label: "Sale To", Value: this.selectedRow.salesto},
      {Label: "Created On", Value: this.selectedRow.createdon},
      {Label: "Updated On", Value: this.selectedRow.updatedon},
      {Label: "Type", Value: this.selectedRow.generictype.name},
      {Label: "Currency", Value: this.selectedRow.currency.name},
      {Label: "Status", Value: this.selectedRow.genericstatus.name},
      {Label: "Table", Value: tables},
    ];

    this.dataServer.sendData(data);
  }

  //==================================================================================================================//

  /**
   * Fills in the form with the provided generic data, initializing form fields, enabling/disabling buttons, and setting up necessary state.
   *
   * @param {Generic} generic - The generic object containing data used to populate the form.
   * @return {void} Does not return any value.
   */
  fillForm(generic: Generic): void {
    this.setEnableEditModes(false, true);
    this.enableTransferCreateButton(true);
    this.enableButtons(false, true, true);
    this.selectedGenericRow = generic;
    this.generic = JSON.parse(JSON.stringify(generic));
    this.oldGeneric = JSON.parse(JSON.stringify(generic));

    this.generic.user = this.activeUsers.find(user => user.id === this.generic.user?.id) ?? this.generic.user;
    this.generic.supplier = this.suppliers.find(supplier => supplier.id === this.generic.supplier?.id) ?? this.generic.supplier;
    this.generic.generictype = this.genericTypes.find(type => type.id === this.generic.generictype?.id) ?? this.generic.generictype;
    this.generic.genericstatus = this.genericStatuses.find(status => status.id === this.generic.genericstatus?.id) ?? this.generic.genericstatus;
    this.generic.currency = this.currencyTypes.find(currency => currency.id === this.generic.currency?.id) ?? this.generic.currency;

    this.genericDiscounts = generic.genericdiscounts;
    this.genericCancellationCharges = generic.genericcancellationcharges;
    this.genericRates = generic.genericrates;

    this.isEnableRoomView = true;

    this.genericForm.patchValue(this.generic, {emitEvent: false});
    this.setMinDateForValidAndSale(this.generic.validfrom, this.generic.salesfrom)
    this.formValidationService.createForm(this.genericForm, this.oldGeneric, this.generic);
    this.genericForm.markAsPristine();
  }

  //==================================================================================================================//

  /**
   * Processes a given form group to extract and structure data into a `Generic` object.
   *
   * @param {FormGroup} genericForm - The form group containing data to be processed.
   * @return {Generic} The processed data structured as a `Generic` object.
   */
  private getGenericData(genericForm: FormGroup): Generic {
    const formValues = genericForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }

    this.generic = formValues;
    return this.generic;
  }

  /**
   * Handles the process of validating, formatting, and saving generic form data.
   * Displays confirmation dialogs, feedback messages, and error messages based
   * on the validation and API response outcomes.
   *
   * @return {void} Does not return a value. Executes saving workflow and provides UI feedback for success, failure, or errors.
   */
  save(): void {

    const errors = this.formValidationService.getErrors(this.genericForm);
    if (errors) {
      this.operationFeedbackService.showErrors("Generic", "Add", errors);
      return;
    }

    const toSaveGeneric = this.getGenericData(this.genericForm);

    const genericData = this.operationFeedbackService.formatObjectData(toSaveGeneric, ["reference"]);

    this.operationFeedbackService.showConfirmation('Generic', 'Save', genericData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<Generic>(ApiEndpoints.paths.generics, toSaveGeneric).subscribe({
            next: (response) => {
              const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

              if (status) {
                this.resetAndReloadForms();
              }
              this.operationFeedbackService.showStatus("Generic", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Generic", "Save", responseMessage
              );
            }
          })
        }
      })
  }

  /**
   * Updates the current generic data associated with the form by validating,
   * confirming changes with the user, and sending the update request to the server.
   * The method performs the following:
   * - Validates the form for errors and displays them if they exist.
   * - Retrieves updated data from the form and confirms the intent to update with the user.
   * - Sends an update request to the server if confirmed.
   * - Handles the server's response, resets/reloads the form if successful, and displays feedback.
   *
   * @return {void} This method does not return a value, as it primarily performs side-effects related to data update.
   */
  update(): void {
    const errors = this.formValidationService.getErrors(this.genericForm);
    if (errors) {
      this.operationFeedbackService.showErrors('Generic', 'Update', errors);
      return;
    }

    const toUpdateGeneric = this.getGenericData(this.genericForm);
    toUpdateGeneric.id = this.oldGeneric.id;

    let updates = this.formValidationService.getUpdates(this.genericForm);
    this.operationFeedbackService.showConfirmation('Generic', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.dataService.update<Generic>(ApiEndpoints.paths.generics, toUpdateGeneric)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Generic", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Generic", "Update", responseMessage
                );
              },
              complete: () => {
              }
            });
        }
      });
  }

  /**
   * Deletes a generic entity and updates the relevant forms. Shows confirmation dialogs to the user and handles
   * responses including success, error, or cancellation. If confirmed, makes a deletion request to the data service
   * for the specified entity, processes the server response, and provides feedback to the user.
   *
   * @return {void} Does not return a value. Performs actions such as sending a delete request, updating forms,
   *                 and providing user feedback.
   */
  delete(): void {
    const genericData = this.operationFeedbackService.formatObjectData(this.generic, ['reference']);
    this.operationFeedbackService.showConfirmation('Generic', 'Delete', genericData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;
          // this.operationFeedbackService.showConfirmation('Transfer Contract', 'Delete', 'This will take some time, do you like to wait...?', {yes: 'Yes', no: 'No'}, true)
          //   .subscribe({
          //     next: (isConfirmed) => {
          //       if (!isConfirmed) {return;}
          //       this.loadingService.showLoading();
          //     }
          //   })
          this.dataService.delete(ApiEndpoints.paths.generics, this.generic.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Generic", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Generic', 'Delete', responseMessage);
              },
              complete: () => {
                // this.loadingService.hideLoading();
              }
            })
        })
      })
  }

  //==================================================================================================================//

  /**
   * Sets the status color class based on the provided employee status.
   *
   * @param {EmployeeStatus} status - The status of the employee used to determine the corresponding color class.
   * @return {string} The CSS class name representing the color for the given status. Defaults to 'default-cell' if no match is found.
   */
  setStatusColor(status: EmployeeStatus): string {
    const statusColor: Record<string, string> = {
      active: 'active-cell',
      inactive: 'inactive-cell'
    }
    const colorClass = statusColor[status.name?.toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Resets the generic data fields by clearing the values of genericDiscounts,
   * genericCancellationCharges, and genericRates.
   *
   * @return {void} Does not return any value.
   */
  private resetGenericData(): void {
    this.genericDiscounts = [];
    this.genericCancellationCharges = [];
    this.genericRates = []
  }

  /**
   * Resets specific form states related to transfer contracts, particularly focusing on clearing any applied discounts.
   * The method primarily ensures that discount-related data is removed without affecting other parameters.
   *
   * @return {void} Does not return any value.
   */
  clearDiscount(): void {
    this.resetTransferContractForms(false, true, false, false, false, false);
  }

  /**
   * Clears the cancellation charge by resetting specific parameters in the transfer contract forms.
   *
   * This method modifies the state of transfer contract forms to remove any cancellation charges
   * without altering other attributes unnecessarily.
   *
   * @return {void} Does not return a value.
   */
  clearCancellationCharge(): void {
    this.resetTransferContractForms(false, false, true, false, false, false);
  }

  /**
   * Clears the form controls except for the 'reference' field after confirmation from the user.
   * If there are no values to clear, displays a message indicating nothing to clear.
   *
   * @return {void} No return value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.genericForm, ['user', 'reference']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Generic', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Generic', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) {
          return;
        }
        this.resetAndReloadForms();
      })
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
    this.dataValidationService.cleanupSubscriptions(this.componentId);
  }
}
