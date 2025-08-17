import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {Generic} from "../../../entity/generic";
import {Observable, Subscription} from "rxjs";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatTab, MatTabGroup, MatTabLabel} from "@angular/material/tabs";
import {TourAccommodation} from "../../../entity/tour-accommodation";
import {TourTransferContact} from "../../../entity/tour-transfer-contact";
import {Tour} from "../../../entity/tour";
import {TourGeneric} from "../../../entity/tour-generic";
import {Accommodation} from "../../../entity/accommodation";
import {TransferContract} from "../../../entity/transfer-contract";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {AsyncPipe, DatePipe} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {User} from "../../../entity/user";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {PaxType} from "../../../entity/pax-type";
import {TourOccupancy} from "../../../entity/tour-occupancy";
import {StarRate} from "../../../entity/star-rate";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatSelect} from "@angular/material/select";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {TourType} from "../../../entity/tour-type";
import {TourTheme} from "../../../entity/tour-theme";
import {TourCategory} from "../../../entity/tour-category";
import {RoomType} from "../../../entity/room-type";
import {AccommodationRoom} from "../../../entity/accommodation-room";
import {MatDialog, MatDialogActions, MatDialogContent, MatDialogTitle} from "@angular/material/dialog";
import {MatCheckbox} from "@angular/material/checkbox";
import {TourAccommodationRoom} from "../../../entity/tour-accommodation-room";
import {MatChip, MatChipRemove, MatChipSet} from "@angular/material/chips";
import {TourDataShareService} from "./tour-data-share.service";
import {TourViewComponent} from "./tour-view/tour-view.component";
import {DataValidationService} from "../../../util/core-services/validation/data-validation.service";
import {AvDataTable} from "@avoraui/av-data-table";

interface Day {
  id: number;
  plannedAccommodation?: TourAccommodation;
  plannedActivities: TourGeneric[];
  plannedTransfer?: TourTransferContact;
}

@Component({
  selector: 'app-tour',
  templateUrl: './tour.component.html',
  imports: [
    ReactiveFormsModule,
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    MatButton,
    MatIconButton,
    CdkDropList,
    CdkDrag,
    DragDropModule,
    FormsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatStartDate,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatStepper,
    MatStep,
    MatStepLabel,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatCardHeader,
    MatCardTitle,
    MatSelect,
    DatePipe,
    MatCardActions,
    MatDialogContent,
    MatCheckbox,
    MatDialogActions,
    MatDialogTitle,
    MatChip,
    MatChipRemove,
    MatChipSet,
    TourViewComponent,
    AvDataTable
  ],
  styleUrl: './tour.component.css',
  standalone: true,
})

export class TourComponent implements OnInit, OnDestroy {

  private readonly componentId = 'tour-package-component';

  tourOccupancyTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Pax Type', align: 'left' },
    { label: 'Amount', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  tourOccupancyTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'paxtype.name', align: 'left' ,color : '#3182ce'},
    { field: 'amount', align: 'left' }
  ];

  breadcrumb!: any;

  enableAdd: boolean = false;
  enableUpdate: boolean = false;
  enableDelete: boolean = false;
  enableEdit: boolean = false;
  enableGoToRecode: boolean = true;
  enableGoToView: boolean = true;

  hasInsertAuthority: boolean = false;
  hasUpdateAuthority: boolean = false;
  hasDeleteAuthority: boolean = false;

  isEnableRecordView: boolean = false;
  isEnableFormView: boolean = false;
  isEnableTourDetailView: boolean = false;

  nextTourRef: string = "";

  tours: Array<Tour> = [];
  filteredTours: Array<Tour> = [];
  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  filteredTourTypes!: Observable<Array<TourType>>;
  paxTypes: Array<PaxType> = [];
  occupancyCountMap: { [key: number]: number } = {};
  tourOccupancies: Array<TourOccupancy> = [];

  totalDays: number = 0;
  totalAccommodations: number = 0;
  totalTransfers: number = 0;
  totalActivities: number = 0;
  totalPassengers: number = 0;

  loadingImageURL: string = '';
  loadingAccommDataImageURL: string = '';
  loadingTransferDataImageURL: string = '';
  loadingGenericDataImageURL: string = '';

  availableAccommodations: Array<Accommodation> = [];
  accommodationSearchQuery!: URLSearchParams;

  @ViewChild('roomTypeDialog') roomTypeDialog!: TemplateRef<any>;
  dropAccommodationRoomTypes: (RoomType & { selected?: boolean })[] = [];
  selectedAccommodationRoomType: Array<RoomType> = [];
  private currentDropDayIndex: number = -1

  availableTransfers: Array<TransferContract> = [];
  transferSearchQuery!: URLSearchParams;

  availableActivities: Array<Generic> = [];
  activitySearchQuery!: URLSearchParams;

  tourPassengers: Array<TourOccupancy> = [];

  tourForm!: FormGroup;
  accommodationSearchForm!: FormGroup;
  transferSearchForm!: FormGroup;
  activitySearchForm!: FormGroup;
  tourOccupancyForm!: FormGroup;

  public serverSearchForm!: FormGroup;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  searchQuery!: URLSearchParams;

  @ViewChild('stepper') stepper!: MatStepper;
  isLinear = false;

  plannedTour!: Tour;
  oldTour!: Tour;

  tourTypes: Array<TourType> = [];
  tourCategories: Array<TourCategory> = [];
  tourThemes: Array<TourTheme> = [];

  dataSubscriber$: Subscription = new Subscription();

  days: Day[] = [];
  oldDays: Day[] = [];

  minValidDate!: Date;
  minSaleDate: Date = new Date();
  maxSaleDate: Date = new Date();

  constructor(
    private breadCrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private dataService: DataService,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private authService: AuthorizationManagerService,
    private dialog: MatDialog,
    private operationFeedBackService: OperationFeedbackService,
    private tourDataShareService: TourDataShareService,
    private dataValidationService: DataValidationService
  ) {

    this.tourForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      reference: new FormControl('', Validators.required),
      validfrom: new FormControl('', Validators.required),
      validto: new FormControl('', Validators.required),
      maxpaxcount: new FormControl('', Validators.required),
      markup: new FormControl('', Validators.required),
      salesfrom: new FormControl('', Validators.required),
      salesto: new FormControl('', Validators.required),
      tourtype: new FormControl('', Validators.required),
      tourcategory: new FormControl('', Validators.required),
      tourtheme: new FormControl('', Validators.required),
      touroccupancies: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.accommodationSearchForm = this.formBuilder.group({
      name: new FormControl(''),
      location: new FormControl(''),
    });

    this.transferSearchForm = this.formBuilder.group({
      pickuplocation: new FormControl(''),
      droplocation: new FormControl(''),
      isreturn: new FormControl(false),
    });

    this.activitySearchForm = this.formBuilder.group({
      name: new FormControl(''),
      salesFrom: new FormControl(''),
      salesTo: new FormControl(''),
    });

    this.tourOccupancyForm = this.formBuilder.group({
      paxtype: new FormControl(''),
      amount: new FormControl(''),
    });

    this.serverSearchForm = this.formBuilder.group({
      searchInput: new FormControl(),
      searchSelect: new FormControl(),
      filterField: new FormControl(),
      searchStartDate: new FormControl(),
      searchEndDate: new FormControl()
    });

  }

  /**
   * Lifecycle hook that is called after Angular has initialized the component's data-bound properties.
   * It is used to perform any necessary initialization logic for the component.
   *
   * @return {void} Does not return any value.
   */
  ngOnInit() {
    this.initialize();

    this.dataValidationService.setupPositiveNumberValidation(this.componentId, this.tourOccupancyForm, [['amount', 0]]);

    this.dataSubscriber$.add(
      this.tourDataShareService.triggerTourView$.subscribe(() => {
        this.setDisplayView('records');
      })
    )

    this.tourForm.valueChanges.subscribe((form) => {
      this.minSaleDate = form.validfrom;
      this.maxSaleDate = form.validto;

      const salesFromControl = this.tourForm.get('salesfrom');
      const salesToControl = this.tourForm.get('salesto');

      if (form.validfrom && form.validto) {
        salesFromControl?.enable({ emitEvent: false });
        salesToControl?.enable({ emitEvent: false });
      } else {
        salesFromControl?.disable({ emitEvent: false });
        salesToControl?.disable({ emitEvent: false });
      }
    });

    this.tourForm.controls['maxpaxcount'].valueChanges.subscribe((count) => {
      this.totalPassengers = count;
    })

    this.setMinDateForValidAndSale('today', 'today');
  }

  /**
   * Initializes the component by setting up initial data, fetching required resources, and preparing the form for use.
   * It retrieves active users, passenger types, and tours from the respective endpoints,
   * configures form validation, and sets up internal state and UI components.
   *
   * @return {void} Does not return any value.
   */
  initialize(): void {
    this.breadcrumb = this.breadCrumbService.getActiveRoute();
    this.loadingImageURL = 'pending.gif';
    this.loadingAccommDataImageURL = 'rejected.png';
    this.loadingTransferDataImageURL = 'rejected.png';
    this.loadingGenericDataImageURL = 'rejected.png';
    this.generateTourContractReference();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.tourForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
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
      this.dataService.getData<Tour>(ApiEndpoints.paths.tours).subscribe({
        next: (tours) => {
          this.tours = tours;
          this.filteredTourTypes = this.autoCompleteDataFilterService.filterData<TourType>(this.tourTypes, this.tourForm, 'tourtype', ['name']);
        },
        error: (error) => {
          console.error("Error fetching tours : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourType>(ApiEndpoints.paths.tourTypes).subscribe({
        next: (tourTypes) => {
          this.tourTypes = tourTypes;
        },
        error: (error) => {
          console.error("Error fetching tour types : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourCategory>(ApiEndpoints.paths.tourCategories).subscribe({
        next: (tourCategories) => {
          this.tourCategories = tourCategories;
        },
        error: (error) => {
          console.error("Error fetching tour categories : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourTheme>(ApiEndpoints.paths.tourThemes).subscribe({
        next: (tourThemes) => {
          this.tourThemes = tourThemes;
        },
        error: (error) => {
          console.error("Error fetching tour themes : " + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.tourForm, this.plannedTour, this.oldTour, 'tourcontract', ['reference'], [], [['validfrom', 'yyyy-MM-dd'], ['validto', 'yyyy-MM-dd'], ['salesfrom', 'yyyy-MM-dd'], ['salesto', 'yyyy-MM-dd']]);
    this.enableButtons(true, false, false);
    this.buttonStates();
    this.createView();
  }

  /**
   * Creates and initializes the view for records.
   * This method sets up view-related configurations, initializes filters,
   * and loads the table data for the records view.
   *
   * @return {void} No value is returned by this method.
   */
  createView(): void {
    this.setDisplayView('records');
    // this.tourOccupancyForm.controls['count'].patchValue(0);
    this.isSearchFiledInput = true;
    this.loadTourContractFilterFields();
    this.loadTable("");
    this.setLoggedInUser();
  }

  /**
   * Sets the currently logged-in user using the provided authentication service.
   *
   * @return {void} This method does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.tourForm, 'user');
  }

  /**
   * Sets the minimum dates for valid and sale dates based on the input parameters.
   * If any of the parameters is not provided or set to "today", the current date is used as the minimum date.
   *
   * @param {string} [validFrom] - The date to set as the minimum valid date. If not provided, defaults to the current date.
   * @param {string} [saleFrom] - The date to set as the minimum sale date. If not provided, defaults to the current date.
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

  /**
   * Enables or disables the buttons for add, update, and delete operations.
   *
   * @param {boolean} add - Determines whether the add button should be enabled.
   * @param {boolean} upd - Determines whether the update button should be enabled.
   * @param {boolean} del - Determines whether the delete button should be enabled.
   * @return {void} Does not return a value.
   */
  private enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Configures the state of button authorities by checking user permissions
   * for specific operations ('insert', 'update', 'delete') on the 'tour' module.
   *
   * @return {void} This method does not return a value.
   */
  private buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('package', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('package', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('package', 'delete');
  }

  /**
   * Loads table data based on the provided query.
   * Fetches data from the data service and updates the component state.
   * Handles success and error cases by updating the tours data and the loading image URL.
   *
   * @param {string} query - The query string to filter or fetch specific data for the table.
   * @return {void} This method does not return a value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Tour>(ApiEndpoints.paths.tours, query).subscribe({
        next: (tours) => {
          this.tours = tours;
          this.filteredTours = [...tours];
          this.loadingImageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.loadingImageURL = 'rejected.png';
        }
      })
    )
  }

  /**
   * Filters the tours grid based on the input value from an event target.
   *
   * @param {Event} event - The input event containing the filter value.
   * @return {void} Does not return a value. Updates the filtered list of tours based on the filter criteria.
   */
  filterTourGrid(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    if (!filterValue || filterValue.trim() === '') {
      this.filteredTours = [...this.tours];
      return;
    }
    this.filteredTours = this.tours.filter(tour => {
      return tour.reference.toLowerCase().includes(filterValue) ||
        tour.name.toLowerCase().includes(filterValue) ||
        tour.validfrom.toLowerCase().includes(filterValue) ||
        tour.validto.toLowerCase().includes(filterValue) ||
        tour.salesfrom.toLowerCase().includes(filterValue) ||
        tour.salesto.toLowerCase().includes(filterValue) ||
        tour.tourtype.name.toLowerCase().includes(filterValue) ||
        tour.tourcategory.name.toLowerCase().includes(filterValue) ||
        tour.tourtheme.name.toLowerCase().includes(filterValue);

    });
  }

  /**
   * Generates a reference number for a tour contract.
   * Retrieves a new tour reference number from the data service and assigns it to the form control 'reference'.
   * Logs an error message in case of a failure while fetching the reference number.
   *
   * @return {void} This function does not return any value.
   */
  generateTourContractReference(): void {
    this.dataService.getRefNumber(ApiEndpoints.paths.tourRefNumber, 'tourRef').subscribe({
      next: (data) => {
        this.nextTourRef = data.tourRef;
        this.tourForm.controls['reference'].setValue(this.nextTourRef);
      },
      error: (err) => {
        console.error('Error fetching tour-number:', err);
      }
    });
  }

  //==============Add Name for Mat AutoComplete============================//
  /**
   * Formats and returns the display name of a user based on specified attributes.
   *
   * @param {any} user - The user object containing relevant details.
   * @returns {string} The formatted display name of the user.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Retrieves and returns the display name for a given tour type.
   *
   * This function utilizes the autoCompleteDataFilterService to extract
   * and format the display name of a tour type based on its 'name' property.
   * It is commonly used to generate user-friendly labels for tour types
   * in UI components or other parts of the application.
   *
   * @param {any} tourType - The tour type object to retrieve the display name for.
   *                         The object is expected to contain a 'name' property.
   * @returns {string} The display name of the given tour type.
   */
  displayTourTypeName = (tourType: any): string => {
    return this.autoCompleteDataFilterService.displayValue<TourType>(tourType, ['name']);
  }
  //======================================================================//

  //=================================Set View=============================//
  /**
   * Sets the current view of the application to either 'records' or 'form'.
   *
   * @param {('records' | 'form')} view - The view to be set, either 'records' for the records view or 'form' for the form view.
   * @return {void} This method does not return a value.
   */
  public setDisplayView(view: 'records' | 'form' | 'tourDetailView'): void {
    this.isEnableRecordView = view === 'records';
    this.isEnableFormView = view === 'form';
    this.isEnableTourDetailView = view === 'tourDetailView';
  }

  /**
   * Loads the modifications for the given tour and updates the view accordingly.
   * Disables navigation options and populates the form with the provided tour data.
   *
   * @param {Tour} element - The tour object containing data used to populate the modify view.
   * @return {void}
   */
  loadTourModifyView(element: Tour): void {
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Loads the data view for a specific tour by fetching tour details based on its reference.
   *
   * @param {Tour} tour - The tour object containing information about the specific tour to load.
   * @return {void} This method does not return a value.
   */
  loadTourDataView(tour: Tour): void {
    this.getTourByReference(tour.reference);
  }

  /**
   * Fetches the tour data associated with the given reference and updates the relevant view.
   *
   * @param {string} reference - The unique reference identifier for the tour to be fetched.
   * @return {void} This method does not return any value.
   */
  getTourByReference(reference: string): void {
    this.dataSubscriber$.add(
      this.dataService.getDataObject<Tour>(ApiEndpoints.paths.tourView, reference).subscribe({
        next: (tour) => {
          this.tourDataShareService.sendTourData(tour);
          this.setDisplayView('tourDetailView');
        },
        error: (error) => {
          console.error("Error fetching tour by reference : " + error.message);
        }
      })
    )
  }

  //=================================Tour Guest Configurations================================//

  /**
   * Adds or updates a pax type with a specified amount to the tour occupancies list.
   * If the pax type already exists in the list, its amount is updated. If not, the pax type is added.
   *
   * @param {PaxType} paxType - The passenger type to add or update in the tour occupancies.
   * @return {void} This method does not return a value.
   */
  addPaxAmount(paxType: PaxType): void {
    const amountControl = this.tourOccupancyForm.get('amount');

    if (amountControl && amountControl.valid) {
      const amount = Number(amountControl.value);

      if (amount <= 0) {
        this.operationFeedbackService.showMessage("Invalid", "Can not enter this value : " + amount);
        return;
      }

      // Check if this pax type already exists
      const existingIndex = this.tourOccupancies.findIndex(
        occupancy => occupancy.paxtype.id === paxType.id
      );

      if (existingIndex !== -1) {
        // Update existing entry
        this.tourOccupancies[existingIndex].amount = amount;
      } else {
        // Add new entry
        const newOccupancy = new TourOccupancy();
        newOccupancy.amount = amount;
        newOccupancy.paxtype = paxType;

        this.tourOccupancies.push(newOccupancy);
      }

      this.removeInvalidAmounts();
      // Reset the form after adding
      amountControl.reset();

      // Optional: Log the current state
      console.log('Current Tour Occupancies:', this.tourOccupancies);
    } else {
      console.error('Please enter a valid amount');
    }
  }

  public removeInvalidAmounts(): void {
    this.tourOccupancies = this.tourOccupancies.filter(occupancy => occupancy.amount > 0);
  }

  // Method to remove a pax type from the array
  removePaxAmount(paxType: PaxType): void {
    this.tourOccupancies = this.tourOccupancies.filter(
      occupancy => occupancy.paxtype.id !== paxType.id
    );
  }

  // Method to get total amount
  getTotalAmount(): number {
    return this.tourOccupancies.reduce((total, occupancy) => total + occupancy.amount, 0);
  }

  // Method to get amount for specific pax type
  getAmountForPaxType(paxType: PaxType): number {
    const occupancy = this.tourOccupancies.find(
      occ => occ.paxtype.id === paxType.id
    );
    return occupancy ? occupancy.amount : 0;
  }

  //=========================================================================================//

  /**
   * Calculates the total duration of a tour based on the latest day from accommodations, transfers, and generic activities.
   *
   * @param {Tour} tour - The tour object containing details such as accommodations, transfers, and generic activities.
   * @return {number} The maximum day value across the tour's accommodations, transfers, and generics, representing the total tour duration.
   */
  getTourDuration(tour: Tour): number {
    const accommDays = tour.touraccommodations?.map(accomm => accomm.day) || [];
    const transferDays = tour.tourtransfercontracts?.map(transfer => transfer.day) || [];
    const genericDays = tour.tourgenerics?.map(generic => generic.day) || [];

    // Include all day arrays
    const allDays = [...accommDays, ...transferDays, ...genericDays];

    if (allDays.length === 0) {
      return 0;
    }

    return Math.max(...allDays);
  }

  /**
   * Calculates the minimum price for a guest from the provided tour occupancies.
   *
   * @param {Tour} tour - The tour object containing occupancy information and corresponding prices.
   * @return {string} The minimum price formatted as a string with two decimal places, or '0.00' if no prices are available.
   */
  getMinPriceForGuest(tour: Tour): string {
    const minPrices = tour.touroccupancies.map(o => o.amount ?? 0);
    return minPrices.length ? Math.min(...minPrices).toFixed(2) : '0.00';
  }

  /**
   * Calculates the count of accommodations, transfers, and generics in a given tour.
   *
   * @param {Tour} tour - The tour object containing information about accommodations, transfer contracts, and generics.
   * @return {Object} - An object containing the counts of accommodations, transfer contracts, and generics:
   *                    - accommCount: Number of accommodations.
   *                    - transferCount: Number of transfer contracts.
   *                    - genericCount: Number of generics.
   */
  getItineraryCount(tour: Tour): {accommCount: number, transferCount: number, genericCount: number} {
    const accommCount = tour.touraccommodations?.length || 0;
    const transferCount = tour.tourtransfercontracts?.length || 0;
    const genericCount = tour.tourgenerics?.length || 0;
    return {accommCount, transferCount, genericCount};
  }

  /**
   * Adds a new day to the list of days. Each day is assigned a unique ID and
   * initialized with an empty list of planned activities. Updates the total
   * number of days after adding the new day.
   *
   * @return {void} Does not return a value.
   */
  addDay(): void {
    const newDay: Day = {
      id: this.days.length + 1,
      plannedActivities: []
    };
    this.days.push(newDay);
    this.totalDays = this.days.length;
  }

  /**
   * Removes a day from the list of days and updates associated data such as accommodations, transfers, and activities.
   *
   * @param {number} dayId - The ID of the day to be removed.
   * @return {void} This method does not return a value.
   */
  removeDay(dayId: number): void {
    const dayToRemove = this.days.find(day => day.id === dayId);
    if (dayToRemove) {
      if (dayToRemove.plannedAccommodation) {
        this.availableAccommodations.push(dayToRemove.plannedAccommodation.accommodation);
      }
      if (dayToRemove.plannedTransfer) {
        this.availableTransfers.push(dayToRemove.plannedTransfer.transfercontract);
      }
      dayToRemove.plannedActivities.forEach(activity => {
        this.availableActivities.push(activity.generic);
      });
    }

    this.days = this.days.filter(day => day.id !== dayId);
    this.days.forEach((day, index) => {
      day.id = index + 1;
    });
    this.totalDays = this.days.length;
    this.updateAccommodationCounts('remove', dayId);
    this.updateTransferCounts('remove', dayId);
    this.updateActivityCounts('remove', dayId);
  }

  /**
   * A predicate function used to determine whether a drag event involving an accommodation-related object
   * can be accepted by a specific drop list.
   *
   * This function evaluates if the dragged item's accommodation data contains the minimal required properties:
   * `name`, `accommodationtype`, and `location`. The function supports both `Accommodation` objects and
   * `TourAccommodation` objects by verifying the presence of the necessary fields.
   *
   * @param {CdkDrag} drag - The drag object representing the draggable item in the operation.
   * @param {CdkDropList} drop - The drop list object representing the area where the item might be dropped.
   * @returns {boolean} - Returns `true` if the accommodation data meets the criteria, otherwise `false`.
   */
  accommodationPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => {
    const item = drag.data;

    // Handle both Accommodation objects and TourAccommodation objects
    const accommodation = item.accommodation || item;

    // More lenient check - just verify it has the basic accommodation properties
    return accommodation &&
      accommodation.name &&
      accommodation.accommodationtype &&
      accommodation.location;
  };

  /**
   * Determines whether a drag-and-drop interaction between a specific draggable item and a drop zone is valid.
   *
   * This function evaluates the provided `drag` and `drop` parameters to check if the draggable item can
   * interact with the drop zone. The validation is based on the presence of a `name` property in the
   * `generic` object extracted from the draggable item's data.
   *
   * The function accounts for both generic objects and tour-specific generic objects by verifying and
   * accessing the `generic` property if it exists. If the `generic` property does not exist, the function
   * assumes the root item itself as the object to validate.
   *
   * @param {CdkDrag} drag - The draggable item being moved.
   * @param {CdkDropList} drop - The drop zone where the item is being dropped.
   * @returns {boolean} - Returns true if the draggable item's data contains a valid object with a `name` property; otherwise, false.
   */
  activityPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => {
    const item = drag.data;

    // Handle both Generic objects and TourGeneric objects
    const generic = item.generic || item;

    // Simple check - just verify it has a name property
    return generic && generic.name;
  };

  /**
   * Determines whether a drag-and-drop transfer operation should be allowed based on custom conditions.
   *
   * This function evaluates the transfer predicate by checking specific properties
   * of the dragged item's data and its eligibility to be dropped into a target drop container.
   *
   * @param {CdkDrag} drag - The drag instance representing the item being moved.
   * @param {CdkDropList} drop - The drop list instance representing the target container.
   * @returns {boolean} Returns true if the item can be transferred to the target container, otherwise false.
   */
  transferPredicate = (drag: CdkDrag, drop: CdkDropList): boolean => {
    const item = drag.data;

    // Handle both TransferContract objects and TourTransferContact objects
    const transfer = item.transferContact || item;

    // Fixed property access - transferstatus might be a string or object
    return transfer &&
      (transfer.transferstatus ||
        (transfer.transferstatus && transfer.transferstatus.name));
  };

  /**
   * Handles the drop event for accommodations, managing the movement of items between containers
   * and updating the relevant data structures accordingly.
   *
   * @param {CdkDragDrop<any[]>} event - The drag and drop event containing information such as the
   *                                     dragged item, the source and target containers, and their indices.
   * @return {void} This method does not return a value.
   */
  dropAccommodation(event: CdkDragDrop<any[]>): void {

    const draggedItem = event.item.data;
    this.dropAccommodationRoomTypes = draggedItem.accommodationrooms.map((r: AccommodationRoom) => ({
      ...r.roomtype,
      selected: false
    }));
    this.selectedAccommodationRoomType = [];

    // Validate item type before processing
    if (!this.accommodationPredicate(event.item, event.container)) {
      this.showInvalidDropMessage('Only accommodations can be dropped here');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {

      if (event.container.element.nativeElement.id.startsWith('day-accommodation-')) {
        const dayId = parseInt(event.container.element.nativeElement.id.split('-')[2]);
        const day = this.days.find(d => d.id === dayId);
        this.currentDropDayIndex = this.days.findIndex(d => d.id === dayId);

        if (day) {
          // Return existing accommodation to an available list
          if (day.plannedAccommodation) {
            this.availableAccommodations.push(day.plannedAccommodation.accommodation);
          }

          const sourceItem = event.previousContainer.data[event.previousIndex];

          // Open the dialog
          this.dialog.open(this.roomTypeDialog, {
            width: '400px',
            disableClose: true,
          });

          // Create TourAccommodation wrapper if needed
          if (sourceItem.accommodation) {
            day.plannedAccommodation = {
              ...sourceItem,
              day: dayId,
            };
          } else {
            day.plannedAccommodation = {
              accommodation: sourceItem,
              day: dayId
            } as TourAccommodation;
          }

          // Remove from source
          event.previousContainer.data.splice(event.previousIndex, 1);
        }
      } else {
        // Handle other container types
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }

      this.updateAccommodationCounts('add');
    }
  }

  /**
   * Handles the drop event for activity elements, enabling movement of items between containers
   * and updating the relevant data structures.
   *
   * @param {CdkDragDrop<any[]>} event - The drag-and-drop event that contains information about the source and target containers,
   *                                      item indices, and associated data.
   * @return {void} Returns no value. Updates relevant data structures and performs any necessary state or UI updates.
   */
  dropActivity(event: CdkDragDrop<any[]>): void {

    if (!this.activityPredicate(event.item, event.container)) {
      this.showInvalidDropMessage('Only activities can be dropped here');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      if (event.container.element.nativeElement.id.startsWith('day-activities-')) {
        const dayId = parseInt(event.container.element.nativeElement.id.split('-')[2]);
        const day = this.days.find(d => d.id === dayId);

        if (day) {
          const sourceItem = event.previousContainer.data[event.previousIndex];

          // Create TourGeneric wrapper if needed
          let tourGeneric: TourGeneric;
          if (sourceItem.generic) {
            // Already wrapped - just update the day
            tourGeneric = {
              ...sourceItem,
              day: dayId
            };
          } else {
            // Create a new wrapper
            tourGeneric = {
              generic: sourceItem,
              day: dayId
            } as TourGeneric;
          }

          if (sourceItem.generic) {
          }

          day.plannedActivities.push(tourGeneric);
          event.previousContainer.data.splice(event.previousIndex, 1);
        }
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
      this.updateActivityCounts('add');
    }
  }

  /**
   * Handles the logic for transferring items when a drag-and-drop event occurs.
   *
   * @param {CdkDragDrop<any[]>} event The drag-drop event containing information about the dropped item, including its previous and new container.
   * @return {void} This method does not return a value.
   */
  dropTransfer(event: CdkDragDrop<any[]>): void {
    // Validate item type before processing
    if (!this.transferPredicate(event.item, event.container)) {
      this.showInvalidDropMessage('Only transfers can be dropped here');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const transfer = event.previousContainer.data[event.previousIndex];

      if (event.container.element.nativeElement.id.startsWith('day-transfer-')) {
        const dayId = parseInt(event.container.element.nativeElement.id.split('-')[2]);
        const day = this.days.find(d => d.id === dayId);

        if (day) {
          // Return existing transfer to available list
          if (day.plannedTransfer) {
            this.availableTransfers.push(day.plannedTransfer.transfercontract);
          }

          // Create TourTransferContact if dropping from availableTransfers
          if (transfer.transferContact) {
            day.plannedTransfer = {
              ...transfer,
              day: dayId
            } // Already a TourTransferContact
          } else {
            day.plannedTransfer = {
              transfercontract: transfer,
              day: dayId
            } as TourTransferContact;
          }

          event.previousContainer.data.splice(event.previousIndex, 1);
        }
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex
        );
      }
      this.updateTransferCounts('add');
    }
  }

  /**
   * Updates the location of a specific day identified by its ID.
   * If the day with the given ID is found, its location is modified.
   *
   * @param {number} dayId - The unique identifier of the day to be updated.
   * @param {string} location - The new location to be set for the specified day.
   * @return {void} This method does not return a value.
   */
  updateDayLocation(dayId: number, location: string): void {
    const day = this.days.find(d => d.id === dayId);
    if (day) {
      // day.location = location; // Uncomment if Day interface has location property
    }
  }

  /**
   * Removes the planned accommodation from a specific day and updates the accommodation counts.
   *
   * @param {number} dayId - The unique identifier of the day from which the accommodation should be removed.
   * @return {void} - This method does not return a value.
   */
  removeAccommodationFromDay(dayId: number): void {
    const day = this.days.find(d => d.id === dayId);
    if (day && day.plannedAccommodation) {
      this.availableAccommodations.push(day.plannedAccommodation.accommodation);
      this.updateAccommodationCounts('remove');
      day.plannedAccommodation = undefined;
      this.updateAccommodationCounts('remove');
    }
  }

  /**
   * Removes a planned transfer from the specified day.
   * If a planned transfer exists for the given day, it is added back to the list of available transfers,
   * and the day's planned transfer is reset. Additionally, updates the transfer counts accordingly.
   *
   * @param {number} dayId - The identifier of the day from which the transfer should be removed.
   * @return {void} This method does not return a value.
   */
  removeTransferFromDay(dayId: number): void {
    const day = this.days.find(d => d.id === dayId);
    if (day && day.plannedTransfer) {
      this.availableTransfers.push(day.plannedTransfer.transfercontract);
      day.plannedTransfer = undefined;
      this.updateTransferCounts('remove');
    }
  }

  /**
   * Removes an activity from a specific day by its index in the planned activities list.
   * If the activity exists, it is removed from the day's planned activities and added back to the available activities.
   *
   * @param {number} dayId - The unique identifier of the day from which the activity should be removed.
   * @param {number} activityIndex - The index of the activity in the day's planned activities list.
   * @return {void}
   */
  removeActivityFromDay(dayId: number, activityIndex: number): void {
    const day = this.days.find(d => d.id === dayId);
    if (day && day.plannedActivities[activityIndex]) {
      const activity = day.plannedActivities[activityIndex];
      this.availableActivities.push(activity.generic);
      day.plannedActivities.splice(activityIndex, 1);
      this.updateActivityCounts('remove');
    }
  }

  /**
   * Displays a snackbar message indicating an invalid drop action.
   *
   * @param {string} message - The message to be displayed in the snackbar.
   * @return {void} This method does not return a value.
   */
  private showInvalidDropMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  //=============================Display/ Update item counts=============================//
  /**
   * Updates the accommodation counts by either adding or removing accommodations
   * and recalculates the total number of accommodations.
   *
   * @param {('add'|'remove')} operation Specifies the type of operation: 'add' to include accommodations or 'remove' to exclude them.
   * @param {number} [dayToRemove] The ID of the day from which to remove the accommodation when the operation is 'remove'. Optional parameter.
   * @return {void} Does not return any value.
   */
  private updateAccommodationCounts(operation: 'add' | 'remove', dayToRemove?: number): void {
    if (operation === 'remove' && dayToRemove) {
      // Remove accommodation from a specific day
      const dayIndex = this.days.findIndex(day => day.id === dayToRemove);
      if (dayIndex !== -1) {
        this.days[dayIndex].plannedAccommodation = undefined;
      }
    }
    // Always recalculate the total count
    this.totalAccommodations = this.days.filter(day => day.plannedAccommodation).length;
  }

  /**
   * Updates the transfer counts by either adding or removing transfers.
   *
   * @param {'add' | 'remove'} operation The operation to be performed, either 'add' or 'remove'.
   * @param {number} [dayToRemove] The ID of the day to remove the transfer from, applicable only when the operation is 'remove'.
   * @return {void} Does not return any value.
   */
  private updateTransferCounts(operation: 'add' | 'remove', dayToRemove?: number): void {
    if (operation === 'remove' && dayToRemove) {
      const dayIndex = this.days.findIndex(day => day.id === dayToRemove);
      if (dayIndex !== -1) {
        this.days[dayIndex].plannedTransfer = undefined;
      }
    }
    this.totalTransfers = this.days.filter(day => day.plannedTransfer).length;
  }

  /**
   * Updates activity counts by either adding or removing activities and recalculates the total count.
   *
   * @param {'add' | 'remove'} operation The operation to perform, either 'add' to increase activity counts or 'remove' to decrease them.
   * @param {number} [dayToRemove] The ID of the day from which activities should be removed, applicable only if the operation is 'remove'.
   * @return {void} This method does not return a value.
   */
  private updateActivityCounts(operation: 'add' | 'remove', dayToRemove?: number): void {
    // If removing activities from a specific day
    if (operation === 'remove' && dayToRemove) {
      const dayIndex = this.days.findIndex(day => day.id === dayToRemove);
      if (dayIndex !== -1) {
        // Clear all activities from this day
        this.days[dayIndex].plannedActivities = [];
      }
    }
    // Always recalculate the total count to ensure accuracy
    this.totalActivities = this.days.reduce((total, day) => total + day.plannedActivities.length, 0);
  }

  //=================================================Server Search===============================//
  /**
   * Resets the server search query parameter fields by setting their values to default.
   * This includes clearing input fields and resetting date fields to null.
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
   * Loads and sets the filter fields for tour contracts by filtering out
   * specific keys from the Tour object and formatting the remaining fields.
   *
   * @return {void} This method does not return a value.
   */
  loadTourContractFilterFields(): void {
    const tour = new Tour();
    this.filterFields = Object.keys(tour)
      .filter(value => !['id', 'validto', 'salesto', 'touraccommodations', 'tourtransfercontracts', 'tourgenerics', 'touroccupancies'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Converts the first letter of each word in a given string to uppercase.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with each word's first letter capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Loads and updates the search select options based on the selected filter field value.
   * Determines whether the filter field is associated with a select dropdown, an input field, or a date picker.
   * Additionally, it populates the appropriate options for a select dropdown if applicable.
   * @return {void} Does not return any value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user','tourtype','tourcategory','tourtheme',];
    const dateFields = ['validfrom', 'salesfrom', 'createdon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUsers,
      tourtype: this.tourTypes,
      tourcategory: this.tourCategories,
      tourtheme: this.tourThemes,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Executes a search operation based on the form values provided.
   * The method validates the necessary fields and constructs a search query accordingly.
   * It supports filtering by a combination of field, input values, and date ranges.
   * If no valid search field is provided, an operation feedback message is displayed.
   *
   * @return {void} This method does not return a value, but it initiates the search process and updates the table with the results.
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
   * Clears the search form and resets related states. If no values are present in the form fields,
   * a feedback message indicating there is nothing to clear will be shown. Otherwise, it prompts
   * the user for confirmation before clearing the form and resetting the search query and table data.
   *
   * @return {void} No return value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Tour', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Resets the current search query to its default state by initializing it as a new URLSearchParams instance.
   *
   * @return {void} This method does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  //==============================Filtering Items logics (Accommodations, Transfers, Activities)=======================================//
  /**
   * Initiates a search for accommodations based on the search form values.
   * Sends a query to the endpoint with the specified parameters and fetches accommodations data.
   *
   * Resets and constructs the query parameters dynamically before making the request.
   * Updates the `availableAccommodations` property with the result or logs errors upon failure.
   * Displays status images (`pending.gif`, `fulfilled.png`, `rejected.png`) to represent loading state.
   *
   * @return {void} No return value; the results are processed internally.
   */
  searchAccommodations(): void {
    this.loadingAccommDataImageURL = 'pending.gif';
    const accommodationSearchValues = this.accommodationSearchForm.getRawValue();
    const {name, location} = accommodationSearchValues;

    // Reset and build new search params
    this.accommodationSearchQuery = new URLSearchParams();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.accommodationSearchQuery.append(key, value);
      }
    };
    // Add basic search parameters
    addParam("name", name);
    addParam("location", location);

    const queryString = this.accommodationSearchQuery.toString() ? `?${this.accommodationSearchQuery.toString()}` : "";
    this.dataSubscriber$.add(
      this.dataService.getData<Accommodation>(ApiEndpoints.paths.accommodationSearch, queryString).subscribe({
        next: (accommodations) => {
          this.availableAccommodations = accommodations;
          this.loadingAccommDataImageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching accommodations:", error.message);
          this.loadingAccommDataImageURL = 'rejected.png';
        },
        complete: () => {
          console.log("Accommodations fetched successfully");
        }
      })
    )
  }

  /**
   * Searches for available transfer options based on the provided search parameters.
   * Constructs a query using the form input values for pickup location, drop location, and return status.
   * Updates the UI with the results of the search and handles success or error states.
   *
   * @return {void} Does not return a value. Updates the component's state and UI with the transfer search results.
   */
  searchTransfers(): void {

    const transferSearchValues = this.transferSearchForm.getRawValue();
    const {pickuplocation, droplocation, isreturn} = transferSearchValues;

    if (!pickuplocation || !droplocation) {
      this.operationFeedbackService.showMessage('Transfer', 'Please select both pickup and drop locations');
      return;
    }
    this.loadingTransferDataImageURL = 'pending.gif';

    // Reset and build new search params
    this.transferSearchQuery = new URLSearchParams();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.transferSearchQuery.append(key, value);
      }
    };
    // Add basic search parameters
    addParam("pickuplocation", pickuplocation);
    addParam("droplocation", droplocation);
    addParam("isreturn", isreturn);

    const queryString = this.transferSearchQuery.toString() ? `?${this.transferSearchQuery.toString()}` : "";
    this.dataSubscriber$.add(
      this.dataService.getData<TransferContract>(ApiEndpoints.paths.transferContractSearch, queryString).subscribe({
        next: (transfers) => {
          this.availableTransfers = transfers;
          this.loadingTransferDataImageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching transfers:", error.message);
          this.loadingTransferDataImageURL = 'rejected.png';
        },
        complete: () => {
          console.log("Transfers fetched successfully");
        }
      })
    )
  }

  /**
   * Initiates a search for activities based on provided criteria in the activity search form.
   * Builds query parameters dynamically and makes an API call to fetch the filtered activities.
   * Updates activity-related data and loading states based on the API response or potential errors.
   *
   * @return {void} This method does not return a value but updates the component's state
   * to reflect search results or error status.
   */
  searchActivities(): void {
    this.loadingGenericDataImageURL = 'pending.gif';
    const activitySearchValues = this.activitySearchForm.getRawValue();
    const {name, salesFrom, salesTo} = activitySearchValues;

    // Reset and build new search params
    this.activitySearchQuery = new URLSearchParams();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.activitySearchQuery.append(key, value);
      }
    };
    // Add basic search parameters
    addParam("name", name);
    addParam("salesFrom", salesFrom);
    addParam("salesTo", salesTo);

    const queryString = this.activitySearchQuery.toString() ? `?${this.activitySearchQuery.toString()}` : "";
    this.dataSubscriber$.add(
      this.dataService.getData<Generic>(ApiEndpoints.paths.genericSearch, queryString).subscribe({
        next: (generics) => {
          this.availableActivities = generics;
          this.loadingGenericDataImageURL = 'fullfilled.png';
        },
        error: (error) => {
          console.error("Error fetching generics:", error.message);
          this.loadingGenericDataImageURL = 'rejected.png';
        },
        complete: () => {
          console.log("Generics fetched successfully");
        }
      })
    )
  }

  /**
   * Clears the accommodation search by resetting the search form, clearing the available accommodations array,
   * resetting the search query parameters, and updating the loading accommodation data image URL.
   *
   * @return {void} This method does not return a value.
   */
  clearAccommodationSearch() {
    this.loadingAccommDataImageURL = 'rejected.png';
    this.accommodationSearchForm.reset();
    this.availableAccommodations = [];
    this.accommodationSearchQuery = new URLSearchParams();
  }

  /**
   * Clears the current state of the transfer search, resetting relevant properties to their initial states.
   *
   * Resets the loading transfer image URL to indicate a rejected state.
   * Clears the transfer search form.
   * Empties the list of available transfers.
   * Resets the transfer search query parameters.
   *
   * @return {void} Does not return a value.
   */
  clearTransferSearch() {
    this.loadingTransferDataImageURL = 'rejected.png';
    this.transferSearchForm.reset();
    this.availableTransfers = [];
    this.transferSearchQuery = new URLSearchParams();
  }

  /**
   * Clears the activity search state by resetting the search form,
   * clearing available activities, and resetting the search query parameters.
   *
   * @return {void} This method does not return a value.
   */
  clearActivitySearch() {
    this.loadingGenericDataImageURL = 'rejected.png';
    this.activitySearchForm.reset();
    this.availableActivities = [];
    this.activitySearchQuery = new URLSearchParams();
  }

  //================================Summary Overview=======================================//
  // Method to generate a star rating array
  /**
   * Generates an array of integers from 1 to 7.
   *
   * @param {any} starRating - An object containing a `value` property which represents a star rating. If `value` is not provided, it defaults to 0.
   * @return {number[]} An array containing numbers from 1 to 7.
   */
  getStarArray(starRating: any): number[] {
    const rating = starRating?.value || 0;
    return Array.from({length: 7}, (_, i) => i + 1);
  }

  // Method to generate summary text
  /**
   * Generates a summary text description for a given day based on its planned details.
   *
   * @param {Day} day - An object containing details about the day's planned accommodation, activities, and transfers.
   * @return {string} - A summary text describing the day's plan, including accommodations, number of activities, and transfer information,
   *                    or a default message if no details are provided.
   */
  getSummaryText(day: Day): string {
    const parts = [];

    if (day.plannedAccommodation) {
      parts.push(`${day.plannedAccommodation.accommodation.accommodationtype?.name || 'Accommodation'}`);
    }

    if (day.plannedActivities?.length) {
      parts.push(`${day.plannedActivities.length} activities`);
    }

    if (day.plannedTransfer) {
      parts.push('Transfer included');
    }

    return parts.length > 0 ? parts.join(' • ') : 'Day details to be confirmed';
  }

  /**
   * Extracts the number of stars from a given star rating object.
   *
   * @param {StarRate} starRating - The star rating object containing a name property
   * where the number of stars is represented as a number followed by a space and text.
   * @return {number} The numeric representation of the star count parsed from the star rating name.
   */
  getStarCount(starRating: StarRate): number {
    return parseInt(starRating.name.split(' ')[0], 10);
  }

  //======================================Reset And Clear Operations=========================//

  /**
   * Resets form-related properties to their initial state and reloads necessary data to ensure proper functionality.
   * Resets all counters, clears lists/maps, and enables/disables relevant buttons.
   * Also regenerates required references and reinitializes form validation.
   *
   * @return {void} This method does not return a value.
   */
  private resetAndReloadForms(): void {
    this.loadTable('');
    this.days = [];
    this.totalDays = 0;
    this.totalAccommodations = 0;
    this.totalTransfers = 0;
    this.totalActivities = 0;
    this.totalPassengers = 0;
    this.availableAccommodations = [];
    this.availableTransfers = [];
    this.availableActivities = [];
    this.occupancyCountMap = {};
    this.enableButtons(true, false, false);
    this.tourForm.reset();
    this.setLoggedInUser();
    this.generateTourContractReference();
    this.setMinDateForValidAndSale('today', 'today');
    this.formValidationService.createForm(this.tourForm);
    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  /**
   * Clears the current form inputs if there are any values present in the form fields, excluding the 'reference' field.
   * Displays a confirmation dialog before proceeding to reset and reload the forms.
   * If no values are detected in the form fields, a message is shown indicating that there is nothing to clear.
   *
   * @return {void} Indicates that the method doesn't return a value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.tourForm, ['user', 'reference']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Tour', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Tour', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) {
          return;
        }
        this.resetAndReloadForms();
      })
  }

  /**
   * Resets the stepper component and reloads its associated forms to their initial state.
   *
   * @return {void} Does not return a value.
   */
  resetStepper(): void {
    this.resetAndReloadForms();
  }

  //=================================Load Data to UI========================================//

  /**
   * Populates the form with the provided tour data and initializes required states.
   *
   * @param {Tour} tour - The tour object containing relevant data to populate the form.
   * @return {void} This method does not return any value.
   */
  fillForm(tour: Tour): void {
    this.enableButtons(false, true, true);
    this.setDisplayView("form");
    this.plannedTour = JSON.parse(JSON.stringify(tour));
    this.oldTour = JSON.parse(JSON.stringify(tour));

    this.plannedTour.user = this.activeUsers.find(user => user.id === this.plannedTour.user?.id) ?? this.plannedTour.user;
    this.plannedTour.tourtype = this.tourTypes.find(tourType => tourType.id === this.plannedTour.tourtype?.id) ?? this.plannedTour.tourtype;
    this.plannedTour.tourcategory = this.tourCategories.find(tourCategory => tourCategory.id === this.plannedTour.tourcategory?.id) ?? this.plannedTour.tourcategory;
    this.plannedTour.tourtheme = this.tourThemes.find(tourTheme => tourTheme.id === this.plannedTour.tourtheme?.id) ?? this.plannedTour.tourtheme;

    this.days = this.createDaysFromTourData(this.plannedTour.touraccommodations, this.plannedTour.tourtransfercontracts, this.plannedTour.tourgenerics);
    this.oldDays = this.days;
    // this.initializeOccupancyCountMap(this.plannedTour.touroccupancies);

    this.tourForm.patchValue(this.plannedTour);
    this.setMinDateForValidAndSale(this.plannedTour.validfrom, this.plannedTour.salesfrom)
    this.formValidationService.createForm(this.tourForm, this.oldTour, this.plannedTour);
    this.tourForm.markAsPristine();
  }

  /**
   * Creates an array of Day objects by processing data from tour accommodations, transfers, and activities.
   *
   * @param {TourAccommodation[]} tourAccommodations - Array of objects representing tour accommodations, each containing information about accommodation details for specific days.
   * @param {TourTransferContact[]} tourTransfers - Array of objects representing transfer details, including day-specific transport information.
   * @param {TourGeneric[]} tourActivities - Array of objects representing activities planned for specific days.
   * @return {Day[]} An array of Day objects containing merged and organized information for each unique day, sorted by day ID.
   */
  private createDaysFromTourData(tourAccommodations: TourAccommodation[], tourTransfers: TourTransferContact[], tourActivities: TourGeneric[]): Day[] {
    const daysMap = new Map<number, Day>();

    if (tourAccommodations) {
      tourAccommodations.forEach((tourAccomm, index) => {
        const day = tourAccomm.day;
        if (!daysMap.has(day)) {
          daysMap.set(day, {
            id: day,
            plannedAccommodation: tourAccomm,
            plannedActivities: [],
            plannedTransfer: undefined
          });
        }
        daysMap.get(day)!.plannedAccommodation = tourAccomm;
        this.totalAccommodations = index + 1;
      });
    }

    if (tourTransfers) {
      tourTransfers.forEach((tourTransfer, index) => {
        const day = tourTransfer.day;
        if (!daysMap.has(day)) {
          daysMap.set(day, {
            id: day,
            plannedAccommodation: undefined,
            plannedActivities: [],
            plannedTransfer: tourTransfer
          });
        }
        daysMap.get(day)!.plannedTransfer = tourTransfer;
        this.totalTransfers = index + 1;
      });
    }

    if (tourActivities) {
      tourActivities.forEach((tourActivity, index) => {
        const day = tourActivity.day;
        if (!daysMap.has(day)) {
          daysMap.set(day, {
            id: day,
            plannedAccommodation: undefined,
            plannedActivities: [],
            plannedTransfer: undefined
          });
        }
        daysMap.get(day)!.plannedActivities.push(tourActivity);
        this.totalActivities = index + 1;
      })
    }

    this.totalDays = daysMap.size;
    return Array.from(daysMap.values()).sort((a, b) => a.id - b.id);
  }

  //============================Get Inner Data Updates=====================================//
  /**
   * Determines if the current 'days' array has been updated compared to the 'oldDays' array.
   * Compares the length of both arrays to check for changes.
   *
   * @return {boolean} Returns true if the lengths of the 'days' and 'oldDays' arrays are not equal, indicating an update; otherwise, false.
   */
  getDaysUpdates(): boolean {
    return this.days.length !== this.oldDays.length;
  }

  /**
   * Determines whether there are updates in the accommodations of a tour by comparing
   * the current and planned accommodations.
   *
   * The method checks for changes in the size of the accommodations list, indicating
   * additions or deletions. It also verifies if any existing accommodation has been updated.
   *
   * @return {boolean} Returns true if there are updates or changes in the tour accommodations; otherwise, false.
   */
  getTourAccommodationRoomUpdates(): boolean {
    const oldAccommodationMap = new Map<number, TourAccommodation>();
    const newAccommodationMap = new Map<number, TourAccommodation>();

    // Build maps by accommodation ID
    this.oldTour.touraccommodations.forEach(tourAccomm => {
      oldAccommodationMap.set(tourAccomm.id, tourAccomm);
    });

    this.plannedTour.touraccommodations.forEach(tourAccomm => {
      newAccommodationMap.set(tourAccomm.id, tourAccomm);
    });

    // Iterate through current accommodations
    for (const [id, newAccomm] of newAccommodationMap) {
      const oldAccomm = oldAccommodationMap.get(id);

      // New accommodation – considered a change
      if (!oldAccomm) {
        return true;
      }

      const oldRooms = oldAccomm.touraccommodationrooms || [];
      const newRooms = newAccomm.touraccommodationrooms || [];

      // Compare number of rooms
      if (oldRooms.length !== newRooms.length) {
        return true;
      }

      // Map room IDs for precise comparison
      const oldRoomMap = new Map<number, any>();
      oldRooms.forEach(room => oldRoomMap.set(room.id, room));

      for (const newRoom of newRooms) {
        const oldRoom = oldRoomMap.get(newRoom.id);

        // New room added
        if (!oldRoom) {
          return true;
        }

        // Compare room properties (optional deep comparison)
        if (newRoom.roomtype !== oldRoom.roomtype) {
          return true;
        }

        // Add more fields here if needed
      }
    }

    return false;
  }


  /**
   * Determines if there are updates to the tour transfer contracts between the old tour
   * and the planned tour. Checks for differences in size (additions or deletions) and
   * detects any updates to existing contracts.
   *
   * @return {boolean} Returns true if there are updates to the tour transfer contracts,
   * otherwise returns false.
   */
  getTourTransferUpdates(): boolean {
    const oldTransferMap = new Map();
    const newTransferMap = new Map();

    this.oldTour.tourtransfercontracts.forEach(tourTransfer => {
      oldTransferMap.set(tourTransfer.id, tourTransfer);
    });

    this.plannedTour.tourtransfercontracts.forEach(tourTransfer => {
      newTransferMap.set(tourTransfer.id, tourTransfer);
    });

    // Check if sizes are different (additions or deletions)
    if (oldTransferMap.size !== newTransferMap.size) {
      return true;
    }

    // Check if any existing accommodation has been updated
    for (const [id, newAccomm] of newTransferMap) {
      const oldTransfer = oldTransferMap.get(id);

      // If accommodation doesn't exist in an old map, it's new
      if (!oldTransfer) {
        return true;
      }

    }

    return false;
  }

  /**
   * Determines if there are any updates in the planned tour's activities compared to the old tour.
   * Checks for additions, deletions, or modifications in the activities between the two tour states.
   *
   * @return {boolean} Returns true if there are any updates in the activities, otherwise false.
   */
  getTourActivityUpdates(): boolean {
    const oldActivityMap = new Map();
    const newActivityMap = new Map();

    this.oldTour.tourgenerics.forEach(tourGeneric => {
      oldActivityMap.set(tourGeneric.id, tourGeneric);
    });

    this.plannedTour.tourgenerics.forEach(tourGeneric => {
      newActivityMap.set(tourGeneric.id, tourGeneric);
    });

    // Check if sizes are different (additions or deletions)
    if (oldActivityMap.size !== newActivityMap.size) {
      return true;
    }

    // Check if any existing accommodation has been updated
    for (const [id, newAccomm] of newActivityMap) {
      const oldActivity = oldActivityMap.get(id);

      // If accommodation doesn't exist in an old map, it's new
      if (!oldActivity) {
        return true;
      }

    }

    return false;
  }


  /**
   * Aggregates updates from various inner forms within the application and returns them as a single formatted string.
   *
   * @return {string} A formatted string containing updates from days, tour accommodations, transfers, and activities.
   * The output is concatenated with line breaks to represent individual updates. If there are no updates, the string will be empty.
   */
  getInnerFormsUpdates(): string {
    let updates: string = '';
    if (this.getDaysUpdates()) updates += `<br>Days Updated`;
    if (this.getTourAccommodationRoomUpdates()) updates += `<br>Tour Accommodations Updated`;
    if (this.getTourTransferUpdates()) updates += `<br>Tour Transfers Updated`;
    if (this.getTourActivityUpdates()) updates += `<br>Tour Activities Updated`;
    // if (this.getTourPassengerUpdates()) updates += `<br>Tour Passengers Updated`;
    return updates;
  }

  //============================CRUD Operations============================================//

  /**
   * Generates a tour data object based on the values from the provided form and additional processing.
   *
   * @param {FormGroup} tourForm - The form containing user input and initial tour details.
   * @return {Tour} The generated tour object containing organized data, including accommodations, transfers, occupancies, and activities.
   */
  private generateTourData(tourForm: FormGroup): Tour {
    const formValues = tourForm.getRawValue();

    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }

    this.plannedTour = formValues;
    this.plannedTour.touraccommodations = [];
    this.plannedTour.tourtransfercontracts = [];
    // this.plannedTour.touroccupancies = [];
    this.plannedTour.tourgenerics = [];

    this.days.forEach(day => {
      if (day.plannedAccommodation) {
        this.plannedTour.touraccommodations.push(day.plannedAccommodation);
      }
      if (day.plannedTransfer) {
        this.plannedTour.tourtransfercontracts.push(day.plannedTransfer);
      }
      // if (this.tourPassengers.length > 0) {
      //   this.plannedTour.touroccupancies = this.tourPassengers;
      // }
      if (day.plannedActivities && day.plannedActivities.length > 0) {
        day.plannedActivities.forEach(activity => {
          this.plannedTour.tourgenerics.push(activity);
        });
      }
    })

    return this.plannedTour;
  }

  /**
   * Saves the tour data by validating the form, formatting the data, and making an API call.
   * Prompts the user for confirmation before proceeding with the save operation.
   * Provides feedback to the user regarding the success or failure of the operation.
   *
   * @return {void} This method does not return a value.
   */
  save(): void {

    const errors = this.formValidationService.getErrors(this.tourForm);
    if (errors) {
      this.operationFeedbackService.showErrors("Tour", "Add", errors);
      return;
    }

    const toSaveTour = this.generateTourData(this.tourForm);

    const tourData = this.operationFeedbackService.formatObjectData(toSaveTour, ["reference"]);

    this.operationFeedbackService.showConfirmation('Tour', 'Save', tourData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<Tour>(ApiEndpoints.paths.tours, toSaveTour).subscribe({
            next: (response) => {
              const {status, responseMessage} = this.operationFeedbackService.handleResponse(response);

              if (status) {
                this.resetAndReloadForms();
              }
              this.operationFeedbackService.showStatus("Tour", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Tour", "Save", responseMessage
              );
            }
          })
        }
      })
  }

  /**
   * Handles the update process for a tour. Validates form data, generates updated tour data,
   * checks user confirmation for updates, and performs the update operation by interacting
   * with the data service. Provides user feedback based on the operation's outcome.
   *
   * @return {void} This method does not return a value.
   */
  update(): void {
    const errors = this.formValidationService.getErrors(this.tourForm);
    if (errors) {
      this.operationFeedbackService.showErrors('Tour', 'Update', errors);
      return;
    }

    const toUpdateTour = this.generateTourData(this.tourForm);
    console.log(toUpdateTour);
    toUpdateTour.id = this.oldTour.id;

    let updates = '';
    updates += this.formValidationService.getUpdates(this.tourForm);
    updates += this.getInnerFormsUpdates();
    this.operationFeedbackService.showConfirmation('Tour', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.dataService.update<Tour>(ApiEndpoints.paths.tours, toUpdateTour)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Tour", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Tour", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes the planned tour after user confirmation and updates the forms and feedback based on the operation's outcome.
   * The method utilizes confirmation dialogs, API service calls, and handles both success and error scenarios.
   *
   * @return {void} No return value.
   */
  delete(): void {
    const tourData = this.operationFeedbackService.formatObjectData(this.plannedTour, ['reference']);
    this.operationFeedbackService.showConfirmation('Tour', 'Delete', tourData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;
          this.dataService.delete(ApiEndpoints.paths.tours, this.plannedTour.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadForms();
                }
                this.operationFeedbackService.showStatus("Tour", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Tour', 'Delete', responseMessage);
              }
            })
        })
      })
  }

  //===========================Select Room Type=================================================//

  /**
   * Handles the cancel action by checking if any room type has been selected and
   * providing feedback to the user if none has been selected. If a selection is made,
   * it closes all open dialogs.
   * @return {void} This method does not return any value.
   */
  onCancel(): void {
    if (this.selectedAccommodationRoomType.length <= 0) {
      this.operationFeedBackService.showMessage('Close Room Selection', 'Please select the room type');
      return;
    }
    this.dialog.closeAll();
  }

  /**
   * Handles the confirmation action for selecting accommodation room types.
   * Updates the planned accommodation rooms for the current day with the selected room types and closes all open dialogs.
   *
   * @return {void} This method does not return any value.
   */
  onConfirm(): void {
    this.selectedAccommodationRoomType = [];
    this.selectedAccommodationRoomType = this.dropAccommodationRoomTypes.filter(rt => rt.selected);

    // Initialize the array if it doesn't exist
    if (!this.days[this.currentDropDayIndex].plannedAccommodation?.touraccommodationrooms) {
      this.days[this.currentDropDayIndex].plannedAccommodation!.touraccommodationrooms = [];
    }

    const createdDayAccommodationRooms = this.days[this.currentDropDayIndex].plannedAccommodation!.touraccommodationrooms;

    this.selectedAccommodationRoomType.forEach(roomType => {
      const tourAccommodationRoom = new TourAccommodationRoom();
      tourAccommodationRoom.roomtype = roomType.name;
      createdDayAccommodationRooms.push(tourAccommodationRoom);
    });

    this.dialog.closeAll();
  }

  /**
   * Checks if any accommodation room type has been selected.
   *
   * @return {boolean} True if at least one room type is selected, otherwise false.
   */
  hasSelection(): boolean {
    return this.dropAccommodationRoomTypes.some(rt => rt.selected);
  }

  /**
   * Removes a room type from a specific day's accommodation plan.
   *
   * @param {number} dayIndex - The index of the day in the planning array (1-based index).
   * @param {number} roomIndex - The index of the room type to be removed within the day's accommodation rooms array.
   * @return {void} This method does not return a value.
   */
  removeRoomTypeFromDay(dayIndex: number, roomIndex: number): void {
    const rooms = this.days[dayIndex - 1]?.plannedAccommodation?.touraccommodationrooms;
    if (rooms && roomIndex > -1 && roomIndex < rooms.length) {
      rooms.splice(roomIndex, 1);
    }
  }


  //==============================================================================================//

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
    this.dataValidationService.cleanupSubscriptions(this.componentId);
  }

  protected readonly Math = Math;
}
