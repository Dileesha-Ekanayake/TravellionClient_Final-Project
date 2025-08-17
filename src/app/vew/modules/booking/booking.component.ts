import {
  ChangeDetectorRef,
  Component,
  computed,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatIcon, MatIconRegistry} from "@angular/material/icon";
import {MatButton, MatIconButton, MatMiniFabButton} from "@angular/material/button";
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatCheckbox} from "@angular/material/checkbox";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {RoomType} from "../../../entity/room-type";
import {DataService} from "../../../services/data.service";
import {debounceTime, distinctUntilChanged, Observable, skip, Subject, Subscription, takeUntil} from "rxjs";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {AsyncPipe, CurrencyPipe, DatePipe, KeyValuePipe, NgClass, NgTemplateOutlet} from "@angular/common";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {Accommodation} from "../../../entity/accommodation";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {AccommodationRoom} from "../../../entity/accommodation-room";
import {DomSanitizer} from "@angular/platform-browser";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {PaxType} from "../../../entity/pax-type";
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {Customer} from "../../../entity/customer";
import {Router} from "@angular/router";
import {User} from "../../../entity/user";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {Booking} from "../../../entity/booking";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {BookingStatus} from "../../../entity/booking-status";
import {BookingItemStatus} from "../../../entity/booking-item-status";
import {MatSelect} from "@angular/material/select";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {BookingAccommodation} from "../../../entity/booking-accommodation";
import {BookingAccommodationRoom} from "../../../entity/booking-accommodation-room";
import {BookingPassenger} from "../../../entity/booking-passenger";
import {ClientPaymentComponent} from "../client-payment/client-payment/client-payment.component";
import {CustomerPaymentDataShareService} from "../client-payment/customer-payment-data-share.service";
import {provideNativeDateAdapter} from "@angular/material/core";
import {BookingDataShareService} from "./booking-data-share.service";
import {CustomerPayment} from "../../../entity/customer-payment";
import {MatPaginator} from "@angular/material/paginator";
import {TransferContract} from "../../../entity/transfer-contract";
import {TransferType} from "../../../entity/transfer-type";
import {TransferRates} from "../../../entity/transfer-rates";
import {BookingTransfer} from "../../../entity/booking-transfer";
import {BookingTransferDetail} from "../../../entity/booking-transfer-detail";
import {GenericType} from "../../../entity/generic-type";
import {Generic} from "../../../entity/generic";
import {BookingGenericPax} from "../../../entity/booking-generic-pax";
import {BookingGeneric} from "../../../entity/booking-generic";
import {ResidentType} from "../../../entity/resident-type";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {Tour} from "../../../entity/tour";
import {TourType} from "../../../entity/tour-type";
import {TourTheme} from "../../../entity/tour-theme";
import {TourCategory} from "../../../entity/tour-category";
import {BookingTour} from "../../../entity/booking-tour";
import {TourOccupancy} from "../../../entity/tour-occupancy";
import {LoadingService} from "../../../util/dialog/loading/loading.service";
import {BookingViewComponent} from "./booking-view/booking-view.component";
import {StepperSelectionEvent} from "@angular/cdk/stepper";
import {AvDataTable} from "@avoraui/av-data-table";
import {AvNotificationService} from "@avoraui/av-notifications";

interface RoomGuestConfigurationItem {
  roomType: RoomType;
  roomCount?: number;
  guests: { [guestType: string]: number };
}

interface TotalRoomPriceConfiguration {
  roomType: RoomType;
  roomCount?: number;
  paxType: PaxType;
  paxCount: number;
  paxAmount: number;
}

interface RoomPriceSummary {
  roomTypeName: string;
  roomCount: number;
  pricePerRoom: number;
  totalRoomPrice: number;
  nights: number;
}

interface BookingAccommodationPriceSummary {
  grandTotal: number;
  roomSummaries: RoomPriceSummary[];
}

interface ItineraryItem {
  id: number;
  value: string;
}

interface TransferGuestConfigurationItem {
  paxType: PaxType;
  count: number;
}

interface TotalTransferPriceConfiguration {
  paxType: PaxType;
  count: number;
  paxAmount: number;
}

interface GenericGuestConfigurationItem {
  residentType: ResidentType;
  paxType: PaxType;
  count: number;
}

interface TotalGenericPriceConfiguration {
  residentType: ResidentType;
  paxType: PaxType;
  count: number;
  paxAmount: number;
}

interface TourGuestConfigurationItem {
  paxType: PaxType;
  count: number;
}

interface TotalTourPriceConfiguration {
  paxType: PaxType;
  count: number;
  paxAmount: number;
}

interface BookedRoomCount {
  roomType: string;
  count: number;
}

interface AvailableRoomCount {
  roomType: string;
  count: number;
}

