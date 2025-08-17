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
import {Supplier} from "../../../entity/supplier";
import {Currency} from "../../../entity/currency";
import {RateType} from "../../../entity/rate-type";
import {CancellationScheme} from "../../../entity/cancellation-scheme";
import {PaxType} from "../../../entity/pax-type";
import {BehaviorSubject, Observable, Subscription} from "rxjs";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {TransferDiscountType} from "../../../entity/transfer-discount-type";
import {TransferContract} from "../../../entity/transfer-contract";
import {TransferStatus} from "../../../entity/transfer-status";
import {TransferDiscount} from "../../../entity/transfer-discount";
import {TransferCancellationCharge} from "../../../entity/transfer-cancellation-charge";
import {Location} from "../../../entity/location";
import {LocationType} from "../../../entity/location-type";
import {Airport} from "../../../entity/airport";
import {Port} from "../../../entity/port";
import {City} from "../../../entity/city";
import {PickupLocation} from "../../../entity/pickup-location";
import {DropLocation} from "../../../entity/drop-location";
import {Transfer} from "../../../entity/transfer";
import {TransferRates} from "../../../entity/transfer-rates";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {TransferType} from "../../../entity/transfer-type";
import {DataValidationService} from "../../../util/core-services/validation/data-validation.service";
import {AvDataTable} from "@avoraui/av-data-table";

@Component({
  selector: 'app-transfers',
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
    MatColumnDef,
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
    NgClass,
    MatHeaderCellDef,
    MatNoDataRow,
    MatCheckbox,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvDataTable
  ],
  templateUrl: './transfers.component.html',
  standalone: true,
  styleUrl: './transfers.component.css'
})
export class TransfersComponent implements OnInit, AfterViewInit, OnDestroy, DoCheck {

  private readonly componentId = 'transferContract-component';

  breadcrumb: any;
  currentSection = 1;
  selectedRow: any;
  selectedRoomRow: any;
  isEditMode: boolean = false;
  isInnerDataEditMode: boolean = false;
  selectedTransferContractRow: any;

  private occupancyPaxCounter = 0;
  private isObserverFormInitialized = false;

  columns: string[] = ['reference', 'validfrom', 'validto', 'salesfrom', 'salesto', 'transferstatus', 'modify/view'];
  headers: string[] = ['Reference', 'Valid-From', 'Valid-To', 'Sales-From', 'Sales-To', 'Status', 'Modify / View'];

  columnsDetails: string[] = ['reference', 'transferstatus'];
  headersDetails: string[] = ['Reference', 'Status'];

  discountTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Disc Type', align: 'left'},
    {label: 'Rate Type', align: 'left'},
    {label: 'Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  discountTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'transferdiscounttype.name', align: 'left'},
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

  pickupLocationTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Code', align: 'left'},
    {label: 'Type', align: 'left'},
    {label: 'Location', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  pickupLocationTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'code', align: 'left'},
    {field: 'locationtype.name', align: 'left'},
    {field: 'name', align: 'left', color: '#3182ce'},
  ]

  dropLocationTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Code', align: 'left'},
    {label: 'Type', align: 'left'},
    {label: 'Location', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  dropLocationTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'code', align: 'left'},
    {field: 'locationtype.name', align: 'left'},
    {field: 'name', align: 'left', color: '#3182ce'},
  ]

  transferRateTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Pax Type', align: 'left'},
    {label: 'Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  transferRateTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'paxtype.name', align: 'left'},
    {field: 'amount', align: 'left', color: '#3182ce'},
  ]

  statusColors = [
    {value: "Pending", color: {background: "#fef9c3", text: "#683c0b"}},
    {value: "Confirmed", color: {background: "#d1fcd3", text: "#4CAF50"}},
    {value: "Waiting for payment", color: {background: "#f8e8d0", text: "#FF9800"}},
    {value: "Paid", color: {background: "#c9e3f8", text: "#2196F3"}},
    {value: "Cancelled", color: {background: "#f8c9c5", text: "#F44336"}}
  ];

  transferContracts: Array<TransferContract> = [];
  data!: MatTableDataSource<TransferContract>;
  imageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isEnablePickupLocationAutoComplete: boolean = false;
  isEnableDropLocationAutoComplete: boolean = false;

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

  transferContract!: TransferContract;
  includeReturnTransfer: boolean = false;
  oldTransferContract!: TransferContract;

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  activeSupplier: Array<Supplier> = []
  filteredSupplierList!: Observable<Array<Supplier>>;
  currencies: Array<Currency> = [];
  transferStatuses: Array<TransferStatus> = [];
  transferTypes: Array<TransferType> = [];

  pickupLocationOptions = new BehaviorSubject<Array<any>>([]);
  dropLocationOptions = new BehaviorSubject<Array<any>>([]);

  private pickupLocationSubscription?: Subscription;
  private dropLocationSubscription?: Subscription;

  public transferContractForm!: FormGroup;
  public transferDiscountForm!: FormGroup;
  public transferCancellationChargesForm!: FormGroup;
  public pickupLocationForm!: FormGroup;
  public dropLocationForm!: FormGroup;
  public transferRateForm!: FormGroup;
  public serverSearchForm!: FormGroup;

  // Initially loaded data
  transferDiscountTypes: Array<TransferDiscountType> = [];
  rateTypes: Array<RateType> = [];
  cancellationSchemes: Array<CancellationScheme> = [];
  paxTypes: Array<PaxType> = [];
  locations: Array<Location> = [];
  filteredLocationListForPickupLocation!: Observable<Array<Location>>;
  filteredLocationListForDropLocation!: Observable<Array<Location>>;
  locationTypes: Array<LocationType> = [];
  airports: Array<Airport> = [];
  ports: Array<Port> = [];
  cities: Array<City> = [];
  filteredCityListForPickupLocation!: Observable<Array<City>>;
  filteredCityListForDropLocation!: Observable<Array<City>>;

  //=======Details for newly created TransferContract=======//
  transferDiscounts: Array<TransferDiscount> = [];
  transferCancellationCharges: Array<TransferCancellationCharge> = [];

  //=======Details for newly created Transfer=======//
  pickUpLocations: Array<PickupLocation> = [];
  dropLocations: Array<DropLocation> = [];

  transferContractTransfer!: Transfer;

  transferRates: Array<TransferRates> = [];

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

    this.transferContractForm = this.formBuilder.group({
      user: new FormControl('', [Validators.required]),
      supplier: new FormControl('', [Validators.required]),
      reference: new FormControl('', [Validators.required]),
      validfrom: new FormControl('', [Validators.required]),
      validto: new FormControl('', [Validators.required]),
      salesfrom: new FormControl('', [Validators.required]),
      salesto: new FormControl('', [Validators.required]),
      markup: new FormControl('', [Validators.required]),
      transferstatus: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      transferdiscounts: new FormControl('', [Validators.required]),
      transfertype: new FormControl('', [Validators.required]),
      transfercancellationcharges: new FormControl('', [Validators.required]),
      transferrates: new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

    this.transferDiscountForm = this.formBuilder.group({
      amount: new FormControl('', [Validators.required],),
      transferdiscounttype: new FormControl('', [Validators.required],),
      ratetype: new FormControl('', [Validators.required],),
    });

    this.transferCancellationChargesForm = this.formBuilder.group({
      amount: new FormControl('', [Validators.required],),
      ratetype: new FormControl('', [Validators.required],),
      cancellationscheme: new FormControl('', [Validators.required],),
    });

    this.pickupLocationForm = this.formBuilder.group({
      code: new FormControl('', [Validators.required],),
      location: new FormControl('', [Validators.required],),
      locationtype: new FormControl('', [Validators.required],),
    });

    this.dropLocationForm = this.formBuilder.group({
      code: new FormControl('', [Validators.required],),
      location: new FormControl('', [Validators.required],),
      locationtype: new FormControl('', [Validators.required],),
    });

    this.transferRateForm = this.formBuilder.group({
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

    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.transferContractForm, [['markup', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.transferDiscountForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.transferCancellationChargesForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.transferRateForm, [['amount', 0]]);

    this.transferContractForm.get('salesfrom')?.disable();
    this.transferContractForm.get('salesto')?.disable();

    this.transferContractForm.valueChanges.subscribe((form) => {
      this.minSaleDate = form.validfrom;
      this.maxSaleDate = form.validto;

      const salesFromControl = this.transferContractForm.get('salesfrom');
      const salesToControl = this.transferContractForm.get('salesto');

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
   * A lifecycle hook method called by Angular to check the component and execute custom change detection logic.
   * This method is used to perform actions like initializing forms or invoking custom change detection manually.
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
   * A lifecycle hook that is invoked immediately after Angular has completed initializing
   * the component's view. This method is typically used to perform actions that
   * require the component's view and child components to be fully initialized.
   *
   * @return {void} No return value.
   */
  ngAfterViewInit(): void {
    this.getFormSections();
  }

  /**
   * Initializes the data and sets up necessary elements for the component.
   * It creates views, subscribes to various data services, and configures form validation.
   *
   * @return {void} This method does not return a value.
   */
  initialize(): void {
    this.breadcrumb = this.breadCrumbService.getActiveRoute();

    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.transferContractForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Supplier>(ApiEndpoints.paths.activeTransferSuppliersList).subscribe({
        next: (suppliers) => {
          this.activeSupplier = suppliers;
          this.filteredSupplierList = this.autoCompleteDataFilterService.filterData<Supplier>(this.activeSupplier, this.transferContractForm, 'supplier', ['name', 'brno']);
        },
        error: (error) => {
          console.error("Error fetching active suppliers : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Currency>(ApiEndpoints.paths.currencies).subscribe({
        next: (currencies) => {
          this.currencies = currencies;
        },
        error: (error) => {
          console.error("Error fetching currencies : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TransferStatus>(ApiEndpoints.paths.transferStatuses).subscribe({
        next: (transferStatus) => {
          this.transferStatuses = transferStatus;
        },
        error: (error) => {
          console.error("Error fetching transferContract statuses : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TransferType>(ApiEndpoints.paths.transferTypes).subscribe({
        next: (transferTypes) => {
          this.transferTypes = transferTypes;
        },
        error: (error) => {
          console.error("Error fetching transferContract types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TransferDiscountType>(ApiEndpoints.paths.transferDiscountTypes).subscribe({
        next: (transferDiscountTypes) => {
          this.transferDiscountTypes = transferDiscountTypes;
        },
        error: (error) => {
          console.error("Error fetching transferContract discount types : " + error.message);
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
      this.dataService.getData<Location>(ApiEndpoints.paths.locationList).subscribe({
        next: (locations) => {
          this.locations = locations;
          this.filteredLocationListForPickupLocation = this.autoCompleteDataFilterService.filterData<Location>(this.locations, this.pickupLocationForm, 'location', ['name']);
          this.filteredLocationListForDropLocation = this.autoCompleteDataFilterService.filterData<Location>(this.locations, this.dropLocationForm, 'location', ['name']);
        },
        error: (error) => {
          console.error("Error fetching locations : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<LocationType>(ApiEndpoints.paths.locationTypes).subscribe({
        next: (locationTypes) => {
          this.locationTypes = locationTypes;
        },
        error: (error) => {
          console.error("Error fetching locations : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Airport>(ApiEndpoints.paths.airportList).subscribe({
        next: (airports) => {
          this.airports = airports;
        },
        error: (error: Error) => {
          console.error('Error fetching airports : ' + error.message);
        }
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<Port>(ApiEndpoints.paths.portList).subscribe({
        next: (ports) => {
          this.ports = ports;
        },
        error: (error: Error) => {
          console.error('Error fetching ports: ' + error.message);
        }
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<City>(ApiEndpoints.paths.cityList).subscribe({
        next: (cities) => {
          this.cities = cities;
          this.filteredCityListForPickupLocation = this.autoCompleteDataFilterService.filterData<City>(this.cities, this.pickupLocationForm, 'location', ['name']);
          this.filteredCityListForDropLocation = this.autoCompleteDataFilterService.filterData<City>(this.cities, this.dropLocationForm, 'location', ['name']);
        },
        error: (error: Error) => {
          console.error('Error fetching cities: ' + error.message);
        }
      })
    );

    this.setMinDateForValidAndSale('today', 'today');

    this.formValidationService.createForm(this.transferContractForm, this.transferContract, this.oldTransferContract, 'transferContract', ['reference'], [], [['validfrom', 'yyyy-MM-dd'], ['validto', 'yyyy-MM-dd'], ['salesfrom', 'yyyy-MM-dd'], ['salesto', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Retrieves and returns a formatted string representation of a user's name
   * based on the specified data filter criteria.
   *
   * @param {any} user - The user object whose name needs to be displayed.
   * @returns {string} - The formatted display name derived from the user's data.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * A function that returns the display name of a supplier.
   * Utilizes the `autoCompleteDataFilterService` to extract the display value
   * for a given supplier object based on the provided key(s).
   *
   * @param {any} supplier - The supplier object from which the display name is to be retrieved.
   * @returns {string} - The display name of the supplier.
   */
  displaySupplierName = (supplier: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Supplier>(supplier, ['name']);
  }

  /**
   * Retrieves and returns the display name of a location.
   *
   * This function is used to extract and display the appropriate
   * 'name' property from a given location object. It relies on the
   * `autoCompleteDataFilterService` for properly formatting the
   * display value.
   *
   * @param {any} location - An object that contains information about a location. The expected structure
   *                         should include a 'name' property or similar identifier(s) for display.
   * @returns {string} The formatted display name of the given location.
   */
  displayLocationName = (location: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Location | City>(location, ['name']);
  }

  /**
   * Initializes and sets up the view by loading the necessary data and updating component states.
   * This includes loading filter fields, setting the default image, initializing the table with data,
   * and configuring form controls and view-related flags.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.loadTransferContractFilterFields();
    this.imageURL = 'pending.gif';
    this.loadTable("");
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.transferRateForm.controls['count'].patchValue(0);
    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user by calling the authentication service.
   *
   * @return {void} Does not return any value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.transferContractForm, 'user');
  }

  //==================================================================================================================//

  /**
   * Enables or disables the Add, Update, and Delete buttons based on the provided boolean values.
   *
   * @param {boolean} add - Determines whether the Add button should be enabled (true) or disabled (false).
   * @param {boolean} upd - Determines whether the Update button should be enabled (true) or disabled (false).
   * @param {boolean} del - Determines whether the Delete button should be enabled (true) or disabled (false).
   * @return {void} This method does not return a value.
   */
  private enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of button permissions based on user operation authorities.
   * This method checks the user's authority to perform insert, update, and delete operations
   * for the "transfers" resource and updates the corresponding state properties.
   *
   * @return {void} This method does not return a value.
   */
  private buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('transfer', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('transfer', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('transfer', 'delete');
  }

  /**
   * Sets the minimum valid date (`minValidDate`) and minimum sale date (`minSaleDate`) based on the input parameters.
   *
   * @param {string} [validFrom] - The starting date for validation in string format. If not provided or set to 'today', the current date is used.
   * @param {string} [saleFrom] - The starting date for sale in string format. If not provided or set to 'today', the current date is used.
   * @return {void} - Does not return a value.
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
   * Loads data from the back-end service using the specified query and updates the table's data source.
   *
   * @param {string} query - The query parameter used to fetch data from the API.
   * @return {void} Does not return a value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<TransferContract>(ApiEndpoints.paths.transferContracts, query).subscribe({
        next: (transferContracts) => {
          this.transferContracts = transferContracts;
          this.imageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching transfer contracts : " + error.message);
          this.imageURL = 'rejected.png';
        },
        complete: () => {
          this.data = new MatTableDataSource(this.transferContracts);
          this.data.paginator = this.paginator;
        }
      })
    )
  }

  /**
   * Filters the data in a table based on the input received from an event.
   * The filter works by comparing specific properties of a transfer contract
   * against the provided filter value from the event.
   *
   * @param {Event} event - The event object that contains the filter input,
   * typically triggered by a user typing in an input field. The input value
   * is used to filter the table data.
   * @return {void} This method does not return a value. It modifies the
   * filtering behavior of the table based on the input value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (transferContract: TransferContract, filter: string) => {
      return (
        filterValue == null ||
        transferContract.user.username.toLowerCase().includes(filter.toLowerCase()) ||
        transferContract.supplier.name.toLowerCase().includes(filter.toLowerCase()) ||
        transferContract.supplier.brno.toLowerCase().includes(filter.toLowerCase()) ||
        transferContract.reference.toLowerCase().includes(filterValue) ||
        transferContract.validfrom.includes(filterValue) ||
        transferContract.validto.includes(filterValue) ||
        transferContract.salesfrom.includes(filterValue) ||
        transferContract.salesto.includes(filterValue) ||
        transferContract.markup.toString().trim().toLowerCase().includes(filterValue) ||
        transferContract.createdon.includes(filterValue) ||
        transferContract.updatedon.includes(filterValue) ||
        transferContract.transferstatus.name.toLowerCase().includes(filterValue) ||
        transferContract.currency.name.toLowerCase().includes(filterValue) ||
        transferContract.transferdiscounts.some(discount => {
          return discount.transferdiscounttype.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transfercancellationcharges.some(cancelation => {
          return cancelation.cancellationscheme.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transferrates.some(rate => {
          return rate.paxtype.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transfer.isreturn.toString().trim().toLowerCase().includes(filterValue) ||
        transferContract.transfer.droplocations.some(dropLocation => {
          return dropLocation.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transfer.pickuplocations.some(pickupLocation => {
          return pickupLocation.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transfer.droplocations.some(dropLocation => {
          return dropLocation.locationtype.name.toLowerCase().includes(filterValue)
        }) ||
        transferContract.transfer.pickuplocations.some(pickupLocation => {
          return pickupLocation.locationtype.name.toLowerCase().includes(filterValue)
        })
      )
    };
    this.data.filter = 'filter';
  }

  //==================================================================================================================//

  /**
   * Loads and processes the filter fields from a TransferContract object.
   * It excludes specific fields ('id', 'transfer') and formats the remaining fields for use as filter options.
   *
   * @return {void} This method does not return any value.
   */
  loadTransferContractFilterFields(): void {
    const transferContract = new TransferContract();
    this.filterFields = Object.keys(transferContract)
      .filter(value => !['id', 'transfer'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Capitalizes the first letter of each word in the provided string.
   *
   * @param {string} field - The input string to format.
   * @return {string} The formatted string with the first letter of each word capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Determines the type of search field (select, input, or date) based on the selected value
   * from the server search form, and sets the corresponding options for search selection.
   * Updates the `isSearchFiledSelect`, `isSearchFiledInput`, and `isSearchFiledDate` flags
   * and populates `searchSelectOptions` with appropriate data if applicable.
   *
   * @return {void} This method does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'supplier', 'transferstatus', 'currency', 'transferdiscounts', 'transfercancellationcharges', 'transferrates'];
    const dateFields = ['validfrom', 'validto', 'salesfrom', 'salesto', 'createdon', 'updatedon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUsers,
      supplier: this.activeSupplier,
      transferstatus: this.transferStatuses,
      currency: this.currencies,
      transferdiscounts: this.transferDiscountTypes,
      transfercancellationcharges: this.cancellationSchemes,
      transferrates: this.paxTypes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  //==================================================================================================================//

  /**
   * Loads the list of pickup locations based on the specified location type.
   *
   * @param {LocationType} locationType - The type of location to load pickup locations for.
   * @return {void} This method does not return a value.
   */
  loadPickupLocationList(locationType: LocationType): void {
    this.loadLocationOptions(locationType);
    this.isEnablePickupLocationAutoComplete = locationType.name.toLowerCase() === 'city' || locationType.name.toLowerCase() === 'location';
  }

  /**
   * Loads the list of drop locations based on the specified location type.
   * It also updates the status of the drop location auto-complete feature.
   *
   * @param {LocationType} locationType - The type of location to load the drop location list for.
   * @return {void}
   */
  loadDropLocationList(locationType: LocationType): void {
    this.loadLocationOptions(locationType);
    this.isEnableDropLocationAutoComplete = locationType.name.toLowerCase() === 'city' || locationType.name.toLowerCase() === 'location';
  }

  /**
   * Loads available location options based on the provided location type.
   * Subscribes to filtered location or city lists for pickup and drop locations,
   * or fetches options from predefined lists for specific location types such as airports or ports.
   * Automatically unsubscribes from previous subscriptions to avoid memory leaks.
   *
   * @param {LocationType} locationType The type of location to load options for (e.g., location, city, airport, port).
   * @return {void} This method does not return a value.
   */
  loadLocationOptions(locationType: LocationType): void {
    const locationtype = locationType.name.toLowerCase();
    if (!locationtype) return;

    // Unsubscribe from previous subscriptions if they exist
    this.pickupLocationSubscription?.unsubscribe();
    this.dropLocationSubscription?.unsubscribe();

    if (locationtype === 'location') {
      this.pickupLocationSubscription = this.filteredLocationListForPickupLocation.subscribe(locations => {
        this.pickupLocationOptions.next(locations);
      });

      this.dropLocationSubscription = this.filteredLocationListForDropLocation.subscribe(locations => {
        this.dropLocationOptions.next(locations);
      });

    } else if (locationtype === 'city') {
      this.pickupLocationSubscription = this.filteredCityListForPickupLocation.subscribe(cities => {
        this.pickupLocationOptions.next(cities);
      });

      this.dropLocationSubscription = this.filteredCityListForDropLocation.subscribe(cities => {
        this.dropLocationOptions.next(cities);
      });

    } else {
      const optionsMap: Record<string, any[]> = {
        airport: this.airports,
        port: this.ports,
      };

      const locations = optionsMap[locationtype] || [];
      this.pickupLocationOptions.next(locations);
      this.dropLocationOptions.next(locations);
    }
  }


  //==================================================================================================================//

  /**
   * Resets the current search query to an empty URLSearchParams instance.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Clears the search form and resets associated states after user confirmation.
   * It checks if there are any values in the form controls. If not, it provides feedback that there is nothing to clear.
   * Otherwise, it prompts the user for confirmation before clearing the form, resetting related search flags,
   * and reloading the table with default data.
   *
   * @return {void} No value is returned from this method.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Accommodation', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Performs a search operation using the values from a server search form.
   * It verifies and utilizes input, select, filters, and date ranges to construct
   * a query string and subsequently loads a table based on the constructed query.
   *
   * @return {void} Does not return any value but processes and initiates the search operation.
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
   * Resets the server search query parameter fields in the form to their default values.
   *
   * @return {void} No return value.
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
   * Subscribes to changes in the 'supplier' control, fetches a reference number
   * based on the supplier's branch number, and updates the 'reference' control
   * with the fetched transfer reference.
   *
   * @return {void} Does not return any value.
   */
  generateTransferReference(): void {
    this.transferContractForm.controls['supplier'].valueChanges.subscribe({
      next: (value) => {
        this.dataService.getRefNumber(ApiEndpoints.paths.transferRefNumber, 'transferRef', value.brno).subscribe({
          next: (data) => {
            this.transferContractForm.controls['reference'].patchValue(data.transferRef);
          },
          error: (error) => {
            console.error("Error fetching reference : " + error.message);
          }
        })
      }
    })
  }

  //=====================================================Add Discounts================================================//
  /**
   * Adds a new discount to the list of transfer discounts if the provided values are valid
   * and the discount type has not already been added.
   *
   * Validates the input values such as amount, transfer discount type, and rate type.
   * Checks for duplicate discount type within the existing transfer discounts.
   * Displays a feedback message if the discount type is already present.
   * Otherwise, creates a new discount using the input values and resets specific forms.
   *
   * @return {void} Does not return a value.
   */
  addDiscount(): void {
    const {amount, transferdiscounttype, ratetype} = this.transferDiscountForm.value;
    if (amount && !isNaN(amount) && Number(amount) > 0 && transferdiscounttype && ratetype) {
      const alreadyAddedDiscounts = this.transferDiscounts.some(
        discount => discount.transferdiscounttype.id === transferdiscounttype.id
      );
      if (alreadyAddedDiscounts) {
        this.operationFeedbackService.showMessage('Existing', `Discount Type ${transferdiscounttype.name} is Already Exist`);
        return;
      }
      const newDiscount = new TransferDiscount();
      newDiscount.amount = amount;
      newDiscount.transferdiscounttype = transferdiscounttype;
      newDiscount.ratetype = ratetype;
      this.transferDiscounts = [...this.transferDiscounts, newDiscount];
      this.resetTransferContractForms(false, true, false, false, false, false);
    }
  }

  //=====================================================Add Cancellations============================================//
  /**
   * Adds a cancellation charge to the list of transferCancellationCharges if valid inputs are provided
   * and if the cancellation scheme is not already present.
   *
   * The method validates that the amount is a positive number and checks the presence of a rate type
   * and a cancellation scheme before adding a new cancellation charge. If the scheme already exists in
   * the current list, an operation feedback message is displayed. Otherwise, the new cancellation charge
   * is added, and relevant forms are reset.
   *
   * @return {void} This method does not return any value.
   */
  addCancellationCharge(): void {
    const {amount, ratetype, cancellationscheme} = this.transferCancellationChargesForm.value;
    if (amount && !isNaN(amount) && Number(amount) > 0 && ratetype && cancellationscheme) {
      const alreadyAddedCancellation = this.transferCancellationCharges.some(
        previousCancellation => previousCancellation.cancellationscheme.id === cancellationscheme.id
      );
      if (alreadyAddedCancellation) {
        this.operationFeedbackService.showMessage('Existing', `Cancellation Scheme ${cancellationscheme.name} is Already Exist`);
        return;
      }
      const newCancellationCharges = new TransferCancellationCharge();
      newCancellationCharges.amount = amount;
      newCancellationCharges.ratetype = ratetype;
      newCancellationCharges.cancellationscheme = cancellationscheme;

      this.transferCancellationCharges = [...this.transferCancellationCharges, newCancellationCharges];
      this.resetTransferContractForms(false, false, true, false, false, false);
    }
  }

  //=====================================================Add PickupLocations==========================================//
  /**
   * Adds a new pickup location to the list of pickup locations if it does not already exist.
   * New locations are created using the form data and validated for duplicates based on location name.
   * If a duplicate is found, it displays an operation feedback message.
   * Upon successful addition, form states and buttons are updated accordingly.
   *
   * @return {void} Does not return any value.
   */
  addPickupLocations(): void {
    const {code, location, locationtype} = this.pickupLocationForm.getRawValue();
    if (code && location && locationtype) {
      const alreadyAddedLocation = this.pickUpLocations.some(
        previousLocation => previousLocation.name === location.name
      );
      if (alreadyAddedLocation) {
        this.operationFeedbackService.showMessage('Existing', `Location ${location.name} is Already Exist`);
        return;
      }
      const newLocation = new PickupLocation();
      newLocation.code = code;
      newLocation.name = location.name;
      newLocation.locationtype = locationtype;
      this.pickUpLocations = [...this.pickUpLocations, newLocation];
      this.resetTransferContractForms(false, false, false, true, false, false);
      this.enableTransferCreateButton(true);
    }
  }

  /**
   * Removes a pickup location from the list based on the provided index.
   *
   * @param {number} index - The index of the pickup location to be removed.
   * @return {void} This method does not return a value.
   */
  removePickupLocation(index: number): void {
    this.pickUpLocations.splice(index, 1);
  }

  //=====================================================Add DropLocations============================================//
  /**
   * Adds a new drop location to the list of drop locations if it meets the required conditions.
   * Checks if the location already exists in the list, and if not, adds the location.
   * Provides feedback if the location already exists.
   *
   * @return {void} This method does not return a value.
   */
  addDropLocations(): void {
    const {code, location, locationtype} = this.dropLocationForm.getRawValue();
    if (code && location && locationtype) {
      const alreadyAddedLocation = this.dropLocations.some(
        previousLocation => previousLocation.name === location.name
      );
      if (alreadyAddedLocation) {
        this.operationFeedbackService.showMessage('Existing', `Location ${location.name} is Already Exist`);
        return;
      }
      const newLocation = new DropLocation();
      newLocation.code = code;
      newLocation.name = location.name;
      newLocation.locationtype = locationtype;
      this.dropLocations = [...this.dropLocations, newLocation];
      this.resetTransferContractForms(false, false, false, false, true, false);
    }
  }

  /**
   * Removes a drop location by its index.
   *
   * @param {number} index - The position of the drop location to remove in the dropLocations array.
   * @return {void} This method does not return a value.
   */
  removeDropLocation(index: number): void {
    this.dropLocations.splice(index, 1);
  }

  //=======================================================Add Transfer===============================================//
  /**
   * Creates a transfer by assigning pickup and drop locations to the `transferContractTransfer` object.
   * If either the pickup or drop locations are empty, it displays an error message.
   *
   * @return {void} This method does not return a value.
   */
  createTransfer(): void {
    if (this.pickUpLocations.length > 0 && this.dropLocations.length > 0) {
      console.log(this.pickUpLocations);
      console.log(this.dropLocations);

      // Ensure transferContractTransfer is not undefined
      if (!this.transferContractTransfer) {
        this.transferContractTransfer = new Transfer();
      }

      this.transferContractTransfer.pickuplocations = [...this.pickUpLocations];
      this.transferContractTransfer.droplocations = [...this.dropLocations];
      this.transferContractTransfer.isreturn = this.includeReturnTransfer;

      // console.log(this.transferContractTransfer.pickuplocations);
      // console.log(this.transferContractTransfer.droplocations);
    } else {
      this.operationFeedbackService.showMessage('No Values', 'Please add Pickup and Drop Location first');
      return;
    }
  }

  /**
   * Toggles the return transfer inclusion state based on the checkbox change event.
   *
   * @param {MatCheckboxChange} $event The event emitted by the checkbox, containing the updated checked state.
   * @return {void} Does not return a value.
   */
  toggleReturnTransfer($event: MatCheckboxChange): void {
    this.includeReturnTransfer = $event.checked;
  }

  /**
   * Changes the return transfer status of the current operation.
   *
   * @return {boolean} Returns true if the return transfer status was successfully changed, otherwise false.
   */
  changeReturnTransfer(): boolean {
    return true;
  }

  //==============================================Transfer Rates======================================================//

  /**
   * Adds a new transfer rate for the specified passenger type to the transfer contract.
   *
   * @param {PaxType} paxType - The type of passenger for whom the transfer rate is being added.
   * @return {void} This method does not return a value.
   */
  addTransferRate(paxType: PaxType): void {
    const {amount} = this.transferRateForm.value;
    if (amount && paxType) {
      const newTransferRate = this.createNewTransferRate(amount, paxType);
      this.addTransferRatesToTransferContract(newTransferRate);
      // Reset form
      this.resetTransferContractForms(false, false, false, false, false, true);
      this.transferRateForm.controls['count'].setValue(0);
      this.occupancyCountMap[paxType.id] = 0;
      this.occupancyPaxCounter++;
    }
  }

  /**
   * Creates and returns a new instance of TransferRates with the specified amount and passenger type.
   *
   * @param {number} amount - The monetary value for the transfer rate.
   * @param {PaxType} paxType - The type of passenger associated with the transfer rate.
   * @return {TransferRates} A new instance of TransferRates with the assigned values.
   */
  createNewTransferRate(amount: number, paxType: PaxType): TransferRates {
    const newTransferRate = new TransferRates();
    newTransferRate.amount = amount;
    newTransferRate.paxtype = paxType;
    return newTransferRate;
  }

  /**
   * Adds a new transfer rate to the transfer contract. Ensures that the transfer rate is not duplicated
   * based on the passenger type ID before adding it to the list.
   *
   * @param {TransferRates} newTransferRate - The new transfer rate to be added to the transfer contract.
   * @return {void} This method does not return any value.
   */
  addTransferRatesToTransferContract(newTransferRate: TransferRates): void {
    if (!this.transferRates) {
      this.transferRates = [];
    }
    const alreadyAddedRates = this.transferRates.some(
      transferRate => transferRate.paxtype.id === newTransferRate.paxtype.id
    );
    if (alreadyAddedRates) {
      this.operationFeedbackService.showMessage('Existing', `Rate is Already Exist`);
      return;
    } else {
      this.transferRates = [...this.transferRates, newTransferRate];
    }
  }

  //==================================================================================================================//

  //==================================================================================================================//

  /**
   * Resets specified forms related to the transfer contract.
   *
   * @param {boolean} generalInfoForm - Indicates whether the general information form should be reset.
   * @param {boolean} discountForm - Indicates whether the discount form should be reset.
   * @param {boolean} cancellationForm - Indicates whether the cancellation charges form should be reset.
   * @param {boolean} pickUpLocForm - Indicates whether the pickup location form should be reset.
   * @param {boolean} dropLocForm - Indicates whether the drop location form should be reset.
   * @param {boolean} transferRate - Indicates whether the transfer rate form should be reset.
   * @return {void} This method does not return any value.
   */
  private resetTransferContractForms(generalInfoForm: boolean, discountForm: boolean, cancellationForm: boolean, pickUpLocForm: boolean, dropLocForm: boolean, transferRate: boolean): void {
    if (generalInfoForm) this.transferContractForm.reset();
    if (discountForm) this.transferDiscountForm.reset();
    if (cancellationForm) this.transferCancellationChargesForm.reset();
    if (pickUpLocForm) this.pickupLocationForm.reset();
    if (dropLocForm) this.dropLocationForm.reset();
    if (transferRate) this.transferRateForm.reset();
  }

  /**
   * Enables or disables the transfer create button.
   *
   * @param {boolean} enable - A boolean value indicating whether to enable (true) or disable (false) the transfer create button.
   * @return {void}
   */
  private enableTransferCreateButton(enable: boolean): void {
    this.isEnableCreateTransfer = enable;
  }

  /**
   * Tracks and identifies sections of a form that are currently in view based on their intersection with the viewport.
   *
   * This method uses an Intersection Observer to monitor visibility of form sections and updates
   * the current section when more than 50% of a section is in view.
   *
   * @return {void} This method does not return any value.
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
   * Configures and enables edit modes based on the provided parameters.
   *
   * @param {boolean} [enableInnerDataEdit] - Determines whether the inner data edit mode should be enabled. If undefined, no changes are made to the inner data edit mode.
   * @param {boolean} [enableMainDataEdit] - Determines whether the main data edit mode should be enabled. If undefined, no changes are made to the main data edit mode.
   * @return {void} Does not return a value.
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
   * Clears the current table selection and resets relevant state variables.
   * Disables edit functionality, sets the selected row to null,
   * and sends a null value to the data server.
   *
   * @return {void} Does not return any value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets and reloads various forms and associated data within the application state.
   *
   * This method resets the transfer contract data, reloads form variables,
   * and updates the UI state including enabling or disabling buttons and form elements.
   * It also initializes form validation and configurations.
   *
   * @return {void} Does not return any value.
   */
  private resetAndReloadForms(): void {
    this.loadTable('')
    this.enableGoToView = true;
    this.enableGoToRecode = true;
    this.resetTransferContractData();
    this.isEnableRoomView = false;
    this.selectedRoomRow = null;
    this.selectedTransferContractRow = null;
    this.enableTransferCreateButton(false);
    this.setEnableEditModes(false, false);
    this.enableButtons(true, false, false);
    this.resetTransferContractForms(true, true, true, true, true, true);
    this.transferContractForm.reset();
    this.setLoggedInUser();
    this.setMinDateForValidAndSale('today', 'today');
    this.formValidationService.createForm(this.transferContractForm);
  }

  //==================================================================================================================//

  /**
   * Sets the current view of the application and adjusts the state accordingly.
   *
   * @param view Determines which view to display. Can be 'records' for record view, 'profiles' for profile view, or 'form' for form view.
   * @return void
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
   * Navigates to a specific step in a sequence by scrolling the corresponding step element into view.
   * Adjusts the scrolling behavior depending on the step.
   *
   * @param {number} stepNumber - The step number to navigate to.
   * @return {void} No return value.
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
   * Selects a transfer contract row and sets it as the currently selected row.
   *
   * @param {TransferContract} row - The transfer contract row to be selected.
   * @return {void} Does not return a value.
   */
  selectTransferContractRow(row: TransferContract): void {
    this.selectedTransferContractRow = row;
  }

  /**
   * Loads the transfer contract modification view by updating the component's state and populating the form with the provided TransferContract data.
   *
   * @param {TransferContract} transferContract - The transfer contract data to populate the form with.
   * @return {void} Does not return a value.
   */
  loadTransferConModifyView(transferContract: TransferContract): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(transferContract);
  }

  /**
   * Loads the modify view for a given transfer contract.
   *
   * @param {TransferContract} transferContract - The transfer contract to populate the view with.
   * @return {void} No return value.
   */
  loadTransferContractModifyView(transferContract: TransferContract): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(transferContract);
  }

  //==================================================================================================================//

  /**
   * Loads the detailed view of a transfer contract, populating it with relevant information
   * and configuring the associated data tables for display.
   *
   * @param {TransferContract} element - The transfer contract whose details are to be loaded.
   * @return {void} This method does not return a value.
   */
  loadTransferContractDetailView(element: TransferContract): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;

    let tables = [];
    if (this.selectedRow.transferdiscounts && this.selectedRow.transferdiscounts.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Discount Type'],
          columns: ['amount', 'transferdiscounttype.name'],
          data: this.selectedRow.transferdiscounts || [],
          title: "Transfer Contract Discounts"
        }
      );
    }

    if (this.selectedRow.transfercancellationcharges && this.selectedRow.transfercancellationcharges.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Cancellation Scheme'],
          columns: ['amount', 'cancellationscheme.name'],
          data: this.selectedRow.transfercancellationcharges || [],
          title: "Transfer Contract Cancellation"
        }
      );
    }

    if (this.selectedRow.transferrates && this.selectedRow.transferrates.length > 0) {
      tables.push(
        {
          headers: ['Amount', 'Rate Type'],
          columns: ['amount', 'paxtype.name'],
          data: this.selectedRow.transferrates || [],
          title: "Transfer Contract Rates"
        }
      );
    }

    if (this.selectedRow.transfer) {
      tables.push(
        {
          headers: ['Type', 'Location'],
          columns: ['locationtype.name', 'name'],
          data: this.selectedRow.transfer.pickuplocations || [],
          title: "Pickup Locations"
        }
      );
    }

    if (this.selectedRow.transfer) {
      tables.push(
        {
          headers: ['Type', 'Location'],
          columns: ['locationtype.name', 'name'],
          data: this.selectedRow.transfer.droplocations || [],
          title: "Drop Locations"
        }
      );
    }

    const data = [
      {Label: "Title", Value: this.selectedRow.reference},
      {Label: "Reference", Value: this.selectedRow.reference},
      {Label: "Supplier", Value: this.selectedRow.supplier.brno},
      {Label: "Valid From", Value: this.selectedRow.validfrom},
      {Label: "Valid To", Value: this.selectedRow.validto},
      {Label: "Sale From", Value: this.selectedRow.salesfrom},
      {Label: "Sale To", Value: this.selectedRow.salesto},
      {Label: "Markup", Value: this.selectedRow.markup},
      {Label: "Return Transfer", Value: this.selectedRow.transfer.isreturn},
      {Label: "Created On", Value: this.selectedRow.createdon},
      {Label: "Updated On", Value: this.selectedRow.updatedon},
      {Label: "Status", Value: this.selectedRow.transferstatus.name},
      {Label: "Type", Value: this.selectedRow.transfertype.name},
      {Label: "Default Currency", Value: this.selectedRow.currency.name},
      {Label: "Table", Value: tables},
    ];

    this.dataServer.sendData(data);
  }

  //==================================================================================================================//

  /**
   * Populates and initializes the form fields with the provided transfer contract data.
   * Configures the necessary states for editing, button enablement, and dropdown selections,
   * and sets up the form validation logic.
   *
   * @param {TransferContract} transferContract - The transfer contract object containing data
   * to be used for populating the form fields.
   *
   * @return {void} This method does not return any value.
   */
  fillForm(transferContract: TransferContract): void {
    this.setEnableEditModes(false, true);
    this.enableTransferCreateButton(true);
    this.enableButtons(false, true, true);
    this.selectedTransferContractRow = transferContract;
    this.transferContract = JSON.parse(JSON.stringify(transferContract));
    this.oldTransferContract = JSON.parse(JSON.stringify(transferContract));

    this.transferContract.user = this.activeUsers.find(user => user.id === this.transferContract.user?.id) ?? this.transferContract.user;
    this.transferContract.supplier = this.activeSupplier.find(supplier => supplier.id === this.transferContract.supplier?.id) ?? this.transferContract.supplier;
    this.transferContract.currency = this.currencies.find(currency => currency.id === this.transferContract.currency?.id) ?? this.transferContract.currency;
    this.transferContract.transferstatus = this.transferStatuses.find(status => status.id === this.transferContract.transferstatus?.id) ?? this.transferContract.transferstatus;
    this.transferContract.transfertype = this.transferTypes.find(type => type.id === this.transferContract.transfertype?.id) ?? this.transferContract.transfertype;

    this.transferDiscounts = transferContract.transferdiscounts;
    this.transferCancellationCharges = transferContract.transfercancellationcharges;
    this.pickUpLocations = transferContract.transfer.pickuplocations;
    this.dropLocations = transferContract.transfer.droplocations;
    this.includeReturnTransfer = transferContract.transfer.isreturn;
    this.transferRates = transferContract.transferrates;

    this.isEnableRoomView = true;

    this.transferContractForm.patchValue(this.transferContract, {emitEvent: false});
    this.setMinDateForValidAndSale(this.transferContract.validfrom, this.transferContract.salesfrom)
    this.formValidationService.createForm(this.transferContractForm, this.oldTransferContract, this.transferContract);
    this.transferContractForm.markAsPristine();
  }

  //===============================================Get Inner Data Updates=============================================//

  /**
   * Determines whether there are updates in the pickup locations by comparing the current and old pickup location maps.
   *
   * @return {boolean} Returns true if there are updates in the pickup locations, otherwise false.
   */
  getPickupLocUpdates(): boolean {
    const oldPickupLocMap = new Map();
    const newPickUpLocMap = new Map();
    this.pickUpLocations.forEach((currentPickUpLoc) => {
      newPickUpLocMap.set(currentPickUpLoc.locationtype.name, currentPickUpLoc.name);
    })
    this.oldTransferContract.transfer.pickuplocations.forEach(oldPickupLoc => {
      oldPickupLocMap.set(oldPickupLoc.locationtype.name, oldPickupLoc.name);
    })
    if (oldPickupLocMap.size !== newPickUpLocMap.size) {
      return true;
    }
    for (const [type, oldName] of oldPickupLocMap.entries()) {
      const newName = newPickUpLocMap.get(type);
      if (oldName !== newName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Compares the current drop locations with the old drop locations to determine
   * if there are any updates or changes between the two sets of data.
   *
   * @return {boolean} Returns true if there are changes in the drop locations; otherwise, false.
   */
  getDropLocUpdates(): boolean {
    const oldDropLocMap = new Map();
    const newDropLocMap = new Map();
    this.dropLocations.forEach((currentDropLoc) => {
      newDropLocMap.set(currentDropLoc.locationtype.name, currentDropLoc.name);
    })
    this.oldTransferContract.transfer.droplocations.forEach(oldDropLoc => {
      oldDropLocMap.set(oldDropLoc.locationtype.name, oldDropLoc.name);
    })
    if (oldDropLocMap.size !== newDropLocMap.size) {
      return true;
    }
    for (const [type, oldName] of oldDropLocMap.entries()) {
      const newName = newDropLocMap.get(type);
      if (oldName !== newName) {
        return true;
      }
    }
    return false;
  }

  /**
   * Collects and concatenates update messages for the inner forms to indicate any changes made.
   *
   * @return {string} A concatenated string of update messages if changes are detected, otherwise an empty string.
   */
  getInnerFormsUpdates(): string {
    let updates: string = '';
    if (this.getPickupLocUpdates()) updates += `<br>Pickup Location Updated`;
    if (this.getDropLocUpdates()) updates += `<br>Drop Location Updated`;
    if (this.changeReturnTransfer()) updates += `<br>Return Transfer Updated`;
    return updates;
  }

  //==================================================================================================================//

  /**
   * Processes the transfer contract form data and constructs a TransferContract object.
   *
   * @param {FormGroup} transferContractForm - The form group containing the transfer contract details.
   * @return {TransferContract} A TransferContract object populated with the provided form data.
   */
  private getTransferContractData(transferContractForm: FormGroup): TransferContract {
    const formValues = transferContractForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    formValues.supplier = {
      id: formValues.supplier.id,
      name: formValues.supplier.name,
    }
    this.transferContract = formValues;
    this.transferContract.transfercancellationcharges = this.transferCancellationCharges;
    this.transferContract.transfer = this.transferContractTransfer;
    return this.transferContract;
  }

  /**
   * Validates the transferContract's transfer property and displays a feedback message if it is missing or undefined.
   * Terminates the method execution if the validation fails.
   *
   * @return {void} Does not return any value.
   */
  private checkTransfer(): void {
    if (this.transferContract.transfer === null || this.transferContract.transfer === undefined) {
      this.operationFeedbackService.showMessage('Missing Data', 'Transfer in missing click on Create Transfer Button');
      return;
    }
  }

  //==================================================================================================================//


  /**
   * Handles the process of validating, saving, and providing feedback for a transfer contract.
   *
   * The method performs the following steps:
   * 1. Validates the transfer contract form for errors.
   * 2. Formats the transfer contract data to be saved.
   * 3. Prompts the user for confirmation to save the transfer contract.
   * 4. If confirmed, saves the transfer contract using the data service.
   * 5. Provides feedback on the success or failure of the saving operation.
   *
   * @return {void} This method does not return any value; it performs operations such as validation, confirmation,
   * data persistence, and feedback within its execution.
   */
  save(): void {

    const errors = this.formValidationService.getErrors(this.transferContractForm);
    if (errors) {
      this.operationFeedbackService.showErrors("Transfer Contract", "Add", errors);
      return;
    }

    const toSaveTransferContract = this.getTransferContractData(this.transferContractForm);

    const transferContractData = this.operationFeedbackService.formatObjectData(toSaveTransferContract, ["reference"]);
    this.checkTransfer();
    this.operationFeedbackService.showConfirmation('Transfer Contract', 'Save', transferContractData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<TransferContract>(ApiEndpoints.paths.transferContracts, toSaveTransferContract).subscribe({
            next: (response) => {
              const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

              if (status) {
                this.resetAndReloadForms();
              }
              this.operationFeedbackService.showStatus("Transfer Contract", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Transfer Contract", "Save", responseMessage
              );
            }
          })
        }
      })
  }

  /**
   * Handles the update operation for the transfer contract form. Validates the form, retrieves necessary
   * updates, checks for necessary confirmation, and initiates the update process with the data service.
   * Provides appropriate feedback based on results or errors during the operation through the feedback service.
   *
   * @return {void} No return value. The method performs an update operation and provides feedback to the user.
   */
  update(): void {
    const errors = this.formValidationService.getErrors(this.transferContractForm);
    if (errors) {
      this.operationFeedbackService.showErrors('Transfer Contract', 'Update', errors);
      return;
    }

    const toUpdateTransferContract = this.getTransferContractData(this.transferContractForm);
    toUpdateTransferContract.id = this.oldTransferContract.id;

    let updates = '';
    updates += this.formValidationService.getUpdates(this.transferContractForm);
    updates += this.getInnerFormsUpdates();
    this.checkTransfer();
    this.operationFeedbackService.showConfirmation('Transfer Contract', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          // this.operationFeedbackService.showConfirmation('Transfer Contract', 'Update', 'This will take some time, do you like to wait...?', {yes: 'Yes', no: 'No'}, true)
          //   .subscribe({
          //     next: (isConfirmed) => {
          //       if (!isConfirmed) {return;}
          //       this.loadingService.showLoading();
          //     }
          //   })
          this.dataService.update<TransferContract>(ApiEndpoints.paths.transferContracts, toUpdateTransferContract)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Transfer Contract", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Transfer Contract", "Update", responseMessage
                );
              },
              complete: () => {
                // this.loadingService.hideLoading();
              }
            });
        }
      });
  }

  /**
   * Deletes a transfer contract after prompting the user with a confirmation dialog.
   * The deletion process includes formatting the contract data for display,
   * handling confirmation, initiating the delete action through the data service,
   * and managing both success and error responses.
   *
   * @return {void} No return value.
   */
  delete(): void {
    const transferContractData = this.operationFeedbackService.formatObjectData(this.transferContract, ['reference']);
    this.operationFeedbackService.showConfirmation('Transfer Contract', 'Delete', transferContractData)
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
          this.dataService.delete(ApiEndpoints.paths.transferContracts, this.transferContract.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Transfer Contract", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Transfer Contract', 'Delete', responseMessage);
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
   * Sets the CSS class for the status color based on the given employee status.
   *
   * @param {EmployeeStatus} status - The employee status object containing the name of the status.
   * @return {string} The CSS class corresponding to the status color. Returns 'default-cell' if the status is not recognized.
   */
  setStatusColor(status: TransferStatus): string {
    const statusColor: Record<string, string> = {
      pending: 'pending-cell',
      confirmed: 'confirmed-cell',
      'waiting for payment': 'waitingforpayment-cell',
      paid: 'paid-cell',
      cancelled: 'cancelled-cell'
    }
    const colorClass = statusColor[status.name?.trim().toLowerCase() || ''];
    return colorClass ? colorClass : 'default-cell';
  }

  /**
   * Resets the transfer contract data by clearing all related collections.
   *
   * This method initializes the following properties to empty arrays:
   * - transferDiscounts
   * - transferCancellationCharges
   * - pickUpLocations
   * - dropLocations
   * - transferRates
   *
   * @return {void} No return value.
   */
  private resetTransferContractData(): void {
    this.transferDiscounts = [];
    this.transferCancellationCharges = [];
    this.pickUpLocations = [...[]];
    this.dropLocations = [...[]];
    this.transferRates = []
  }

  /**
   * Clears any applied discount by resetting the relevant transfer contract forms.
   * Calls the resetTransferContractForms method with specific flags set to adjust the state.
   *
   * @return {void} Does not return a value.
   */
  clearDiscount(): void {
    this.resetTransferContractForms(false, true, false, false, false, false);
  }

  /**
   * Clears the cancellation charge by resetting specific transfer contract forms.
   * Calls the `resetTransferContractForms` method with predefined parameters.
   *
   * @return {void} Does not return any value.
   */
  clearCancellationCharge(): void {
    this.resetTransferContractForms(false, false, true, false, false, false);
  }

  /**
   * Clears the pickup-related data within the transfer contract forms.
   * It disables or resets the pickup section without affecting other sections.
   *
   * @return {void} No value is returned by this method.
   */
  clearPickup(): void {
    this.resetTransferContractForms(false, false, false, true, false, false);
  }

  /**
   * Clears a specific drop configuration by resetting transfer contract forms
   * with predefined boolean parameters. This method is utilized to reset the state
   * for a particular drop mechanism.
   *
   * @return {void} Does not return any value.
   */
  clearDrop(): void {
    this.resetTransferContractForms(false, false, false, false, true, false);
  }

  /**
   * Clears the transfer contract form, performing a reset operation if certain conditions are met.
   * Checks if any form value exists (excluding the "reference" field) and prompts the user for confirmation
   * before clearing the form. If no values are present, a message indicating there is nothing to clear is shown.
   *
   * @return {void} No return value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.transferContractForm, ['user', 'reference']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Transfer Contract', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('ransfer Contract', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) {
          return;
        }
        this.resetAndReloadForms();
      })
  }

  /**
   * Cleanup logic to be executed when the component is destroyed.
   * Unsubscribes from the `dataSubscriber$` observable to avoid memory leaks.
   *
   * @return {void} No return value.
   */
  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
    this.dataValidationService.cleanupSubscriptions(this.componentId);
  }

  /**
   * Updates the transfer discount form with the data from the specified event.
   *
   * @param {Object} event - Object containing the index and modified item details.
   * @param {number} event.index - The index of the modified item.
   * @param {Object} event.modifiedItem - The modified item containing the updated discount data.
   * @return {void} This method does not return a value.
   */
  loadDiscountData(event: { index: number; modifiedItem: any }): void {
    const matchedRateType = this.rateTypes.find(r => r.id === event.modifiedItem.ratetype.id);
    const matchedDiscountType = this.transferDiscountTypes.find(d => d.id === event.modifiedItem.transferdiscounttype.id);

    this.transferDiscountForm.patchValue({
      amount: event.modifiedItem.amount,
      ratetype: matchedRateType,
      transferdiscounttype: matchedDiscountType
    });
  }
}
