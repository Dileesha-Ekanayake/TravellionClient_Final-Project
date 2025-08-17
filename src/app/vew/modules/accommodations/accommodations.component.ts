import {AfterViewInit, Component, DoCheck, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {AccommodationDiscount} from "../../../entity/accommodation-discount";
import {AccommodationDiscountType} from "../../../entity/accommodation-discount-type";
import {forkJoin, Observable, Subscription} from "rxjs";
import {RateType} from "../../../entity/rate-type";
import {CancellationScheme} from "../../../entity/cancellation-scheme";
import {AccommodationCancellationCharge} from "../../../entity/accommodation-cancellation-charge";
import {PaxType} from "../../../entity/pax-type";
import {RoomFacility} from "../../../entity/room-facility";
import {AccommodationOccupanciesPax} from "../../../entity/accommodation-occupancies-pax";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {AccommodationRates} from "../../../entity/accommodation-rates";
import {MatChip, MatChipRemove, MatChipSet} from "@angular/material/chips";
import {AccommodationRoom} from "../../../entity/accommodation-room";
import {User} from "../../../entity/user";
import {Supplier} from "../../../entity/supplier";
import {Currency} from "../../../entity/currency";
import {AccommodationStatus} from "../../../entity/accommodation-status";
import {ResidentType} from "../../../entity/resident-type";
import {AccommodationFacilities} from "../../../entity/accommodation-facilities";
import {Accommodation} from "../../../entity/accommodation";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
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
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {RoomType} from "../../../entity/room-type";
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {LoadingService} from "../../../util/dialog/loading/loading.service";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {AccommodationType} from "../../../entity/accommodation-type";
import {StarRate} from "../../../entity/star-rate";
import {DataValidationService} from "../../../util/core-services/validation/data-validation.service";
import {City} from "../../../entity/city";
import {Location} from "../../../entity/location";
import {AllLocation} from "../../../entity/all-location";
import {AvDataTable} from "@avoraui/av-data-table";

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatStartDate,
    MatSuffix,
    MatInput,
    MatButton,
    MatIconButton,
    FormsModule,
    MatPrefix,
    NgClass,
    MatChip,
    MatChipRemove,
    MatChipSet,
    MatCardFooter,
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
    MatHeaderCellDef,
    MatNoDataRow,
    DetailViewComponent,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvDataTable
  ],
  templateUrl: './accommodations.component.html',
  styleUrl: './accommodations.component.css'
})
export class AccommodationsComponent implements OnInit, AfterViewInit, OnDestroy, DoCheck {

  private readonly componentId = 'accommodation-component';

  breadcrumb: any;
  currentSection = 1;
  selectedRow: any;
  selectedRoomRow: any;
  isRoomSelected: boolean = false;
  isEditMode: boolean = false;
  isInnerDataEditMode: boolean = false;
  selectedAccommodationRow: any;

  private occupancyPaxCounter = 0;
  private isObserverFormInitialized = false;

  columns: string[] = ['reference', 'name', 'validfrom', 'validto', 'salesfrom', 'salesto', 'modify/view'];
  headers: string[] = ['Reference', 'Accomm', 'Valid-From', 'Valid-To', 'Sales-From', 'Sales-To', 'Modify / View'];

  columnsDetails: string[] = ['reference', 'name'];
  headersDetails: string[] = ['Reference', 'Name'];

  displayedColumns: string[] = ['roomType', 'rooms', 'actions'];

  discountTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Disc Type', align: 'left' },
    { label: 'Amount', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  discountTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'accommodationdiscounttype.name', align: 'left' },
    { field: 'amount', align: 'left' , color : '#3182ce'},
  ]

  cancellationTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Rate Type', align: 'left' },
    { label: 'Scheme', align: 'left' },
    { label: 'Amount', align: 'center' },
    { label: 'Action', align: 'center' }
  ];

  cancellationTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'ratetype.name', align: 'left' },
    { field: 'cancellationscheme.name', align: 'left' },
    { field: 'amount', align: 'center' , color : '#3182ce'},
  ]

  accommRoomData!: MatTableDataSource<AccommodationRoom>;

  accommodations: Array<Accommodation> = [];
  data!: MatTableDataSource<Accommodation>;
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
  isEnableRoomAdd: boolean = false;
  isEnableRoomFacilityAdd: boolean = false
  isEnableOccupancyPaxAndRateAdd: boolean = false

  isEnableCreateRoom: boolean = false;

  minValidDate!: Date;
  // minSaleDate!: Date;

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  accommodation!: Accommodation;
  oldAccommodation!: Accommodation;

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  activeSupplier: Array<Supplier> = []
  filteredSupplierList!: Observable<Array<Supplier>>;
  currencies: Array<Currency> = [];
  accommodationStatus: Array<AccommodationStatus> = [];
  residentTypes: Array<ResidentType> = [];

  cityList: Array<City> = [];
  locationList: Array<Location> = [];
  allLocations: Array<AllLocation> = [];
  filteredAllLocations!: Observable<Array<AllLocation>>;

  public accommodationForm!: FormGroup;
  public accommodationDiscountForm!: FormGroup;
  public accommodationCancellationChargesForm!: FormGroup;
  public accommodationRoomForm!: FormGroup;
  public accommodationFacilityForm!: FormGroup;
  public accommodationOccupanciesPaxAndRateForm!: FormGroup;
  public serverSearchForm!: FormGroup;

  // Initially loaded data
  accommodationDiscountTypes: Array<AccommodationDiscountType> = [];
  accommodationTypes: Array<AccommodationType> = [];
  accommodationStarRates: Array<StarRate> = [];
  rateTypes: Array<RateType> = [];
  cancellationSchemes: Array<CancellationScheme> = [];
  roomTypes: Array<RateType> = [];
  paxTypes: Array<PaxType> = [];
  roomFacilities: Array<RoomFacility> = [];

  //=======Details for newly created Accommodation=======//
  accommodationDiscounts: Array<AccommodationDiscount> = [];
  accommodationCancellationCharges: Array<AccommodationCancellationCharge> = [];

  // Details for Accommodation
  selectedFacilities: Array<RoomFacility> = [];
  filteredFacilities: Array<RoomFacility> = [];

  occupancyCountMap: { [key: number]: number } = {};
  accommodationOccupanciesPax: Array<AccommodationOccupanciesPax> = [];
  accommodationRates: Array<AccommodationRates> = [];

  // Arrays to bind newly created objects
  accommodationRoomFacilities: Array<RoomFacility> = [];
  accommodationRooms: Array<AccommodationRoom> = [];

  tempAccommRooms: Array<AccommodationRoom> = [];

  //======================================================//

  dataSubscriber$: Subscription = new Subscription();
  searchQuery!: URLSearchParams;

  minSaleDate: Date = new Date();
  maxSaleDate: Date = new Date();

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
    private loadingService: LoadingService,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private dataValidationService: DataValidationService,
  ) {

    this.accommodationForm = this.formBuilder.group({
      user: new FormControl('', [Validators.required]),
      supplier: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      reference: new FormControl('', [Validators.required]),
      validfrom: new FormControl('', [Validators.required]),
      validto: new FormControl('', [Validators.required]),
      salesfrom: new FormControl('', [Validators.required]),
      salesto: new FormControl('', [Validators.required]),
      markup: new FormControl('', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      accommodationstatus: new FormControl('', [Validators.required]),
      residenttype: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      accommodationdiscounts: new FormControl('', [Validators.required]),
      accommodationtype: new FormControl('', [Validators.required]),
      starrating: new FormControl('', [Validators.required]),
      accommodationcncelationcharges: new FormControl('', [Validators.required]),
    }, {updateOn: 'change'});

    this.accommodationDiscountForm = this.formBuilder.group({
      accommodationdiscounttype: new FormControl('', [Validators.required],),
      amount: new FormControl('', [Validators.required],),
    });

    this.accommodationCancellationChargesForm = this.formBuilder.group({
      amount: new FormControl('', [Validators.required],),
      ratetype: new FormControl('', [Validators.required],),
      cancellationscheme: new FormControl('', [Validators.required],),
    });

    this.accommodationOccupanciesPaxAndRateForm = this.formBuilder.group({
      count: new FormControl('0'),
      amount: new FormControl(''),
    });

    this.accommodationRoomForm = this.formBuilder.group({
      rooms: new FormControl('', [Validators.required]),
      roomtype: new FormControl('', [Validators.required]),
    });

    this.accommodationFacilityForm = this.formBuilder.group({
      filterField: new FormControl(''),
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

    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.accommodationForm, [['markup', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.accommodationDiscountForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.accommodationCancellationChargesForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.accommodationOccupanciesPaxAndRateForm, [['amount', 0]]);
    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.accommodationRoomForm, [['amount', 0]]);


    this.accommodationForm.get('salesfrom')?.disable();
    this.accommodationForm.get('salesto')?.disable();

    this.accommodationForm.valueChanges.subscribe((form) => {
      this.minSaleDate = form.validfrom;
      this.maxSaleDate = form.validto;

      const salesFromControl = this.accommodationForm.get('salesfrom');
      const salesToControl = this.accommodationForm.get('salesto');

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
   * Lifecycle hook that is called during every change detection run.
   * This method is triggered manually as part of Angular's mechanism to check changes for components.
   * It performs custom change detection logic, such as initializing observer forms when conditions are met.
   *
   * @return {void} This method does not return any value.
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
   * Lifecycle hook that is called after Angular has fully initialized a component's view.
   * This method is used to trigger the retrieval of form sections after the view is initialized.
   *
   * @return {void} Does not return a value.
   */
  ngAfterViewInit(): void {
    this.getFormSections();
  }

  /**
   * Initializes the component by setting up necessary data and configurations. This includes fetching various data lists, configuring forms, and initializing button states.
   *
   * @return {void} This method does not return any value.
   */
  initialize(): void {
    this.breadcrumb = this.breadCrumbService.getActiveRoute();

    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.accommodationForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Supplier>(ApiEndpoints.paths.activeAccommSuppliersList).subscribe({
        next: (suppliers) => {
          this.activeSupplier = suppliers;
          this.filteredSupplierList = this.autoCompleteDataFilterService.filterData<Supplier>(this.activeSupplier, this.accommodationForm, 'supplier', ['name', 'brno']);
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
      this.dataService.getData<AccommodationStatus>(ApiEndpoints.paths.accommodationStatuses).subscribe({
        next: (accommodationStatus) => {
          this.accommodationStatus = accommodationStatus;
        },
        error: (error) => {
          console.error("Error fetching accommodation statuses : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<ResidentType>(ApiEndpoints.paths.residentTypes).subscribe({
        next: (residentType) => {
          this.residentTypes = residentType;
        },
        error: (error) => {
          console.error("Error fetching resident types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<AccommodationDiscountType>(ApiEndpoints.paths.accommodationDiscountTypes).subscribe({
        next: (accommodationDiscountTypes) => {
          this.accommodationDiscountTypes = accommodationDiscountTypes;
        },
        error: (error) => {
          console.error("Error fetching accommodation discount types : " + error.message);
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
      this.dataService.getData<RoomType>(ApiEndpoints.paths.roomTypes).subscribe({
        next: (rateTypes) => {
          this.roomTypes = rateTypes;
        },
        error: (error) => {
          console.error("Error fetching roomTypes : " + error.message);
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
      this.dataService.getData<RoomFacility>(ApiEndpoints.paths.roomFacilities).subscribe({
        next: (roomFacilities) => {
          this.roomFacilities = roomFacilities;
          this.filteredFacilities = [...this.roomFacilities];
        },
        error: (error) => {
          console.error("Error fetching roomFacilities : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<AccommodationType>(ApiEndpoints.paths.accommodationTypes).subscribe({
        next: (accommodationTypes) => {
          this.accommodationTypes = accommodationTypes;
        },
        error: (error) => {
          console.error("Error fetching accommodationTypes : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<StarRate>(ApiEndpoints.paths.accommodationStarRate).subscribe({
        next: (starRates) => {
          this.accommodationStarRates = starRates;
        },
        error: (error) => {
          console.error("Error fetching accommodationStarRates : " + error.message);
        }
      })
    )

    this.loadAllCitiesAndLocations();

    this.setMinDateForValidAndSale('today', 'today');

    this.formValidationService.createForm(this.accommodationForm, this.accommodation, this.oldAccommodation, 'accommodation', ['reference'], ['accommodationdiscounts'], [['validfrom', 'yyyy-MM-dd'], ['validto', 'yyyy-MM-dd'], ['salesfrom', 'yyyy-MM-dd'], ['salesto', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Retrieves and formats the display name for a given user.
   *
   * This function utilizes a specified service to filter and extract
   * the display name based on the provided attributes of the user,
   * such as 'employee.callingname'.
   *
   * @param {any} user - The user object from which the display name will be extracted.
   * @returns {string} The formatted display name of the user.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Formats and returns the display name for a given supplier object.
   *
   * This method leverages the `autoCompleteDataFilterService` to extract and
   * format the display value of a supplier based on its `name` property.
   *
   * @param {any} supplier - The supplier object whose display name needs to be retrieved.
   *                         It is expected to have the relevant properties required
   *                         for formatting the display name.
   * @returns {string} The formatted name of the supplier.
   */
  displaySupplierName = (supplier: any): string => {
    return this.autoCompleteDataFilterService.displayValue<Supplier>(supplier, ['name']);
  }

  /**
   * Retrieves the display name for a given location object.
   *
   * This function takes a location object as input and extracts its
   * display name by utilizing a filtering service. The filtering service
   * processes the provided object and retrieves the value associated with
   * the 'name' property.
   *
   * @param {any} allLocation - The location object containing location details.
   * @returns {string} The display name of the location.
   */
  displayLocationName = (allLocation: any): string => {
    return this.autoCompleteDataFilterService.displayValue<AllLocation>(allLocation, ['name']);
  }

  /**
   * Initializes and sets up the view by loading accommodation filter fields, setting default image URL,
   * preparing the table, enabling the room control buttons, and configuring form controls and view settings.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.loadAccommodationFilterFields();
    this.imageURL = 'pending.gif';
    this.loadTable("");
    this.enableRoomControlButtons(true, false, false);
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.accommodationOccupanciesPaxAndRateForm.controls['count'].patchValue(0);
    this.setLoggedInUser();
  }

  /**
   * Sets the currently logged-in user by retrieving the user from the authentication service.
   * It utilizes the provided accommodation form to fetch user details.
   *
   * @return {void} No return value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.accommodationForm, 'user');
  }

  //==================================================================================================================//

  /**
   * Updates the state of buttons by enabling or disabling them based on the provided parameters.
   *
   * @param {boolean} add - Determines whether the add button should be enabled (true) or disabled (false).
   * @param {boolean} upd - Determines whether the update button should be enabled (true) or disabled (false).
   * @param {boolean} del - Determines whether the delete button should be enabled (true) or disabled (false).
   * @return {void} Does not return a value.
   */
  private enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Determines the state of button permissions by evaluating the user's operational authorities
   * for insert, update, and delete actions on accommodations.
   *
   * @return {void} This method does not return a value.
   */
  private buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('accommodation', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('accommodation', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('accommodation', 'delete');
  }

  /**
   * Sets the minimum valid date and minimum sale date based on the provided input dates or default values.
   *
   * @param {string} [validFrom] - The starting date to set as the minimum valid date. If 'today' or undefined, defaults to the current date.
   * @param {string} [saleFrom] - The starting date to set as the minimum sale date. If 'today' or undefined, defaults to the current date.
   * @return {void} Does not return any value.
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

  /**
   * Loads all cities and locations data from the specified API endpoints,
   * processes the data to create a combined list of unique location entries (cities and locations),
   * and applies filtering for autocomplete functionality.
   *
   * @return {void} Does not return a value.
   */
  private loadAllCitiesAndLocations(): void {
    this.dataSubscriber$.add(
      forkJoin({
        cities: this.dataService.getData<City>(ApiEndpoints.paths.cityList),
        locations: this.dataService.getData<Location>(ApiEndpoints.paths.locationList)
      }).subscribe({
        next: ({ cities, locations }) => {
          this.cityList = cities;
          this.locationList = locations;

          const locationMap = new Map<number, AllLocation>();

          // Add cities first
          cities.forEach(city => {
            if (!locationMap.has(city.id)) {
              locationMap.set(city.id, { id: city.id, name: city.name });
            }
          });

          // Add locations only if the name is not already in a map
          locations.forEach(loc => {
            if (!locationMap.has(loc.id)) {
              locationMap.set(loc.id, { id: loc.id, name: loc.name });
            }
          });

          // Convert a map to array
          this.allLocations = Array.from(locationMap.values());
          this.filteredAllLocations = this.autoCompleteDataFilterService.filterData<AllLocation>(this.allLocations, this.accommodationForm, 'location', ['name']);

        },
        error: (error) => {
          console.error('Error fetching cityList or locationList:', error.message);
        }
      })
    );
  }

  //==================================================================================================================//

  /**
   * Loads a table by retrieving data based on the provided query, handling success, error, and completion scenarios.
   *
   * @param {string} query - The query string used to fetch data for the table.
   * @return {void} - This method does not return a value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Accommodation>(ApiEndpoints.paths.accommodations, query).subscribe({
        next: (accommodations) => {
          this.accommodations = accommodations;
          this.imageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching accommodations : " + error.message);
          this.imageURL = 'rejected.png';
        },
        complete: () => {
          this.data = new MatTableDataSource(this.accommodations);
          this.data.paginator = this.paginator;
        }
      })
    )
  }

  /**
   * Filters the data table based on the user input from the given event.
   *
   * @param {Event} event - The event that contains the user input used for filtering.
   * @return {void} This method does not return a value. It adjusts the table filter predicate to match the input criteria.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (accommodation: Accommodation, filter: string) => {
      return (
        filterValue == null ||
        accommodation.user.username.toLowerCase().includes(filter.toLowerCase()) ||
        accommodation.supplier.name.toLowerCase().includes(filter.toLowerCase()) ||
        accommodation.supplier.brno.toLowerCase().includes(filter.toLowerCase()) ||
        accommodation.name.toLowerCase().includes(filterValue) ||
        accommodation.reference.toLowerCase().includes(filterValue) ||
        accommodation.validfrom.includes(filterValue) ||
        accommodation.validto.includes(filterValue) ||
        accommodation.salesfrom.includes(filterValue) ||
        accommodation.salesto.includes(filterValue) ||
        accommodation.markup.toString().trim().toLowerCase().includes(filterValue) ||
        accommodation.createdon.includes(filterValue) ||
        accommodation.updatedon.includes(filterValue) ||
        accommodation.accommodationstatus.name.toLowerCase().includes(filterValue) ||
        accommodation.residenttype.name.toLowerCase().includes(filterValue) ||
        accommodation.currency.name.toLowerCase().includes(filterValue) ||
        accommodation.accommodationdiscounts.some(discount => {
          return discount.accommodationdiscounttype.name.toLowerCase().includes(filterValue)
        }) ||
        accommodation.accommodationcncelationcharges.some(cancelation => {
          return cancelation.cancellationscheme.name.toLowerCase().includes(filterValue)
        }) ||
        accommodation.accommodationrooms.some(room => {
          return room.roomtype.name.toLowerCase().includes(filterValue)
        }) ||
        accommodation.accommodationrooms.some(room => {
          return room.roomtype.name.toLowerCase().includes(filterValue)
        }) ||
        accommodation.accommodationrooms.some(room => {
          return room.accommodationrates.some(rate => {
            return rate.amount.toString().includes(filterValue);
          });
        }) ||
        accommodation.accommodationrooms.some(room => {
          return room.accommodationoccupanciespaxes.some(occupancy => {
            return occupancy.paxtype.name.toLowerCase().includes(filterValue)
          })
        }) ||
        accommodation.accommodationrooms.some(room => {
          return room.accommodationfacilities.some(facility => {
            return facility.roomfacilities.name.toLowerCase().includes(filterValue)
          })
        })
      )
    };
    this.data.filter = 'filter';
  }

  //==================================================================================================================//

  /**
   * Loads and processes the accommodation filter fields to populate the `filterFields` property.
   * The method filters out specific keys (e.g., 'id') and formats the remaining fields.
   *
   * @return {void} This method does not return a value.
   */
  loadAccommodationFilterFields(): void {
    const accommodation = new Accommodation();
    this.filterFields = Object.keys(accommodation)
      .filter(value => !['id'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string by capitalizing the first letter of each word.
   *
   * @param {string} field - The string to be formatted.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Configures the search options for select, input, or date fields based on the currently selected value.
   * Updates internal properties `isSearchFiledSelect`, `isSearchFiledInput`, `isSearchFiledDate`, and `searchSelectOptions`.
   *
   * @return {void} This method does not return any value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'supplier', 'accommodationstatus', 'residenttype', 'currency', 'accommodationdiscounts', 'accommodationcncelationcharges', 'accommodationrooms'];
    const dateFields = ['validfrom', 'validto', 'salesfrom', 'salesto', 'createdon', 'updatedon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUsers,
      supplier: this.activeSupplier,
      accommodationstatus: this.accommodationStatus,
      residenttype: this.residentTypes,
      currency: this.currencies,
      accommodationdiscounts: this.accommodationDiscountTypes,
      accommodationcncelationcharges: this.cancellationSchemes,
      accommodationrooms: this.roomTypes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Resets the searchQuery property by initializing it as a new URLSearchParams instance.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Clears the search form, resets the relevant controls, and reloads the table.
   * If the search form has no values, a notification will be displayed stating nothing to clear.
   * Otherwise, it prompts for confirmation before clearing the search and performing related reset operations.
   *
   * @return {void} No return value.
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
   * Executes a search operation based on form values and appends query parameters accordingly.
   * This method handles fields such as search input, selected value, filter field, and date range
   * to construct a query and load table data.
   *
   * @return {void} This method does not return any value.
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
   * Resets the fields of the server search form to their default values.
   * It clears the search input and search select fields, and sets the date fields to null.
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

  //==================================================================================================================//

  /**
   * Subscribes to changes in the 'supplier' control value of the accommodation form.
   * When a change occurs, fetches an accommodation reference number from the API and updates the 'reference' control value in the form.
   * Logs an error message in case of a failure during the API call.
   *
   * @return {void} This method does not return any value.
   */
  generateAccommReference(): void {
    this.accommodationForm.controls['supplier'].valueChanges.subscribe({
      next: (value) => {
        this.dataService.getRefNumber(ApiEndpoints.paths.accommodationRefNumber, 'accommRef', value.brno).subscribe({
          next: (data) => {
            this.accommodationForm.controls['reference'].patchValue(data.accommRef);
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
   * Adds a new discount to the list of accommodation discounts if it is valid and not already added.
   *
   * The method retrieves the discount amount and type from the accommodation discount form.
   * It performs validations to ensure the amount is a positive number and the discount type exists.
   * If the discount type already exists in the list of discounts, it displays a feedback message.
   * Otherwise, it creates a new discount object, updates the discounts list, and resets the form.
   *
   * @return {void} Does not return a value. The method updates the internal state by adding a discount or showing feedback.
   */
  addDiscount(): void {
    const {amount, accommodationdiscounttype} = this.accommodationDiscountForm.getRawValue();
    if (amount && !isNaN(amount) && Number(amount) > 0 && accommodationdiscounttype) {
      const alreadyAddedDiscounts = this.accommodationDiscounts.some(
        discount => discount.accommodationdiscounttype.id === accommodationdiscounttype.id
      );
      if (alreadyAddedDiscounts) {
        this.operationFeedbackService.showMessage('Existing', `Discount Type ${accommodationdiscounttype.name} is Already Exist`);
        return;
      }
      const newDiscount = new AccommodationDiscount();
      newDiscount.amount = amount;
      newDiscount.accommodationdiscounttype = accommodationdiscounttype;
      this.accommodationDiscounts = [...this.accommodationDiscounts, newDiscount];
      this.resetAccommodationForms(false, true, false, false, false, false);
    }
  }

  //=====================================================Add Cancellations============================================//
  /**
   * Adds a cancellation charge if all required conditions are met.
   * This method validates input values of amount, ratetype, and cancellationscheme.
   * It ensures there is no duplication of a cancellation scheme before adding a new charge.
   * If the cancellation scheme already exists, a feedback message is displayed instead.
   *
   * @return {void} Does not return any value but updates the list of accommodationCancellationCharges.
   */
  addCancellationCharge(): void {
    const {amount, ratetype, cancellationscheme} = this.accommodationCancellationChargesForm.getRawValue();
    if (amount && !isNaN(amount) && Number(amount) > 0 && ratetype && cancellationscheme) {
      const alreadyAddedCancellation = this.accommodationCancellationCharges.some(
        previousCancellation => previousCancellation.cancellationscheme.id === cancellationscheme.id
      );
      if (alreadyAddedCancellation) {
        this.operationFeedbackService.showMessage('Existing', `Cancellation Scheme ${cancellationscheme.name} is Already Exist`);
        return;
      }
      const newCancellationCharges = new AccommodationCancellationCharge();
      newCancellationCharges.amount = amount;
      newCancellationCharges.ratetype = ratetype;
      newCancellationCharges.cancellationscheme = cancellationscheme;

      this.accommodationCancellationCharges = [...this.accommodationCancellationCharges, newCancellationCharges];
      this.resetAccommodationForms(false, false, true, false, false, false);
    }
  }

  //====================================================Add Rooms=====================================================//
  /**
   * Adds rooms to the accommodation configuration based on the data provided in the accommodationRoomForm.
   * Handles scenarios where a room is already selected or data validation fails.
   * Updates state and UI components accordingly after adding valid rooms.
   *
   * @return {void} This method does not return a value.
   */
  addRooms(): void {
    const {rooms, roomtype} = this.accommodationRoomForm.getRawValue();
    if (this.isRoomSelected) {
      this.operationFeedbackService.showConfirmation('Selection', 'Clear', 'Before add new room, first need to clear the selection').subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.selectedRoomRow = [];
          this.resetAccommodationData();
          this.enableRoomControlButtons(true, false, false);
          this.enableRoomCreateButton(false);
          this.isRoomSelected = false;
        }
      })

    }
    if (!this.isRoomSelected && rooms && !isNaN(rooms) && Number(rooms) > 0 && roomtype) {
      const newRoom = this.createRoom(rooms, roomtype);
      const previousCreatedRoom = this.tempAccommRooms.some(room =>
        room.roomtype.id === roomtype.id
      );
      const previousAddedRoom = this.accommodationRooms.some(room =>
        room.roomtype.id === roomtype.id
      );
      if (previousCreatedRoom || previousAddedRoom) {
        this.operationFeedbackService.showMessage('Existing', `Room type ${roomtype.name} is Already Exist`);
        return;
      }
      this.tempAccommRooms.push(newRoom);
      // Combine previous rooms with temp rooms
      this.accommodationRooms = [...this.accommodationRooms, ...this.tempAccommRooms];
      this.resetAccommodationForms(false, false, false, true, false, false);
      this.enableRoomControlButtons(false, true, false);
    }

  }

  /**
   * Creates a new AccommodationRoom instance with specified attributes.
   *
   * @param {number} rooms - The total number of rooms to be set.
   * @param {RoomType} roomType - The type/category of the room.
   * @param {Array<AccommodationFacilities>} [roomFacilities] - An optional array of facilities to include in the room.
   * @return {AccommodationRoom} An instance of AccommodationRoom configured with the provided parameters.
   */
  private createRoom(rooms: number, roomType: RoomType, roomFacilities?: Array<AccommodationFacilities>): AccommodationRoom {
    const newRoom = new AccommodationRoom();
    newRoom.rooms = rooms;
    newRoom.roomtype = roomType;
    newRoom.accommodationfacilities = roomFacilities ? roomFacilities : [];
    return newRoom;
  }

  /**
   * Removes a room from the accommodation's list of rooms by its index.
   * Also clears room facilities and updates the state of room control buttons.
   *
   * @param {number} index - The index of the room to be removed from the list.
   * @return {void} This method does not return a value.
   */
  removeRoom(index: number): void {
    this.tempAccommRooms.splice(index, 1);
    this.accommodationRoomFacilities = [];
    this.enableRoomControlButtons(true, false, false);
  }

  //========================================================Room Facilities===========================================//

  /**
   * Allows the user to select a facility and adds it to the list of selected facilities
   * if it hasn't already been selected. Clears the input field after selection.
   *
   * @param {RoomFacility} facility - The facility to be selected.
   * @return {void} No return value.
   */
  selectFacility(facility: RoomFacility): void {

    const alreadySelected = this.selectedFacilities.some(selected => selected.id === facility.id);

    if (!alreadySelected) {
      // Add to selected facilities
      this.selectedFacilities.push(facility);
    }
    // Clear the input
    this.accommodationFacilityForm.controls['filterField'].setValue('');
  }

  /**
   * Adds selected room facilities to the list of accommodation room facilities.
   * Ensures no duplicate facilities are added. If the facility already exists,
   * an appropriate feedback message is displayed. If the facilities are successfully
   * added, buttons related to room controls are updated accordingly.
   *
   * @return {void} This method does not return a value.
   */
  addAccommodationRoomFacilities(): void {
    if (this.selectedFacilities.length > 0) {
      let alreadyAddedFacilities: boolean;
      if (this.isInnerDataEditMode) {
        alreadyAddedFacilities = this.selectedRoomRow.accommodationfacilities.some(
          (facility: RoomFacility) => this.selectedFacilities.some(
            (selected: RoomFacility) => selected.id === facility.id
          )
        );
      } else {
        alreadyAddedFacilities = this.accommodationRoomFacilities.some(
          facility => this.selectedFacilities.some(selected => selected.id === facility.id)
        );
      }
      if (alreadyAddedFacilities) {
        this.operationFeedbackService.showMessage('Existing', 'Room Facility is Already Exist');
        return;
      }
      this.accommodationRoomFacilities = [...this.selectedFacilities]; // Copy selected facilities
      this.createRoomWithFacilities(this.accommodationRooms, this.accommodationRoomFacilities);
      this.selectedFacilities = [];
    }
    this.enableRoomControlButtons(false, false, true);
  }

  /**
   * Adds selected facilities to the last room in the provided array of rooms.
   * The facilities are added as `AccommodationFacilities` objects, which are appended
   * to the `accommodationfacilities` property of the last room.
   *
   * @param {Array<AccommodationRoom>} currentRoomsArray - The array of accommodation rooms to process. The last room in the array is selected for modification.
   * @param {Array<RoomFacility>} addedFacilitiesArray - The array of room facilities to add to the last room's facilities list.
   *
   * @return {void} This method does not return a value.
   */
  private createRoomWithFacilities(currentRoomsArray: Array<AccommodationRoom>, addedFacilitiesArray: Array<RoomFacility>): void {
    if (currentRoomsArray.length > 0) {
      let lastRoom = null;

      if (this.isInnerDataEditMode) {
        lastRoom = this.tempAccommRooms[0];
      } else {
        lastRoom = currentRoomsArray[currentRoomsArray.length - 1];
      }
      if (lastRoom) {
        // Ensure accommodationfacilities is initialized as an array
        if (!lastRoom.accommodationfacilities) {
          lastRoom.accommodationfacilities = [];
        }

        // Add each selected facility as an AccommodationFacilities object
        addedFacilitiesArray.forEach((facility) => {
          const newAccommodationFacilities = new AccommodationFacilities();
          newAccommodationFacilities.roomfacilities = facility;

          lastRoom.accommodationfacilities.push(newAccommodationFacilities);
        });
      }
    }
  }

  /**
   * Removes a specified facility from the list of selected facilities.
   * If the facility is not found, no action is performed.
   *
   * @param {RoomFacility} facility - The facility to be removed from the selected facilities.
   * @return {void} Does not return a value.
   */
  removeFacility(facility: RoomFacility): void {
    const index = this.selectedFacilities.findIndex(selected => selected.id === facility.id);

    if (index >= 0) {
      this.selectedFacilities.splice(index, 1);
    }
  }

  /**
   * Filters the list of facilities based on user input and excludes facilities that are already selected.
   * The search is case-insensitive and trims the input value before filtering.
   * Modifies the `filteredFacilities` property to include only the facilities that match the filter criteria.
   *
   * @return {void} This method does not return a value.
   */
  filterFacilities(): void {
    const filterValue = this.accommodationFacilityForm.controls['filterField'].value?.trim().toLowerCase() || '';

    // Get only the facilities that are not already selected
    const availableFacilities = this.roomFacilities.filter(
      facility => !this.selectedFacilities.some(selected => selected.id === facility.id)
    );

    // Apply search filter
    this.filteredFacilities = filterValue
      ? availableFacilities.filter(facility => facility.name.toLowerCase().includes(filterValue))
      : this.roomFacilities;
  }

  //=========================Accommodation Occupancies and Rates======================================================//
  /**
   * Adds an occupancy pax for a given pax type. This method handles the logic for creating new occupancy pax,
   * generating accommodation rates, and updating internal states and forms based on the provided pax type.
   *
   * @param {PaxType} paxType - The type of passenger to add occupancy for. Must contain a valid ID and related details.
   * @return {void} This method does not return a value.
   */
  addOccupancyPax(paxType: PaxType): void {
    const count = this.occupancyCountMap[paxType.id] || 0;

    if (paxType && count > 0 && this.accommodationOccupanciesPaxAndRateForm.controls['amount'].value) {
      // Create a new occupancy pax
      const newOccupancyPax = this.createNewOccupancyPax(paxType, count);
      // Create a new accommodation rate
      const newAccommodationRate = this.createNewRate(paxType, this.accommodationOccupanciesPaxAndRateForm.controls['amount'].value);
      // Store created occupancies and rates
      this.storeAccommodationOccupanciesAndRates(newOccupancyPax, newAccommodationRate, paxType);
      this.createRoomWithOccupanciesAndRates(this.accommodationRooms, newOccupancyPax, newAccommodationRate);
      // Reset form
      this.resetAccommodationForms(false, false, false, false, false, true);
      this.accommodationOccupanciesPaxAndRateForm.controls['count'].setValue(0);
      this.occupancyCountMap[paxType.id] = 0;
      this.occupancyPaxCounter++;
      // if (this.occupancyPaxCounter === 4) {
      this.enableRoomControlButtons(true, false, true);
      //   this.occupancyPaxCounter = 0;
      // }
      this.enableRoomCreateButton(true);
    }
  }

  /**
   * Creates a new instance of AccommodationOccupanciesPax with the specified passenger type and count.
   *
   * @param {PaxType} paxType - The type of passenger (e.g., adult, child).
   * @param {number} count - The number of passengers of the specified type.
   * @return {AccommodationOccupanciesPax} A new AccommodationOccupanciesPax object with the provided passenger type and count.
   */
  private createNewOccupancyPax(paxType: PaxType, count: number): AccommodationOccupanciesPax {
    const newOccupancyPax = new AccommodationOccupanciesPax();
    newOccupancyPax.paxtype = paxType;
    newOccupancyPax.count = count;
    return newOccupancyPax;
  }

  /**
   * Creates a new accommodation rate for a given passenger type and amount.
   *
   * @param {PaxType} paxType - The type of passenger for which the rate is created.
   * @param {number} amount - The monetary amount associated with the rate.
   * @return {AccommodationRates} The newly created accommodation rate object.
   */
  private createNewRate(paxType: PaxType, amount: number): AccommodationRates {
    const newAccommodationRate = new AccommodationRates();
    newAccommodationRate.paxtype = paxType;
    newAccommodationRate.amount = amount;
    return newAccommodationRate;
  }

  /**
   * Stores new accommodation occupancies and rates for a specific Pax Type.
   * If occupancy and rates of the same Pax Type already exist, it shows a feedback message and does not add the data.
   *
   * @param {AccommodationOccupanciesPax} newOccupancyPax - The new occupancy details to be stored.
   * @param {AccommodationRates} newAccommodationRate - The new rate details to be stored.
   * @param {PaxType} paxType - The type of Pax associated with the given occupancy and rate.
   * @return {void} Does not return a value. Performed operation is purely for data storage.
   */
  private storeAccommodationOccupanciesAndRates(newOccupancyPax: AccommodationOccupanciesPax, newAccommodationRate: AccommodationRates, paxType: PaxType): void {
    const previousAddedOccupancy = this.accommodationOccupanciesPax.some(previousOccupancy =>
      previousOccupancy.paxtype.id === paxType.id
    );
    const previousAddedRates = this.accommodationRates.some(previousRate =>
      previousRate.paxtype.id === paxType.id
    );

    if (previousAddedOccupancy && previousAddedRates) {
      this.operationFeedbackService.showMessage('Existing', `A Pax Type ${paxType.name} with this amount (${newAccommodationRate.amount}) already exist`);
      return;
    }
    this.accommodationOccupanciesPax.push(newOccupancyPax);
    this.accommodationRates.push(newAccommodationRate);
  }

  /**
   * Adds the provided occupancy and rate to the most recently added room in the array,
   * ensuring no duplicate entries are added for the same pax type.
   *
   * @param {Array<AccommodationRoom>} currentRoomsArray - The array of room objects where the occupancy and rate will be associated with the last room in the array.
   * @param {AccommodationOccupanciesPax} createdOccupancy - The occupancy object to be added to the last room.
   * @param {AccommodationRates} createdRate - The rate object to be added to the last room.
   * @return {void} Does not return a value. The provided room array is modified in place.
   */
  private createRoomWithOccupanciesAndRates(currentRoomsArray: Array<AccommodationRoom>, createdOccupancy: AccommodationOccupanciesPax, createdRate: AccommodationRates): void {
    if (currentRoomsArray.length > 0) {
      const lastRoom = currentRoomsArray[currentRoomsArray.length - 1];
      // Ensure arrays are initialized
      if (!lastRoom.accommodationoccupanciespaxes) {
        lastRoom.accommodationoccupanciespaxes = [];
      }
      if (!lastRoom.accommodationrates) {
        lastRoom.accommodationrates = [];
      }
      // Add occupancy if it doesn't already exist in the last room
      const alreadyAddedOccupancy = lastRoom.accommodationoccupanciespaxes.some(
        addedOccupancy => addedOccupancy.paxtype.id === createdOccupancy.paxtype.id
      );
      if (!alreadyAddedOccupancy) {
        lastRoom.accommodationoccupanciespaxes.push(createdOccupancy);
      }
      // Add rate if it doesn't already exist in the last room
      const alreadyAddedRate = lastRoom.accommodationrates.some(
        addedRate => addedRate.paxtype.id === createdRate.paxtype.id
      );
      if (!alreadyAddedRate) {
        lastRoom.accommodationrates.push(createdRate);
      }
    }
  }

  /**
   * Increments the count of a specific passenger type.
   *
   * @param {PaxType} paxType - The passenger type object for which the count should be incremented.
   * @return {void} No value is returned by this method.
   */
  incrementCount(paxType: PaxType): void {
    if (!this.occupancyCountMap[paxType.id]) {
      this.occupancyCountMap[paxType.id] = 0;
    }
    this.occupancyCountMap[paxType.id]++;
  }

  /**
   * Decreases the count for the given passenger type if the current count is greater than zero.
   *
   * @param {PaxType} paxType - The type of passenger whose count needs to be decremented.
   * @return {void} This method does not return a value.
   */
  decrementCount(paxType: PaxType): void {
    if (this.occupancyCountMap[paxType.id] > 0) {
      this.occupancyCountMap[paxType.id]--;
    }
  }

  /**
   * Retrieves the count associated with a specific passenger type.
   *
   * @param {PaxType} paxType - The passenger type for which to get the count.
   * @return {number} The count corresponding to the provided passenger type. Returns 0 if the passenger type is not found.
   */
  getCount(paxType: PaxType): number {
    return this.occupancyCountMap[paxType.id] || 0;
  }

  /**
   * Removes an accommodation occupancy and its corresponding rate at the specified index.
   *
   * @param {number} index - The index of the occupancy and rate to be removed.
   * @return {void} No return value.
   */
  removeAccommodationOccupancy(index: number): void {
    this.accommodationOccupanciesPax.splice(index, 1);
    this.accommodationRates.splice(index, 1);
  }

  //==================================================================================================================//

  /**
   * Configures the view and state for adding a room to an accommodation.
   * It initializes the table data source for accommodation rooms,
   * updates the view to enable the room section, and resets appropriate flags and data.
   *
   * @return {void} No return value.
   */
  addRoomToAccommodation(): void {
    this.accommRoomData = new MatTableDataSource(this.accommodationRooms);
    this.isEnableRoomView = true;
    this.setEnableEditModes(false);
    this.isRoomSelected = false;
    this.enableRoomCreateButton(false);
    this.enableRoomControlButtons(true, false, false);
    this.resetAccommodationData();
  }

  //==================================================================================================================//

  /**
   * Edits and sets the currently selected room data for further processing or updates.
   *
   * @param {AccommodationRoom} accommodationRoom - The room object containing details such as rooms, room type, facilities, and other related data to be edited.
   * @return {void} This method does not return any value.
   */
  editSelectedRoom(accommodationRoom: AccommodationRoom): void {
    this.tempAccommRooms = [];
    this.selectedRoomRow = null;
    this.setEnableEditModes(true);

    this.selectedRoomRow = accommodationRoom;
    this.isRoomSelected = true;

    this.enableRoomControlButtons(true, true, true);
    this.enableRoomCreateButton(true);
    this.resetAccommodationData();
    const selectedRoom = this.createRoom(
      this.selectedRoomRow.rooms,
      this.selectedRoomRow.roomtype,
      this.selectedRoomRow.accommodationfacilities
    );
    this.tempAccommRooms.push(selectedRoom);
    this.accommodationRoomFacilities = [...this.selectedRoomRow.accommodationfacilities];
    this.accommodationOccupanciesPax = this.selectedRoomRow.accommodationoccupanciespaxes;
    this.accommodationRates = this.selectedRoomRow.accommodationrates;
  }

  /**
   * Deletes the selected room from the list of accommodation rooms after confirming the action.
   *
   * @param {AccommodationRoom} accommodationRoom The selected accommodation room to be deleted.
   * @return {void} This method does not return a value.
   */
  deleteSelectedRoom(accommodationRoom: AccommodationRoom): void {
    const roomData = this.operationFeedbackService.formatObjectData(accommodationRoom, ['roomtype.name']);
    this.operationFeedbackService.showConfirmation('Room', 'Delete', roomData).subscribe({
      next: (isConfirmed) => {
        if (!isConfirmed) return;
        const index = this.accommodationRooms.indexOf(accommodationRoom);
        if (index !== -1) {
          this.accommodationRooms.splice(index, 1);
          this.accommRoomData = new MatTableDataSource(this.accommodationRooms);
        }
      }
    })
  }

  //==================================================================================================================//

  /**
   * Resets specific accommodation-related forms based on the provided parameters.
   *
   * @param {boolean} generalInfoForm - Specifies whether to reset the general information form.
   * @param {boolean} discountForm - Specifies whether to reset the discount form.
   * @param {boolean} cancellationForm - Specifies whether to reset the cancellation charges form.
   * @param {boolean} roomForm - Specifies whether to reset the room form.
   * @param {boolean} facilitiesForm - Specifies whether to reset the facilities form.
   * @param {boolean} occupanciesAndRateForm - Specifies whether to reset the occupancies, pax, and rate form.
   * @return {void} This method does not return a value.
   */
  private resetAccommodationForms(generalInfoForm: boolean, discountForm: boolean, cancellationForm: boolean, roomForm: boolean, facilitiesForm: boolean, occupanciesAndRateForm: boolean): void {
    if (generalInfoForm) this.accommodationForm.reset();
    if (discountForm) this.accommodationDiscountForm.reset();
    if (cancellationForm) this.accommodationCancellationChargesForm.reset();
    if (roomForm) this.accommodationRoomForm.reset();
    if (facilitiesForm) this.accommodationFacilityForm.reset();
    if (occupanciesAndRateForm) this.accommodationOccupanciesPaxAndRateForm.reset();
  }

  /**
   * Resets all accommodation-related internal data structures to their initial states.
   * This includes clearing temporary room data, occupancy details, and rate information.
   *
   * @return {void} No return value.
   */
  private resetAccommodationData(): void {
    this.tempAccommRooms = [];
    this.accommodationOccupanciesPax = [];
    this.accommodationRates = [];
  }

  /**
   * Enables or disables the room creation button.
   *
   * @param {boolean} enable - A boolean value indicating whether to enable (true) or disable (false) the room creation button.
   * @return {void}
   */
  private enableRoomCreateButton(enable: boolean): void {
    this.isEnableCreateRoom = enable;
  }

  /**
   * Initializes an Intersection Observer to detect which section is currently in view
   * and updates the current section based on the visibility of elements with the class 'step-section'.
   * This method observes all step sections and updates the `currentSection` property
   * based on the ID of the section that is intersecting with the viewport.
   *
   * @return {void} This method does not return any value.
   */
  private getFormSections(): void {
    // Create an Intersection Observer to detect which section is in view
    // @ts-ignore
    const observer = new IntersectionObserver(
      (entries : any) => {
        entries.forEach((entry : any) => {
          // Check if the section is visible (intersecting with viewport)
          if (entry.isIntersecting) {
            this.currentSection = parseInt(entry.target.id.replace('step-', ''), 10);
          }
        });
      },
      // Use the viewport as the reference,  Trigger when 50% of the section is visible
      {root: null, threshold: 0.4}
    );

    // Select all sections with the class 'step-section'
    const sections = this.stepAction.nativeElement.querySelectorAll('.step-section');

    // Observe each section to track its visibility
    //@ts-ignore
    sections.forEach((section) => observer.observe(section));
  }

  /**
   * Updates the state of room control buttons based on the provided parameters.
   *
   * @param {boolean} room - Determines whether the room add button is enabled.
   * @param {boolean} facility - Determines whether the room facility add button is enabled.
   * @param {boolean} occupancy - Determines whether the occupancy and rate add controls are enabled.
   * @return {void} This method does not return a value.
   */
  private enableRoomControlButtons(room: boolean, facility: boolean, occupancy: boolean): void {
    this.isEnableRoomAdd = room;
    this.isEnableRoomFacilityAdd = facility;
    this.isEnableOccupancyPaxAndRateAdd = occupancy;
  }

  /**
   * Sets the edit modes for the main data and inner data.
   *
   * @param {boolean} [enableInnerDataEdit] - Indicates whether the inner data edit mode should be enabled.
   * @param {boolean} [enableMainDataEdit] - Indicates whether the main data edit mode should be enabled.
   * @return {void} This method does not return any value.
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
   * Clears the current table selection and resets relevant properties.
   * Disables editing, clears the selected row, and sends null as data to the data server.
   *
   * @return {void} No return value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets and reloads all forms and related data to their initial state, ensuring that all variables and fields
   * are cleared or reset appropriately. Additionally, updates UI elements and enables/disables necessary controls.
   *
   * Steps performed include:
   * - Reloading the main table data with default values.
   * - Resetting and clearing various arrays and properties related to accommodation, rooms, facilities, and rates.
   * - Resetting form controls and their validations.
   * - Clearing and resetting UI states such as enabled/disabled buttons and control modes.
   *
   * @return {void} No value is returned from this method.
   */
  private resetAndReloadForms(): void {
    this.loadTable('')
    this.enableGoToView = true;
    this.enableGoToRecode = true;
    this.tempAccommRooms = [];
    this.selectedFacilities = [];
    this.accommodationRates = [];
    this.accommodationRooms = [];
    if (this.accommRoomData && this.accommRoomData.data){
      this.accommRoomData.data = [];
    }
    this.accommodationDiscounts = [];
    this.accommodationOccupanciesPax = [];
    this.accommodationCancellationCharges = [];
    this.isEnableRoomView = false;
    this.selectedRoomRow = null;
    this.selectedAccommodationRow = null;
    this.enableRoomCreateButton(false);
    this.setEnableEditModes(false, false);
    this.enableButtons(true, false, false);
    this.enableRoomControlButtons(true, false, false);
    this.resetAccommodationForms(true, true, true, true, true, true);
    this.accommodationForm.reset();
    this.setLoggedInUser();
    this.setMinDateForValidAndSale('today', 'today');
    this.formValidationService.createForm(this.accommodationForm);
    this.accommRoomData = new MatTableDataSource(this.accommodationRooms);
    this.accommodationOccupanciesPaxAndRateForm.controls['count'].patchValue(0);
  }

  //==================================================================================================================//

  /**
   * Updates the current view state of the application.
   * This method will enable the appropriate view while disabling others and reloads the table data.
   *
   * @param {('records' | 'profiles' | 'form')} view - The view to display. Can be either 'records', 'profiles', or 'form'.
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
   * Navigates to the specified step in the sequence by scrolling into view.
   *
   * @param {number} stepNumber - The number of the step to navigate to.
   * @return {void} Returns nothing.
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

  /**
   * Navigates the application to the "Create Room" step by moving to step 2 in the process flow.
   *
   * @return {void} This method does not return a value.
   */
  goToCreatRoom(): void {
    this.goToStep(2);
  }

  //==================================================================================================================//

  /**
   * Selects an accommodation row and sets it as the currently selected row.
   *
   * @param {Accommodation} row - The accommodation row to be selected.
   * @return {void}
   */
  selectAccommodationRow(row: Accommodation): void {
    this.selectedAccommodationRow = row;
  }

  /**
   * Loads the accommodation modify view by enabling the form and filling it with the provided accommodation details.
   *
   * @param {Accommodation} accommodation - The accommodation object containing details to populate the form.
   * @return {void} No return value.
   */
  loadAccommModifyView(accommodation: Accommodation): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(accommodation);
  }

  //==================================================================================================================//

  /**
   * Loads the accommodation modify view by setting various view control properties
   * and populates the form with the given element data.
   *
   * @param {any} element - The data object used to populate the form in the modify view.
   * @return {void}
   */
  loadAccommodationModifyView(element: any): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    // this.isObserverFormInitialized = false;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Loads the detailed view of the specified accommodation element, enabling relevant display and editing options.
   * This method also structures relevant data for accommodation discounts, cancellations, rooms, facilities, occupancies, rates,
   * and general information to be sent and displayed.
   *
   * @param {Accommodation} element - The selected accommodation element whose details will be displayed.
   * @return {void} No value is returned as the method manages state and sends data via an internal data server.
   */
  loadAccommodationDetailView(element: Accommodation): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;
    let tables = [];
    if (this.selectedRow.accommodationdiscounts && this.selectedRow.accommodationdiscounts.length > 0){
      tables.push(
        {
          headers: ['Amount', 'Discount Type'],
          columns: ['amount', 'accommodationdiscounttype.name'],
          data: this.selectedRow.accommodationdiscounts || [],
          title: "Accommodation Discounts"
        }
      );
    }

    if (this.selectedRow.accommodationcncelationcharges && this.selectedRow.accommodationcncelationcharges.length > 0){
      tables.push(
        {
          headers: ['Rate', 'Amount', 'Scheme'],
          columns: ['ratetype.name', 'amount', 'cancellationscheme.name'],
          data: this.selectedRow.accommodationcncelationcharges || [],
          title: "Accommodation Cancellations"
        }
      );
    }

    if (this.selectedRow.accommodationrooms && this.selectedRow.accommodationrooms.length > 0){
      tables.push(
        {
          headers: ['Room Type','Capacity'],
          columns: ['roomtype.name', 'rooms'],
          data: this.selectedRow.accommodationrooms || [],
          title: "Accommodation Rooms"
        }
      );
    }

    if (this.selectedRow.accommodationrooms){
      tables.push(
        {
          headers: ['Room Type','Facilities'],
          columns: ['roomtype.name', 'accommodationfacilities.roomfacilities.name'],
          data: this.selectedRow.accommodationrooms,
          title: "Room's Facilities"
        }
      );
    }

    if (this.selectedRow.accommodationrooms){
      tables.push(
        {
          headers: ['Room Type', 'Pax Type', 'Capacity', ],
          columns: ['roomtype.name', 'accommodationoccupanciespaxes.paxtype.name', 'accommodationoccupanciespaxes.count'],
          data: this.selectedRow.accommodationrooms,
          title: "Room's Occupancies"
        }
      );
    }

    if (this.selectedRow.accommodationrooms){
      tables.push(
        {
          headers: ['Room Type', 'Pax Type', 'Amount', ],
          columns: ['roomtype.name', 'accommodationrates.paxtype.name', 'accommodationrates.amount'],
          data: this.selectedRow.accommodationrooms,
          title: "Room's Rates"
        }
      );
    }

    const data = [
      {Label: "Title", Value: this.selectedRow.reference},
      {Label: "Reference", Value: this.selectedRow.reference},
      {Label: "Name", Value: this.selectedRow.name},
      {Label: "Location", Value: this.selectedRow.location},
      {Label: "Supplier", Value: this.selectedRow.supplier.brno},
      {Label: "Valid From", Value: this.selectedRow.validfrom},
      {Label: "Valid To", Value: this.selectedRow.validto},
      {Label: "Sale From", Value: this.selectedRow.salesfrom},
      {Label: "Sale To", Value: this.selectedRow.salesto},
      {Label: "Markup", Value: this.selectedRow.markup},
      {Label: "Created On", Value: this.selectedRow.createdon},
      {Label: "Updated On", Value: this.selectedRow.updatedon},
      {Label: "Residents", Value: this.selectedRow.residenttype.name},
      {Label: "Default Currency", Value: this.selectedRow.currency.name},
      {Label: "Type", Value: this.selectedRow.accommodationtype.name},
      {Label: "Ratings", Value: this.selectedRow.starrating.name},
      {Label: "Status", Value: this.selectedRow.accommodationstatus.name},
      {Label: "Table", Value: tables},
    ];

    this.dataServer.sendData(data);
  }

  //==================================================================================================================//

  /**
   * Populates the form with the details of the given accommodation object.
   * Performs deep cloning of the accommodation object and resets associated data.
   * Also initializes various form controls, grid data, and relationships related to the accommodation.
   *
   * @param {Accommodation} accommodation - The accommodation object whose details will be used to populate the form.
   * @return {void} This method does not return a value.
   */
  fillForm(accommodation: Accommodation): void {
    this.setEnableEditModes(false, true);
    this.enableButtons(false, true, true);
    this.loadAllCitiesAndLocations();
    this.selectedAccommodationRow = accommodation;
    this.accommodation = JSON.parse(JSON.stringify(accommodation));
    this.oldAccommodation = JSON.parse(JSON.stringify(accommodation));

    this.resetAccommodationData();

    this.accommodation.user = this.activeUsers.find(user => user.id === this.accommodation.user?.id) ?? this.accommodation.user;
    this.accommodation.supplier = this.activeSupplier.find(supplier => supplier.id === this.accommodation.supplier?.id) ?? this.accommodation.supplier;
    this.accommodation.currency = this.currencies.find(currency => currency.id === this.accommodation.currency?.id) ?? this.accommodation.currency;
    this.accommodation.accommodationstatus = this.accommodationStatus.find(status => status.id === this.accommodation.accommodationstatus?.id) ?? this.accommodation.accommodationstatus;
    this.accommodation.residenttype = this.residentTypes.find(residentType => residentType.id === this.accommodation.residenttype?.id) ?? this.accommodation.residenttype;
    this.accommodation.accommodationtype = this.accommodationTypes.find(type => type.id === this.accommodation.accommodationtype?.id) ?? this.accommodation.accommodationtype;
    this.accommodation.starrating = this.accommodationStarRates.find(starRate => starRate.id === this.accommodation.starrating?.id) ?? this.accommodation.starrating;
    //@ts-ignore
    this.accommodation.location = this.allLocations.find(location => location.name === this.accommodation.location) ?? this.accommodation.location;
    console.log('Form location to patch:', this.accommodation.location);
    console.log('location:', this.allLocations.find(location => location.name === this.accommodation.location) ?? this.accommodation.location);
    console.log('All locations:', this.allLocations);

    this.accommodationDiscounts = accommodation.accommodationdiscounts;
    this.accommodationCancellationCharges = accommodation.accommodationcncelationcharges;

    this.accommodationRooms = accommodation.accommodationrooms;
    this.accommRoomData = new MatTableDataSource(this.accommodationRooms);
    this.isEnableRoomView = true;

    this.accommodationForm.patchValue(this.accommodation, {emitEvent: false});
    this.setMinDateForValidAndSale(this.accommodation.validfrom, this.accommodation.salesfrom)
    this.formValidationService.createForm(this.accommodationForm, this.oldAccommodation, this.accommodation);
    this.accommodationForm.markAsPristine();
  }

  //===============================================Get Inner Data Updates=============================================//

  /**
   * Determines if there are any updates to the room details by comparing the current room configuration
   * with the previously stored configuration.
   *
   * @return {boolean} True if there are updates to the room details, false otherwise.
   */
  getRoomUpdates(): boolean {
    const oldRoomMap = new Map();
    const newRoomMap = new Map();
    this.accommodationRooms.forEach((currentRoom) => {
      oldRoomMap.set(currentRoom.roomtype.name, currentRoom.rooms);
    })
    this.oldAccommodation.accommodationrooms.forEach(oldRoom => {
      newRoomMap.set(oldRoom.roomtype.name, oldRoom.rooms);
    })
    if (oldRoomMap.size !== newRoomMap.size) {
      return true;
    }
    for (const [type, oldRoomCount] of oldRoomMap.entries()) {
      const newCount = newRoomMap.get(type);
      const oldRoomCountNum = Number(oldRoomCount);
      const newRoomCountNum = Number(newCount);
      if (oldRoomCountNum !== newRoomCountNum) {
        return true;
      }
    }
    return false;
  }

  /**
   * Determines if there are updates in the room facilities by comparing the current and old accommodation room facilities.
   * It checks for changes in the number of facilities and the names of facilities.
   *
   * @return {boolean} Returns true if there are updates in the room facilities, otherwise false.
   */
  getRoomFacilityUpdates(): boolean {
    let oldAllRoomFacilitiesSize = 0;
    let currentAllRoomFacilitiesSize = 0;
    let oldAllRoomFacilities: string[] = [];
    let currentAllRoomFacilities: string[] = [];

    this.oldAccommodation.accommodationrooms.forEach(room => {
      oldAllRoomFacilitiesSize += room.accommodationfacilities.length;
      room.accommodationfacilities.forEach(roomFacility => {
        oldAllRoomFacilities.push(roomFacility.roomfacilities.name);
      })
    });
    this.accommodationRooms.forEach((room) => {
      currentAllRoomFacilitiesSize += room.accommodationfacilities.length;
      room.accommodationfacilities.forEach(roomFacility => {
        currentAllRoomFacilities.push(roomFacility.roomfacilities.name);
      })
    });

    if (oldAllRoomFacilitiesSize !== currentAllRoomFacilitiesSize) {
      return true;
    }
    for (const oldFacility of oldAllRoomFacilities) {
      if (!currentAllRoomFacilities.includes(oldFacility)) {
        return true;
      }
    }
    for (const currentFacility of currentAllRoomFacilities) {
      if (!oldAllRoomFacilities.includes(currentFacility)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks for updates in occupancies and rates between the old accommodation data and the current accommodation data.
   * The method evaluates whether there are changes in the number of rooms, occupancies, or rates by performing
   * detailed comparisons between corresponding elements of the old and current accommodation data sets.
   *
   * @return {boolean} Returns true if there are updates in the occupancies or rates; otherwise, false.
   */
  getOccupanciesAndRatesUpdates(): boolean {
    if (this.oldAccommodation.accommodationrooms.length !== this.accommodationRooms.length) {
      return true;
    }
    // Compare each room individually
    for (let i = 0; i < this.oldAccommodation.accommodationrooms.length; i++) {
      const oldRoom = this.oldAccommodation.accommodationrooms[i];
      const currentRoom = this.accommodationRooms[i];

      // Check if occupancy counts differ
      if (oldRoom.accommodationoccupanciespaxes.length !== currentRoom.accommodationoccupanciespaxes.length) {
        return true;
      }

      // Check if rate counts differ
      if (oldRoom.accommodationrates.length !== currentRoom.accommodationrates.length) {
        return true;
      }

      // Create maps for occupancies for easier comparison
      const oldOccupancyMap = new Map();
      const currentOccupancyMap = new Map();

      // Check if all pax types and counts match
      oldRoom.accommodationoccupanciespaxes.forEach(occupancy => {
        oldOccupancyMap.set(occupancy.paxtype.name, occupancy.count);
      });

      currentRoom.accommodationoccupanciespaxes.forEach(occupancy => {
        currentOccupancyMap.set(occupancy.paxtype.name, occupancy.count);
      });

      // Check if all pax types and counts match
      for (const [paxType, count] of oldOccupancyMap.entries()) {
        if (!currentOccupancyMap.has(paxType) || currentOccupancyMap.get(paxType) !== count) {
          return true;
        }
      }

      for (const paxType of currentOccupancyMap.keys()) {
        if (!oldOccupancyMap.has(paxType)) {
          return true;
        }
      }

      // Compare rates
      const oldRates = new Set(oldRoom.accommodationrates.map(rate => rate.amount));
      const currentRates = new Set(currentRoom.accommodationrates.map(rate => rate.amount));

      if (oldRates.size !== currentRates.size) {
        return true;
      }

      // Check if all old rates exist in current rates
      for (const amount of oldRates) {
        if (!currentRates.has(amount)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Retrieves a string summarizing updates related to inner forms, including room updates,
   * facility updates, and occupancies/rates updates.
   *
   * @return {string} A formatted string detailing the updates in inner forms.
   */
  getInnerFormsUpdates(): string {
    let updates: string = '';
    if (this.getRoomUpdates()) updates += `<br>Rooms Updated`;
    if (this.getRoomFacilityUpdates()) updates += `<br>Room's Facilities Updated`;
    if (this.getOccupanciesAndRatesUpdates()) updates += `<br>Room's Occupancies Updated`;
    return updates;
  }

  //==================================================================================================================//

  /**
   * Processes and retrieves the accommodation data based on the provided form group.
   *
   * @param {FormGroup} accommodationForm - The form group containing accommodation information.
   * @return {Accommodation} The processed accommodation object with updated user and supplier details and associated accommodation rooms.
   */
  private getAccommodationData(accommodationForm: FormGroup): Accommodation {
    const formValues = accommodationForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    formValues.supplier = {
      id: formValues.supplier.id,
      name: formValues.supplier.name,
    }
    this.accommodation = formValues;
    this.accommodation.location = formValues.location.name;
    this.accommodation.accommodationrooms = this.accommodationRooms;
    return this.accommodation;
  }

  /**
   * Validates the accommodation form, confirms the save action with the user, and attempts to save the accommodation data
   * to the server. Provides feedback to the user regarding the result of the save operation.
   *
   * @return {void} Does not return a value but performs operations such as validation, confirmation, data saving, and feedback.
   */
  save(): void {

    const errors = this.formValidationService.getErrors(this.accommodationForm, ['accommodationdiscounts']);
    if (errors) {
      this.operationFeedbackService.showErrors("Accommodation", "Add", errors);
      return;
    }

    const toSaveAccommodation = this.getAccommodationData(this.accommodationForm);

    const accommodationData = this.operationFeedbackService.formatObjectData(toSaveAccommodation, ["reference", "name"]);

    this.operationFeedbackService.showConfirmation('Accommodation', 'Save', accommodationData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<Accommodation>(ApiEndpoints.paths.accommodations, toSaveAccommodation).subscribe({
            next: (response) => {
              const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

              if (status) {
                this.resetAndReloadForms();
              }
              this.operationFeedbackService.showStatus("Accommodation", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Accommodation", "Save", responseMessage
              );
            }
          })
        }
      })
  }

  /**
   * Updates the accommodation details based on the form data and displays appropriate feedback.
   *
   * Performs validation for the accommodation form, collects updates from the form and its inner components,
   * and confirms the update action with the user. After user confirmation, it initiates the update request
   * to the server and handles the response accordingly.
   *
   * In case of validation errors or user cancellation, the update process is halted.
   *
   * @return {void} No return value.
   */
  update(): void {
    const errors = this.formValidationService.getErrors(this.accommodationForm, ['accommodationdiscounts']);
    if (errors) {
      this.operationFeedbackService.showErrors('Accommodation', 'Update', errors);
      return;
    }

    const toUpdateAccommodation = this.getAccommodationData(this.accommodationForm);
    toUpdateAccommodation.id = this.oldAccommodation.id;

    let updates = '';
    updates += this.formValidationService.getUpdates(this.accommodationForm);
    updates += this.getInnerFormsUpdates();
    this.operationFeedbackService.showConfirmation('Accommodation', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.operationFeedbackService.showConfirmation('Accommodation', 'Update', 'This will take some time, do you like to wait...?', {yes: 'Yes', no: 'No'}, true)
            .subscribe({
              next: (isConfirmed) => {
                if (!isConfirmed) {return;}
                this.loadingService.showLoading('Updating Accommodation, please wait...');
              }
            })
          this.dataService.update<Accommodation>(ApiEndpoints.paths.accommodations, toUpdateAccommodation)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Accommodation", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Accommodation", "Update", responseMessage
                );
              },
              complete: () => {
                this.loadingService.hideLoading();
              }
            });
        }
      });
  }

  /**
   * Deletes the accommodation record after confirming the operation with the user.
   *
   * This method first formats the accommodation data for display, then prompts the user with a confirmation dialog.
   * If the user confirms, a second confirmation dialog is displayed, indicating the process might take time.
   * If confirmed again, a loading indicator is shown while the deletion request is processed.
   * Upon successful completion, the forms are reset and reloaded, and feedback is shown to the user.
   * Any errors during the process are handled and displayed to the user.
   *
   * @return {void} This method does not return a value.
   */
  delete(): void {
    const accommodationData = this.operationFeedbackService.formatObjectData(this.accommodation, ['reference']);
    this.operationFeedbackService.showConfirmation('Accommodation', 'Delete', accommodationData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;
          this.operationFeedbackService.showConfirmation('Accommodation', 'Delete', 'This will take some time, do you like to wait...?', {yes: 'Yes', no: 'No'}, true)
            .subscribe({
              next: (isConfirmed) => {
                if (!isConfirmed) {return;}
                this.loadingService.showLoading('Deleting Accommodation, please wait...');
              }
            })
          this.dataService.delete(ApiEndpoints.paths.accommodations, this.accommodation.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Accommodation", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                this.loadingService.hideLoading();
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Accommodation', 'Delete', responseMessage);
              },
              complete: () => {
                this.loadingService.hideLoading();
              }
            })
        })
      })
  }

  //==================================================================================================================//

  /**
   * Clears any applied discount settings by resetting accommodation forms with specific parameters.
   *
   * @return {void} Does not return any value.
   */
  clearDiscount(): void {
    this.resetAccommodationForms(false, true, false, false, false, false);
  }

  /**
   * Clears the cancellation charge by resetting the accommodation forms with specific flags.
   *
   * This method ensures that all relevant cancellation charges are cleared while retaining
   * other form states based on the provided reset parameters.
   *
   * @return {void} Does not return a value.
   */
  clearCancellationCharge(): void {
    this.resetAccommodationForms(false, false, true, false, false, false);
  }

  /**
   * Clears the current room settings by resetting the accommodation forms
   * based on predefined parameters.
   *
   * @return {void} Does not return a value.
   */
  clearRoom(): void {
    this.resetAccommodationForms(false, false, false, true, false, false);
  }

  /**
   * Clears the list of selected room facilities for accommodation by resetting it to an empty array.
   *
   * @return {void} Does not return a value.
   */
  clearAccommodationRoomFacilities(): void {
    this.selectedFacilities = [];
  }

  /**
   * Removes a specified facility from the list of facilities for a selected room.
   *
   * @param {AccommodationRoom} selectedRoom - The room from which the facility is to be removed.
   * @param {AccommodationFacilities} facility - The facility to be removed from the room.
   * @return {void} This method does not return a value.
   */
  removeAddedFacility(selectedRoom: AccommodationRoom, facility: AccommodationFacilities): void {
    this.accommodationRooms.forEach((room: AccommodationRoom) => {
      if (room.roomtype.id === selectedRoom.roomtype.id) {
        room.accommodationfacilities.splice(room.accommodationfacilities.indexOf(facility), 1);
      }
    })
  }

  /**
   * Clears the accommodation form and data after user confirmation.
   * If the form contains no value other than the 'reference' field, a feedback message is displayed, and the method exits.
   * Otherwise, prompts the user for confirmation before clearing all relevant details.
   * If the user confirms, resets the form state and associated data.
   *
   * @return {void} This method does not return a value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.accommodationForm, ['user', 'reference']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Accommodation', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Accommodation', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) {
          return;
        }
        this.resetAndReloadForms();
        this.resetAccommodationData();
      })
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
    this.dataValidationService.cleanupSubscriptions(this.componentId);
  }

}