@Component({
  selector: 'app-booking',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    MatIcon,
    MatCardHeader,
    MatCardTitle,
    MatButton,
    MatFormField,
    MatInput,
    MatDatepickerToggle,
    MatLabel,
    MatCheckbox,
    FormsModule,
    MatSuffix,
    ReactiveFormsModule,
    MatPrefix,
    NgClass,
    MatDateRangeInput,
    MatDateRangePicker,
    MatEndDate,
    MatStartDate,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatAccordion,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatDialogTitle,
    MatIconButton,
    MatDialogClose,
    MatDialogContent,
    MatDialogActions,
    DatePipe,
    KeyValuePipe,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatSelect,
    NgTemplateOutlet,
    ClientPaymentComponent,
    MatMiniFabButton,
    CurrencyPipe,
    MatTabGroup,
    MatTab,
    BookingViewComponent,
    AvDataTable
  ],
  templateUrl: './booking.component.html',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit, OnDestroy {

  bookedAccommodationTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Name', align: 'left'},
    {label: 'Location', align: 'left'},
    {label: 'Discount', align: 'left'},
    {label: 'Net Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  bookedAccommodationTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'accommodation.name', align: 'left', color: '#3182ce'},
    {field: 'accommodation.location', align: 'left'},
    {field: 'discountamount', align: 'left'},
    {field: 'totalamount', align: 'left'},
  ];

  bookedTransferTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Reference', align: 'left'},
    {label: 'Discount', align: 'left'},
    {label: 'Net Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  bookedTransferTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'transfercontract.reference', align: 'left', color: '#3182ce'},
    {field: 'discountamount', align: 'left'},
    {field: 'totalamount', align: 'left'},
  ];

  bookedGenericTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Reference', align: 'left'},
    {label: 'Discount', align: 'left'},
    {label: 'Net Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  bookedGenericTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'generic.reference', align: 'left', color: '#3182ce'},
    {field: 'discountamount', align: 'left'},
    {field: 'totalamount', align: 'left'},
  ];

  bookedTourTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Reference', align: 'left'},
    {label: 'Net Amount', align: 'left'},
    {label: 'Action', align: 'center'}
  ];

  bookedTourTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'tourcontract.reference', align: 'left', color: '#3182ce'},
    {field: 'totalamount', align: 'left'},
  ];

  breadcrumb: any;

  isEnableBookingAccommodationForm: boolean = false;
  isEnableBookingTransferForm: boolean = false;
  isEnableBookingGenericForm: boolean = false;
  isEnableBookingTourForm: boolean = false;

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

  bookingDate!: Date;
  bookingAccommodationItemStatus!: string;
  bookingTransferItemStatus!: string;
  bookingGenericItemStatus!: string;

  selectedBookingRow: any;

  clientLoadImageURL = '';
  accommodationLoadingImageURL: string = '';

  // Cache these values to avoid recalculating on every change detection
  private _guestEntries: { [key: string]: { type: string; count: number }[] } = {};
  private _roomPrices: { [key: string]: any } = {};
  private _totalRoomAndGuestCount: any = null;
  private _bookingItemGrossAmount: any = null;
  private _currencyCode: WritableSignal<string> = signal('');

  // Add this flag to prevent recursive updates
  private _isUpdatingConfiguration = false;

  selectedView: 'main' | 'accomm' | 'transfer' | 'generic' | 'tour' = 'main';

  passengerTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    {label: 'Code', align: 'left'},
    {label: 'Name', align: 'center'},
    {label: 'Age', align: 'center'},
    {label: 'Action', align: 'center'}
  ];

  passengerTableColumns: { field: string; align: 'left' | 'center' | 'right', color?: string }[] = [
    {field: 'code', align: 'left', color: '#3182ce'},
    {field: 'name', align: 'center'},
    {field: 'age', align: 'center'},
  ];

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;

  bookingStatuses: Array<BookingStatus> = [];
  bookingItemStatuses: Array<BookingItemStatus> = [];

  isEnableBookingView: boolean = false;
  booking!: Booking;
  oldBooking!: Booking;
  nextBookingCode: string = '';

  bookings: Array<Booking> = [];
  bookingLoadingImageURL: string = '';

  grossAmountForBooking: number = 0;
  discountAmountForBooking: number = 0;
  netAmountForBooking: number = 0;
  totalPaidForBooking: number = 0;
  balanceForBooking: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  bookingAccommodation!: BookingAccommodation;
  oldBookingAccommodation!: BookingAccommodation;

  bookingAccommodationRoom!: BookingAccommodationRoom;
  oldBookingAccommodationRoom!: BookingAccommodationRoom;

  bookingPassengers: Array<BookingPassenger> = [];
  oldBookingPassengers: Array<BookingPassenger> = [];

  bookingForm!: FormGroup;
  bookingAccommodationForm!: FormGroup;

  clients: Array<Customer> = [];
  filteredClients: Array<Customer> = [];

  selectedClient!: Customer | null;
  isProceedAsDummyClient: boolean = false;

  adults: number = 1;
  children: number = 0;
  rooms: number = 1;

  checkInDate!: string;
  checkOutDate!: string;
  totalNights: number = 0;
  accommodationDiscount: number = 0;

  //====Accommodation Amounts====//
  totalAmountForBookingAccommodationRoom: number = 0;
  totalAmountForBookingAccommodationWithoutMarkup: number = 0;

  netAmountForBookedAccommodation: number = 0;
  totalPaid: number = 0;
  balance: number = 0;

  isDisplaySelectedGuestRoomInfor: boolean = false;
  displaySelectedGuestRoomInfor!: string;

  isEnableMainView: boolean = false;

  isEnableClientSelectionView: boolean = false;

  isEnableAccommodationView: boolean = false;
  isEnableTransferView: boolean = false;
  isEnableGenericView: boolean = false;
  isEnableTourView: boolean = false;

  accommodationSearchFrom!: FormGroup;
  @ViewChild('accommodationStepper') accommodationStepper!: MatStepper;

  //============Stored created booking itinerary==============//
  bookingAccommodations: Array<BookingAccommodation> = [];
  storedBookingAccommodations: Array<BookingAccommodation> = [];
  oldBookingAccommodations: Array<BookingAccommodation> = [];
  bookingAccommodationRooms: Array<BookingAccommodationRoom> = [];

  //=========================================================//

  roomTypes: Array<RoomType> = [];
  paxTypes: Array<PaxType> = [];

  bookedRoomCounts: BookedRoomCount[] = [];
  availableRoomCounts: AvailableRoomCount[] = [];

  selectedAccommodationRoomTypes: Array<RoomType> = [];
  selectedAccommodationRoomPaxTypes: Array<PaxType> = [];
  selectedSearchRoomTypes: Array<RoomType> = [];
  accommodationSearchQuery!: URLSearchParams;
  searchedAccommodations: Array<Accommodation> = [];

  dataSubscriber$ = new Subscription();
  private destroy$ = new Subject<void>();

  currencyTypeSymbolMap: any = {
    'LKR': 'lkr',
    'USD': 'attach_money',
    'INR': 'currency_rupee',
    'EUR': 'euro'
  };

  currencyTypeMap: any = {
    'LKR': 'LKR',
    'USD': 'USD',
    'INR': 'INR',
    'EUR': 'EUR'
  }

  selectedAccommodation: Accommodation | null = null;
  selectedRoom: any;
  private dialogRef: MatDialogRef<any> | null = null;
  roomGuestConfiguration: RoomGuestConfigurationItem[] = [];
  roomPriceConfiguration: TotalRoomPriceConfiguration[] = [];

  itineraryItems: ItineraryItem[] = [
    {id: 1, value: ''}
  ];

  private nextId = 2;

  @ViewChild('configureModal') configureModal!: TemplateRef<any>;
  @ViewChild('sharedPaymentContainer') sharedPaymentContainer!: TemplateRef<any>;

  //==============Final Customer Payment==========//
  customerPayment!: CustomerPayment | null;

  //===============Last Saved Booking==============//
  lastSavedBookingCode: string = '';

  //========================================================Transfer Details Section======================================================================//

  bookingTransfer!: BookingTransfer;
  oldBookingTransfer!: BookingTransfer;

  transferSearchFrom!: FormGroup;
  @ViewChild('transferStepper') transferStepper!: MatStepper;

  bookingTransferContractForm!: FormGroup;

  transferContractLoadingImageURL: string = '';

  isDisplaySelectedTransferGuestInfor: boolean = false;
  displaySelectedTransferGuestInfor!: string;

  searchedTransfers: Array<TransferContract> = [];
  selectedTransferType!: string;
  selectedTransferVehicleType!: string;
  transferContractSearchQuery!: URLSearchParams;

  transferTypes: Array<TransferType> = [];

  selectedTransferContract: TransferContract | null = null;
  selectedTransferContractPaxTypes: Array<PaxType> = [];

  transferGuestConfiguration: TransferGuestConfigurationItem[] = [];
  transferPriceConfiguration: TotalTransferPriceConfiguration[] = [];

  bookingTransferContracts: Array<BookingTransfer> = [];
  storedBookingTransferContracts: Array<BookingTransfer> = [];
  oldBookingTransferContracts: Array<BookingTransfer> = [];
  bookingTransferDetails: Array<BookingTransferDetail> = [];

  transferDiscount: number = 0;

  totalAmountForBookingTransfer: number = 0;
  totalAmountForBookingTransferWithoutMarkup: number = 0;
  netAmountForBookedTransfer: number = 0;

  transferPickUpDate!: string;
  transferDropOffDate!: string;

  pickUpLocation: string = '';
  dropLocation: string = '';

  //========================================================Generic Details Section======================================================================//

  genericTypeIconList: any = {
    'Adventure': '🏔️',
    'Cultural': '🏛️',
    'Water Sports': '🌊',
    'Food & Dining': '🍽️',
    'Walking Tours': '🚶',
    'Entertainment': '🎭',
    'Tour Guide': '🙋🏼‍♂️',
  };

  bookingGeneric!: BookingGeneric;
  oldBookingGeneric!: BookingGeneric;

  genericSearchFrom!: FormGroup;
  @ViewChild('genericStepper') genericStepper!: MatStepper;

  bookingGenericForm!: FormGroup;

  genericLoadingImageURL: string = '';

  isDisplaySelectedGenericGuestInfor: boolean = false;
  displaySelectedGenericGuestInfor!: string;

  searchedGenerics: Array<Generic> = [];
  selectedGenericType!: string;
  genericSearchQuery!: URLSearchParams;

  genericTypes: Array<GenericType> = [];

  selectedGeneric: Generic | null = null;
  selectedGenericLocalPaxTypes: GenericGuestConfigurationItem[] = [];
  selectedGenericForeignPaxTypes: GenericGuestConfigurationItem[] = [];

  genericGuestConfiguration: GenericGuestConfigurationItem[] = [];
  genericPriceConfiguration: TotalGenericPriceConfiguration[] = [];

  bookingGenerics: Array<BookingGeneric> = [];
  storedBookingGenerics: Array<BookingGeneric> = [];
  oldBookingGenerics: Array<BookingGeneric> = [];
  bookingGenericPaxes: Array<BookingGenericPax> = [];

  genericDiscount: number = 0;

  totalAmountForBookingGeneric: number = 0;
  totalAmountForBookingGenericWithoutMarkup: number = 0;
  netAmountForBookedGeneric: number = 0;

  genericChekInDate!: string;
  genericCheckOutDate!: string;

  //========================================================Tour Details Section======================================================================//

  bookingTour!: BookingTour;
  oldBookingTour!: BookingTour;

  tourSearchFrom!: FormGroup;
  @ViewChild('tourStepper') tourStepper!: MatStepper;

  bookingTourForm!: FormGroup;

  tourLoadingImageURL: string = '';

  isDisplaySelectedTourGuestInfor: boolean = false;
  displaySelectedTourGuestInfor!: string;

  searchedTours: Array<Tour> = [];
  selectedTourType!: string;
  selectedTourTheme!: string;
  selectedTourCategory!: string;
  selectedTourPaxCount!: string;
  tourSearchQuery!: URLSearchParams;

  tourTypes: Array<TourType> = [];
  filteredTourTypes!: Observable<Array<TourType>>;
  tourThemes: Array<TourTheme> = [];
  tourCategories: Array<TourCategory> = [];

  tourCategoryIconList: any = {
    'Budget': '💸',
    'Standard': '🧳️',
    'Premium': '✈️',
    'Luxury': '🏰'
  };

  tourPaxCounts = [
    {value: '1', label: 'Single'},
    {value: '2', label: 'Double'},
    {value: '3', label: 'Triple'},
    {value: '4', label: 'Family'},
    {value: '10', label: 'Group'}
  ];

  selectedTour: Tour | null = null;

  tourGuestConfiguration: TourGuestConfigurationItem[] = [];
  selectedTourGuestConfiguration: TourGuestConfigurationItem[] = [];
  tourPriceConfiguration: TotalTourPriceConfiguration[] = [];

  bookingTours: Array<BookingTour> = [];
  storedBookingTours: Array<BookingTour> = [];
  oldBookingTours: Array<BookingTour> = [];

  tourDiscount: number = 0;

  totalAmountForBookingTour: number = 0;
  totalAmountForBookingTourWithoutMarkup: number = 0;
  netAmountForBookedTour: number = 0;

  tourChekInDate!: string;
  tourCheckOutDate!: string;

  minDepartureDate!: Date;
  minEndDate!: Date;

  isEnableBookingDataModify: boolean = false;
  extractedTotalPaidForBooking: number = 0;

  isBookingAccommodationChanged: boolean = false;
  isBookingTransferChanged: boolean = false;
  isBookingGenericChanged: boolean = false;
  isBookingTourChanged: boolean = false;

  isDisableContinuousChangeDetection: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private authService: AuthorizationManagerService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private avNotificationService: AvNotificationService,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private router: Router,
    private datePipe: DatePipe,
    private customerPaymentDataShareService: CustomerPaymentDataShareService,
    private cdr: ChangeDetectorRef,
    private bookingDataShareService: BookingDataShareService,
    private loadingService: LoadingService,
  ) {

    this.matIconRegistry.addSvgIcon(
      'lkr',
      this.domSanitizer.bypassSecurityTrustResourceUrl('rupee-svgrepo-com.svg')
    );

    this.bookingForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      grossamount: new FormControl('', Validators.required),
      discountamount: new FormControl('', Validators.required),
      netamount: new FormControl('', Validators.required),
      totalpaid: new FormControl('', Validators.required),
      balance: new FormControl('', Validators.required),
      departuredate: new FormControl('', Validators.required),
      enddate: new FormControl('', Validators.required),
      bookingstatus: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.bookingAccommodationForm = this.formBuilder.group({
      totalamount: new FormControl('', Validators.required),
      fromdatetime: new FormControl('', Validators.required),
      todatetime: new FormControl('', Validators.required),
      supplieramount: new FormControl('', Validators.required),
      bookingitemstatus: new FormControl('', Validators.required),
      discountamount: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.accommodationSearchFrom = this.formBuilder.group({
      name: new FormControl(),
      location: new FormControl(),
      checkInDate: new FormControl(),
      checkOutDate: new FormControl(),
    });

    this.transferSearchFrom = this.formBuilder.group({
      pickuplocation: new FormControl(),
      droplocation: new FormControl(),
      pickupDate: new FormControl(),
      dropDate: new FormControl(),
      guestInfor: new FormControl(),
    });

    this.bookingTransferContractForm = this.formBuilder.group({
      totalamount: new FormControl('', Validators.required),
      fromdatetime: new FormControl('', Validators.required),
      todatetime: new FormControl('', Validators.required),
      supplieramount: new FormControl('', Validators.required),
      bookingitemstatus: new FormControl('', Validators.required),
      discountamount: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.genericSearchFrom = this.formBuilder.group({
      name: new FormControl(),
      checkInDate: new FormControl(),
      checkOutDate: new FormControl(),
      guestInfor: new FormControl(),
    });

    this.bookingGenericForm = this.formBuilder.group({
      totalamount: new FormControl('', Validators.required),
      supplieramount: new FormControl('', Validators.required),
      fromdatetime: new FormControl('', Validators.required),
      todatetime: new FormControl('', Validators.required),
      bookingitemstatus: new FormControl('', Validators.required),
      discountamount: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.tourSearchFrom = this.formBuilder.group({
      name: new FormControl(),
      departureDate: new FormControl(),
      endDate: new FormControl(),
      tourtype: new FormControl(null),
      tourtheme: new FormControl(),
    }, {updateOn: 'change'})

    this.bookingTourForm = this.formBuilder.group({
      totalamount: new FormControl(),
      suppliersamount: new FormControl(),
      bookingitemstatus: new FormControl(),
    })

    this.bookingDate = new Date();
  }

  ngOnInit() {
    this.initialize();

    this.dataSubscriber$.add(
      this.customerPaymentDataShareService.triggerPaymentSaveAndCloseModel$.subscribe(() => {
        this.closePaymentDialog();
      })
    )

    this.dataSubscriber$.add(
      this.bookingDataShareService.triggerBookingView$.subscribe(() => {
        this.setDisplayView('main');
      })
    )

    this.dataSubscriber$.add(
      this.bookingDataShareService.triggerFillForm$.subscribe(() => {
        this.bookingDataShareService.bookingData$.subscribe((bookingData) => {
          if (bookingData) {
            this.booking = bookingData ? bookingData : this.booking;
            this.isEnableBookingDataModify = true;
            this.fillForm(this.booking);
          } else {
            this.isEnableBookingDataModify = false;
          }
        })
      })
    )
  }

  /**
   * Initializes the component by setting up forms, fetching required data from various services,
   * and processing the retrieved data. This method also manages active subscriptions for the data stream.
   * Each data retrieval is followed by assignment and optional filtering operations.
   *
   * @return {void} This method does not return any value.
   */
  initialize(): void {
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.bookingForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching active users : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<RoomType>(ApiEndpoints.paths.roomTypes).subscribe({
        next: (roomTypes) => {
          this.roomTypes = roomTypes;
        },
        error: (error) =>
          console.error("Error fetching room types:", error.message),
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<PaxType>(ApiEndpoints.paths.paxTypes).subscribe({
        next: (paxTypes) => {
          this.paxTypes = paxTypes;
        },
        error: (error) =>
          console.error("Error fetching pax types:", error.message),
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<BookingStatus>(ApiEndpoints.paths.bookingStatuses).subscribe({
        next: (bookingStatuses) => {
          this.bookingStatuses = bookingStatuses;
        },
        error: (error) =>
          console.error("Error fetching booking statuses:", error.message),
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<BookingItemStatus>(ApiEndpoints.paths.bookingItemStatuses).subscribe({
        next: (bookingItemStatuses) => {
          this.bookingItemStatuses = bookingItemStatuses;
        },
        error: (error) =>
          console.error("Error fetching booking item statuses:", error.message),
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TransferType>(ApiEndpoints.paths.transferTypes).subscribe({
        next: (transferTypes) => {
          this.transferTypes = transferTypes;
        },
        error: (error) => {
          console.error("Error fetching transfer types:", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<GenericType>(ApiEndpoints.paths.genericTypes).subscribe({
        next: (genericTypes) => {
          this.genericTypes = genericTypes;
        },
        error: (error) => {
          console.error("Error fetching generic types:", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourType>(ApiEndpoints.paths.tourTypes).subscribe({
        next: (tourTypes) => {
          this.tourTypes = tourTypes;
          this.filteredTourTypes = this.autoCompleteDataFilterService.filterData<TourType>(this.tourTypes, this.tourSearchFrom, 'tourtype', ['name']);
        },
        error: (error) => {
          console.error("Error fetching tour types:", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourTheme>(ApiEndpoints.paths.tourThemes).subscribe({
        next: (tourThemes) => {
          this.tourThemes = tourThemes;
        },
        error: (error) => {
          console.error("Error fetching tour themes:", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<TourCategory>(ApiEndpoints.paths.tourCategories).subscribe({
        next: (tourCategories) => {
          this.tourCategories = tourCategories;
        },
        error: (error) => {
          console.error("Error fetching tour categories:", error.message);
        }
      })
    )

    this.formValidationService.createForm(this.bookingForm, this.oldBooking, this.booking, 'booking', ['code', 'grossamount', 'netamount', 'discountamount', 'totalpaid', 'balance'], [], [['departuredate', 'yyyy-MM-dd'], ['enddate', 'yyyy-MM-dd']]);

    this.formValidationService.createForm(this.accommodationSearchFrom, null, null, '', [], [], [['checkInDate', 'yyyy-MM-dd'], ['checkOutDate', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.bookingAccommodationForm, this.oldBookingAccommodation, this.bookingAccommodation, 'booking', ['totalamount', 'supplieramount'], [], [['fromdatetime', 'yyyy-MM-dd'], ['todatetime', 'yyyy-MM-dd']]);

    this.formValidationService.createForm(this.transferSearchFrom, null, null, '', [], [], [['pickupDate', 'yyyy-MM-dd'], ['dropDate', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.bookingTransferContractForm, this.oldBookingTransfer, this.bookingTransfer, 'booking', ['totalamount', 'supplieramount'], [], [['fromdatetime', 'yyyy-MM-dd'], ['todatetime', 'yyyy-MM-dd']]);

    this.formValidationService.createForm(this.genericSearchFrom, null, null, '', [], [], [['checkInDate', 'yyyy-MM-dd'], ['checkOutDate', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.bookingGenericForm, this.oldBookingGeneric, this.bookingGeneric, 'booking', ['totalamount', 'supplieramount'], [], [['fromdatetime', 'yyyy-MM-dd'], ['todatetime', 'yyyy-MM-dd']]);

    this.formValidationService.createForm(this.tourSearchFrom, null, null, '', [], [], [['departureDate', 'yyyy-MM-dd'], ['endDate', 'yyyy-MM-dd']]);
    this.formValidationService.createForm(this.bookingTourForm, this.oldBookingTour, this.bookingTour, 'booking', ['totalamount', 'suppliersamount']);

    this.createView();
  }

  /**
   * Initializes and sets up the view by enabling or disabling buttons,
   * initializing calculation values, setting display information for various entities,
   * and configuring default settings for accommodations, transfers, and generic bookings.
   * It also synchronizes dates and locations, sets up forms with reactive value change listeners,
   * and prepares the booking configuration settings.
   *
   * @return {void} Does not return any value.
   */
  createView(): void {
    this.enableButtons(true, false, false);
    this.buttonStates();
    this.initializeCalculationValues();
    this.setDisplayView("main");
    this.setDisplaySelectedGuestRoomInfor(this.adults, this.children, this.rooms);
    this.setDisplaySelectedTransferGuestInfor(this.adults, this.children);
    this.setDisplaySelectedGenericGuestInfor(this.adults, this.children);
    this.accommodationLoadingImageURL = 'rejected.png';
    this.transferContractLoadingImageURL = 'rejected.png';
    this.genericLoadingImageURL = 'rejected.png';
    this.tourLoadingImageURL = 'rejected.png';
    this.clientLoadImageURL = 'pending.gif';
    this.bookingLoadingImageURL = 'pending.gif';
    this.getBookingCode();
    this.calculateBookingRoomDiscountAmount();
    this.calculateBookingTransferDiscountAmount();
    this.calculateBookingGenericDiscountAmount();
    this.calculateBookingTourDiscountAmount();
    this.initializeAccommodationBookingConfigurations();
    this.initializeTransferBookingConfigurations();
    this.setLoggedInUser();
    this.formatAccommodationSearchDates();
    this.formatTransferSearchDates();
    this.formatGenericSearchDates();
    this.syncFromAndToDatesWithSearchDates();
    this.syncPickupAndDropLocationsWithSearchFields();
    this.preventSetupBookingStatusWithoutPayment();
    this.setMinDateForBookingDepartureAndEnd('today');

    this.bookingAccommodationForm.controls['bookingitemstatus'].valueChanges.subscribe(bookingItemStatus => {
      if (bookingItemStatus) {
        this.bookingAccommodationItemStatus = bookingItemStatus.name;
      }
    });
    this.bookingTransferContractForm.controls['bookingitemstatus'].valueChanges.subscribe(bookingItemStatus => {
      if (bookingItemStatus) {
        this.bookingTransferItemStatus = bookingItemStatus.name;
      }
    });
    this.bookingGenericForm.controls['bookingitemstatus'].valueChanges.subscribe(bookingItemStatus => {
      if (bookingItemStatus) {
        this.bookingGenericItemStatus = bookingItemStatus.name;
      }
    });
  }

  /**
   * Sets the logged-in user by calling the authService with the provided booking form and user type.
   *
   * @return {void} This method does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.bookingForm, 'user');
  }

  /**
   * Enables or disables specific buttons based on the provided boolean parameters.
   *
   * @param {boolean} add - Determines whether the "Add" button should be enabled (true) or disabled (false).
   * @param {boolean} upd - Determines whether the "Update" button should be enabled (true) or disabled (false).
   * @param {boolean} del - Determines whether the "Delete" button should be enabled (true) or disabled (false).
   * @return {void} This method doesn't return any value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the state of the component's button authority flags based on user permissions.
   *
   * This method checks the current user's authority for specific operations (insert, update, delete)
   * on the "booking" module by utilizing the authService and updates the respective state variables.
   *
   * @return {void} Does not return any value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('booking', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('booking', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('booking', 'delete');
  }

  /**
   * Formats the check-in and check-out dates from the accommodation search form.
   * Subscribes to value changes on the check-in and check-out date fields, transforming
   * the dates into a specific format and updating related properties accordingly.
   *
   * @return {void} This method does not return a value.
   */
  formatAccommodationSearchDates(): void {
    this.accommodationSearchFrom.controls['checkInDate'].valueChanges.subscribe({
      next: (value) => {
        this.checkInDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
      }
    });
    this.accommodationSearchFrom.controls['checkOutDate'].valueChanges.subscribe({
      next: (value) => {
        this.checkOutDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
        this.calculateNights();
      }
    });
  }

  /**
   * Synchronizes the 'from' and 'to' dates in booking forms with the respective search date fields across accommodation, transfer, and generic searches.
   * Subscribes to value changes of search date fields and updates the corresponding fields in the associated booking forms.
   *
   * @return {void} This method does not return a value.
   */
  syncFromAndToDatesWithSearchDates(): void {
    this.accommodationSearchFrom.controls['checkInDate'].valueChanges.subscribe(checkInDate => {
      this.bookingAccommodationForm.controls['fromdatetime'].patchValue(checkInDate);
    });
    this.accommodationSearchFrom.controls['checkOutDate'].valueChanges.subscribe(checkOutDate => {
      this.bookingAccommodationForm.controls['todatetime'].patchValue(checkOutDate);
    });

    this.transferSearchFrom.controls['pickupDate'].valueChanges.subscribe(pickupDate => {
      this.bookingTransferContractForm.controls['fromdatetime'].patchValue(pickupDate);
    });
    this.transferSearchFrom.controls['dropDate'].valueChanges.subscribe(dropDate => {
      this.bookingTransferContractForm.controls['todatetime'].patchValue(dropDate);
    });

    this.genericSearchFrom.controls['checkInDate'].valueChanges.subscribe(checkInDate => {
      this.bookingGenericForm.controls['fromdatetime'].patchValue(checkInDate);
    });
    this.genericSearchFrom.controls['checkOutDate'].valueChanges.subscribe(checkOutDate => {
      this.bookingGenericForm.controls['todatetime'].patchValue(checkOutDate);
    });
  }

  /**
   * Synchronizes the values of the pickup and drop locations with the corresponding search fields in the form controls.
   * It listens for value changes in the search form controls for pickup and drop*/
  syncPickupAndDropLocationsWithSearchFields(): void {
    this.transferSearchFrom.controls['pickuplocation'].valueChanges.subscribe(pickupLocation => {
      this.pickUpLocation = pickupLocation || '';
    });
    this.transferSearchFrom.controls['droplocation'].valueChanges.subscribe(dropLocation => {
      this.dropLocation = dropLocation || '';
    });
  }

  /**
   * This method prevents setting a booking status if payment has not been made.
   * It listens to changes in the `bookingstatus` control of the booking form, checks the payment status, and prompts the user to complete payment if it's not done, resetting the booking status to null.
   *
   * @return {void} Does not return a value.
   */
  preventSetupBookingStatusWithoutPayment(): void {
    this.bookingForm.controls['bookingstatus'].valueChanges.subscribe(bookingStatus => {
      if (this.isEnableBookingDataModify) {
        return;
      } else {
        if (bookingStatus && !this.customerPayment) {
          this.operationFeedbackService.showMessage('Error', 'Please make the payment first');
          this.bookingForm.controls['bookingstatus'].setValue(null);
          return;
        }
      }
    })
  }

  /**
   * Formats and updates the pickup and drop-off dates for a transfer search form.
   * Subscribes to changes in the pickup and drop-off date controls, and updates
   * the corresponding variables with the formatted dates. Triggers additional logic for
   * drop-off date changes, such as recalculating the number of nights.
   *
   * @return {void} No return value.
   */
  formatTransferSearchDates(): void {
    this.transferSearchFrom.controls['pickupDate'].valueChanges.subscribe({
      next: (value) => {
        this.transferPickUpDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
      }
    });
    this.transferSearchFrom.controls['dropDate'].valueChanges.subscribe({
      next: (value) => {
        this.transferDropOffDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
        this.calculateNights();
      }
    });
  }

  /**
   * Listens to value changes on check-in and check-out date form controls, and formats these dates into a specific string format.
   * Subscribes to observe changes, updates formatted dates, and triggers calculations as needed.
   *
   * @return {void} Does not return any value.
   */
  formatGenericSearchDates(): void {
    this.genericSearchFrom.controls['checkInDate'].valueChanges.subscribe({
      next: (value) => {
        this.genericChekInDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
      }
    });
    this.genericSearchFrom.controls['checkOutDate'].valueChanges.subscribe({
      next: (value) => {
        this.genericCheckOutDate = this.datePipe.transform(value, 'MMMM dd, yyyy') || '';
        this.calculateNights();
      }
    });
  }

  /**
   * Resets all search query parameters to their default state by initializing new instances of URLSearchParams for each category.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.accommodationSearchQuery = new URLSearchParams();
    this.transferContractSearchQuery = new URLSearchParams();
    this.genericSearchQuery = new URLSearchParams();
    this.tourSearchQuery = new URLSearchParams();
  }

  /**
   * Formats and returns the display name of a given tour type.
   *
   * This function utilizes the `displayValue` method from the `autoCompleteDataFilterService`
   * to retrieve and return the display name of a tour type. The function requires
   * the input object representing the tour type data and focuses on extracting and
   * formatting the 'name' property for display purposes.
   *
   * @param {any} tourType - The input object representing a tour type. It contains the
   *                         relevant details that include the 'name' property to be formatted.
   * @returns {string} - A formatted string representing the name of the tour type suitable
   *                     for display.
   */
  displayTourTypeName = (tourType: any): string => {
    return this.autoCompleteDataFilterService.displayValue<TourType>(tourType, ['name']);
  }

  /**
   * Initializes all calculation-related values for the booking process.
   * Resets various financial and booking-related properties to their default values.
   *
   * @return {void} Does not return any value as it only initializes the class properties.
   */
  initializeCalculationValues(): void {
    this.grossAmountForBooking = 0;
    this.netAmountForBooking = 0;
    this.discountAmountForBooking = 0;
    this.totalPaidForBooking = 0;
    this.balanceForBooking = 0;
    this.accommodationDiscount = 0;

    this.totalAmountForBookingAccommodationRoom = 0;
    this.totalAmountForBookingAccommodationWithoutMarkup = 0;
    this.netAmountForBookedAccommodation = 0;
    this.totalPaid = 0;
    this.balance = 0;

    this.transferDiscount = 0;

    this.totalAmountForBookingTransfer = 0;
    this.totalAmountForBookingTransferWithoutMarkup = 0;
    this.netAmountForBookedTransfer = 0;

    this.genericDiscount = 0;

    this.totalAmountForBookingGeneric = 0;
    this.totalAmountForBookingGenericWithoutMarkup = 0;
    this.netAmountForBookedGeneric = 0;

    this.tourDiscount = 0;

    this.totalAmountForBookingTour = 0;
    this.totalAmountForBookingTourWithoutMarkup = 0;
    this.netAmountForBookedTour = 0;

    this.storedBookingAccommodations = [];
    this.storedBookingTransferContracts = [];
    this.storedBookingGenerics = [];
    this.storedBookingTours = [];
  }

  /**
   * Sets the minimum dates for booking departure and booking end.
   *
   * @param {string} [departureDate] - The departure date to set as the minimum. If not provided or set to 'today', the current date will be used.
   * @param {string} [endDate] - The ending date to set as the minimum. If not provided or set to 'today', the current date will be used.
   * @return {void} This method does not return a value.
   */
  setMinDateForBookingDepartureAndEnd(departureDate?: string, endDate?: string): void {
    const today = new Date();
    if ((!departureDate && !endDate) || departureDate === 'today') {
      this.minDepartureDate = today;
    } else {
      const validDepartureDate = departureDate ? new Date(departureDate) : null;
      this.minDepartureDate = validDepartureDate && !isNaN(validDepartureDate.getTime()) ? validDepartureDate : today;
    }

    if ((!departureDate && !endDate) || endDate === 'today') {
      this.minEndDate = today;
    } else {
      const validEndDate = endDate ? new Date(endDate) : null;
      this.minEndDate = validEndDate && !isNaN(validEndDate.getTime()) ? validEndDate : today;
    }
  }

  /**
   * Handles step change events in a stepper and enforces specific navigation rules
   * between steps, such as preventing transitions if certain conditions are met.
   *
   * @param {StepperSelectionEvent} event - The stepper change event containing the previously selected index and the currently selected index.
   * @param {MatStepper} stepper - The MatStepper instance that allows controlling the current step programmatically.
   * @return {void} This method does not return a value.
   */
  onStepChange(event: StepperSelectionEvent, stepper: MatStepper): void {
    const from = event.previouslySelectedIndex;
    const to = event.selectedIndex;

    // Prevent going to Step 5 if Step 4 has unsaved data
    if (!this.isEnableBookingDataModify &&
      (from === 3 && to === 4 &&
        (this.isEnableBookingAccommodationForm ||
          this.isEnableBookingTransferForm ||
          this.isEnableBookingGenericForm ||
          this.isEnableBookingTourForm) &&
        this.bookingAccommodationForm.get('fromdatetime')?.value ||
        this.bookingTransferContractForm.get('fromdatetime')?.value ||
        this.bookingGenericForm.get('fromdatetime')?.value ||
        this.bookingTourForm.get('bookingitemstatus')?.value)
    ) {
      // Block transition
      setTimeout(() => stepper.selectedIndex = from);
      this.avNotificationService.showWarning('Warning : Please save the selected booking before proceeding to the next step',{
        theme: "light",
      });
    }
  }

  //==============================================Supportive form Validation=========================================================//
  // To check for validation errors in your component:
  /**
   * Retrieves the total amount value from the booking accommodation form.
   *
   * @return {AbstractControl} The form control associated with the 'totalamount' field.
   */
  get totalamount() {
    return this.bookingAccommodationForm.get('totalamount');
  }

  /**
   * Retrieves the `supplieramount` form control from the `bookingAccommodationForm`.
   *
   * @return {AbstractControl} The form control associated with `supplieramount`.
   */
  get supplieramount() {
    return this.bookingAccommodationForm.get('supplieramount');
  }

  /**
   * Retrieves the discount amount field from the booking accommodation form.
   * @return {AbstractControl | null} The AbstractControl instance associated with the 'discountamount' field, or null if it does not exist.
   */
  get discountamount() {
    return this.bookingAccommodationForm.get('discountamount');
  }

  //==============================================================================================================================//

  /**
   * Retrieves and returns the display name for the provided user.
   *
   * This function extracts the user's calling name by leveraging the displayValue
   * method of the autoCompleteDataFilterService. Uses the property path
   * 'employee.callingname' to identify the relevant field in the user object.
   *
   * @param {any} user - The user object for which the display name should be determined.
   * @returns {string} The display name for the specified user.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Retrieves the next available booking code from the data service and updates the booking form with it.
   * Handles updating the form control for the booking code and logs an error message in case of a failure.
   *
   * @return {void} This method does not return a value.
   */
  getBookingCode(): void {
    this.dataSubscriber$.add(
      this.dataService.getRefNumber(ApiEndpoints.paths.bookingCode, 'bookingCode').subscribe({
        next: (data) => {
          this.nextBookingCode = data.bookingCode;
          this.bookingForm.controls['code'].setValue(this.nextBookingCode);
        },
        error: (error) => {
          console.error("Error fetching booking code:", error.message);
        }
      })
    )
  }

  /**
   * Updates the display view by enabling or disabling specific views and forms based on the provided view type.
   * Resets the stepper index to 0 for the relevant views after the view is set.
   *
   * @param {('main' | 'accomm' | 'transfer' | 'generic' | 'tour' | 'bookingDetailView')} view - The view to be displayed. Possible values are:
   *  - 'main' for the main view
   *  - 'accomm' for the accommodation view
   *  - 'transfer' for the transfer view
   *  - 'generic' for the generic view
   *  - 'tour' for the tour view
   *  - 'bookingDetailView' for the booking detail view
   * @return {void} This method does not return any value.
   */
  setDisplayView(view: 'main' | 'accomm' | 'transfer' | 'generic' | 'tour' | 'bookingDetailView'): void {
    this.isEnableMainView = view === "main";
    this.isEnableAccommodationView = view === "accomm";
    this.isEnableTransferView = view === "transfer";
    this.isEnableGenericView = view === "generic";
    this.isEnableTourView = view === "tour";
    this.isEnableBookingView = view === "bookingDetailView";
    this.isEnableBookingAccommodationForm = view === "accomm";
    this.isEnableBookingTransferForm = view === "transfer";
    this.isEnableBookingGenericForm = view === "generic"
    this.isEnableBookingTourForm = view === "tour";

    // Reset stepper index to 0 on each relevant view
    setTimeout(() => {
      if (view === 'accomm' && this.accommodationStepper) {
        this.accommodationStepper.selectedIndex = 0;
      }
      if (view === 'transfer' && this.transferStepper) {
        this.transferStepper.selectedIndex = 0;
      }
      if (view === 'generic' && this.genericStepper) {
        this.genericStepper.selectedIndex = 0;
      }
      if (view === 'tour' && this.tourStepper) {
        this.tourStepper.selectedIndex = 0;
      }
    });
  }

  /**
   * Updates the display view based on the provided view parameter. Handles different conditions
   * such as enabling or disabling specific views and initiating client data loading if necessary.
   *
   * @param {'main' | 'accomm' | 'transfer' | 'generic' | 'tour'} view - The view to set as the selected display view.
   * @return {void} Does not return any value.
   */
  selectedDisplayView(view: 'main' | 'accomm' | 'transfer' | 'generic' | 'tour'): void {

    if (this.isEnableBookingDataModify) {
      this.setDisplayView(view);
      this.isDisableContinuousChangeDetection = false;
    } else {
      this.isEnableClientSelectionView = true;
      this.loadClients();
      this.isEnableMainView = false;
      this.selectedView = view;
      this.isDisableContinuousChangeDetection = false;
    }
  }

  /**
   * Navigates back to the main view after clearing all current data, if the user confirms the action.
   * Displays a confirmation dialog before proceeding with the operation.
   *
   * @return {void} Does not return a value.
   */
  goBack(): void {
    this.operationFeedbackService.showConfirmation('Booking', 'Back to main view', 'Clearing all current data?').subscribe({
      next: (isConfirm) => {
        if (!isConfirm) return;
        this.isDisableContinuousChangeDetection = true;
        this.resetAndReloadForms();
      }
    })

  }

  /**
   * Function to filter and validate dates, allowing only today and future dates.
   *
   * The function validates a given date and ensures that it is either today
   * or a future date. Dates in the past are not allowed. If the input is null,
   * the function will return false.
   *
   * @param {Date | null} d - The date to be validated. Can be a Date object or null.
   * @returns {boolean} - Returns true if the date is either today or a future date; otherwise, false.
   */
  pastDateFilter = (d: Date | null): boolean => {
    if (!d) return false;

    // Disable past dates (only allow today and future dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    return d >= today;
  }

  //============================================Load Clients=========================================================//

  /**
   * Loads client data from the data service and populates the relevant properties with the retrieved customer list.
   * Handles success, error, and completion states during the data fetching process.
   *
   * @return {void} Does not return any value.
   */
  loadClients(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Customer>(ApiEndpoints.paths.customers).subscribe({
        next: (customers) => {
          this.clients = customers;
          this.filteredClients = [...this.clients];
        },
        error: (error) => {
          console.error("Error fetching clients:", error.message);
          this.clientLoadImageURL = 'rejected.png';
        },
        complete: () => {
          this.clientLoadImageURL = 'fullfilled.png';
        }
      })
    )
  }

  /**
   * Selects a client and manages the booking process by clearing existing passengers,
   * adding a lead passenger, and including other passengers associated with the client.
   *
   * @param {Customer} client - The client to be selected and processed for the booking.
   * @return {void}
   */
  selectClient(client: Customer) {
    this.selectedClient = client;
    this.isEnableClientSelectionView = false;
    this.setDisplayView(this.selectedView);

    if (this.selectedClient) { // need to refine this to handle manual actions too
      // Clear existing booking passengers to avoid duplicates
      this.bookingPassengers = [];

      // Add a lead passenger (the client)
      const leadPassenger = new BookingPassenger();
      leadPassenger.code = client.code;
      leadPassenger.name = client.callingname;
      leadPassenger.age = this.calculateAge(client.dobirth);
      leadPassenger.leadpassenger = true;
      this.bookingPassengers.push(leadPassenger);

      // Add other passengers
      this.selectedClient.passengers.forEach(passenger => {
        const bookingPassenger = new BookingPassenger();
        bookingPassenger.code = passenger.code;
        bookingPassenger.name = passenger.name;
        bookingPassenger.age = passenger.age;
        bookingPassenger.leadpassenger = false;
        this.bookingPassengers.push(bookingPassenger);
      });

      this.booking.bookingpassengers = [];
      this.booking.bookingpassengers = this.bookingPassengers;
    }
  }

  /**
   * Calculates the age based on the provided birth date.
   *
   * @param {Date | string} birthDate - The birth date of the individual. It can be a Date object or a string that can be parsed into a Date.
   * @return {number} The calculated age in years.
   */
  private calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Filters the list of clients based on the input value provided in the event.
   * The filtering is performed by checking if the input value exists in any of the specified client fields.
   *
   * @param {Event} event - The DOM event triggered, typically by an input field. The value of the input field is used to filter clients.
   * @return {void} - This method does not return a value; it updates the filteredClients property with the filtered client list.
   */
  filterClients(event: Event) {

    //@ts-ignore
    const input = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.callingname.toLowerCase().includes(input) ||
      client.fullname.toLowerCase().includes(input) ||
      client.code.toLowerCase().includes(input) ||
      client.customerContacts[0]?.mobile.includes(input) ||
      client.customerContacts[0]?.email.toLowerCase().includes(input) ||
      client.customerIdentities[0]?.passportNo.toLowerCase().includes(input)
    );
  }

  /**
   * Navigates the application to the client addition page.
   *
   * @return {void} Does not return a value.
   */
  addNewClient() {
    this.router.navigateByUrl('/Home/client');
  }

  /**
   * Configures the application to proceed as a dummy client by updating relevant state properties
   * and setting the display view to the currently selected view.
   *
   * @return {void} This method does not return a value.
   */
  proceedAsDummyClient(): void {
    this.isProceedAsDummyClient = true;
    this.isEnableClientSelectionView = false;
    this.setDisplayView(this.selectedView);
  }

  //=============================================MarkUp Calculation for All Booking Items==========================================//
  /**
   * Calculates and returns the room price with a fixed markup applied. This method processes accommodation rates,
   * adjusts the rates by adding the provided markup (or defaulting to 0 if markup is missing), and formats the result
   * as a string, listing the pax type and final amount for each rate.
   *
   * @param {Accommodation} accommodation - The accommodation object containing the markup value to be applied to the rates.
   * @param {AccommodationRoom} room - The accommodation room containing the rates and pax types to be processed.
   * @return {string} A formatted string representing the adjusted rates for each pax type in the room. Returns '0' if no rates are available.
   */
  calculateAndGetRoomPriceWithFixedMarkup(accommodation: Accommodation, room: AccommodationRoom): string {
    // 1. Handle edge case: no room, no rates, or empty rates array
    // The original check `!room?.accommodationrates?.length` is good and covers these.
    if (!room?.accommodationrates?.length) {
      return '0';
    }

    // 2. Get markup, defaulting to 0 if accommodation.markup is undefined/null.
    // This makes the code more robust if `markup` could be missing.
    const markup = accommodation.markup ?? 0;

    // 3. Map each rate to its string representation
    // This avoids manual looping and conditional separator logic.
    const formattedRates = room.accommodationrates.map(rate => {
      const paxTypeName = rate.paxtype.name;
      const finalAmount = (rate.amount ?? 0) + markup;

      return `${paxTypeName} : ${finalAmount}`;
    })

    // 4. Join the formatted rates with the separator
    return formattedRates.join(' | ');
  }

  /**
   * Calculates and formats the transfer price with a fixed markup for each rate provided.
   *
   * @param {TransferContract} transferContract - The transfer contract containing markup details.
   * @param {TransferRates[]} rates - An array of rates, where each rate contains price and passenger type details.
   * @return {string} A formatted string showing the passenger type and the corresponding final price with the markup applied, or a message if no rates are available.
   */
  calculateAndGetTransferPriceWithFixedMarkup(transferContract: TransferContract, rates: TransferRates[]): string {
    if (!rates || rates.length === 0) {
      return 'No rates available';
    }

    const markup = transferContract.markup ?? 0;

    return rates.map(rate => {
      const paxTypeName = rate.paxtype?.name ?? 'Unknown';
      const baseAmount = rate.amount ?? 0;
      const finalAmount = baseAmount + markup;

      return `${paxTypeName} : ${finalAmount.toFixed(2)}`; // 2 decimals
    }).join(' | ');
  }

  //============================================Accommodation View========================================================//

  /**
   * Extracts the three-letter currency code (e.g., "USD", "LKR") from a given currency name string.
   * If the currency code cannot be found, the original string is returned as a fallback.
   *
   * @param {string} currencyName - The full currency name string, typically including a currency code pattern (e.g., "Sri Lankan rupee - LKR").
   * @return {string} The extracted three-letter currency code or the original string if no code is found.
   */
  getCurrencyCode(currencyName: string): string {
    // This handles strings like "Sri Lankan rupee - LKR" and extracts "LKR"
    const matches = currencyName.match(/\s-\s([A-Z]{3})$/);
    if (matches && matches[1]) {
      return matches[1]; // Returns "LKR", "USD", etc.
    }
    return currencyName; // Fallback to the original string
  }

  /**
   * Retrieves the guest capacity details for a given room by formatting its occupancy information.
   *
   * @param {AccommodationRoom} room - The room object which contains accommodation occupancy data.
   * @return {string} A formatted string representation of the room's guest capacity, showing each guest type and its count. If no occupancy data is available, returns '0'.
   */
  getRoomGuestCapacity(room: AccommodationRoom): string {
    if (!room?.accommodationoccupanciespaxes?.length) {
      return '0';
    }

    const formattedOccupancies = room.accommodationoccupanciespaxes.map(occupancy => {
      const paxTypeName = occupancy.paxtype.name;
      const finalCount = occupancy.count ?? 0;

      return `${paxTypeName} : ${finalCount}`;
    })

    return formattedOccupancies.join(' | ');
  }

  /**
   * Updates and sets the display string for the selected guest room information.
   *
   * @param adultsCount The number of adults.
   * @param childrenCount The number of children.
   * @param roomCount The number of rooms.
   * @return {void} Does not return a value.
   */
  private setDisplaySelectedGuestRoomInfor(adultsCount: number, childrenCount: number, roomCount: number): void {
    this.displaySelectedGuestRoomInfor = adultsCount + " Adults, " + childrenCount + " Children, " + roomCount + " Rooms";
  }

  /**
   * Resets the guest room information to default values and updates the displayed information.
   *
   * @return {void} No return value.
   */
  private resetGuestRoomInfor(): void {
    this.adults = 1;
    this.children = 0;
    this.rooms = 1;
    this.setDisplaySelectedGuestRoomInfor(this.adults, this.children, this.rooms);
  }

  /**
   * Updates the display information for selected transfer guests based on the provided count of adults and children.
   *
   * @param {number} adultsCount - The number of adults included in the transfer.
   * @param {number} childrenCount - The number of children included in the transfer.
   * @return {void} This method does not return a value.
   */
  private setDisplaySelectedTransferGuestInfor(adultsCount: number, childrenCount: number): void {
    this.displaySelectedTransferGuestInfor = adultsCount + " Adults, " + childrenCount + " Children";
  }

  /**
   * Updates the display string for selected generic guest information.
   * Combines the number of adults and children into a single formatted string.
   *
   * @param {number} adultsCount - The number of adults.
   * @param {number} childrenCount - The number of children.
   * @return {void} This method does not return a value.
   */
  private setDisplaySelectedGenericGuestInfor(adultsCount: number, childrenCount: number): void {
    this.displaySelectedGenericGuestInfor = adultsCount + " Adults, " + childrenCount + " Children";
  }

  /**
   * Resets the transfer guest information to default values.
   * Sets the number of adults to 1 and the number of children to 0.
   * Updates the display of the selected transfer guest information accordingly.
   *
   * @return {void} This method does not return a value.
   */
  private resetTransferGuestInfor(): void {
    this.adults = 1;
    this.children = 0;
    this.setDisplaySelectedTransferGuestInfor(this.adults, this.children);
  }

  /**
   * Resets the guest information to default values.
   * Sets the number of adults to 1 and the number of children to 0,
   * and updates the display with the new guest information.
   *
   * @return {void} Does not return a value.
   */
  private resetGenericGuestInfor(): void {
    this.adults = 1;
    this.children = 0;
    this.setDisplaySelectedGenericGuestInfor(this.adults, this.children);
  }


  //===================================Search By Pax Box Config===============================//

  /**
   * Handles the change in the number of adults based on the specified action.
   *
   * @param {'-' | '+'} action - The action to perform. '-' decreases the number of adults (to a minimum of 1), '+' increases the number of adults.
   * @return {void} This method does not return a value.
   */
  onAdultsChange(action: '-' | '+'): void {
    action === '-' ? this.adults > 1 ? this.adults-- : 0 : this.adults++;
    this.setDisplaySelectedGuestRoomInfor(this.adults, this.children, this.rooms);
    this.setDisplaySelectedTransferGuestInfor(this.adults, this.children);
    this.setDisplaySelectedGenericGuestInfor(this.adults, this.children);
  }

  /**
   * Updates the count of children based on the action provided and refreshes display information accordingly.
   *
   * @param {'-' | '+'} action - Determines whether to decrement ('-') or increment ('+') the count of children.
   * @return {void} This method does not return a value.
   */
  onChildrenChange(action: '-' | '+'): void {
    action === '-' ? this.children > 0 ? this.children-- : 0 : this.children++;
    this.setDisplaySelectedGuestRoomInfor(this.adults, this.children, this.rooms);
    this.setDisplaySelectedTransferGuestInfor(this.adults, this.children);
    this.setDisplaySelectedGenericGuestInfor(this.adults, this.children);
  }

  /**
   * Updates the number of rooms based on the specified action and updates the display information accordingly.
   *
   * @param {'-' | '+'} action - Indicates whether to decrement ('-') or increment ('+') the number of rooms.
   * @return {void} Does not return a value.
   */
  onRoomsChange(action: '-' | '+'): void {
    action === '-' ? this.rooms > 1 ? this.rooms-- : 0 : this.rooms++;
    this.setDisplaySelectedGuestRoomInfor(this.adults, this.children, this.rooms);
  }

  /**
   * Toggles the display state of the selected guest room information.
   * Changes the value of `isDisplaySelectedGuestRoomInfor` to its opposite state.
   *
   * @return {void} No return value.
   */
  toggleDisplaySelectedGuestRoomInfor(): void {
    this.isDisplaySelectedGuestRoomInfor = !this.isDisplaySelectedGuestRoomInfor;
  }

  /**
   * Toggles the display state of the selected transfer guest information.
   * Changes the boolean value of `isDisplaySelectedTransferGuestInfor` to its opposite state.
   *
   * @return {void} Does not return a value.
   */
  toggleDisplaySelectedTransferGuestInfor(): void {
    this.isDisplaySelectedTransferGuestInfor = !this.isDisplaySelectedTransferGuestInfor;
  }

  /**
   * Toggles the visibility state of the selected generic guest information.
   * Updates the `isDisplaySelectedGenericGuestInfor` property to its opposite value.
   *
   * @return {void} Does not return any value.
   */
  toggleDisplaySelectedGenericGuestInfor(): void {
    this.isDisplaySelectedGenericGuestInfor = !this.isDisplaySelectedGenericGuestInfor;
  }


  //===================================Search By RoomType Box Config===============================//

  /**
   * Toggles the selection of a room type in the `selectedSearchRoomTypes` array.
   * If the specified room type is already selected, it removes it.
   * If the specified room type is not selected, it adds it.
   *
   * @param {RoomType} roomType - The room type to toggle in the selection.
   * @return {void} This method does not return a value.
   */
  toggleRoomTypeSelection(roomType: RoomType): void {
    const index = this.selectedSearchRoomTypes.findIndex(rt => rt.id === roomType.id);

    if (index === -1) {
      // Room type not found in a selected array, add it
      this.selectedSearchRoomTypes.push(roomType);
    } else {
      // Room type already selected, remove it
      this.selectedSearchRoomTypes.splice(index, 1);
    }
  }

  /**
   * Checks if a given room type is selected in the list of selected search room types.
   *
   * @param {RoomType} roomType - The room type to check against the selected search room types.
   * @return {boolean} Returns true if the given room type is selected, otherwise false.
   */
  isRoomTypeSelected(roomType: RoomType): boolean {
    return this.selectedSearchRoomTypes.some(rt => rt.id === roomType.id);
  }

  //==================================Accommodation Search and Reset===============================//

  /**
   * Executes a search for accommodations based on the parameters provided in the accommodation search form.
   * The method validates required fields and constructs a query string with appropriate parameters
   * before making an API call to fetch accommodation data.
   *
   * @return {void} This method does not return a value. It operates by updating internal states such as
   * the accommodation search results and the loading image URL, and handles feedback and errors as necessary.
   */
  searchAccommodation(): void {
    const accommodationSearchFormValues = this.accommodationSearchFrom.value;
    const {name, location, checkInDate, checkOutDate} = accommodationSearchFormValues;

    // Validate required fields
    if (checkInDate && !checkOutDate) {
      this.operationFeedbackService.showMessage("Error", "Please select check-in and check-out dates");
      return;
    }
    // Reset and build new search params
    this.resetSearchQuery();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.accommodationSearchQuery.append(key, value);
      }
    };
    // Add basic search parameters
    addParam("name", name);
    addParam("location", location);
    addParam("checkInDate", checkInDate);
    addParam("checkOutDate", checkOutDate);
    addParam("adultsCount", this.adults.toString());
    addParam("childrenCount", this.children > 0 ? this.children.toString() : null);
    addParam("roomsCount", this.rooms >= 1 ? this.rooms.toString() : null);

    // Handle room types more elegantly
    if (this.selectedSearchRoomTypes.length > 0) {
      const roomTypeIds = this.selectedSearchRoomTypes.map(rt => rt.id).join(',');
      addParam("roomTypes", roomTypeIds);
    }

    const queryString = this.accommodationSearchQuery.toString() ? `?${this.accommodationSearchQuery.toString()}` : "";
    this.accommodationLoadingImageURL = 'pending.gif';
    this.dataSubscriber$.add(
      this.dataService.getData<Accommodation>(ApiEndpoints.paths.accommodationSearch, queryString).subscribe({
        next: (accommodations) => {
          this.searchedAccommodations = accommodations;
        },
        error: (error) =>
          console.error("Error fetching accommodations:", error.message),
        complete: () => {
          this.accommodationLoadingImageURL = 'fullfilled.png';
        }
      })
    )
  }

  /**
   * Clears all values and resets states related to the accommodation search.
   * This method resets the search form, clears stored search results, removes selected room types,
   * resets guest and room information as well as the search query. Additionally, it updates the
   * loading image status to indicate rejection or reset.
   *
   * @return {void} Does not return a value.
   */
  clearAccommodationSearch() {
    this.accommodationSearchFrom.reset();
    this.searchedAccommodations = [];
    this.selectedSearchRoomTypes = [];
    this.resetGuestRoomInfor();
    this.resetSearchQuery();
    this.accommodationLoadingImageURL = 'rejected.png';
  }

  //======================================Initialize Accommodation Booking Configurations==========================//
  /**
   * Initializes configurations related to accommodation booking.
   * Sets up necessary properties and structures for managing bookings, accommodations,
   * room configurations, and related details.
   *
   * @return {void} No return value.
   */
  initializeAccommodationBookingConfigurations(): void {
    this.booking = new Booking();
    this.bookingAccommodation = new BookingAccommodation();
    this.bookingAccommodations = [];
    this.bookingAccommodationRooms = [];
    this.booking.bookingaccommodations = [];
    this.roomPriceConfiguration = [];
    this.roomGuestConfiguration = [];
  }

  //========================================Calculate Nights========================================//

  /**
   * Calculates the total number of nights between the check-in date and check-out date
   * provided in the accommodation search form. The total is stored in the `totalNights` property.
   * If the dates are not specified, the calculation will not be performed.
   *
   * @return {void} This method does not return a value. It updates the `totalNights` property.
   */
  calculateNights(): void {
    const startDate = new Date(this.accommodationSearchFrom.controls['checkInDate'].value);
    const endDate = new Date(this.accommodationSearchFrom.controls['checkOutDate'].value);
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      this.totalNights = Math.ceil(diff / (1000 * 3600 * 24));
    }
  }

  //==================================Set selected Accommodation====================================//

  /**
   * Updates the state with the selected accommodation and associated room types,
   * fetches booked and available room counts, and proceeds to the next step in the accommodation workflow.
   *
   * @param {Accommodation} accommodation - The accommodation object to be selected.
   * @return {void} This method does not return a value.
   */
  selectAccommodation(accommodation: Accommodation) {
    this.roomGuestConfiguration = [];
    // this.priceConfiguration = [];
    this.selectedAccommodation = accommodation;
    this.selectedAccommodationRoomTypes = accommodation.accommodationrooms.map(
      room => room.roomtype
    );

    this.fetchBookedRoomCounts(accommodation);
    this.fetchAvailableRoomCounts(accommodation);

    this.accommodationStepper.next();
  }

  /**
   * Fetches the count of booked rooms for a given accommodation by querying the relevant API endpoint.
   *
   * @param {Accommodation} accommodation The accommodation object containing information about rooms and associated details.
   * @return {void} This method performs API calls and updates the internal state with booked room counts.
   */
  fetchBookedRoomCounts(accommodation: Accommodation) {
    // Map room types to a comma-separated string
    const roomTypes = accommodation.accommodationrooms.map(room => room.roomtype.name);
    const query = new URLSearchParams();
    query.append('accommId', String(accommodation.id));
    query.append('roomTypes', roomTypes.join(','));

    const queryString = query.toString();

    this.dataSubscriber$.add(
      this.dataService.getData<any>(ApiEndpoints.paths.bookedRoomCount, queryString).subscribe({
        next: (response: any[]) => {
          this.bookedRoomCounts = response;
        },
        error: (err) => {
          console.error('Error fetching room counts:', err);
          this.bookedRoomCounts = []; // Clear array on error
        }
      })
    );
  }

  /**
   * Fetches the available room counts for a given accommodation by sending a request to the appropriate endpoint.
   *
   * @param {Accommodation} accommodation - The accommodation object containing details about the accommodation, including its id and associated room types.
   * @return {void} No return value. Updates the `availableRoomCounts` property with the fetched data or clears it in case of an error.
   */
  fetchAvailableRoomCounts(accommodation: Accommodation) {
    // Map room types to a comma-separated string
    const roomTypes = accommodation.accommodationrooms.map(room => room.roomtype.name);
    const query = new URLSearchParams();
    query.append('accommId', String(accommodation.id));
    query.append('roomTypes', roomTypes.join(','));

    const queryString = query.toString();

    this.dataSubscriber$.add(
      this.dataService.getData<any>(ApiEndpoints.paths.availableRooms, queryString).subscribe({
        next: (response: any[]) => {
          this.availableRoomCounts = response;
        },
        error: (err) => {
          console.error('Error fetching room counts:', err);
          this.availableRoomCounts = []; // Clear array on error
        }
      })
    );
  }

  /**
   * Retrieves and displays detailed information about the provided accommodation.
   *
   * @param {Accommodation} accommodation - The accommodation object containing the details to display.
   * @return {void} Does not return a value.
   */
  viewDetails(accommodation: Accommodation): void {

  }

  /**
   * Checks if a specific room type is sold out based on booked room counts and available rooms.
   *
   * @param {RoomType} roomType - The room type to check for availability.
   * @return {boolean} - Returns true if the room type is sold out, false otherwise.
   */
  checkIsRoomSoldOut(roomType: RoomType): boolean {
    return this.selectedAccommodation?.accommodationrooms.some(room => {
      const matchingRoom = this.bookedRoomCounts.find(roomCount =>
        roomCount.roomType === roomType.name
      );
      return matchingRoom ? matchingRoom.count === room.rooms || matchingRoom.count > room.rooms : false;
    }) ?? false;
  }

  /**
   * Checks if a room of the specified type is available based on the required room count,
   * total available rooms, and already booked rooms.
   *
   * @param {RoomType} roomType - The type of room to check for availability.
   * @return {boolean} - Returns true if the room is available, otherwise false.
   */
  checkIsRoomAvailable(roomType: RoomType): boolean {
    const config = this.roomGuestConfiguration.find(r => r.roomType.id === roomType.id);
    const requiredCount = config?.roomCount ?? 0;
    // console.log(requiredCount)
    const availableRoom = this.availableRoomCounts.find(rc => rc.roomType === roomType.name);
    const totalAvailableCount = availableRoom?.count ?? 0;

    const bookedRoom = this.bookedRoomCounts.find(rc => rc.roomType === roomType.name);
    const alreadyBookedCount = bookedRoom?.count ?? 0;
    const remainingCount = totalAvailableCount - alreadyBookedCount;
    // console.log(availableCount)
    return requiredCount >= remainingCount;
  }


  //====================================Room Configuration==========================================//

  /**
   * Opens a modal dialog for configuring the selected room.
   *
   * @param {RoomType} roomType - The type of room to be configured.
   * @return {void} This method does not return a value.
   */
  openConfigureModal(roomType: RoomType): void {
    this.selectedRoom = roomType;
    this.getSelectedRoomPax(roomType);
    this.dialogRef = this.dialog.open(this.configureModal, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: false,
      panelClass: 'room-configure-dialog'
    });
  }

  /**
   * Retrieves the maximum number of passengers allowed for a given room type and passenger type.
   *
   * @param {RoomType} roomType - The type of room for which the maximum passenger count is to be determined.
   * @param {PaxType} paxType - The type of passenger for which the count is to be determined.
   * @return {number} The maximum number of passengers allowed for the specified room type and passenger type.
   */
  getMaxPaxCountForRoomType(roomType: RoomType, paxType: PaxType): number {
    const accommodationRoom = this.selectedAccommodation?.accommodationrooms.find(
      room => room.roomtype.id === roomType.id
    );

    if (accommodationRoom) {
      const occupancy = accommodationRoom.accommodationoccupanciespaxes.find(
        occupancyPax => occupancyPax.paxtype.id === paxType.id
      );

      return occupancy?.count || 0;
    }

    return 0;
  }

  /**
   * Saves the current configuration by performing necessary operations
   * such as closing any open modal dialogs or persisting data.
   *
   * @return {void} This method does not return a value.
   */
  saveConfiguration(): void {
    this.closeModal();
  }

  /**
   * Closes the currently opened modal dialog, if any.
   * Clears the reference to the dialog and resets selected room data.
   *
   * @return {void} No return value.
   */
  private closeModal(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
    this.selectedRoom = null;
  }

  /**
   * Filters accommodation rooms based on the provided room type and collects the pax types
   * associated with the matched rooms' accommodation occupancies.
   *
   * @param {RoomType} roomType - The room type to filter the selected accommodation's rooms.
   * @return {void} This method does not return a value, but updates `selectedAccommodationRoomPaxTypes` with the result.
   */
  getSelectedRoomPax(roomType: RoomType): void {
    if (!this.selectedAccommodation) return;

    this.selectedAccommodationRoomPaxTypes = this.selectedAccommodation.accommodationrooms
      .filter(room => room.roomtype.id === roomType.id) // match roomType
      .flatMap(room => room.accommodationoccupanciespaxes.map(
        occupancy => occupancy.paxtype
      ));
  }

  //=======================================Guest Count Config====================================//

  /**
   * Increments the number of guests of a specified type in the given room. This method updates
   * the room's guest configuration and recalculates pricing as necessary. Ensures that guest count
   * does not exceed the allowable maximum for the room type.
   *
   * @param {RoomType} room - The room to which the guest count should be incremented.
   * @param {PaxType} guestType - The type of guest to be added (e.g., adult, child).
   * @return {void} This method does not return a value.
   */
  incrementGuest(room: RoomType, guestType: PaxType): void {
    if (this._isUpdatingConfiguration) {
      // console.log('Already updating configuration, skipping...');
      return;
    }

    this._isUpdatingConfiguration = true;
    // console.log('=== INCREMENT GUEST START ===');

    try {
      let roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
      if (!roomConfig) {
        roomConfig = {
          roomType: room,
          guests: {},
          roomCount: 1
        };
        this.roomGuestConfiguration.push(roomConfig);
      }

      const maxPax = this.getMaxPaxCountForRoomType(room, guestType);
      const currentCount = roomConfig.guests[guestType.name] || 0;
      const roomCount = roomConfig.roomCount || 1;

      // console.log('maxPax:', maxPax, 'currentCount:', currentCount, 'roomCount:', roomCount);

      if ((maxPax * roomCount) <= currentCount) {
        this.operationFeedbackService.showMessage("Error", "Maximum pax count for this room type is " + maxPax);
        return;
      }

      roomConfig.guests[guestType.name] = currentCount + 1;

      // Clear cache when configuration changes
      this.clearCalculationCache();

      // Use setTimeout to prevent blocking and allow change detection to complete
      setTimeout(() => {
        try {
          this.getPriceForRoomByPaxTypePerNight(room, guestType);
        } catch (error) {
          console.error('Error in getPriceForRoomByPaxTypePerNight:', error);
        }
      }, 0);

    } catch (error) {
      console.error('Error in incrementGuest:', error);
    } finally {
      // Reset a flag after a short delay
      setTimeout(() => {
        this._isUpdatingConfiguration = false;
      }, 100);
    }

    // console.log('=== INCREMENT GUEST END ===');
  }

  // Clear cache when configuration changes
  /**
   * Clears the cached calculation data including guest entries, room prices,
   * total room and guest count, booking item gross amount, and resets the currency code.
   *
   * @return {void} This method does not return a value.
   */
  private clearCalculationCache(): void {
    this._guestEntries = {};
    this._roomPrices = {};
    this._totalRoomAndGuestCount = null;
    this._bookingItemGrossAmount = null;
    this._currencyCode.set('');
  }

  // Cache guest entries to avoid recalculation
  /**
   * Retrieves and caches guest entries based on the provided guests and room index.
   * The method uses a cache key to store and retrieve previously computed entries.
   *
   * @param {any} guests - The guest data used to compute entries.
   * @param {number} roomIndex - The index of the room for which entries are being retrieved.
   * @return {Array<{type: string, count: number}>} - An array of guest entry objects containing type and count properties.
   */
  getGuestEntriesCached(guests: any, roomIndex: number): { type: string; count: number }[] {
    const cacheKey = `${roomIndex}_${JSON.stringify(guests)}`;
    if (!this._guestEntries[cacheKey]) {
      this._guestEntries[cacheKey] = this.getGuestEntries(guests);
    }
    return this._guestEntries[cacheKey];
  }

  // Cache room prices to avoid recalculation
  /**
   * Retrieves the cached price for a room based on room type and guest type.
   * If the price is not already cached, it calculates and stores it in the cache.
   *
   * @param {RoomType} roomType - The type of the room for which the price is requested.
   * @param {string} guestType - The type of guest for which the price is requested.
   * @return {any} The cached room price for the given room type and guest type.
   */
  getRoomPriceCached(roomType: RoomType, guestType: string): any {
    const cacheKey = `${roomType.id}_${guestType}`;
    if (!this._roomPrices[cacheKey]) {
      this._roomPrices[cacheKey] = this.getRoomPrice(roomType, guestType);
    }
    return this._roomPrices[cacheKey];
  }

  // Cache total calculations
  /**
   * Retrieves the cached total count of rooms and guests. If the value is not already cached,
   * it calculates the total by invoking the `getTotalRoomAndGuestCount` method and stores it in the cache.
   *
   * @return {any} The cached total count of rooms and guests.
   */
  get totalRoomAndGuestCountCached(): any {
    if (!this._totalRoomAndGuestCount) {
      this._totalRoomAndGuestCount = this.getTotalRoomAndGuestCount();
    }
    return this._totalRoomAndGuestCount;
  } //⭐

  // Cache booking amount calculations
  /**
   * Retrieves the cached gross amount for a booking item. If the value is not already cached,
   * it calculates the gross amount using the `calculateBookingAccommodationGrossAmount` method
   * and updates the cache before returning the result.
   *
   * @return {any} The gross amount for the booking item, either retrieved from cache or computed if not already cached.
   */
  get bookingItemGrossAmountCached(): any {
    // if (!this._bookingItemGrossAmount) {
    this._bookingItemGrossAmount = this.calculateBookingAccommodationGrossAmount();
    // }
    return this._bookingItemGrossAmount;
  } //⭐

  // Cache currency code
  /**
   * Retrieves a cached currency code for the currently selected entity.
   * The currency code is determined based on the selected accommodation, transfer contract, or generic entity.
   * If the currency code is not already cached, it will compute and cache the value.
   *
   * @return {string} The cached or newly computed currency code.
   */
  get currencyCodeCached(): string {
    if (!this._currencyCode() && (this.selectedAccommodation?.currency?.name || this.selectedTransferContract?.currency?.name || this.selectedGeneric?.currency?.name)) {
      const currencyName = this.selectedAccommodation?.currency?.name
        ?? this.selectedTransferContract?.currency?.name
        ?? this.selectedGeneric?.currency?.name;
      const currencyCode = this.getCurrencyCode(currencyName || "");
      this._currencyCode.set(currencyCode);
    }
    return this._currencyCode();
  }

  /**
   * A computed property that determines the currency code based on the selected entity.
   * It prioritizes the `currency.name` value from `selectedAccommodation`, `selectedTransferContract`,
   * or `selectedGeneric` in that order. If a matching `currency.name` is found, it is passed into
   * the `getCurrencyCode` method to retrieve the corresponding currency code. Otherwise, it defaults
   * to an empty string.
   *
   * @type {ComputedRef<string>} A reactive string representing the computed currency code.
   */
  currencyCodeComputed = computed(() => {
    const currencyName = this.selectedAccommodation?.currency?.name
      ?? this.selectedTransferContract?.currency?.name
      ?? this.selectedGeneric?.currency?.name;

    return currencyName ? this.getCurrencyCode(currencyName) : '';
  });


  /**
   * A tracking function used for identifying and differentiating room configurations
   * in lists or arrays, typically in Angular's *ngFor directive.
   *
   * @param {number} index - The index of the current item in the array.
   * @param {any} item - The current item in the array containing room configuration data.
   * @return {any} The unique identifier for the room configuration, extracted from the item's roomType property.
   */
  trackByRoomConfiguration(index: number, item: any): any {
    return item.roomType.id;
  }

  /**
   * Tracks items in a collection by their guest type.
   *
   * @param {number} index The index of the current item in the collection.
   * @param {any} item The current item being processed in the collection.
   * @return {any} The type property of the provided item.
   */
  trackByGuestType(index: number, item: any): any {
    return item.type;
  }

  /**
   * Tracks a unique identifier for items based on their price details.
   *
   * @param {number} index - The index of the item in the collection.
   * @param {any} item - The item containing price details, including room type name, room count, and nights.
   * @return {any} A unique identifier string derived from the item's room type name, room count, and nights.
   */
  trackByPriceDetails(index: number, item: any): any {
    return `${item.roomTypeName}_${item.roomCount}_${item.nights}`;
  }

  /**
   * Function used to track items in a list by their guest count. Typically used in Angular's trackBy mechanism to optimize rendering by identifying list changes.
   *
   * @param {number} index - The current index of the item in the list.
   * @param {any} item - The current item in the list.
   * @return {any} Returns a unique identifier for the item, typically its 'key' property.
   */
  trackByGuestCount(index: number, item: any): any {
    return item.key;
  }

  /**
   * Decreases the count of a specific guest type in a room if the current count is greater than zero.
   * Updates the price for the room based on the modified guest configuration.
   *
   * @param {RoomType} room - The room object for which the guest count is decremented.
   * @param {PaxType} guestType - The type of the guest that needs to be decremented.
   * @return {void} This method does not return any value.
   */
  decrementGuest(room: RoomType, guestType: PaxType): void {
    const roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
    if (roomConfig && roomConfig.guests[guestType.name] > 0) {
      roomConfig.guests[guestType.name]--;
      this.getPriceForRoomByPaxTypePerNight(room, guestType);
    }
  }

  /**
   * Retrieves the count of allowed guests of a specific type for a given room.
   *
   * @param {RoomType} room - The room for which the guest count is being retrieved.
   * @param {PaxType} guestType - The type of guest (e.g., adult, child) to get the count for.
   * @return {number} The number of guests of the specified type allowed in the room. Returns 0 if no configuration is found.
   */
  getGuestCount(room: RoomType, guestType: PaxType): number {
    const roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
    return roomConfig?.guests[guestType.name] || 0;
  }

  /**
   * Processes a guest list and returns an array of entries with guest types and their respective counts,
   * filtered to include only those with a count greater than zero.
   *
   * @param {Object} guests - An object where keys represent guest types and values represent respective counts.
   * @return {Array} An array of objects, each containing the type of guest and its count,
   * filtered to include only those with a count greater than zero.
   */
  getGuestEntries(guests: { [key: string]: number }): Array<{ type: string, count: number }> {
    return Object.entries(guests)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({type, count}));
  }

  //======================================Room Count Config=======================================//

  /**
   * Increments the count of the specified room type in the room guest configuration.
   * If the room type does not exist in the configuration, it adds a new entry for that room type with a count of 1.
   *
   * @param {RoomType} room - The room type object for which the count needs to be incremented.
   * @return {void} Does not return any value.
   */
  incrementRoomCount(room: RoomType): void {
    let roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
    if (!roomConfig) {
      roomConfig = {
        roomType: room,
        roomCount: 1,
        guests: {}
      };
      this.roomGuestConfiguration.push(roomConfig);
    } else {
      roomConfig.roomCount = (roomConfig.roomCount || 0) + 1;
    }
    this.getPriceForRoomByPaxTypePerNight(room);
  }

  /**
   * Decreases the count of the specified room type. If the count reaches zero, it is set to zero.
   * Resets guest configuration for the room and recalculates the price for the room type.
   *
   * @param {RoomType} room The room type for which the count should be decremented.
   * @return {void} Does not return a value.
   */
  decrementRoomCount(room: RoomType) {
    const roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
    if (roomConfig && roomConfig.roomType) {
      roomConfig.roomCount ? roomConfig.roomCount-- : roomConfig.roomCount = 0;
      roomConfig.guests = {};
      this.getPriceForRoomByPaxTypePerNight(room);
    }

  }

  /**
   * Retrieves the count of rooms for a given room type.
   *
   * @param {RoomType} room - The room type for which the count is to be retrieved.
   * @return {number} The number of rooms available for the specified room type. Returns 0 if the room type does not exist or is not found.
   */
  getRoomCount(room: RoomType): number {
    if (room) {
      const roomConfig = this.roomGuestConfiguration.find(r => r.roomType.id === room.id);
      return roomConfig?.roomCount || 0;
    }
    return 0;
  }

  /**
   * Calculates the total number of rooms and guests based on the room and guest configuration.
   *
   * @return An object containing the total room count (`roomCount`) and a mapping of guest types to their respective total counts (`guestCounts`).
   */
  getTotalRoomAndGuestCount(): { roomCount: number; guestCounts: { [key in string]?: number } } {
    const totals: {
      roomCount: number;
      guestCounts: { [key in string]?: number };
    } = {
      roomCount: 0,
      guestCounts: {}
    };

    this.roomGuestConfiguration.forEach(config => {
      totals.roomCount += config.roomCount || 0;

      for (const [guestType, count] of Object.entries(config.guests)) {
        const type = guestType as string;
        totals.guestCounts[type] = (totals.guestCounts[type] || 0) + count;
      }
    });
    return totals;
  }

  /**
   * Removes a room from the configuration, including guest and price configurations,
   * and updates the room price summary data.
   *
   * @param {number} $index - The index of the room to be removed from the guest configuration list.
   * @param {RoomType} room - The room object to be removed, containing the details of the specific room type.
   * @return {void} Does not return a value.
   */
  removeRoomFromConfiguration($index: number, room: RoomType): void {
    this.roomGuestConfiguration.splice($index, 1);
    const config = this.roomPriceConfiguration.find(config => config.roomType.id === room.id);
    if (config) {
      this.roomPriceConfiguration.splice(this.roomPriceConfiguration.indexOf(config), 1);
    }

    const roomPriceSummary = this.calculateBookingAccommodationGrossAmount();
    const priceSummary = roomPriceSummary.roomSummaries.find(summary => summary.roomTypeName.toLowerCase() === room.name);
    if (priceSummary) {
      roomPriceSummary.roomSummaries.splice(roomPriceSummary.roomSummaries.indexOf(priceSummary), 1);
    }
    this.cdr.detectChanges();
  }

  //===========================⭐Get Room Price by Room and Pax Type with Markup⭐==============================//

  /**
   * Retrieves the price and currency of a specific room and passenger type.
   *
   * @param {RoomType} room - The room type for which the price needs to be fetched.
   * @param {string} paxType - The passenger type (e.g., adult, child) for pricing lookup.
   * @return {{currencyType: string, price: string}} An object containing the currency type and the calculated price.
   */
  getRoomPrice(room: RoomType, paxType: string): { currencyType: string; price: string } {
    let currencyType = 'LKR';
    let price = '';

    const accommodation = this.selectedAccommodation;

    if (!accommodation) {
      return {currencyType, price: '0.00'};
    }

    currencyType = this.getCurrencyCode(accommodation.currency?.name);

    for (const accommodationRoom of accommodation.accommodationrooms) {
      if (accommodationRoom.roomtype.id === room.id) {
        for (const accommodationRate of accommodationRoom.accommodationrates) {
          if (accommodationRate.paxtype?.name === paxType) {
            if (this.selectedAccommodation?.markup) {
              price = (accommodationRate.amount + this.selectedAccommodation?.markup).toFixed(2);
            } else {
              price = accommodationRate.amount.toFixed(2);
            }
            return {currencyType, price};
          }
        }
      }
    }

    return {currencyType, price: '0.00'};
  }

  /**
   * Calculates and updates price configurations for a room type based on the number of guests
   * and their respective types (Pax Type) per night.
   *
   * @param {RoomType} roomType - The type of the room for which the price is calculated.
   * @param {PaxType} [guesType] - The type of guest (optional) to specifically calculate the price for.
   *                               If not provided, prices are calculated for all guest types in the configuration.
   *
   * @return {void} This method does not return anything as it updates the price configuration directly.
   */
  getPriceForRoomByPaxTypePerNight(roomType: RoomType, guesType?: PaxType): void {

    this.roomGuestConfiguration.forEach(config => {
      if (config.roomType.id === roomType.id) {
        const roomCount = config.roomCount || 0;

        if (guesType?.name && config.guests[guesType.name]) {
          // Handle specific guest type
          const guestCount = config.guests[guesType.name];
          const pricePerGuest = Number.parseFloat(
            this.getRoomPrice(roomType, guesType.name).price
          );
          const paxAmount = pricePerGuest * guestCount;
          // Store/update price configuration for this specific paxType
          this.updatePriceConfiguration(roomType, roomCount, guesType, guestCount, paxAmount);

        } else {
          // Handle all guest types in the configuration
          Object.entries(config.guests).forEach(([guestTypeName, guestCount]) => {
            const pricePerGuest = Number.parseFloat(
              this.getRoomPrice(roomType, guestTypeName).price
            );

            const paxAmount = pricePerGuest * guestCount;
            // Find the PaxType object for this guest type name
            const paxType = this.paxTypes.find(paxType => paxType.name === guestTypeName);

            if (paxType) {
              // Store/update price configuration for each paxType
              this.updatePriceConfiguration(roomType, roomCount, paxType, guestCount, paxAmount);
            }
          });
        }
      }
    });
  }

  /**
   * Updates the price configuration for a specific room and passenger type.
   *
   * @param {RoomType} roomType - The type of the room to be updated.
   * @param {number} roomCount - The number of rooms for the given room type.
   * @param {PaxType} paxType - The type of passenger associated with the configuration.
   * @param {number} paxCount - The number of passengers for the given passenger type.
   * @param {number} paxAmount - The price or amount associated with the given passenger type.
   * @return {void} Does not return a value.
   */
  private updatePriceConfiguration(roomType: RoomType, roomCount: number, paxType: PaxType, paxCount: number, paxAmount: number): void {
    let priceConfiguration = this.roomPriceConfiguration.find(
      p => p.roomType.id === roomType.id && p.paxType.id === paxType.id
    );

    if (!priceConfiguration) {
      priceConfiguration = {
        roomType: roomType,
        roomCount: roomCount,
        paxType: paxType,
        paxCount: paxCount,
        paxAmount: paxAmount
      };
      this.roomPriceConfiguration.push(priceConfiguration);
    } else {
      priceConfiguration.roomType = roomType;
      priceConfiguration.roomCount = roomCount;
      priceConfiguration.paxType = paxType;
      priceConfiguration.paxCount = paxCount;
      priceConfiguration.paxAmount = paxAmount;
    }
  }

  //==========================⭐Calculate Booked Rooms Final Total⭐===========================//

  // Hear Calculated Booked Accommodation Rooms Prices and Trigger formControl Update
  /**
   * Calculates the gross amount for booking accommodations, including details of individual room summaries and the total grand amount.
   *
   * This method processes the room guest configuration, groups configurations by room type, calculates room summaries,
   * and determines the grand total pricing for the booking accommodation. It also updates necessary internal controls and states.
   *
   * @return {BookingAccommodationPriceSummary} An object containing the grand total amount for the booking accommodation
   *                                            and an array of summaries for individual rooms.
   */
  calculateBookingAccommodationGrossAmount(): BookingAccommodationPriceSummary {
    if (this.roomGuestConfiguration.length === 0) {
      this.roomPriceConfiguration = [];
      this.roomGuestConfiguration = [];
      return {
        grandTotal: 0,
        roomSummaries: []
      };
    }

    const roomTypeGroups = this.groupConfigurationsByRoomType();
    const roomSummaries = this.calculateRoomSummaries(roomTypeGroups);
    const bookingRoomGrandTotal = this.calculateBookingRoomGrandTotal(roomSummaries);

    this.updateBookingAccommodationAmounts(bookingRoomGrandTotal);
    this.updateFormControls();
    // roomTypeGroups.forEach((configs, roomType) => {
    //   console.log(`Room Type: ${roomType}`, configs);
    // });
    return {
      grandTotal: this.netAmountForBookedAccommodation,
      roomSummaries
    };
  }

  // Group each configuration by room type
  /**
   * Groups room price configurations by their associated room type.
   * Iterates through the roomPriceConfiguration list and organizes configurations
   * into a map where the keys are room type names and the values are arrays of configurations
   * for each room type.
   *
   * @return {Map<string, TotalRoomPriceConfiguration[]>} A map with room type names as keys and arrays of TotalRoomPriceConfiguration objects as values.
   */
  private groupConfigurationsByRoomType(): Map<string, TotalRoomPriceConfiguration[]> {
    const roomTypeGroups = new Map<string, TotalRoomPriceConfiguration[]>();

    this.roomPriceConfiguration.forEach(config => {
      const roomTypeName = config.roomType.name;
      if (!roomTypeGroups.has(roomTypeName)) {
        roomTypeGroups.set(roomTypeName, []);
      }
      roomTypeGroups.get(roomTypeName)!.push(config);
    });

    return roomTypeGroups;
  }

  // Hear Calculated and store Final Rooms Tpes, Rooms count, Pricer per room,
  // total price for room count with night count, nigh count
  /**
   * Calculates summaries for each room type, including total prices, price per room, and number of nights.
   *
   * @param {Map<string, TotalRoomPriceConfiguration[]>} roomTypeGroups - A map where the key is the room type name, and the value is a list of room price configurations for that type.
   * @return {RoomPriceSummary[]} An array containing the summary for each room type, including room count, price per room, total room price, and number of nights.
   */
  private calculateRoomSummaries(roomTypeGroups: Map<string, TotalRoomPriceConfiguration[]>): RoomPriceSummary[] {
    const roomSummaries: RoomPriceSummary[] = [];

    roomTypeGroups.forEach((configs, roomTypeName) => {
      // Sum up room counts from all configurations for this room type
      const roomCount = configs[0]?.roomCount || 1;
      const totalRoomTypePrice = this.calculateRoomTypePrice(configs, roomCount);
      const pricePerRoom = roomCount > 0 ? totalRoomTypePrice / roomCount : 0;
      const nights = Math.max(this.totalNights, 0);
      if (this.selectedAccommodation) {
        this.totalAmountForBookingAccommodationWithoutMarkup = 0;
        const totalRoomTypePriceWithoutMarkup = this.calculateRoomTypePriceWithoutMarkup(configs, roomCount, this.selectedAccommodation);
        this.totalAmountForBookingAccommodationWithoutMarkup = totalRoomTypePriceWithoutMarkup * nights;
      }

      roomSummaries.push({
        roomTypeName,
        roomCount,
        pricePerRoom,
        totalRoomPrice: totalRoomTypePrice * nights,
        nights
      });
    });

    return roomSummaries;
  }

  // Hear Calculated Price per Room by Room type
  /**
   * Calculates the total price for a specific room type based on its configuration and the number of rooms.
   *
   * @param {TotalRoomPriceConfiguration[]} configs - An array of room price configurations, each containing details like paxAmount.
   * @param {number} roomCount - The number of rooms to calculate the price for.
   * @return {number} The total calculated price for the given room type and room count.
   */
  private calculateRoomTypePrice(configs: TotalRoomPriceConfiguration[], roomCount: number): number {
    const basePricePerRoom = configs.reduce((sum, config) => sum + config.paxAmount, 0);
    return basePricePerRoom * roomCount;
  }

  // Hear Calculated Total Rooms Prices
  /**
   * Calculates the grand total price for booking rooms by summing up the total room prices from the provided room summaries.
   *
   * @param {RoomPriceSummary[]} roomSummaries - An array of room price summary objects, each containing the total room price for a specific room.
   * @return {number} The total price for all rooms combined.
   */
  private calculateBookingRoomGrandTotal(roomSummaries: RoomPriceSummary[]): number {
    return roomSummaries.reduce((total, summary) => total + summary.totalRoomPrice, 0);
  }

  //⭐ Find Again Room Prices without markup
  /**
   * Finds the base room rate without markup for a specific room type and passenger type in the given accommodation.
   *
   * @param {Accommodation} selectedAccommodation - The accommodation object containing room and rate details.
   * @param {number} roomTypeId - The ID of the room type to search for.
   * @param {number} paxTypeId - The ID of the passenger type to search for.
   * @return {number} The base room rate amount, or 0 if no matching rate is found.
   */
  private findBaseRoomRateWithoutMarkup(selectedAccommodation: Accommodation, roomTypeId: number, paxTypeId: number): number {
    for (const room of selectedAccommodation.accommodationrooms) {
      if (room.roomtype.id === roomTypeId) {
        const rate = room.accommodationrates.find(r =>
          r.paxtype.id === paxTypeId
        );
        if (rate) {
          return rate.amount ?? 0;
        }
      }
    }
    return 0; // fallback if no match found
  }

  //⭐ Recalculate Total Room Price Without Markup
  /**
   * Calculates the total price for a room type without applying any markup.
   *
   * @param {TotalRoomPriceConfiguration[]} configs - Array of configurations with room and pax information.
   * @param {number} roomCount - The number of rooms to calculate the price for.
   * @param {Accommodation} selectedAccommodation - The selected accommodation details.
   * @return {number} The total price for the specified room type without markup.
   */
  private calculateRoomTypePriceWithoutMarkup(configs: TotalRoomPriceConfiguration[], roomCount: number, selectedAccommodation: Accommodation): number {
    let total = 0;

    for (const config of configs) {
      const baseAmount = this.findBaseRoomRateWithoutMarkup(
        selectedAccommodation,
        config.roomType.id,
        config.paxType.id
      );
      total += baseAmount * config.paxCount;
    }

    return total * roomCount;
  }

  //⭐ Hear Calculated Booked Accommodation Rooms Net Price⭐//
  /**
   * Updates the amounts related to booking accommodation, including the total grand total, the net amount considering discounts,
   * and the total amount without markup.
   *
   * @param {number} grandTotal - The grand total amount for the booking accommodation, including all fees and charges.
   * @return {void} This method does not return a value.
   */
  private updateBookingAccommodationAmounts(grandTotal: number): void {
    this.totalAmountForBookingAccommodationRoom = grandTotal;
    this.netAmountForBookedAccommodation = this.accommodationDiscount > 0
      ? grandTotal - this.accommodationDiscount
      : grandTotal;
    this.totalAmountForBookingAccommodationWithoutMarkup = this.accommodationDiscount > 0
      ? this.totalAmountForBookingAccommodationWithoutMarkup - this.accommodationDiscount
      : this.totalAmountForBookingAccommodationWithoutMarkup;
    // console.log("Total amount booking accommodation without markup : " + this.totalAmountForBookingAccommodationWithoutMarkup);
  }


  //==========================Calculate Booking Room Discount Amount===========================//


  /**
   * Handles and calculates the discount amount for a booking room by listening to the changes
   * in the discount amount control of the booking accommodation form. This also ensures
   * that the discount is properly applied and updates related values such as total amounts
   * and flags. It includes debounced change detection and skips the initial control value.
   *
   * @return {void} Does not return anything. The method updates internal component state
   * and form values as a result of the discount amount changes.
   */
  calculateBookingRoomDiscountAmount(): void {
    this.bookingAccommodationForm.controls['discountamount'].valueChanges
      .pipe(
        skip(1), // Skip the first emission (initialization)
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if the value actually changed
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (discountAmount) => {
          if (!this.checkDiscountCanBeApplied(discountAmount, 5000, this.bookingAccommodationForm, 'totalamount')) {
            return;
          } else {
            // Subtract old discount from the total
            this.discountAmountForBooking -= this.accommodationDiscount;
            // Set new discount
            this.accommodationDiscount = discountAmount || 0;
            this.discountAmountForBooking += Number(this.accommodationDiscount);
            this.isDisableContinuousChangeDetection = true;
          }
        }
      });
  }

  //=========================Add Booking Accommodation as Bookied Item=========================//

  /**
   * Adds a booked accommodation to the current booking. This method performs form validation,
   * populates booking accommodation details, and updates the relevant arrays and state properties.
   * It also calculates the total booking amount and resets the form for further use.
   *
   * @return {void} Does not return any value.
   */
  addBookedAccommodationToBooking(): void {

    const errors = this.formValidationService.getErrors(this.bookingAccommodationForm, ['discountamount']);

    if (errors) {
      this.operationFeedbackService.showErrors("Accommodation", "Booking", errors);
      return;
    }
    this.isEnableBookingAccommodationForm = false;
    let bookingAccommodation = new BookingAccommodation();
    const bookingAccommodationValues = this.bookingAccommodationForm.getRawValue();

    if (this.selectedAccommodation) {
      bookingAccommodation = bookingAccommodationValues;
      bookingAccommodation.accommodation = this.selectedAccommodation;
    }

    // Create a new array for each accommodation
    const bookingAccommodationRooms: BookingAccommodationRoom[] = [];

    this.roomPriceConfiguration.forEach(config => {
      const bookingAccommodationRoom = new BookingAccommodationRoom();
      bookingAccommodationRoom.roomtype = config.roomType.name;
      bookingAccommodationRoom.paxtype = config.paxType.name;
      bookingAccommodationRoom.count = config.paxCount;
      bookingAccommodationRoom.amount = config.paxAmount;
      bookingAccommodationRooms.push(bookingAccommodationRoom); // Use a local array
    });

    bookingAccommodation.bookingaccommodationrooms = bookingAccommodationRooms;
    // this.booking.bookingaccommodations.push(bookingAccommodation);
    this.bookingAccommodations.push(bookingAccommodation);
    this.storedBookingAccommodations = [...this.bookingAccommodations];
    // console.log(this.bookingAccommodations);
    this.isBookingAccommodationChanged = true;
    // Clear the component's room array for next use
    this.bookingAccommodationRooms = [];

    this.destroy$.next();
    this.destroy$.complete();
    // Immediately calculate booking payments
    this.calculateTotalBookingAmount();
    this.updateFormControls();
    // console.log(this.roomGuestConfiguration);
    // console.log(this.roomPriceConfiguration);
    this.resetAndClearAccommodationBooking();
  }

  //======================================Reset Booking=========================================//

  /**
   * Resets and clears all data related to accommodation booking.
   * This method includes resetting forms, clearing data, and removing selected accommodation.
   *
   * @return {void} Does not return any value.
   */
  resetAndClearAccommodationBooking(): void {
    this.clearAllAccommodationConfigurations();
    this.accommodationSearchFrom.reset();
    this.bookingAccommodationForm.reset();
    this.bookingAccommodationForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedAccommodation = null;
    this.clearAccommodationSearch();
  }

  /**
   * Clears all accommodation-related configurations and resets the corresponding values to their initial state.
   * This includes clearing room and price configurations, and resetting totals and discounts related to accommodations.
   *
   * @return {void} No value is returned as this method only performs the reset operation.
   */
  clearAllAccommodationConfigurations(): void {
    this.totalAmountForBookingAccommodationRoom = 0;
    this.totalNights = 0;
    this.accommodationDiscount = 0;
    this.netAmountForBookedAccommodation = 0;
    this.totalAmountForBookingAccommodationWithoutMarkup = 0;
    this.roomGuestConfiguration = [];
    this.roomPriceConfiguration = [];
  }

  //=====================================================================================================================================//
  //================================================🚗🚗🚗Transfer Section🚗🚗🚗=======================================================//

  //=======================================================Display Template Values=================================================//
  /**
   * Tracks an item in a transfer guest configuration list by its `paxType.id`.
   *
   * @param {number} index - The index of the current item in the array.
   * @param {any} item - The item being tracked, expected to have a `paxType` property with an `id`.
   * @return {any} The `id` of the item's `paxType`, used for tracking purposes.
   */
  trackByTransferGuestConfiguration(index: number, item: any): any {
    return item.paxType.id;
  }

  /**
   * Removes a guest configuration from the specified index in the transferGuestConfiguration array.
   * Updates the amount for the transfer passenger type after removal.
   *
   * @param {number} $index - The index of the guest configuration to be removed.
   * @return {void} This method does not return a value.
   */
  removeGuestFromConfiguration($index: number): void {
    this.transferGuestConfiguration.splice($index, 1);
    this.updateAmountForTransferPaxType();
  }

  /**
   * Sets the selected transfer type.
   *
   * @param {string} transferType - The transfer type to be set.
   * @return {void} This method does not return a value.
   */
  setSelectTransferType(transferType: string): void {
    this.selectedTransferType = transferType;
  }

  /**
   * Sets the selected vehicle type for transfer.
   *
   * @param {string} vehicleType - The type of vehicle to set as selected.
   * @return {void} Does not return a value.
   */
  setSelectVehicleType(vehicleType: string): void {
    this.selectedTransferVehicleType = vehicleType;
  }

  /**
   * Initiates a search for transfer contracts based on user-provided input values such as pickup location, drop-off location, pickup date, and drop date.
   * Ensures all required fields are validated before performing the search. Upon successful retrieval, it populates the list of searched transfer contracts.
   *
   * @return {void} This method does not return a value but updates the component state with the retrieved transfer contracts.
   */
  searchTransferContract(): void {
    const transferContractSearchFormValues = this.transferSearchFrom.value;
    const {pickuplocation, droplocation, pickupDate, dropDate} = transferContractSearchFormValues;

    // Validate required fields
    if (pickuplocation === null || droplocation === null || !pickupDate || !dropDate) {
      this.operationFeedbackService.showMessage("Error", "Please select pickup and drop-off locations and dates");
      return;
    }
    // Reset and build new search params
    this.resetSearchQuery();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.transferContractSearchQuery.append(key, value);
      }
    };

    let isreturn = this.selectedTransferType === 'Return';

    // Add basic search parameters
    addParam("pickuplocation", pickuplocation);
    addParam("droplocation", droplocation);
    addParam("pickupDate", pickupDate);
    addParam("dropDate", dropDate);
    addParam("isreturn", isreturn);
    addParam("transfertype", this.selectedTransferVehicleType);

    const queryString = this.transferContractSearchQuery.toString() ? `?${this.transferContractSearchQuery.toString()}` : "";
    this.transferContractLoadingImageURL = 'pending.gif';
    this.dataSubscriber$.add(
      this.dataService.getData<TransferContract>(ApiEndpoints.paths.transferContractSearch, queryString).subscribe({
        next: (transferContracts) => {
          this.searchedTransfers = transferContracts;
        },
        error: (error) =>
          console.error("Error fetching accommodations:", error.message),
        complete: () => {
          this.transferContractLoadingImageURL = 'fullfilled.png';
        }
      })
    )
  }

  /**
   * Resets the state of the transfer contract search form, clears input fields,
   * resets search results and selections, and sets default values for related properties.
   *
   * @return {void} This method does not return any value.
   */
  clearTransferContractSearch() {
    this.transferSearchFrom.get('pickuplocation')?.reset();
    this.transferSearchFrom.get('droplocation')?.reset();
    this.transferSearchFrom.get('pickupDate')?.reset();
    this.transferSearchFrom.get('dropDate')?.reset();
    this.searchedTransfers = [];
    this.setSelectTransferType('');
    this.setSelectVehicleType('');
    this.resetTransferGuestInfor();
    this.resetSearchQuery();
    this.transferContractLoadingImageURL = 'rejected.png';
  }

  /**
   * Selects a transfer contract and updates the related configurations and state.
   *
   * @param {TransferContract} transferContract - The transfer contract to be selected, which includes transfer rates and related details.
   * @return {void} Does not return a value.
   */
  selectTransferContract(transferContract: TransferContract) {
    this.transferGuestConfiguration = [];
    this.transferPriceConfiguration = [];
    this.selectedTransferContract = transferContract;
    this.selectedTransferContractPaxTypes = transferContract.transferrates.map(
      transferRate => transferRate.paxtype
    );

    this.transferStepper.next();
  }

  /**
   * Retrieves and displays the details of a given transfer contract.
   *
   * @param {TransferContract} transferContract - The transfer contract for which the details need to be viewed.
   * @return {void} This method does not return a value.
   */
  viewTransferContractDetails(transferContract: TransferContract) {

  }

  //=========================================Configure Transfer Passengers================================================//
  // Get count for a specific pax type
  /**
   * Calculates and returns the count of passengers of the specified type for transfer.
   *
   * @param {PaxType} paxType - The type of passenger whose count is to be retrieved.
   * @return {number} The count of passengers for the specified type. Returns 0 if no match is found.
   */
  getTransferPaxCount(paxType: PaxType): number {
    const item = this.transferGuestConfiguration.find(item => item.paxType.id === paxType.id);
    return item ? (item.count || 0) : 0;
  }

  // Increment count for a pax type
  /**
   * Increments the count of a specified passenger type in the transfer guest configuration.
   * If the passenger type is not found in the configuration, it adds a new entry for it.
   *
   * @param {PaxType} paxType - The passenger type for which the count is to be incremented.
   * @return {void} No return value.
   */
  incrementTransferPaxCount(paxType: PaxType): void {
    const existingItem = this.transferGuestConfiguration.find(item => item.paxType.id === paxType.id);

    if (existingItem) {
      existingItem.count = (existingItem.count || 0) + 1;
    } else {
      this.transferGuestConfiguration.push({
        paxType: paxType,
        count: 1
      });
    }
    this.updateAmountForTransferPaxType();
    // console.log('Updated guest configuration:', this.transferGuestConfiguration);
    // console.log('Updated price configuration:', this.transferPriceConfiguration);
  }

  // Decrement count for a pax type
  /**
   * Decrements the count of the specified passenger type in the transfer guest configuration.
   * If the count reaches zero, the passenger type is removed from the configuration.
   * Triggers an update of the calculated amount for the transfer passenger type.
   *
   * @param {PaxType} paxType The passenger type whose count is to be decremented.
   * @return {void}
   */
  decrementTransferPaxCount(paxType: PaxType): void {
    const existingItem = this.transferGuestConfiguration.find(item => item.paxType.id === paxType.id);

    if (existingItem && existingItem.count && existingItem.count > 0) {
      existingItem.count -= 1;

      // Remove item if count reaches 0
      if (existingItem.count === 0) {
        this.transferGuestConfiguration = this.transferGuestConfiguration.filter(
          item => item.paxType.id !== paxType.id
        );
      }
    }

    this.updateAmountForTransferPaxType();
    // console.log('Updated guest configuration:', this.transferGuestConfiguration);
    // console.log('Updated price configuration:', this.transferPriceConfiguration);
  }

  //====⭐Always recalculate PaxType, PaxCount, And PaxAmount with fixed markup price⭐====//
  /**
   * Updates the total amounts for each transfer passenger type based on the selected transfer contract and guest configuration.
   * Calculates the price for each pax type considering applicable rates and markups.
   * Updates the transfer price configuration, total amount for booking transfers without markup,
   * and triggers form control updates.
   * Logs a warning if a corresponding transfer rate is not found for a pax type.
   *
   * @return {void} This method does not return a value.
   */
  private updateAmountForTransferPaxType(): void {
    // Clear existing price configuration
    this.transferPriceConfiguration = [];

    // Only process if we have a selected transfer contract
    if (!this.selectedTransferContract?.transferrates) {
      return;
    }

    // Iterate through guest configuration to calculate amounts
    this.transferGuestConfiguration.forEach(guestConfig => {
      if (guestConfig.count && guestConfig.count > 0) {
        // Find the corresponding transfer rate for this pax type
        const transferRate = this.selectedTransferContract?.transferrates.find(
          rate => rate.paxtype.id === guestConfig.paxType.id
        );

        if (transferRate) {
          // Calculate the total amount for this pax type with fixed markup
          const totalAmount = (transferRate.amount + (this.selectedTransferContract?.markup || 0)) * guestConfig.count;

          // Add to price configuration
          this.transferPriceConfiguration.push({
            paxType: guestConfig.paxType,
            count: guestConfig.count,
            paxAmount: totalAmount
          });

          if (this.selectedTransferContract) {
            this.totalAmountForBookingTransferWithoutMarkup = 0;
            this.totalAmountForBookingTransferWithoutMarkup = this.calculateTransferPaxPriceWithoutMarkup(this.transferPriceConfiguration, this.selectedTransferContract);
            // console.log("Total amount booking transfer without markup : " + this.totalAmountForBookingTransferWithoutMarkup);
          }
          this.updateBookingTransferAmounts(this.getTotalTransferPaxAmount());
          this.updateFormControls();

        } else {
          console.warn(`No transfer rate found for pax type: ${guestConfig.paxType.name}`);
        }
      }
    });
  }

  //⭐ Find Again Pax Prices without markup
  /**
   * Finds the base transfer passenger rate without markup for a given passenger type ID.
   *
   * @param {TransferContract} selectedTransfer - The selected transfer object containing transfer rates.
   * @param {number} paxTypeId - The ID of the passenger type to search for.
   * @return {number} The base transfer rate amount for the specified passenger type. Returns 0 if not found.
   */
  private findBaseTransferPaxRateWithoutMarkup(selectedTransfer: TransferContract, paxTypeId: number): number {
    for (const rate of selectedTransfer.transferrates) {
      if (rate.paxtype.id === paxTypeId) {
        return rate.amount
      }
    }
    return 0;
  }

  //⭐ Recalculate Total Room Price Without Markup
  /**
   * Calculates the total transfer passenger price without applying any markup.
   *
   * @param {TotalTransferPriceConfiguration[]} configs - Array of configuration objects specifying passenger types and their counts.
   * @param {TransferContract} selectedTransfer - The selected transfer contract containing pricing details.
   * @return {number} The total price for the transfer passengers without markup.
   */
  private calculateTransferPaxPriceWithoutMarkup(configs: TotalTransferPriceConfiguration[], selectedTransfer: TransferContract): number {
    let total = 0;

    for (const config of configs) {
      const baseAmount = this.findBaseTransferPaxRateWithoutMarkup(
        selectedTransfer,
        config.paxType.id
      );
      total += baseAmount * config.count;
    }

    return total;
  }

  //  to get rate for a specific pax type
  /**
   * Retrieves the transfer rate for the specified passenger type.
   *
   * @param {PaxType} paxType - The passenger type for which to retrieve the transfer rate.
   * @return {TransferRates | undefined} The transfer rate matching the provided passenger type, or undefined if no match is found.
   */
  private getTransferRateForPaxType(paxType: PaxType): TransferRates | undefined {
    return this.selectedTransferContract?.transferrates.find(
      rate => rate.paxtype.id === paxType.id
    );
  }

  // Get total amount for all pax types
  /**
   * Calculates the total passenger amount by summing up the paxAmount of all items in transferPriceConfiguration.
   *
   * @return {number} The total passenger amount.
   */
  getTotalTransferPaxAmount(): number {
    return this.transferPriceConfiguration.reduce(
      (total, config) => total + config.paxAmount, 0
    );
  }

  // Get a total count of all pax types
  /**
   * Calculates the total count of transfer passengers based on the transfer guest configuration.
   *
   * This method iterates through the `transferGuestConfiguration` array and sums up the `count` values
   * for all items, defaulting to 0 if the count is undefined.
   *
   * @return {number} The total number of transfer passengers.
   */
  getTotalTransferPaxCount(): number {
    return this.transferGuestConfiguration.reduce((total, item) => total + (item.count || 0), 0);
  }

  // Get amount for a specific pax type
  /**
   * Retrieves the transfer amount for a specific passenger type.
   *
   * @param {PaxType} paxType - The passenger type for which the transfer amount is being fetched.
   * @return {number} The transfer amount corresponding to the given passenger type, or 0 if no configuration is found.
   */
  getTransferAmountForPaxType(paxType: PaxType): number {
    const config = this.transferPriceConfiguration.find(
      config => config.paxType.id === paxType.id
    );
    return config ? config.paxAmount : 0;
  }

  // Get rate per person for a specific pax type
  /**
   * Calculates and returns the transfer rate for a specific passenger type.
   *
   * @param {PaxType} paxType - The type of passenger for which the transfer rate is being calculated.
   * @return {number} The transfer rate for the provided passenger type. Returns 0 if no specific rate is found.
   */
  getTransferRatePerPerson(paxType: PaxType): number {
    const transferRate = this.getTransferRateForPaxType(paxType);
    return transferRate ? transferRate.amount : 0;
  }

  /**
   * Resets and clears all transfer booking configurations and forms.
   *
   * This method performs the following:
   * - Clears all transfer configurations.
   * - Resets the transfer search form.
   * - Resets the booking transfer contract form and clears specific fields such as total amount and supplier amount.
   * - Sets the selected transfer contract to null.
   * - Clears the booking transfer details array.
   * - Clears the transfer contract search.
   *
   * @return {void} No return value.
   */
  resetAndClearTransferBooking(): void {
    this.clearAllTransferConfigurations();
    this.transferSearchFrom.reset();
    this.bookingTransferContractForm.reset();
    this.bookingTransferContractForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedTransferContract = null;
    this.bookingTransferDetails = [];

    this.clearTransferContractSearch();
  }

  // Clear all configurations
  /**
   * Resets all transfer-related configurations and recalculates the transfer metrics for a booking.
   *
   * @return {void} Does not return a value.
   */
  clearAllTransferConfigurations(): void {
    this.transferDiscount = 0;
    this.totalAmountForBookingTransfer = 0;
    this.totalAmountForBookingTransferWithoutMarkup = 0;
    this.netAmountForBookedTransfer = 0;
    this.transferGuestConfiguration = [];
    this.transferPriceConfiguration = [];
  }

  // Initialize with default values
  /**
   * Initializes and sets up the configurations required for transfer bookings.
   * It resets and prepares various properties such as transfer contracts, passengers, generics,
   * transfer details, guest configurations, and price configurations. Additionally, it updates
   * the amount for different passenger types.
   *
   * @return {void} Does not return a value.
   */
  initializeTransferBookingConfigurations(): void {
    this.bookingTransferContracts = [];
    this.bookingPassengers = [];
    this.bookingGenerics = [];

    this.bookingTransferDetails = [];
    this.transferGuestConfiguration = [];
    this.transferPriceConfiguration = [];
    this.updateAmountForTransferPaxType();
  }

  //  Validate configurations
  /**
   * Validates the configurations by checking if the required configuration arrays are not empty.
   *
   * @return {boolean} Returns true if both transferGuestConfiguration and transferPriceConfiguration arrays have elements; otherwise, false.
   */
  validateConfigurations(): boolean {
    return this.transferGuestConfiguration.length > 0 &&
      this.transferPriceConfiguration.length > 0;
  }


  //==========================Calculate Booking Transfer Discount Amount===========================//

  /**
   * Calculates and applies the discount amount for booking transfers based on user input.
   * This method listens for changes in the discount amount in the booking transfer form, validates the input,
   * calculates the appropriate discount based on rate type (percentage or amount), updates related totals,
   * and applies the discount to the booking transfer.
   *
   * The method handles scenarios where:
   * - No discount is provided by resetting the discount values.
   * - The discount is validated against specific criteria.
   * - The discount is calculated appropriately based on the rate type.
   *
   * @return {void} Does not return a value. Performs updates to the booking transfer amounts and form controls.
   */
  calculateBookingTransferDiscountAmount(): void {
    this.bookingTransferContractForm.controls['discountamount'].valueChanges
      .pipe(
        skip(1), // Skip the first emission (initialization)
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if value actually changed
        takeUntil(this.destroy$)
      ).subscribe({
      next: (discount) => {
        if (!discount || !discount.ratetype || discount.amount == null) {
          this.discountAmountForBooking -= this.transferDiscount;
          this.transferDiscount = 0;
          this.updateAmountForTransferPaxType();
          this.updateBookingTransferAmounts(this.getTotalTransferPaxAmount());
          this.updateFormControls();
          return;
        }

        if (!this.checkDiscountCanBeApplied(discount.amount, 2000, this.bookingTransferContractForm, 'totalamount')) {
          return;
        } else {

          this.discountAmountForBooking -= this.transferDiscount;
          const totalTransferAmount = this.getTotalTransferPaxAmount();

          if (discount.ratetype.name === 'Percentage') {
            this.transferDiscount = (totalTransferAmount * discount.amount) / 100;
          } else if (discount.ratetype.name === 'Amount') {
            this.transferDiscount = discount.amount;
          } else {
            this.transferDiscount = 0;
          }
          this.isDisableContinuousChangeDetection = true;
          this.discountAmountForBooking += Number(this.transferDiscount);
          this.updateBookingTransferAmounts(totalTransferAmount);
          this.updateFormControls();
        }
      }
    });
  }

  /**
   * Updates the booking transfer amounts, including total, net, and amounts without markup.
   *
   * @param {number} grandTotal - The grand total amount for the booking transfer.
   * @return {void}
   */
  private updateBookingTransferAmounts(grandTotal: number): void {
    this.totalAmountForBookingTransfer = grandTotal;
    this.netAmountForBookedTransfer = grandTotal - this.transferDiscount;

    if (this.selectedTransferContract) {
      const baseAmountWithoutMarkup = this.calculateTransferPaxPriceWithoutMarkup(
        this.transferPriceConfiguration,
        this.selectedTransferContract
      );
      this.totalAmountForBookingTransferWithoutMarkup = baseAmountWithoutMarkup - this.transferDiscount;
    }

    // console.log("Total amount booking transfer without markup : " + this.totalAmountForBookingTransferWithoutMarkup);
  }

  //=========================Add Booking Transfer as Bookied Item=========================//

  /**
   * Adds the current transfer contract and its associated details to the booking process.
   * Validates the booking transfer contract form before proceeding, updates the booking transfer contracts array,
   * and recalculates the total booking amount. Prepares the system for further use by resetting and cleaning up data.
   *
   * @return {void} Does not return a value.
   */
  addBookedTransferContractToBooking(): void {

    const errors = this.formValidationService.getErrors(this.bookingTransferContractForm, ['discountamount']);

    if (errors) {
      this.operationFeedbackService.showErrors("Transfer", "Booking", errors);
      return;
    }
    this.isEnableBookingTransferForm = false;
    let bookingTransferContract = new BookingTransfer();
    const bookingAccommodationValues = this.bookingTransferContractForm.getRawValue();

    if (this.selectedTransferContract) {
      delete bookingAccommodationValues.discountamount;
      bookingTransferContract = bookingAccommodationValues;
      bookingTransferContract.discountamount = this.transferDiscount;
      bookingTransferContract.transfercontract = this.selectedTransferContract;
    }

    // Create a new array for each accommodation
    const bookingTransferDetails: BookingTransferDetail[] = [];

    this.transferPriceConfiguration.forEach(config => {
      const bookingTransferDetail = new BookingTransferDetail();
      bookingTransferDetail.paxtype = config.paxType.name;
      bookingTransferDetail.paxcount = config.count;
      bookingTransferDetail.totalamount = config.paxAmount;
      bookingTransferDetail.pickuplocation = this.pickUpLocation;
      bookingTransferDetail.droplocation = this.dropLocation;
      bookingTransferDetails.push(bookingTransferDetail);
    });

    bookingTransferContract.bookingtransferdetails = bookingTransferDetails;
    this.bookingTransferContracts.push(bookingTransferContract);
    this.storedBookingTransferContracts = [...this.bookingTransferContracts];
    this.isBookingTransferChanged = true;
    // Clear the component's room array for next use
    this.bookingTransferDetails = [];

    this.destroy$.next();
    this.destroy$.complete();
    // Immediately calculate booking payments
    this.calculateTotalBookingAmount();
    this.updateFormControls();
    this.resetTransferContractBooking();
  }

  /**
   * Resets the transfer contract booking data to its default state.
   * Clears and resets all related configurations, forms, and selected data.
   *
   * @return {void} This method does not return a value.
   */
  resetTransferContractBooking(): void {
    this.transferDiscount = 0; //⭐⭐⭐
    this.transferGuestConfiguration = [];
    this.transferPriceConfiguration = [];
    this.transferSearchFrom.reset();
    this.bookingTransferContractForm.reset();
    this.bookingTransferContractForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedTransferContract = null;
    this.clearTransferContractSearch();
  }

  //=====================================🧭🧭🧭🧭Generic Section🧭🧭🧭🧭=======================================================//

  //=======================================================Display Template Values=================================================//

  /**
   * Tracks the unique identifier for a generic guest configuration by their `paxType.id`.
   *
   * @param {number} index - The index of the current item in the list.
   * @param {any} item - The item representing a guest configuration.
   * @return {any} The unique ID associated with the `paxType` of the item.
   */
  trackByGenericGuestConfiguration(index: number, item: any): any {
    return item.paxType.id;
  }

  /**
   * Removes a guest from the generic configuration at the specified index and updates the amount for the generic passenger type accordingly.
   *
   * @param {number} $index - The index of the guest to be removed from the generic configuration.
   * @return {void} This method does not return a value.
   */
  removeGuestFromGenericConfiguration($index: number): void {
    this.genericGuestConfiguration.splice($index, 1);
    this.updateAmountForGenericPaxType();
  }

  /**
   * Sets the selected generic type to the specified value.
   *
   * @param {string} genericType - The generic type to set as the selected one.
   * @return {void} This method does not return a value.
   */
  setSelectGenericType(genericType: string): void {
    this.selectedGenericType = genericType;
  }

  /**
   * Executes a generic search operation by gathering values from the form, validating necessary fields,
   * constructing a search query string, and making an API call to fetch the results.
   *
   * The method ensures the required `checkInDate` and `checkOutDate` are provided before proceeding.
   * Additional search parameters such as `name` and `generictype` are appended if available.
   * Performs the API call to retrieve matching generics, handles errors appropriately,
   * and updates the UI with a loading image and received data.
   *
   * @return {void} No return value.
   */
  searchGeneric(): void {
    const genericSearchFormValues = this.genericSearchFrom.value;
    const {name, checkInDate, checkOutDate} = genericSearchFormValues;

    // Validate required fields
    if (!checkInDate || !checkOutDate) {
      this.operationFeedbackService.showMessage("Error", "Please select check-in and check-out dates");
      return;
    }
    // Reset and build new search params
    this.resetSearchQuery();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.genericSearchQuery.append(key, value);
      }
    };

    // Add basic search parameters
    addParam("name", name);
    addParam("salesfrom", checkInDate);
    addParam("salesto", checkOutDate);
    addParam("generictype", this.selectedGenericType);

    const queryString = this.genericSearchQuery.toString() ? `?${this.genericSearchQuery.toString()}` : "";
    this.genericLoadingImageURL = 'pending.gif';
    this.dataSubscriber$.add(
      this.dataService.getData<Generic>(ApiEndpoints.paths.genericSearch, queryString).subscribe({
        next: (generics) => {
          this.searchedGenerics = generics;
        },
        error: (error) =>
          console.error("Error fetching generics:", error.message),
        complete: () => {
          this.genericLoadingImageURL = 'fullfilled.png';
        }
      })
    )
  }

  /**
   * Resets the generic search form and related fields to their default states.
   *
   * @return {void} This method does not return a value.
   */
  clearGenericSearch() {
    this.genericSearchFrom.get('checkInDate')?.reset();
    this.genericSearchFrom.get('checkOutDate')?.reset();
    this.genericSearchFrom.get('name')?.reset();
    this.searchedGenerics = [];
    this.setSelectGenericType('');
    this.resetGenericGuestInfor();
    this.resetSearchQuery();
    this.genericLoadingImageURL = 'rejected.png';
  }

  /**
   * Updates the generic guest and price configurations, and initializes local and foreign pax type configurations based on the provided generic details.
   *
   * @param {Generic} generic - The generic object containing details like rates and resident types for configuring the selections.
   * @return {void} This method does not return any value, but updates internal data for the selected generic.
   */
  selectGeneric(generic: Generic) {
    this.genericGuestConfiguration = [];
    this.genericPriceConfiguration = [];
    this.selectedGeneric = generic;

    this.selectedGenericLocalPaxTypes = generic.genericrates
      .filter(rate => rate.residenttype.name.toLowerCase() === 'local')
      .map(rate => ({
        residentType: rate.residenttype,
        paxType: rate.paxtype,
        count: 0
      }));

    this.selectedGenericForeignPaxTypes = generic.genericrates
      .filter(rate => rate.residenttype.name.toLowerCase() === 'foreign')
      .map(rate => ({
        residentType: rate.residenttype,
        paxType: rate.paxtype,
        count: 0
      }));

    this.genericStepper.next();
  }

  /**
   * Fetches and views the details of the provided generic entity.
   *
   * @param {Generic} generic - The generic entity whose details are to be viewed.
   * @return {void} No return value.
   */
  viewGenericDetails(generic: Generic) {

  }

  //=========================================Configure Generic Passengers================================================//
  // Get count for a specific pax type
  /**
   * Retrieves the generic passenger count based on the provided passenger type and resident type.
   *
   * @param {PaxType} paxType - The type of passenger for which the count is being retrieved.
   * @param {ResidentType} residentType - The resident type associated with the passenger type.
   * @return {number} The count of passengers matching the provided types. Returns 0 if no match is found.
   */
  getGenericPaxCount(paxType: PaxType, residentType: ResidentType): number {
    const item = this.genericGuestConfiguration.find(item =>
      item.paxType.id === paxType.id && item.residentType.id === residentType.id
    );
    return item ? (item.count || 0) : 0;
  }

  // Increment count for a pax type
  /**
   * Increments the count of a generic passenger type based on the given passenger type and resident type.
   * If the combination of passenger type and resident type already exists, the count is incremented by 1.
   * Otherwise, a new entry is created with an initial count of 1.
   *
   * @param {PaxType} paxType - The type of passenger for which the count needs to be updated.
   * @param {ResidentType} residentType - The type of resident associated with the passenger type.
   * @return {void} - This method does not return any value.
   */
  incrementGenericPaxCount(paxType: PaxType, residentType: ResidentType): void {
    const existingItem = this.genericGuestConfiguration.find(item =>
      item.paxType.id === paxType.id && item.residentType.id === residentType.id
    );

    if (existingItem) {
      existingItem.count = (existingItem.count || 0) + 1;
    } else {
      this.genericGuestConfiguration.push({
        residentType: residentType,
        paxType: paxType,
        count: 1
      });
    }
    this.updateAmountForGenericPaxType();
    // console.log('Updated guest configuration:', this.genericGuestConfiguration);
    // console.log('Updated price configuration:', this.genericPriceConfiguration);
  }

  // Decrement count for a pax type
  /**
   * Decrements the count for a specified combination of passenger type and resident type
   * in the generic guest configuration. If the count reaches zero, the item is removed.
   * After decrementing, the amount is recalculated for the generic passenger type.
   *
   * @param paxType The type of passenger (e.g., adult, child).
   * @param residentType The type of residence or resident classification.
   * @return {void} Does not return a value.
   */
  decrementGenericPaxCount(paxType: PaxType, residentType: ResidentType): void {
    const existingItem = this.genericGuestConfiguration.find(item =>
      item.paxType.id === paxType.id && item.residentType.id === residentType.id
    );

    if (existingItem && existingItem.count && existingItem.count > 0) {
      existingItem.count -= 1;

      // Remove item if count reaches 0
      if (existingItem.count === 0) {
        this.genericGuestConfiguration = this.genericGuestConfiguration.filter(
          item => !(item.paxType.id === paxType.id && item.residentType.id === residentType.id)
        );
      }
    }

    this.updateAmountForGenericPaxType();
    // console.log('Updated guest configuration:', this.genericGuestConfiguration);
    // console.log('Updated price configuration:', this.genericPriceConfiguration);
  }

  //====⭐Always recalculate PaxType, PaxCount, And PaxAmount⭐====//
  /**
   * Updates the amount configuration and calculates total amounts for a generic passenger type (pax type)
   * based on the selected generic contract and guest configuration.
   *
   * The method processes the guest configuration, calculates amounts for matching pax types
   * and resident types, and updates the corresponding booking amounts and form controls.
   * If no generic contract is selected or certain configurations have no matching rates,
   * the operation is skipped or logged as a warning.
   *
   * @return {void} This method does not return a value. It performs updates on internal state variables
   * such as `genericPriceConfiguration`, `totalAmountForBookingGenericWithoutMarkup`,
   * and triggers updates for booking amounts and form controls.
   */
  private updateAmountForGenericPaxType(): void {
    // Clear existing price configuration (not guest configuration)
    this.genericPriceConfiguration = [];

    // Only process if we have a selected generic contract
    if (!this.selectedGeneric?.genericrates) {
      return;
    }

    // Iterate through guest configuration to calculate amounts
    this.genericGuestConfiguration.forEach(guestConfig => {
      if (guestConfig.count && guestConfig.count > 0) {
        // Find the corresponding generic rate for this pax type AND resident type
        const genericRate = this.selectedGeneric?.genericrates.find(
          rate => rate.paxtype.id === guestConfig.paxType.id &&
            rate.residenttype?.id === guestConfig.residentType.id
        );

        if (genericRate) {
          // Calculate the total amount for this pax type
          const totalAmount = (genericRate.amount + (this.selectedGeneric?.markup || 0)) * guestConfig.count;

          // Add to price configuration
          this.genericPriceConfiguration.push({
            residentType: guestConfig.residentType,
            paxType: guestConfig.paxType,
            count: guestConfig.count,
            paxAmount: totalAmount
          });

          if (this.selectedGeneric) {
            this.totalAmountForBookingGenericWithoutMarkup = 0;
            this.totalAmountForBookingGenericWithoutMarkup = this.calculateGenericPriceWithoutMarkup(this.genericPriceConfiguration, this.selectedGeneric);
            // console.log("Total amount booking generic without markup : " + this.totalAmountForBookingGenericWithoutMarkup);
          }

          // Update booking amounts with the total generic amount after all calculations
          this.updateBookingGenericAmounts(this.getTotalGenericPaxAmount());
          this.updateFormControls();

        } else {
          console.warn(`No generic rate found for pax type: ${guestConfig.paxType.name} and resident type: ${guestConfig.residentType.name}`);
        }
      }
    });


  }

  //⭐ Find Again Pax Prices without markup
  /**
   * Finds the base generic passenger rate without markup based on the selected generic rate and passenger type ID.
   *
   * @param {Generic} selectedGeneric - The selected generic containing a list of generic rates.
   * @param {number} paxTypeId - The ID of the passenger type to match with the generic rates.
   * @return {number} The amount corresponding to the matched passenger type if found, otherwise returns 0.
   */
  private findBaseGenericPaxRateWithoutMarkup(selectedGeneric: Generic, paxTypeId: number): number {
    for (const rate of selectedGeneric.genericrates) {
      if (rate.paxtype.id === paxTypeId) {
        return rate.amount
      }
    }
    return 0;
  }

  //⭐ Recalculate Total Room Price Without Markup
  /**
   * Calculates the total generic price without considering any markup.
   *
   * @param {TotalGenericPriceConfiguration[]} configs - An array of configurations that specify pricing details for generic items.
   * @param {Generic} selectedGeneric - The selected generic item for which the price is being calculated.
   * @return {number} The total calculated generic price without markup.
   */
  private calculateGenericPriceWithoutMarkup(configs: TotalGenericPriceConfiguration[], selectedGeneric: Generic): number {
    let total = 0;

    for (const config of configs) {
      const baseAmount = this.findBaseGenericPaxRateWithoutMarkup(
        selectedGeneric,
        config.paxType.id
      );
      total += baseAmount * config.count;
    }

    return total;
  }


  // Get total amount for all pax types
  /**
   * Calculates the total generic passenger amount by summing up the `paxAmount`
   * property from all entries in the `genericPriceConfiguration` array.
   *
   * @return {number} The total passenger amount.
   */
  getTotalGenericPaxAmount(): number {
    return this.genericPriceConfiguration.reduce(
      (total, config) => total + config.paxAmount, 0
    );
  }

  // Get a total count of all pax types
  /**
   * Calculates the total number of generic passengers by summing up the count from the generic guest configuration.
   * If an item's count is undefined, it is treated as 0 during summation.
   *
   * @return {number} The total count of generic passengers.
   */
  getTotalGenericPaxCount(): number {
    return this.genericGuestConfiguration.reduce((total, item) => total + (item.count || 0), 0);
  }

  // Get amount for a specific pax type (combined for all resident types)
  /**
   * Calculates the total amount for a given generic passenger type.
   *
   * @param paxType The passenger type for which the amount is to be calculated.
   * @return The total amount associated with the given passenger type.
   */
  getAmountForGenericPaxType(paxType: PaxType): number {
    const configs = this.genericPriceConfiguration.filter(
      config => config.paxType.id === paxType.id
    );
    return configs.reduce((total, config) => total + config.paxAmount, 0);
  }

  // Get amount for a specific pax type and resident type
  /**
   * Calculates the amount for a specified passenger type and resident type.
   *
   * @param {PaxType} paxType - The type of passenger.
   * @param {ResidentType} residentType - The type of resident.
   * @return {number} The calculated amount for the given passenger and resident type or 0 if no configuration matches.
   */
  getAmountForGenericPaxTypeAndResident(paxType: PaxType, residentType: ResidentType): number {
    const config = this.genericPriceConfiguration.find(
      config => config.paxType.id === paxType.id && config.residentType.id === residentType.id
    );
    return config ? config.paxAmount : 0;
  }

  // Get rate per person for a specific pax type
  /**
   * Calculates and returns the generic rate per person based on the given passenger type.
   *
   * @param {PaxType} paxType - The type of passenger for which the rate is to be calculated.
   * @return {number} The calculated generic rate per person. Returns 0 if no rate is found.
   */
  getGenericRatePerPerson(paxType: PaxType): number {
    const genericRate = this.getGenericRateForPaxType(paxType);
    return genericRate ? genericRate.amount : 0;
  }

  // Helper function to get generic rate for pax type
  /**
   * Retrieves the generic rate for the specified passenger type.
   *
   * @param {PaxType} paxType - The passenger type for which the generic rate is to be retrieved.
   * @return {any} The generic rate associated with the given passenger type, or undefined if no matching rate is found.
   */
  private getGenericRateForPaxType(paxType: PaxType): any {
    return this.selectedGeneric?.genericrates?.find(
      rate => rate.paxtype.id === paxType.id
    );
  }

  // Get a total count for a specific resident type
  /**
   * Calculates the total number of generic passengers for a specified resident type.
   *
   * @param {ResidentType} residentType - The resident type for which the passenger count needs to be calculated.
   * @return {number} The total count of passengers associated with the specified resident type.
   */
  getTotalGenericPaxCountForResident(residentType: ResidentType): number {
    return this.genericGuestConfiguration
      .filter(item => item.residentType.id === residentType.id)
      .reduce((total, item) => total + (item.count || 0), 0);
  }

  // Get the total amount for a specific resident type
  /**
   * Calculates the total generic amount for a specific resident type based on the configuration data.
   *
   * @param {ResidentType} residentType - The type of resident for which the total amount needs to be calculated.
   * @return {number} The total generic amount for the given resident type.
   */
  getTotalGenericAmountForResident(residentType: ResidentType): number {
    return this.genericPriceConfiguration
      .filter(config => config.residentType.id === residentType.id)
      .reduce((total, config) => total + config.paxAmount, 0);
  }

  // Get all pax types for a specific resident type
  /**
   * Retrieves a list of generic passenger types (PaxType) for a given resident type.
   *
   * @param residentType The resident type for which the generic passenger types are to be retrieved.
   * @return An array of PaxType objects associated with the specified resident type.
   */
  getGenericPaxTypesForResident(residentType: ResidentType): PaxType[] {
    return this.genericGuestConfiguration
      .filter(item => item.residentType.id === residentType.id && item.count > 0)
      .map(item => item.paxType);
  }

  //==========================Calculate Booking Generic Discount Amount===========================//

  /**
   * Handles the calculation and application of a generic discount amount for a booking.
   * The method listens for changes in the discount amount form control, processes the input,
   * and applies the corresponding discount based on the rate type (percentage or fixed amount).
   * It ensures the discount does not exceed allowed limits and keeps the amounts and controls
   * updated after applying the discount.
   *
   * @return {void} This method does not return any value.
   */
  calculateBookingGenericDiscountAmount(): void {
    this.bookingGenericForm.controls['discountamount'].valueChanges
      .pipe(
        skip(1), // Skip the first emission (initialization)
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only emit if the value actually changed
        takeUntil(this.destroy$)
      ).subscribe({
      next: (discount) => {
        if (!discount || !discount.ratetype || discount.amount == null) {
          this.discountAmountForBooking -= this.genericDiscount;
          this.genericDiscount = 0;
          this.updateAmountForGenericPaxType();
          this.updateBookingGenericAmounts(this.getTotalGenericPaxAmount());
          this.updateFormControls();
          return;
        }

        if (!this.checkDiscountCanBeApplied(discount.amount, 2000, this.bookingGenericForm, 'totalamount')) {
          return;
        } else {
          this.discountAmountForBooking -= this.genericDiscount;
          const totalGenericAmount = this.getTotalGenericPaxAmount();

          if (discount.ratetype.name === 'Percentage') {
            this.genericDiscount = (totalGenericAmount * discount.amount) / 100;
          } else if (discount.ratetype.name === 'Amount') {
            this.genericDiscount = discount.amount;
          } else {
            this.genericDiscount = 0;
          }
          this.isDisableContinuousChangeDetection = true;
          this.discountAmountForBooking += Number(this.genericDiscount);
          this.updateBookingGenericAmounts(totalGenericAmount);
          this.updateFormControls();
        }
      }
    });
  }

  /**
   * Updates the booking generic amounts based on the provided grand total value.
   *
   * @param {number} grandTotal The total amount including discounts and other charges.
   * @return {void} Does not return a value.
   */
  private updateBookingGenericAmounts(grandTotal: number): void {
    this.totalAmountForBookingGeneric = grandTotal;
    this.netAmountForBookedGeneric = grandTotal - this.genericDiscount;

    if (this.selectedGeneric) {
      const baseAmountWithoutMarkup = this.calculateGenericPriceWithoutMarkup(
        this.genericPriceConfiguration,
        this.selectedGeneric
      );
      this.totalAmountForBookingGenericWithoutMarkup = baseAmountWithoutMarkup - this.genericDiscount;
    }

    // console.log("Total amount booking transfer without markup : " + this.totalAmountForBookingGenericWithoutMarkup);
  }

  //=========================Add Booking Transfer as Bookied Item=========================//

  /**
   * Adds a booked generic item to the booking. The method performs validation on the booking generic form
   * and processes the data accordingly. It creates and updates booking generic details including paxes
   * and updates the booking total amount. The form is reset and related states are updated after the operation.
   *
   * @return {void} No return value.
   */
  addBookedGenericToBooking(): void {

    const errors = this.formValidationService.getErrors(this.bookingGenericForm, ['discountamount']);

    if (errors) {
      this.operationFeedbackService.showErrors("Generic", "Booking", errors);
      return;
    }
    this.isEnableBookingGenericForm = false;
    let bookingGeneric = new BookingGeneric();
    const bookingGenericValues = this.bookingGenericForm.getRawValue();

    if (this.selectedGeneric) {
      delete bookingGenericValues.discountamount;
      bookingGeneric = bookingGenericValues;
      bookingGeneric.discountamount = this.genericDiscount;
      bookingGeneric.generic = this.selectedGeneric;
    }

    // Create a new array for each accommodation
    const bookingGenericPaxes: BookingGenericPax[] = [];

    this.genericPriceConfiguration.forEach(config => {
      const bookingGenericPax = new BookingGenericPax();
      bookingGenericPax.paxtype = config.paxType.name;
      bookingGenericPax.paxcount = config.count;
      bookingGenericPax.amount = config.paxAmount;
      bookingGenericPaxes.push(bookingGenericPax);
    });

    bookingGeneric.bookinggenericpaxes = bookingGenericPaxes;
    this.bookingGenerics.push(bookingGeneric);
    this.storedBookingGenerics = [...this.bookingGenerics];
    // console.log(this.bookingGenerics);
    this.isBookingGenericChanged = true;
    // Clear the component's room array for next use
    this.bookingGenericPaxes = [];
    this.destroy$.next();
    this.destroy$.complete();
    // Immediately calculate booking payments
    this.calculateTotalBookingAmount();
    this.updateFormControls();
    this.resetGenericBooking();
  }

  /**
   * Resets the generic booking form and associated properties to their default values.
   *
   * @return {void} This method does not return a value.
   */
  resetGenericBooking(): void {
    this.genericDiscount = 0; // ⭐⭐⭐
    this.genericGuestConfiguration = [];
    this.genericPriceConfiguration = [];
    this.genericSearchFrom.reset();
    this.bookingGenericForm.reset();
    this.bookingGenericForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedGeneric = null;
    this.clearGenericSearch();
  }

  //=========================================================Clear and Reset Generic Config=======================================================================//
  /**
   * Resets and clears all configurations and forms related to generic booking.
   * It resets the generic search form, booking form, and clears specific fields and selected values
   * related to generic bookings. Also triggers actions to clear any associated search data or configurations.
   *
   * @return {void} Does not return a value.
   */
  resetAndClearGenericBooking(): void {
    this.clearAllGenericConfigurations();
    this.genericSearchFrom.reset();
    this.bookingGenericForm.reset();
    this.bookingGenericForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedGeneric = null;
    this.clearGenericSearch();
  }

  /**
   * Clears all stored generic configurations by resetting related properties to their default values.
   * This includes resetting discounts, amounts, booked generics, and configuration data.
   *
   * @return {void} Does not return a value.
   */
  clearAllGenericConfigurations(): void {
    this.genericDiscount = 0;
    this.netAmountForBookedGeneric = 0;
    this.bookingGenericPaxes = [];
    this.bookingGenerics = [];
    this.genericGuestConfiguration = [];
    this.genericPriceConfiguration = [];
  }


  //======================================================✈️✈️Tour Section✈️✈️===========================================================================//
  //=======================================================Display Template Values=================================================//

  /**
   * Removes a guest from the tour configuration at the specified index.
   *
   * @param {number} $index - The index of the guest to be removed from the tour configuration.
   * @return {void}
   */
  removeGuestFromTourConfiguration($index: number): void {
    this.tourGuestConfiguration.splice($index, 1);
    this.updateAmountForTourPaxType();
  }

  /**
   * Sets the selected tour type for the current instance.
   *
   * @param {string} tourType - The type of the tour to be selected.
   * @return {void}
   */
  setSelectedTourType(tourType: string): void {
    this.selectedTourType = tourType;
  }

  /**
   * Sets the selected tour theme.
   *
   * @param {string} tourTheme - The theme of the tour to set as selected.
   * @return {void} No return value.
   */
  setSelectedTourTheme(tourTheme: string): void {
    this.selectedTourTheme = tourTheme;
  }

  /**
   * Updates the currently selected tour category.
   *
   * @param {string} tourCategory - The name of the tour category to set as selected.
   * @return {void}
   */
  setSelectedTourCategory(tourCategory: string): void {
    this.selectedTourCategory = tourCategory;
  }

  /**
   * Sets the selected tour passenger count.
   *
   * @param {string} tourPaxCount - The number of passengers for the selected tour.
   * @return {void} This method does not return a value.
   */
  setSelectedTourPaxCount(tourPaxCount: string): void {
    this.selectedTourPaxCount = tourPaxCount;
  }

  /**
   * Searches for tours based on the provided form values and query parameters.
   * Validates necessary input fields before initiating the search request.
   * Constructs a query string dynamically and performs a call to the data service
   * to fetch the matching tours. Updates the related properties with the search results
   * or handles error appropriately.
   *
   * @return {void} This method performs its operation without returning a value.
   */
  searchTour(): void {
    const tourSearchFormValues = this.tourSearchFrom.value;
    const {name, departureDate, endDate, tourtype, tourtheme} = tourSearchFormValues;

    // Validate required fields
    if (!departureDate || !endDate) {
      this.operationFeedbackService.showMessage("Error", "Please select departure and end dates");
      return;
    }
    // Reset and build new search params
    this.resetSearchQuery();
    // Helper function to add parameters only if they exist
    const addParam = (key: string, value: any) => {
      if (value !== null && value !== undefined && value !== '') {
        this.tourSearchQuery.append(key, value);
      }
    };

    // Add basic search parameters
    addParam("name", name);
    addParam("salesfrom", departureDate);
    addParam("salesto", endDate);
    if (tourtype) {
      addParam("tourtype", tourtype.name);
    }
    addParam("tourtheme", tourtheme);
    addParam("tourcategory", this.selectedTourCategory);
    addParam("paxcount", this.selectedTourPaxCount);

    const queryString = this.tourSearchQuery.toString() ? `?${this.tourSearchQuery.toString()}` : "";
    this.tourLoadingImageURL = 'pending.gif';
    this.dataSubscriber$.add(
      this.dataService.getData<Tour>(ApiEndpoints.paths.tourSearch, queryString).subscribe({
        next: (tours) => {
          this.searchedTours = tours;
        },
        error: (error) =>
          console.error("Error fetching tours:", error.message),
        complete: () => {
          this.tourLoadingImageURL = 'fullfilled.png';
        }
      })
    )
  }

  /**
   * Clears the tour search parameters and resets the search state.
   *
   * Resets the search form, clears the list of searched tours, resets selected
   * tour attributes such as type, theme, category, and passenger count, and
   * resets the search query. Also updates the loading indicator image to signify
   * the cleared state.
   *
   * @return {void} No return value.
   */
  clearTourSearch() {
    this.tourSearchFrom.reset();
    this.searchedTours = [];
    this.setSelectedTourType('');
    this.setSelectedTourTheme('');
    this.setSelectedTourCategory('');
    this.setSelectedTourPaxCount('');
    this.resetSearchQuery();
    this.tourLoadingImageURL = 'rejected.png';
  }

  /**
   * Updates the selected tour and initializes related configurations.
   *
   * @param {Tour} tour - The tour object to be selected.
   * @return {void}
   */
  selectTour(tour: Tour) {
    this.tourGuestConfiguration = [];
    this.tourPriceConfiguration = [];

    this.selectedTourGuestConfiguration = tour.touroccupancies.map(rate => ({
      paxType: rate.paxtype,
      count: 0
    }));
    this.selectedTour = tour;

    this.tourStepper.next();
  }

  /**
   * Displays the detailed information of a specified tour.
   *
   * @param {Tour} tour - The tour object containing information to be viewed.
   * @return {void} This method does not return a value.
   */
  viewTourDetails(tour: Tour) {

  }

  /**
   * Calculates the maximum duration of a tour based on the included accommodations, transfer contracts, and generic activities.
   *
   * The method collects all relevant `day` values from the selected tour's accommodations, transfers, and generic activities,
   * and determines the maximum value among them. If there are no `day` values available, it returns 0.
   *
   * @return {number} The maximum number of days in the tour, or 0 if no relevant data is present.
   */
  getTourDuration(): number {
    const accommDays = this.selectedTour?.touraccommodations?.map(accomm => accomm.day) || [];
    const transferDays = this.selectedTour?.tourtransfercontracts?.map(transfer => transfer.day) || [];
    const genericDays = this.selectedTour?.tourgenerics?.map(generic => generic.day) || [];

    // Include all day arrays
    const allDays = [...accommDays, ...transferDays, ...genericDays];

    if (allDays.length === 0) {
      return 0;
    }

    return Math.max(...allDays);
  }

  //=========================================Configure Tour Passengers================================================//
  // Get count for a specific pax type
  /**
   * Retrieves the passenger count for a specified passenger type from the tour guest configuration.
   *
   * @param {PaxType} paxType - The type of passenger for which the count is to be retrieved.
   * @return {number} The count of passengers of the specified type. Returns 0 if the passenger type is not found or count is not defined.
   */
  getTourPaxCount(paxType: PaxType): number {
    const item = this.tourGuestConfiguration.find(item => item.paxType.id === paxType.id);
    return item ? (item.count || 0) : 0;
  }

  // Increment count for a pax type
  /**
   * Increments the passenger count for the specified passenger type in the tour guest configuration.
   * If the specified passenger type does not already exist in the configuration, it will be added with a count of 1.
   *
   * @param {PaxType} paxType - The type of passenger whose count should be incremented.
   * @return {void} No return value.
   */
  incrementTourPaxCount(paxType: PaxType): void {
    const existingItem = this.tourGuestConfiguration.find(item => item.paxType.id === paxType.id);

    if (existingItem) {
      existingItem.count = (existingItem.count || 0) + 1;
    } else {
      this.tourGuestConfiguration.push({
        paxType: paxType,
        count: 1
      });
    }
    this.updateAmountForTourPaxType();
    // console.log('Updated guest configuration:', this.tourGuestConfiguration);
    // console.log('Updated price configuration:', this.tourPriceConfiguration);
  }

  // Decrement count for a pax type
  /**
   * Decreases the count of a specified passenger type (paxType) in the tour guest configuration.
   * If the count for the paxType reaches 0, it removes the paxType entry from the tour guest configuration.
   * After modification, updates the price configuration for the tour.
   *
   * @param paxType The passenger type object whose count needs to be decremented.
   * @return void
   */
  decrementTourPaxCount(paxType: PaxType): void {
    const existingItem = this.tourGuestConfiguration.find(item => item.paxType.id === paxType.id);

    if (existingItem && existingItem.count && existingItem.count > 0) {
      existingItem.count -= 1;

      // Remove item if count reaches 0
      if (existingItem.count === 0) {
        this.tourGuestConfiguration = this.tourGuestConfiguration.filter(
          item => item.paxType.id !== paxType.id
        );
      }
    }

    this.updateAmountForTourPaxType();
    // console.log('Updated guest configuration:', this.tourGuestConfiguration);
    // console.log('Updated price configuration:', this.tourPriceConfiguration);
  }

  //====⭐Always recalculate PaxType, PaxCount, And PaxAmount with fixed markup price⭐====//
  /**
   * Updates the amount configuration for each tour passenger type based on the selected tour's occupancy and guest configuration.
   * The method calculates the total amount per passenger type, including the applicable markup, and updates the related price configuration.
   * Additionally, it recalculates the total booking amounts and updates the relevant form controls.
   *
   * @return {void} This method does not return any value.
   */
  private updateAmountForTourPaxType(): void {
    // Clear existing price configuration
    this.tourPriceConfiguration = [];

    // Only process if we have a selected tour contract
    if (!this.selectedTour?.touroccupancies) {
      return;
    }

    // Iterate through guest configuration to calculate amounts
    this.tourGuestConfiguration.forEach(guestConfig => {
      if (guestConfig.count && guestConfig.count > 0) {
        // Find the corresponding tour rate for this pax type
        const tourRate = this.selectedTour?.touroccupancies.find(
          rate => rate.paxtype.id === guestConfig.paxType.id
        );

        if (tourRate) {
          // Calculate the total amount for this pax type with fixed markup
          const totalAmount = (tourRate.amount + (this.selectedTour?.markup || 0)) * guestConfig.count;

          // Add to price configuration
          this.tourPriceConfiguration.push({
            paxType: guestConfig.paxType,
            count: guestConfig.count,
            paxAmount: totalAmount
          });

          if (this.selectedTour) {
            this.totalAmountForBookingTourWithoutMarkup = 0;
            this.totalAmountForBookingTourWithoutMarkup = this.calculateTourPaxPriceWithoutMarkup(this.tourPriceConfiguration, this.selectedTour);
            // console.log("Total amount booking tour without markup : " + this.totalAmountForBookingTourWithoutMarkup);
          }
          this.updateBookingTourAmounts(this.getTotalTourPaxAmount());
          this.updateFormControls();

        } else {
          console.warn(`No tour rate found for pax type: ${guestConfig.paxType.name}`);
        }
      }
    });
  }

  // Find Again Pax Prices without markup
  /**
   * Finds and returns the base tour rate for a specific passenger type without applying markup.
   *
   * @param {Tour} selectedTour - The tour object containing occupancy details and rates.
   * @param {number} paxTypeId - The identifier for the passenger type.
   * @return {number} The base rate for the specified passenger type, or 0 if no matching rate is found.
   */
  private findBaseTourPaxRateWithoutMarkup(selectedTour: Tour, paxTypeId: number): number {
    for (const rate of selectedTour.touroccupancies) {
      if (rate.paxtype.id === paxTypeId) {
        return rate.amount
      }
    }
    return 0;
  }

  // Recalculate Total Room Price Without Markup
  /**
   * Calculates the total price for a tour without applying any markup, based on the given configurations and the selected tour.
   *
   * @param {TotalTourPriceConfiguration[]} configs - An array of configurations where each configuration contains passenger type and count.
   * @param {Tour} selectedTour - The selected tour object for which the price is to be calculated.
   * @return {number} The total price for the selected tour without markup applied.
   */
  private calculateTourPaxPriceWithoutMarkup(configs: TotalTourPriceConfiguration[], selectedTour: Tour): number {
    let total = 0;

    for (const config of configs) {
      const baseAmount = this.findBaseTourPaxRateWithoutMarkup(
        selectedTour,
        config.paxType.id
      );
      total += baseAmount * config.count;
    }

    return total;
  }

  //  to get rate for a specific pax type
  /**
   * Retrieves the tour rate for a given passenger type (pax type).
   *
   * @param {PaxType} paxType - The passenger type for which to find the tour rate.
   * @return {TourOccupancy | undefined} The tour occupancy that matches the passenger type, or undefined if no match is found.
   */
  private getTourRateForPaxType(paxType: PaxType): TourOccupancy | undefined {
    return this.selectedTour?.touroccupancies.find(
      rate => rate.paxtype.id === paxType.id
    );
  }

  // Get total amount for all pax types
  /**
   * Calculates and returns the total pax amount for the tour
   * by summing up the paxAmount values from the tour price configuration.
   *
   * @return {number} The total pax amount for the tour.
   */
  getTotalTourPaxAmount(): number {
    return this.tourPriceConfiguration.reduce(
      (total, config) => total + config.paxAmount, 0
    );
  }

  // Get a total count of all pax types
  /**
   * Calculates the total number of passengers (PAX) for a tour based on the tour guest configuration.
   *
   * This method iterates through the tour guest configuration, sums up the count for each configuration item,
   * and returns the total count. If a particular item's count is undefined or null, it is treated as 0.
   *
   * @return {number} The total number of passengers for the tour.
   */
  getTotalTourPaxCount(): number {
    return this.tourGuestConfiguration.reduce((total, item) => total + (item.count || 0), 0);
  }

  // Get amount for a specific pax type
  /**
   * Calculates and returns the tour amount for a given passenger type.
   *
   * @param {PaxType} paxType - The passenger type object for which the tour amount needs to be calculated.
   * @return {number} The calculated tour amount for the given passenger type. Returns 0 if no matching configuration is found.
   */
  getTourAmountForPaxType(paxType: PaxType): number {
    const config = this.tourPriceConfiguration.find(
      config => config.paxType.id === paxType.id
    );
    return config ? config.paxAmount : 0;
  }

  // Get rate per person for a specific pax type
  /**
   * Retrieves the tour rate per person based on the specified passenger type.
   *
   * @param {PaxType} paxType - The passenger type for which to retrieve the tour rate.
   * @return {number} The tour rate for the specified passenger type. Returns 0 if the rate is not available.
   */
  getTourRatePerPerson(paxType: PaxType): number {
    const tourRate = this.getTourRateForPaxType(paxType);
    return tourRate ? tourRate.amount : 0;
  }

  // Initialize with default values
  /**
   * Initializes the configurations related to tour bookings.
   * Sets up the required data structures for handling tours, guests, and pricing configurations.
   * Also updates the amount details for different types of tour participants.
   *
   * @return {void} No value is returned by this method.
   */
  initializeTourBookingConfigurations(): void {
    this.bookingTours = [];
    this.tourGuestConfiguration = [];
    this.tourPriceConfiguration = [];
    this.updateAmountForTourPaxType();
  }

  //  Validate configurations
  /**
   * Validates the tour configurations by checking if required configuration lists are populated.
   *
   * @return {boolean} Returns true if the tour guest and price configurations are not empty; otherwise, false.
   */
  validateTourConfigurations(): boolean {
    return this.tourGuestConfiguration.length > 0 &&
      this.tourPriceConfiguration.length > 0;
  }

  //==========================Calculate Booking Tour Discount Amount===========================//

  /**
   * Calculates and updates the discount amount for a booking tour based on the discount rate type and value.
   * Listens to changes in the 'discountamount' control value within the booking tour form.
   * Depending on the rate type (e.g., Percentage or Amount), the method computes the applicable discount
   * and updates relevant properties and form controls accordingly.
   *
   * @return {void} Does not return any value, but updates related properties and triggers necessary updates.
   */
  calculateBookingTourDiscountAmount(): void {
    this.bookingTourForm?.controls['discountamount']?.valueChanges?.subscribe({
      next: (discount) => {
        if (!discount || !discount.ratetype || discount.amount == null) {
          this.discountAmountForBooking -= this.tourDiscount;
          this.tourDiscount = 0;
          this.updateAmountForTourPaxType();
          this.updateBookingTourAmounts(this.getTotalTourPaxAmount());
          this.updateFormControls();
          return;
        }
        this.discountAmountForBooking -= this.tourDiscount;
        const totalTourAmount = this.getTotalTourPaxAmount();

        if (discount.ratetype.name === 'Percentage') {
          this.tourDiscount = (totalTourAmount * discount.amount) / 100;
        } else if (discount.ratetype.name === 'Amount') {
          this.tourDiscount = discount.amount;
        } else {
          this.tourDiscount = 0;
        }
        this.discountAmountForBooking += Number(this.tourDiscount);
        this.updateBookingTourAmounts(totalTourAmount);
        this.updateFormControls();
      }
    });
  }

  /**
   * Updates the booking tour amounts based on the provided grand total and any applicable discounts.
   *
   * @param {number} grandTotal - The grand total amount for the booking.
   * @return {void} This method does not return a value.
   */
  private updateBookingTourAmounts(grandTotal: number): void {
    this.totalAmountForBookingTour = grandTotal;
    this.netAmountForBookedTour = grandTotal - this.tourDiscount;

    if (this.selectedTour) {
      const baseAmountWithoutMarkup = this.calculateTourPaxPriceWithoutMarkup(
        this.tourPriceConfiguration,
        this.selectedTour
      );
      this.totalAmountForBookingGenericWithoutMarkup = baseAmountWithoutMarkup - this.genericDiscount;
    }

    // console.log("Total amount booking transfer without markup: " + this.totalAmountForBookingGenericWithoutMarkup);
  }

  //=========================Add Booking Transfer as Bookied Item=========================//

  /**
   * Adds a booked tour to the current booking workflow.
   * Validates form input, updates tour data, and recalculates booking totals.
   * If form validation errors exist, feedback is displayed without proceeding.
   *
   * @return {void} Does not return a value.
   */
  addBookedTourToBooking(): void {

    const errors = this.formValidationService.getErrors(this.bookingTourForm);

    if (errors) {
      this.operationFeedbackService.showErrors("Tour", "Booking", errors);
      return;
    }
    this.isEnableBookingTourForm = false;
    let bookingTour = new BookingTour();
    const bookingTourValues = this.bookingTourForm.getRawValue();

    if (this.selectedTour) {
      bookingTour = bookingTourValues;
      bookingTour.tourcontract = this.selectedTour;
    }

    this.bookingTours.push(bookingTour);
    this.storedBookingTours = [...this.bookingTours];
    this.isBookingTourChanged = true;
    // console.log(this.bookingTours);

    // Immediately calculate booking payments
    this.calculateTotalBookingAmount();
    this.updateFormControls();
    this.resetTourBooking();
  }

  /**
   * Resets the tour booking process, including form data, configurations, discounts,
   * and selected tour information.
   *
   * @return {void} This method does not return any value.
   */
  resetTourBooking(): void {
    this.tourDiscount = 0; // ⭐⭐⭐
    this.tourGuestConfiguration = [];
    this.tourPriceConfiguration = [];
    this.tourSearchFrom.reset();
    this.bookingTourForm.reset();
    this.bookingTourForm.patchValue({
      totalamount: '',
      supplieramount: '',
    });
    this.selectedTour = null;
    this.clearTourSearch();
  }

  //=========================================================Clear and Reset Tour Config=======================================================================//
  /**
   * Resets and clears all configurations related to the tour booking process.
   * Invokes methods to clear tour configurations, resets the search and booking forms,
   * and clears any selected tours and tour search data.
   *
   * @return {void} This method does not return any value.
   */
  resetAndClearTourBooking(): void {
    this.clearAllTourConfigurations();
    this.tourSearchFrom.reset();
    this.bookingTourForm.reset();
    this.selectedTour = null;
    this.clearTourSearch();
  }

  /**
   * Clears all stored configurations related to the booked tour.
   * Resets the net amount for the booked tour to zero and clears the guest
   * and price configurations for the tour.
   *
   * @return {void} This method does not return any value.
   */
  clearAllTourConfigurations(): void {
    this.netAmountForBookedTour = 0;

    this.tourGuestConfiguration = [];
    this.tourPriceConfiguration = [];
  }

  //=============================================================================================================================================================================//

  //==============================⭐⭐⭐💲💲Calculate Total Booking Amounts💲💲⭐⭐⭐===============================//

  /**
   * Calculates the total booking amount by aggregating the amounts and discounts
   * from different booking categories such as accommodations, transfer contracts,
   * generics, and tours. Adds up the amounts for each category to determine the gross
   * booking amount.
   *
   * @return {number} The total gross amount for all bookings, including any applicable discounts.
   */
  calculateTotalBookingAmount(): number {

    this.grossAmountForBooking = 0;

    if (this.bookingAccommodations) {
      this.bookingAccommodations.forEach(bookingAccommodation => {
        const amount = Number(bookingAccommodation.totalamount) || 0;
        const discount = Number(bookingAccommodation.discountamount) || 0;
        const bookingAccommodationAmount = amount + discount;
        this.grossAmountForBooking += bookingAccommodationAmount;
        // console.log(this.grossAmountForBooking + " : Accommodation Amount");
      });
    } else {
      this.grossAmountForBooking = 0;
    }

    if (this.bookingTransferContracts) {
      this.bookingTransferContracts.forEach(bookingTransferContract => {
        const amount = Number(bookingTransferContract.totalamount) || 0;
        const discount = Number(bookingTransferContract.discountamount) || 0;
        const bookingTransferContractAmount = amount + discount;
        this.grossAmountForBooking += bookingTransferContractAmount;
        console.log(this.grossAmountForBooking + " : Transfer Amount");
      })
    }

    if (this.bookingGenerics) {
      this.bookingGenerics.forEach(bookingGeneric => {
        const amount = Number(bookingGeneric.totalamount) || 0;
        const discount = Number(bookingGeneric.discountamount) || 0;
        const bookingGenericAmount = amount + discount;
        this.grossAmountForBooking += bookingGenericAmount;
        // console.log(this.grossAmountForBooking + " : Generic Amount");
      })
    }

    if (this.bookingTours) {
      this.bookingTours.forEach(bookingTour => {
        const amount = Number(bookingTour.totalamount) || 0;
        this.grossAmountForBooking += amount;
        // console.log(this.grossAmountForBooking + " : Tour Amount");
      })
    }
    // console.log(this.grossAmountForBooking + " : Final Amount");
    // console.log(this.discountAmountForBooking);
    return this.grossAmountForBooking;
  }

  /**
   * Updates the form controls for various booking-related forms by patching values derived
   * from calculated amounts like gross amount, discount amount, net amount, supplier amount, etc.
   * This method also ensures that balance recalculations occur if booking data modification is enabled.
   *
   * @return {void} No return value.
   */
  private updateFormControls(): void {
    this.bookingForm.patchValue({
      grossamount: this.grossAmountForBooking.toFixed(2),
      discountamount: this.discountAmountForBooking.toFixed(2),
      netamount: (this.grossAmountForBooking - this.discountAmountForBooking).toFixed(2),
    }, {emitEvent: false});

    this.bookingAccommodationForm.patchValue({
      totalamount: this.netAmountForBookedAccommodation.toFixed(2),
      supplieramount: this.totalAmountForBookingAccommodationWithoutMarkup.toFixed(2),
    }, {emitEvent: false});

    this.bookingTransferContractForm.patchValue({
      totalamount: this.netAmountForBookedTransfer.toFixed(2),
      supplieramount: this.totalAmountForBookingTransferWithoutMarkup.toFixed(2),
    }, {emitEvent: false})

    this.bookingGenericForm.patchValue({
      totalamount: this.netAmountForBookedGeneric.toFixed(2),
      supplieramount: this.totalAmountForBookingGenericWithoutMarkup.toFixed(2),
    }, {emitEvent: false})

    this.bookingTourForm.patchValue({
      totalamount: this.netAmountForBookedTour.toFixed(2),
      suppliersamount: this.totalAmountForBookingTourWithoutMarkup.toFixed(2),
    }, {emitEvent: false})

    if (this.isEnableBookingDataModify) {
      this.calculatedNewBalanceAfterModifyingItems();
    }

  }

  //=============================================================================================================================================================================//

  //========================================================Removed Booked Items===========================================//
  /**
   * Removes an accommodation item from the booking list if the conditions allow it.
   * Displays a warning notification if the item cannot be removed.
   * Updates the list of stored booking accommodations and recalculates the discount amount.
   *
   * @param {Object} event - The event object containing details of the item to be removed.
   * @param {number} event.index - The index of the item in the booking accommodations array.
   * @param {number} event.dataSize - The current size of the data.
   * @param {*} event.removedItem - The item being removed from the booking accommodations.
   * @param {boolean} [event.disabled] - An optional flag indicating if the removal is disabled.
   * @return {void} This method does not return any value.
   */
  removeAccommodationFromBooking(event: { index: number; dataSize: number, removedItem: any, disabled?: boolean }): void {
    if (event.disabled || this.isEnableBookingDataModify) {
      this.avNotificationService.showWarning("Warning : Booking Item Cannot be Removed",{
        theme: "light",
      });
      return;
    }

    this.bookingAccommodations.splice(event.index, 1);
    this.reCalculateBookingDiscountAmount(event.removedItem.discountamount);
    this.storedBookingAccommodations = [...this.bookingAccommodations];
  }

  /**
   * Removes a transfer item from the booking based on the provided event details.
   * If the event is marked as disabled or booking data modification is not enabled,
   * a warning notification is shown, and the item is not removed.
   *
   * @param {Object} event - The event object containing details about the transfer to be removed.
   * @param {number} event.index - The index of the item to be removed in the booking array.
   * @param {number} event.dataSize - The total number of items in the booking array.
   * @param {any} event.removedItem - The item that is being removed.
   * @param {boolean} [event.disabled] - Optional flag indicating if the removal is disabled. Defaults to false if not provided.
   * @return {void} Does not return a value.
   */
  removeTransferFromBooking(event: { index: number; dataSize: number, removedItem: any, disabled?: boolean }): void {
    if (event.disabled || this.isEnableBookingDataModify) {
      this.avNotificationService.showWarning("Warning : Booking Item Cannot be Removed",{
        theme: "light",
      });
      return;
    }

    this.bookingTransferContracts.splice(event.index, 1);
    this.reCalculateBookingDiscountAmount(event.removedItem.discountamount);
    this.storedBookingTransferContracts = [...this.bookingTransferContracts];

  }

  /**
   * Handles the removal of a generic item from the booking list, ensuring specific booking rules are adhered to.
   * It prevents removal if the event is marked as disabled or booking data modification is not allowed.
   * Updates the stored booking generics and recalculates the booking discount amount.
   *
   * @param {Object} event - The event object containing information about the item to be removed.
   * @param {number} event.index - The index of the item to be removed from the booking generics list.
   * @param {number} event.dataSize - The total size of the data set.
   * @param {any} event.removedItem - The removed item object containing details such as discount amount.
   * @param {boolean} [event.disabled] - A flag indicating whether the event is disabled, meaning the action cannot proceed.
   * @return {void} This method does not return a value.
   */
  removeGenericFromBooking(event: { index: number; dataSize: number, removedItem: any, disabled?: boolean }): void {
    if (event.disabled || this.isEnableBookingDataModify) {
      this.avNotificationService.showWarning("Warning : Booking Item Cannot be Removed",{
        theme: "light",
      });
      return;
    }
    this.bookingGenerics.splice(event.index, 1);
    this.reCalculateBookingDiscountAmount(event.removedItem.discountamount);
    this.storedBookingGenerics = [...this.bookingGenerics];

  }

  /**
   * Removes a tour from the booking based on the provided event details.
   * This method validates whether the booking modification is allowed before proceeding with the removal.
   * If modification is not allowed, a warning notification is displayed.
   *
   * @param {Object} event - The event object containing details of the tour to be removed.
   * @param {number} event.index - The index of the tour to be removed from the booking list.
   * @param {number} event.dataSize - The total size of the data before removal.
   * @param {any} event.removedItem - The tour item being removed, including its details.
   * @param {boolean} [event.disabled] - Optional flag indicating if removal is disabled.
   * @return {void} This method does not return a value.
   */
  removeTourFromBooking(event: { index: number; dataSize: number, removedItem: any, disabled?: boolean }): void {
    if (event.disabled || this.isEnableBookingDataModify) {
      this.avNotificationService.showWarning("Warning : Booking Item Cannot be Removed",{
        theme: "light",
      });
      return;
    }

    this.bookingTours.splice(event.index, 1);
    this.reCalculateBookingDiscountAmount(event.removedItem.discountamount);
    this.storedBookingTours = [...this.bookingTours];

  }

  /**
   * Updates the booking discount amount by subtracting a removed discount value
   * and recalculates the total booking amount. Additionally, updates necessary
   * form controls based on the modified amounts.
   *
   * @param {any} removedDiscount The discount amount to be removed from the current booking discount total. It should be a numeric value.
   * @return {void} Does not return any value.
   */
  reCalculateBookingDiscountAmount(removedDiscount: any): void {
    this.discountAmountForBooking -= Number(removedDiscount);
    this.calculateTotalBookingAmount();
    this.updateFormControls();
    // const netAmount = this.bookingForm.get('netamount')?.value;
    // const totalPaid = this.bookingForm.get('totalpaid')?.value;
    // this.bookingForm.patchValue({
    //   balance: (Number(netAmount) - Number(totalPaid)).toFixed(2)
    // });
  }

  //==================================================Check Booking Item Updates===========================================//
  /**
   * Determines if there are changes in booking accommodations by comparing the old accommodations
   * with the current and stored accommodations.
   *
   * @return {boolean} Returns true if there are changes detected in booking accommodations, otherwise false.
   */
  getBookingAccommodationChanges(): boolean {
    if (
      this.oldBookingAccommodations.length !== this.booking.bookingaccommodations.length ||
      this.oldBookingAccommodations.length !== this.storedBookingAccommodations.length
    ) {
      this.isBookingAccommodationChanged = true;
      return true;
    }

    // Check if any accommodation was modified
    return this.oldBookingAccommodations.some((oldAccom, index) => {
      const currentAccom = this.booking.bookingaccommodations[index];
      return JSON.stringify(oldAccom) !== JSON.stringify(currentAccom);
    });
  }

  /**
   * Determines if there have been changes between the current, old, and stored booking transfer contracts.
   * Compares the lengths and contents of the corresponding booking transfer contracts arrays.
   * Updates the state indicating if the booking transfer contracts have changed.
   *
   * @return {boolean} Returns true if the booking transfer contracts have changes; otherwise, false.
   */
  getBookingTransferContractChanges(): boolean {
    if (
      this.oldBookingTransferContracts.length !== this.booking.bookingtransfers.length ||
      this.oldBookingTransferContracts.length !== this.storedBookingTransferContracts.length
    ) {
      this.isBookingTransferChanged = true;
      return true;
    }

    return this.oldBookingTransferContracts.some((oldTransfer, index) => {
      const currentTransfer = this.booking.bookingtransfers[index];
      return JSON.stringify(oldTransfer) !== JSON.stringify(currentTransfer);
    });
  }

  /**
   * Checks if there are changes in booking generics by comparing the old booking generics,
   * the stored booking generics, and the current booking generics.
   * Updates the `isBookingGenericChanged` property if any changes are detected.
   *
   * @return {boolean} Returns true if there are changes in booking generics, otherwise false.
   */
  getBookingGenericsChanges(): boolean {
    if (
      this.oldBookingGenerics.length !== this.booking.bookinggenerics.length ||
      this.oldBookingGenerics.length !== this.storedBookingGenerics.length
    ) {
      this.isBookingGenericChanged = true;
      return true;
    }

    return this.oldBookingGenerics.some((oldGeneric, index) => {
      const currentGeneric = this.booking.bookinggenerics[index];
      return JSON.stringify(oldGeneric) !== JSON.stringify(currentGeneric);
    });
  }

  /**
   * Checks if there are any changes in the booking tours by comparing the current booking tours,
   * stored booking tours, and the previous booking tours. Updates the `isBookingTourChanged` flag
   * if any difference is detected.
   *
   * @return {boolean} Returns true if there are changes in the booking tours, otherwise false.
   */
  getBookingTourChanges(): boolean {
    if (
      this.oldBookingTours.length !== this.booking.bookingtours.length ||
      this.oldBookingTours.length !== this.storedBookingTours.length
    ) {
      this.isBookingTourChanged = true;
      return true;
    }

    return this.oldBookingTours.some((oldTour, index) => {
      const currentTour = this.booking.bookingtours[index];
      return JSON.stringify(oldTour) !== JSON.stringify(currentTour);
    });
  }

  /**
   * Retrieves a string of updates indicating the specific sections of a booking that have been changed.
   *
   * The method checks for updates in various booking sections, including accommodations, transfers, activities (generics), and tours.
   * Returns a formatted string that lists the updated sections, if any changes are detected.
   *
   * @return {string} A formatted string listing the sections of the booking that have been updated, or an empty string if no changes are detected.
   */
  getBookingItemChanges(): string {
    let updates: string = '';
    if (this.getBookingAccommodationChanges() || this.isBookingAccommodationChanged) updates += `<br>Booking Accommodation Updated`;
    if (this.getBookingTransferContractChanges() || this.isBookingTransferChanged) updates += `<br>Booking Transfer Updated`;
    if (this.getBookingGenericsChanges() || this.isBookingGenericChanged) updates += `<br>Booking Activity Updated`;
    if (this.getBookingTourChanges() || this.isBookingTourChanged) updates += `<br>Booking Tour Updated`;

    // console.log('Final updates string:', updates);
    return updates;
  }

  //=====================================Check Discount Can be Applied or Not===============================================//
  /**
   * Checks if a discount can be applied based on the provided total amount and minimum acceptable value.
   * If the discount is greater than the total amount or below the minimum acceptable value, it shows a warning notification.
   *
   * @param {number} discount - The discount amount to be applied.
   * @param {number} minimumAcceptValue - The minimum total amount required to allow a discount to be applied.
   * @param {FormGroup} appliedFrom - The form group containing the controls for calculating the discount.
   * @param {string} totalAmountControl - The name of the control within the form group that holds the total amount value.
   * @return {boolean} Returns true if the discount can be applied; otherwise, returns false.
   */
  checkDiscountCanBeApplied(discount: number, minimumAcceptValue: number, appliedFrom: FormGroup, totalAmountControl: string): boolean {

    if (!this.isDisableContinuousChangeDetection) {
      const totalAmount = Number(appliedFrom.get(totalAmountControl)?.value);
      if (totalAmount < minimumAcceptValue || totalAmount < discount) {
        this.avNotificationService.showWarning("Warning : Discount Amount Cannot be Greater than Total Amount",{
          theme: "light",
        });
        appliedFrom.get('discountamount')?.reset();// This prevents loop

        return false;
      }

      return true;
    }

    return true;
  }

  //==============================================Fill Form===================================================//

  /**
   * Calculates the new balance after modifying items based on the net amount and total paid values from the form.
   * Updates the form with the recalculated balance.
   *
   * @return {number} The newly calculated balance value.
   */
  calculatedNewBalanceAfterModifyingItems(): number {
    const newBalance = this.bookingForm.get('netamount')?.value - this.bookingForm.get('totalpaid')?.value;
    this.bookingForm.patchValue({
      balance: newBalance.toFixed(2)
    })
    return newBalance;
  }

  /**
   * Fills the form with booking data. If the booking data is already complete, it processes
   * the existing data without making a server call. If the data is incomplete and modifications
   * are allowed, it retrieves the data from the server, processes it, and updates the form.
   *
   * @param {Booking} booking - The booking object containing details used to fill the form.
   * @return {void} This method does not return a value.
   */
  fillForm(booking: Booking): void {
    // Check if booking data is already complete
    if (this.isBookingDataComplete(booking)) {
      // Use existing booking data without server call
      this.processBookingData(booking);
      return;
    }
    if (this.isEnableBookingDataModify && !this.isDisableContinuousChangeDetection) {
      this.loadingService.showLoading("Please wait until fully data is loaded...");
      // Make server call only if booking data is incomplete/undefined
      this.dataSubscriber$.add(
        this.dataService.getDataObject<Booking>(ApiEndpoints.paths.bookingViews, booking.code).subscribe({
          next: (serverBooking) => {
            this.processBookingData(serverBooking);
          },
          error: (error) => {
            console.error("Error fetching booking code:", error.message);
          },
          complete: () => {
            this.loadingService.hideLoading();
          }
        })
      );
    }
  }

  /**
   * Determines whether all required booking data is complete.
   *
   * @param {Booking} booking - The booking object to be validated. It contains various properties such as user, booking status, accommodations, transfers, generics, tours, and passengers.
   * @return {boolean} Returns true if all required booking properties are defined; otherwise, false.
   */
  private isBookingDataComplete(booking: Booking): boolean {
    // Check if all required properties are defined
    return booking &&
      booking.user &&
      booking.bookingstatus &&
      booking.bookingaccommodations !== undefined &&
      booking.bookingtransfers !== undefined &&
      booking.bookinggenerics !== undefined &&
      booking.bookingtours !== undefined &&
      booking.bookingpassengers !== undefined;
  }

  /**
   * Processes booking data by synchronizing the properties and initializing necessary variables.
   *
   * @param {Booking} booking - The booking object containing data to be processed.
   * @return {void} This method does not return any value.
   */
  private processBookingData(booking: Booking): void {
    this.booking = JSON.parse(JSON.stringify(booking));
    this.oldBooking = JSON.parse(JSON.stringify(booking));
    // console.log(this.oldBooking + "Old Booking")
    // console.log(this.oldBooking.id + "Old Booking")

    this.booking.user = this.activeUsers.find(user => user.id === this.booking.user.id) ?? this.booking.user;
    this.booking.bookingstatus = this.bookingStatuses.find(status => status.id === this.booking.bookingstatus.id) ?? this.booking.bookingstatus;

    this.bookingAccommodations = this.booking.bookingaccommodations;
    this.storedBookingAccommodations = [...this.bookingAccommodations];
    this.oldBookingAccommodations = [...this.bookingAccommodations];

    this.bookingTransferContracts = this.booking.bookingtransfers;
    this.storedBookingTransferContracts = [...this.bookingTransferContracts];
    this.oldBookingTransferContracts = [...this.bookingTransferContracts];

    this.bookingGenerics = this.booking.bookinggenerics;
    this.storedBookingGenerics = [...this.bookingGenerics];
    this.oldBookingGenerics = [...this.booking.bookinggenerics]

    this.bookingTours = this.booking.bookingtours;
    this.storedBookingTours = [...this.bookingTours];
    this.oldBookingTours = [...this.booking.bookingtours]

    this.bookingPassengers = this.booking.bookingpassengers;

    this.bookingForm.patchValue(this.booking, {emitEvent: false});
    this.setMinDateForBookingDepartureAndEnd(this.booking.departuredate, this.booking.enddate);
    this.discountAmountForBooking = this.booking.discountamount;
    this.formValidationService.createForm(this.bookingForm, this.oldBooking, this.booking);
    this.bookingForm.markAsPristine();
  }

  //========================================================save===============================================//
  /**
   * Handles the saving of booking data from the booking form. It validates the form for errors, formats the data,
   * prompts for user confirmation, and performs the save operation on confirmation. Displays appropriate feedback
   * and handles responses or errors during the save process.
   *
   * @return {void} No return value.
   */
  save(): void {
    this.isDisableContinuousChangeDetection = true;
    const errors = this.formValidationService.getErrors(this.bookingForm);
    if (errors) {
      this.operationFeedbackService.showErrors("Booking", "Add", errors);
      return;
    }

    const toSaveBooking = this.getBookingData(this.bookingForm);
    const bookingData = this.operationFeedbackService.formatObjectData(toSaveBooking, ["code"]);

    this.operationFeedbackService.showConfirmation('Booking', 'Save', bookingData)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.save<Booking>(ApiEndpoints.paths.bookings, toSaveBooking).subscribe({
            next: (response) => {
              const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);
              if (status) {
                this.destroy$.next();
                this.destroy$.complete();
                this.resetAndReloadForms();
                this.lastSavedBookingCode = serverInfo;
                this.saveBookingPayment(this.lastSavedBookingCode);
              }
              this.operationFeedbackService.showStatus("Booking", "Save", responseMessage);
            },
            error: (error) => {
              const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
              this.operationFeedbackService.showErrors("Booking", "Save", responseMessage);
            }
          })
        }
      })
  }

  /**
   * Saves a booking payment corresponding to the provided booking code.
   * Retrieves booking information, processes the payment, and handles success or failure notifications.
   *
   * @param {string} bookingCode - The unique code of the booking for which the payment needs to be saved.
   *                                It is mandatory and should not be empty.
   * @return {void} Does not return any value.
   */
  saveBookingPayment(bookingCode: string): void {
    if (!bookingCode) {
      this.operationFeedbackService.showErrors("Booking Payment", "Save", "Booking code is required");
      return;
    }

    this.dataSubscriber$.add(
      this.dataService.getData<Booking>(ApiEndpoints.paths.bookingList).subscribe({
        next: (bookings) => {
          const booking = bookings.find(b => b.code === bookingCode);
          if (!booking) {
            this.operationFeedbackService.showErrors("Booking Payment", "Save", "Booking not found");
            return;
          }

          this.bookingDataShareService.sendBookingData(booking);
          this.customerPaymentDataShareService.triggerPaymentSave();

          this.dataSubscriber$.add(
            this.customerPaymentDataShareService.getPaymentSaveComplete().subscribe({
              next: (paymentSavedResponse) => {
                if (paymentSavedResponse && paymentSavedResponse.operation === 'success') {
                  this.avNotificationService.showSuccess(('Payment ' + paymentSavedResponse.data) || 'Payment saved successfully',{
                    theme: "light",
                  });
                  this.bookingDataShareService.clearBookingData();
                  this.resetAndReloadForms();
                } else {
                  this.avNotificationService.showFailure(('Payment ' + paymentSavedResponse.data) || "Payment save failed",{
                    theme: "light",
                  });
                  // this.failedPaymentBookingStatusUpdate(booking);
                }
              }
            })
          );
        },
        error: (error) => {
          this.operationFeedbackService.showErrors("Booking Payment", "Save", "Failed to load booking data");
        }
      })
    );
  }

  //=======================================================update=============================================//
  /**
   * Updates a booking based on the user-provided data in the booking form.
   * The method validates the form, collects any errors, and displays them if present.
   * If there are no errors, it gathers updated booking data, confirms the updates with the user,
   * and proceeds to call the backend service to update the booking.
   * Upon a successful update, it resets the forms, saves related payment information,
   * and displays the operation status. If an error occurs during the update process,
   * it handles and displays the error appropriately.
   *
   * @return {void} This method does not return any value.
   */
  update(): void {
    this.isDisableContinuousChangeDetection = true;
    const errors = this.formValidationService.getErrors(this.bookingForm);
    if (errors) {
      this.operationFeedbackService.showErrors('Booking', 'Update', errors);
      return;
    }

    const toUpdateBooking = this.getBookingData(this.bookingForm);
    toUpdateBooking.id = this.oldBooking.id;
    toUpdateBooking.totalpaid = this.extractedTotalPaidForBooking;
    // toUpdateBooking.balance += this.bookingForm.get('balance')?.value || this.oldBooking.balance;
    let updates = '';
    updates += this.formValidationService.getUpdates(this.bookingForm);
    updates += this.getBookingItemChanges();
    this.operationFeedbackService.showConfirmation('Booking', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) {
            return;
          }
          this.dataService.update<Booking>(ApiEndpoints.paths.bookings, toUpdateBooking)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.destroy$.next();
                  this.destroy$.complete();
                  this.resetAndReloadForms();
                  this.lastSavedBookingCode = serverInfo;
                  this.saveBookingPayment(this.lastSavedBookingCode);
                }
                this.operationFeedbackService.showStatus("Booking", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Booking", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  //============Generate Final Booing===============//
  /**
   * Processes the booking form data and constructs a Booking object by combining the form values
   * with existing booking data and associated properties.
   *
   * @param {FormGroup} bookingForm - The form group containing the booking-related information.
   * @return {Booking} - The processed booking data object, ready for server submission.
   */
  getBookingData(bookingForm: FormGroup): Booking {
    const formValues = bookingForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }

    // Create booking data with form values
    const bookingData = {
      ...this.booking, // Include original booking data (with id)
      ...formValues    // Override with form values
    };

    bookingData.bookingaccommodations = this.bookingAccommodations;
    bookingData.bookingtransfers = this.bookingTransferContracts;
    bookingData.bookingpassengers = this.bookingPassengers;
    bookingData.bookinggenerics = this.bookingGenerics;
    bookingData.bookingtours = this.bookingTours;

    // Remove read-only fields that server doesn't expect
    const {createdon, updatedon, customerpayments, ...cleanBookingData} = bookingData;

    console.log(cleanBookingData);
    return cleanBookingData;
  }

  //=====================================Make Payment===============================================================//
  /**
   * Initiates the payment process by preparing booking data and opening a payment dialog.
   *
   * If modifications to booking data are enabled, updates the balance based on modified items.
   * Validates that passengers are added before proceeding. Sends the prepared booking data
   * to the booking data share service. Finally, opens a payment dialog with specified configurations.
   *
   * @return {void} Does not return a value. Executes payment-related logic and updates the UI accordingly.
   */
  payment(): void {
    const booking = this.getBookingData(this.bookingForm);
    if (this.isEnableBookingDataModify) {
      booking.balance = this.calculatedNewBalanceAfterModifyingItems();
    }
    if (booking.bookingpassengers.length === 0) {
      this.operationFeedbackService.showMessage("Error", "Please add the passengers");
      return;
    }
    this.bookingDataShareService.sendBookingData(booking);

    setTimeout(() => {
      this.dialogRef = this.dialog.open(this.sharedPaymentContainer, {
        minWidth: '600px',
        maxWidth: '1200px',
        minHeight: '400px',
        maxHeight: '100vh',
        disableClose: true,
        panelClass: 'payment-dialog'
      });
    }, 200);
  }

  /**
   * Closes the payment dialog and updates the booking form with the latest payment data and status.
   *
   * @return {void} This method does not return any value.
   */
  closePaymentDialog(): void {
    this.closeModal();
    this.customerPayment = this.customerPaymentDataShareService.getCustomerPaymentData();
    if (this.customerPayment) {
      let totalPaidAmount = 0;
      if (this.isEnableBookingDataModify) {
        totalPaidAmount = this.bookingForm.get('netamount')?.value - this.customerPayment.balance;
        // console.log("Cus paid : " + this.customerPayment.paidamount);
        // console.log("totalPaidAmount : " + totalPaidAmount);

        // This is done because of in server side, recalculate total and balance for a booking
        this.extractedTotalPaidForBooking = totalPaidAmount - this.customerPayment.paidamount;
      } else {
        totalPaidAmount = this.customerPayment.paidamount; // ⭐⭐
      }
      this.bookingForm.patchValue({
        totalpaid: totalPaidAmount,
        balance: this.customerPayment.balance,
        bookingstatus: this.setBookingStatus(this.customerPayment.balance)
      });
    }
  }

  //============Automatically set Booking Status============================//
  /**
   * Updates and determines the booking status based on the given booking balance.
   *
   * @param {number} bookingBalance - The balance amount of the booking.
   * @return {BookingStatus} The determined booking status, either "Confirmed" or "Partially Confirmed".
   */
  setBookingStatus(bookingBalance: number): BookingStatus {
    // Find status objects and handle nulls properly
    const confirmed = this.bookingStatuses.find(status => status.name === 'Confirmed');
    const pending = this.bookingStatuses.find(status => status.name === 'Partially Confirmed');

    let bookingStatus!: BookingStatus;
    if (confirmed && pending) {
      if (bookingBalance < 0.00) {
        bookingStatus = pending;
      } else {
        bookingStatus = confirmed;
      }
    }

    return bookingStatus;
  }

  //=====================reset and reload forms and arrays==================================================//
  /**
   * Resets and reloads all forms and related data to their initial states.
   * This method will clear and reinitialize calculation values, reset forms,
   * and reload necessary data for bookings including accommodation, transfer, generic, and passenger details.
   * It ensures a fresh start for all forms and sets client and view-related properties to default.
   *
   * @return {void} Does not return a value.
   */
  resetAndReloadForms(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.isBookingAccommodationChanged = false;
    this.isBookingTransferChanged = false;
    this.isBookingGenericChanged = false;
    this.isBookingTourChanged = false;
    this.isEnableBookingDataModify = false;
    this.extractedTotalPaidForBooking = 0;
    this.initializeCalculationValues();
    this.clearCalculationCache();
    this.resetAndClearAccommodationBooking();
    this.resetAndClearTransferBooking();
    this.resetAndClearGenericBooking();
    this.loadClients();
    this.createView();
    this.bookingForm.reset();
    this.grossAmountForBooking = 0;
    this.discountAmountForBooking = 0;
    this.bookingPassengers = [];
    this.setDisplayView("main");
    this.isEnableClientSelectionView = false;
    this.selectedClient = null;
  }

  /**
   * Clears the booking form after user confirmation if specific form fields contain any value.
   *
   * If the form fields 'user' and 'code' do not have any values, a feedback message will be shown,
   * indicating that there is nothing to clear. Otherwise, a confirmation prompt will be displayed
   * to the user. If the user confirms, the form will be reset and reloaded.
   *
   * @return {void} This method does not return a value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.bookingForm, ['user', 'code']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Booking', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Booking', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) {
          return;
        }
        this.resetAndReloadForms();
      })
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

}
