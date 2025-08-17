import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatDivider} from "@angular/material/divider";
import {RoomType} from "../../../entity/room-type";
import {Subscription} from "rxjs";
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
import {Employee} from "../../../entity/employee";
import {NgClass} from "@angular/common";
import {MatPaginator} from "@angular/material/paginator";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {RoomFacility} from "../../../entity/room-facility";
import {PaxType} from "../../../entity/pax-type";
import {ResidentType} from "../../../entity/resident-type";
import {RateType} from "../../../entity/rate-type";
import {Currency} from "../../../entity/currency";
import {CancellationScheme} from "../../../entity/cancellation-scheme";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";

@Component({
  selector: 'app-setup-details',
  standalone: true,
  imports: [
    MatGridList,
    MatCard,
    MatCardContent,
    MatGridTile,
    MatCardHeader,
    MatCardTitle,
    MatTabGroup,
    MatTab,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatCardSubtitle,
    MatDivider,
    MatSuffix,
    ReactiveFormsModule,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCellDef,
    MatHeaderCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIconButton,
    NgClass,
    MatPaginator,
    MatNoDataRow
  ],
  templateUrl: './setup-details.component.html',
  styleUrl: './setup-details.component.css'
})
export class SetupDetailsComponent implements OnInit, OnDestroy {

  roomTypeColumns: string[] = ['id','name', 'action'];
  roomTypeHeaders: string[] = ['ID','Name', 'Action'];

  roomFacilityColumns: string[] = ['id','name', 'action'];
  roomFacilityHeaders: string[] = ['ID','Name', 'Action'];

  paxTypeColumns: string[] = ['id','name', 'action'];
  paxTypeHeaders: string[] = ['ID','Name', 'Action'];

  residentTypeColumns: string[] = ['id','name', 'action'];
  residentTypeHeaders: string[] = ['ID','Name', 'Action'];

  rateTypeColumns: string[] = ['id','name', 'action'];
  rateTypeHeaders: string[] = ['ID','Name', 'Action'];

  currencyColumns: string[] = ['id','name', 'action'];
  currencyHeaders: string[] = ['ID','Name', 'Action'];

  cancellationSchemeColumns: string[] = ['id','name', 'action'];
  cancellationSchemeHeaders: string[] = ['ID','Name', 'Action'];

  breadcrumb: any;
  selectedRow: any;
  isUpdate: boolean = false;

  roomTypeForm!: FormGroup;
  roomFacilityForm!: FormGroup;
  paxTypeForm!: FormGroup;
  rateTypeForm!: FormGroup;
  residentTypeForm!: FormGroup;
  currencyTypeForm!: FormGroup;
  cancellationSchemeForm!: FormGroup;

  enableAddBtns = {
    roomType: true,
    roomFacility: true,
    paxType: true,
    rateType: true,
    residentType: true,
    currencyType: true,
    cancellationScheme: true,
  };

  enableForms = {
    roomType: false,
    roomFacility: false,
    paxType: false,
    rateType: false,
    residentType: false,
    currencyType: false,
    cancellationScheme: false,
  };

  dataSubscriber$ : Subscription = new Subscription();

  roomType!: RoomType;
  oldRoomType!: RoomType;
  roomTypes: Array<RoomType> = [];
  roomTypesData!: MatTableDataSource<RoomType>;
  @ViewChild('roomTypePaginator', { static: false }) roomTypePaginator!: MatPaginator;

  roomFacility!: RoomFacility;
  oldRoomFacility!: RoomFacility;
  roomFacilities: Array<RoomFacility> = [];
  roomFacilitiesData!: MatTableDataSource<RoomFacility>;
  @ViewChild('roomFacilityPaginator', { static: false }) roomFacilityPaginator!: MatPaginator;

  paxType!: PaxType;
  oldPaxType!: PaxType;
  paxTypes: Array<PaxType> = [];
  paxTypeData!: MatTableDataSource<PaxType>;
  @ViewChild('paxTypePaginator', { static: false } ) paxTypePaginator!: MatPaginator;

  residentType!: ResidentType;
  oldResidentType!: ResidentType;
  residentTypes: Array<ResidentType> = [];
  residentTypeData!: MatTableDataSource<ResidentType>;
  @ViewChild('residentTypePaginator', { static: false } ) residentTypePaginator!: MatPaginator;

  rateType!: RateType;
  oldRateType!: RateType;
  rateTypes: Array<RateType> = [];
  rateTypeData!: MatTableDataSource<RateType>;
  @ViewChild('rateTypePaginator', { static: false } ) rateTypePaginator!: MatPaginator;

  currency!: Currency;
  oldCurrency!: Currency;
  currencies: Array<Currency> = [];
  currencyData!: MatTableDataSource<Currency>;
  @ViewChild('currencyPaginator', { static: false } ) currencyPaginator!: MatPaginator;

  cancellationScheme!: CancellationScheme;
  oldCancellationScheme!: CancellationScheme;
  cancellationSchemes: Array<CancellationScheme> = [];
  cancellationSchemeData!: MatTableDataSource<CancellationScheme>;
  @ViewChild('cancellationSchemePaginator', { static: false } ) cancellationSchemePaginator!: MatPaginator;

  constructor(
    private breadcrumbService: BreadcrumbService,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
  ) {

    this.roomTypeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.roomFacilityForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.paxTypeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.rateTypeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.residentTypeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.currencyTypeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
    this.cancellationSchemeForm = this.formBuilder.group({name: new FormControl('', [Validators.required]),});
  }

  ngOnInit(): void {
    this.initialize();
  }

  /**
   * Initializes the component by setting up the breadcrumb data from the active route
   * and preloading all necessary data.
   *
   * @return {void} Does not return a value.
   */
  initialize(): void {
    this.breadcrumb = this.breadcrumbService.getActiveRoute();
    this.loadAllData();
  }

  /**
   * Loads all the necessary data required by the application, including room types, facilities, passenger types, resident types, rate types, currency information, and cancellation schemes.
   *
   * @return {void} No return value.
   */
  loadAllData(): void{
    this.loadRoomTypes();
    this.loadFacilities();
    this.loadPaxTypes();
    this.loadResidentTypes();
    this.loadRateTypes();
    this.loadCurrency();
    this.loadCancellationScheme();
  }

  /**
   * Loads room types data from the data service and sets up the table data source and pagination.
   * Handles fetched data, error, and completion states of the subscription.
   *
   * @return {void} No return value.
   */
  loadRoomTypes(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<RoomType>(ApiEndpoints.paths.roomTypes).subscribe({
        next: (roomTypes) => {
          this.roomTypes = roomTypes;
        },
        error: (error) => {
          console.log("Error fetching room types : ", error.getMessage());
        },
        complete: (() => {
          this.roomTypesData = new MatTableDataSource(this.roomTypes);
          this.roomTypesData.paginator = this.roomTypePaginator;
        })
      })
    )
  }

  /**
   * Loads the room facilities data from the API and assigns it to a data source for display.
   * Handles success, error, and completion states of the observable for loading facilities.
   *
   * @return {void} This method does not return any value.
   */
  loadFacilities(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<RoomFacility>(ApiEndpoints.paths.roomFacilities).subscribe({
        next: (roomFacilities) => {
          this.roomFacilities = roomFacilities;
        },
        error: (error) => {
          console.log("Error fetching room facilities : ", error.getMessage());
        },
        complete: (() => {
          this.roomFacilitiesData = new MatTableDataSource(this.roomFacilities);
          this.roomFacilitiesData.paginator = this.roomFacilityPaginator;
        })
      })
    )
  }

  /**
   * Loads passenger types (pax types) from the data service and initializes the data table.
   * The method fetches data asynchronously, updates the paxTypes property, and sets up the paginator for the material table.
   *
   * @return {void} This method does not return a value.
   */
  loadPaxTypes(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<PaxType>(ApiEndpoints.paths.paxTypes).subscribe({
        next: (paxTypes) => {
          this.paxTypes = paxTypes;
        },
        error: (error) => {
          console.log("Error fetching pax types : ", error.getMessage());
        },
        complete: (() => {
          this.paxTypeData = new MatTableDataSource(this.paxTypes);
          this.paxTypeData.paginator = this.paxTypePaginator;
        })
      })
    )
  }

  /**
   * Fetches and loads the resident types data from the specified API endpoint.
   * Subscribes to the data service to retrieve the resident types, handles errors if they occur,
   * and initializes the resident types data source with a paginator for display.
   *
   * @return {void} This method does not return a value.
   */
  loadResidentTypes(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<ResidentType>(ApiEndpoints.paths.residentTypes).subscribe({
        next: (residentTypes) => {
          this.residentTypes = residentTypes;
        },
        error: (error) => {
          console.log("Error fetching resident types : ", error.getMessage());
        },
        complete: (() => {
          this.residentTypeData = new MatTableDataSource(this.residentTypes);
          this.residentTypeData.paginator = this.residentTypePaginator;
        })
      })
    )
  }

  /**
   * Fetches and loads the rate types data from the API, updates the local rate types array,
   * and initializes the data source and paginator for displaying the rate types in a table.
   *
   * @return {void} This method does not return a value.
   */
  loadRateTypes(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<RateType>(ApiEndpoints.paths.rateTypes).subscribe({
        next: (rateTypes) => {
          this.rateTypes = rateTypes;
        },
        error: (error) => {
          console.log("Error fetching rate types : ", error.getMessage());
        },
        complete: (() => {
          this.rateTypeData = new MatTableDataSource(this.rateTypes);
          this.rateTypeData.paginator = this.rateTypePaginator;
        })
      })
    )
  }

  /**
   * Loads the currency data by subscribing to the data service and initializes the data source for currency-related operations.
   * Handles errors during data retrieval and sets up the paginator for displaying the data.
   *
   * @return {void} This method does not return any value.
   */
  loadCurrency(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<Currency>(ApiEndpoints.paths.currencies).subscribe({
        next: (currencies) => {
          this.currencies = currencies;
        },
        error: (error) => {
          console.log("Error fetching currencies : ", error.getMessage());
        },
        complete: (() => {
          this.currencyData = new MatTableDataSource(this.currencies);
          this.currencyData.paginator = this.currencyPaginator;
        })
      })
    )
  }

  /**
   * Loads and processes the cancellation schemes data by subscribing to the dataService.
   * Populates the cancellation schemes table data source and associates the paginator.
   * Logs any errors encountered during data retrieval.
   *
   * @return {void} No return value as the method performs its operation internally.
   */
  loadCancellationScheme(): void {
    this.dataSubscriber$.add(
      this.dataService.getData<CancellationScheme>(ApiEndpoints.paths.cancellationSchemes).subscribe({
        next: (cancellationSchemes) => {
          this.cancellationSchemes = cancellationSchemes;
        },
        error: (error) => {
          console.log("Error fetching cancellationSchemes : ", error.getMessage());
        },
        complete: (() => {
          this.cancellationSchemeData = new MatTableDataSource(this.cancellationSchemes);
          this.cancellationSchemeData.paginator = this.cancellationSchemePaginator;
        })
      })
    )
  }

  /**
   * Reloads data based on the specified type.
   *
   * @param {('roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes')} data - The type of data to reload. Valid values include:
   * - 'roomType': Loads room types.
   * - 'roomFacilities': Loads room facilities.
   * - 'paxTypes': Loads types of passengers (pax types).
   * - 'residentTypes': Loads resident types.
   * - 'rateTypes': Loads rate types.
   * - 'currencies': Loads supported currencies.
   * - 'cancellationSchemes': Loads cancellation schemes.
   *
   * @return {void} No return value.
   */
  reloadData(data: 'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes'): void {
    data === 'roomType' ? this.loadRoomTypes() :
      data === 'roomFacilities' ? this.loadFacilities() :
        data === 'paxTypes' ? this.loadPaxTypes() :
          data === 'residentTypes' ? this.loadResidentTypes() :
            data === 'rateTypes' ? this.loadRateTypes() :
              data === 'currencies' ? this.loadCurrency() :
                data === 'cancellationSchemes' ? this.loadCancellationScheme() : this.loadAllData();
  }

  /**
   * Sets the selected row to the provided Employee object.
   *
   * @param {Employee} element - The Employee object to select as the current row.
   * @return {void} This method does not return a value.
   */
  selectRow(element: Employee): void {
    this.selectedRow = element;
  }

  //==========================================Generic Setup UI Methods================================================//
  /**
   * Toggles the state of a form and its corresponding button.
   *
   * @param {keyof typeof this.enableForms} type - The type of the form to be toggled.
   * @param {boolean} isOpen - A boolean indicating whether the form should be open or closed.
   * @return {void} Does not return a value.
   */
  toggleForm(type: keyof typeof this.enableForms, isOpen: boolean): void {
    this.enableForms[type] = isOpen;
    this.enableAddBtns[type] = !isOpen;
  }

  /**
   * Adds a new form of the specified type and enables it.
   *
   * @param {keyof typeof this.enableForms} type - The type of form to be added and enabled.
   * @return {void} No return value.
   */
  addNew(type: keyof typeof this.enableForms): void {
    this.toggleForm(type, true);
  }

  /**
   * Closes the specified form, resets it, and updates the relevant state.
   *
   * @param {keyof typeof this.enableForms} type - The type of form to close.
   * @return {void} This method does not return a value.
   */
  close(type: keyof typeof this.enableForms): void {
    this.toggleForm(type, false);
    this[`${type}Form`].reset();
    this.isUpdate = false;
  }

  //=======================================Generic CRUD & Fill Method=================================================//
  /**
   * Saves the setup details provided in the form after performing validation and user confirmation.
   *
   * @param {FormGroup} form - The form containing the setup details to be saved.
   * @param {T} savedData - The object where the data from the form will be stored after validation.
   * @param {string} dataType - A description of the data being saved (e.g., "Room Type", "Currency").
   * @param {string} displayValue - The key or value in the data to be displayed to the user for confirmation.
   * @param {string} endPoint - The API endpoint where the data will be sent for saving.
   * @param {'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes'} refreshData - The type of data to reload after a successful save.
   * @param {keyof typeof this.enableForms} closeType - Specifies the form that should be closed upon successful save.
   * @return {void} This method does not return a value but performs operations such as validation, data submission, and form handling.
   */
  saveSetupDetails<T>(form: FormGroup, savedData: T, dataType: string, displayValue: string, endPoint: string, refreshData: 'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes' , closeType: keyof typeof this.enableForms ): void {

    const formData = form.value;
    if (formData.name === undefined || formData.name === null || formData.name === '') {
      this.operationFeedbackService.showMessage(`${dataType} Save`, 'Nothing to save...!')
      return;
    }

    const errors = this.formValidationService.getErrors(form);
    if (errors) {
      this.operationFeedbackService.showErrors(dataType, "Save", errors);
      return;
    }

    savedData = formData;
    const formattedData = this.operationFeedbackService.formatObjectData(savedData, [displayValue]);

    this.operationFeedbackService.showConfirmation(dataType, "Save", formattedData)
      .subscribe({
        next: (isConfirmed: boolean) => {
          if (!isConfirmed) return;

          this.dataService.save<T>(endPoint, savedData)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);
                if (status){
                  this.reloadData(refreshData);
                  form.reset();
                  this.close(closeType);
                }
                this.operationFeedbackService.showStatus(dataType, "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors(dataType , "Save", responseMessage)
              }
            })
        }
      })
  }

  /**
   * Updates the setup details for a specified entity and performs associated operations.
   *
   * @param {FormGroup} form - The reactive form containing the input data.
   * @param {T} savedData - The object holding updated values to be persisted.
   * @param {T} oldData - The object holding existing values before an update.
   * @param {string} dataType - The type of data being updated (e.g., room type, facilities).
   * @param {string} displayValue - The key to display the data in a formatted way.
   * @param {string} endPoint - The API endpoint where the update request will be sent.
   * @param {'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes'} refreshData - The specific data type to refresh after the update.
   * @param {keyof typeof this.enableForms} closeType - The property to determine the form closure behavior.
   * @return {void} This method does not return any value.
   */
  updateSetupDetails<T>(form: FormGroup, savedData: T, oldData: T, dataType: string, displayValue: string, endPoint: string, refreshData: 'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes' , closeType: keyof typeof this.enableForms ): void {
    if (this.isUpdate) {
      const formData = form.value;

      //@ts-ignore
      if (oldData.name === formData.name || formData.name === null || formData.name === '') {
        this.operationFeedbackService.showMessage(`${dataType} update`, 'Nothing to update...!')
        return;
      }
      const errors = this.formValidationService.getErrors(form);
      if (errors) {
        this.operationFeedbackService.showErrors(dataType, "Update", errors);
        return;
      }

      //@ts-ignore
      savedData = {...formData, id: oldData?.id};
      const formattedData = this.operationFeedbackService.formatObjectData(savedData, [displayValue]);

      this.operationFeedbackService.showConfirmation(dataType, "Update", formattedData)
        .subscribe({
          next: (isConfirmed: boolean) => {
            if (!isConfirmed) return;

            this.dataService.update<T>(endPoint, savedData)
              .subscribe({
                next: (response) => {
                  const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);
                  if (status) {
                    this.reloadData(refreshData);
                    form.reset();
                    this.close(closeType);
                  }
                  this.operationFeedbackService.showStatus(dataType, "Update", responseMessage + " : " + serverInfo);
                },
                error: (error) => {
                  const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                  this.operationFeedbackService.showErrors(dataType, "Update", responseMessage)
                }
              })
          }
        })
    }
  }

  /**
   * Deletes the setup details for a specific type and refreshes associated data.
   *
   * @param {T} deletedData - The data object that needs to be deleted.
   * @param {T} deletedDataType - The type of data object being deleted.
   * @param {string} dataType - A string representing the category of the data being processed.
   * @param {string} displayValue - A key or property for the data object, used in feedback or display contexts.
   * @param {string} endPoint - API endpoint where the delete request will be sent.
   * @param {'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes'} refreshData - Key specifying which data set should be refreshed upon successful deletion.
   * @return {void} No return value as this method handles its operations asynchronously.
   */
  deleteSetupDetails<T>(deletedData: T, deletedDataType: T, dataType: string, displayValue: string, endPoint: string, refreshData: 'roomType' | 'roomFacilities' | 'paxTypes' | 'residentTypes' | 'rateTypes' | 'currencies' | 'cancellationSchemes'): void {
    deletedDataType = deletedData;
    const formatedData  = this.operationFeedbackService.formatObjectData(deletedDataType, [displayValue]);
    this.operationFeedbackService.showConfirmation(dataType, 'Delete', formatedData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          //@ts-ignore
          this.dataService.delete(endPoint, deletedDataType?.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.reloadData(refreshData);
                }
                this.operationFeedbackService.showStatus(dataType, "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors(dataType, 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Populates setup details into the provided form and handles any necessary updates.
   *
   * @param {T} element - The source data element to populate the form with.
   * @param {FormGroup} form - The FormGroup object to be updated with the data.
   * @param {T} data - The object where data will be cloned and used.
   * @param {keyof typeof this.enableForms} formType - Specifies the form type for enabling or handling form-specific logic.
   * @return {void} Does not return any value.
   */
  fillSetupDetails<T>(element: T, form: FormGroup, data: T, formType: keyof typeof this.enableForms): void {
    this.isUpdate = true;
    data = JSON.parse(JSON.stringify(element));
    //@ts-ignore
    form.patchValue(data);
    this.addNew(formType);
  }

  //=======================================Generic Filter Table=================================================//
  /**
   * Filters the data in a Material Table DataSource based on an input event's value.
   * Updates the dataSource's filter predicate and applies the filter.
   *
   * @param {Event} event - The input event containing the filter value.
   * @param {MatTableDataSource<T>} dataSource - The table data source to be filtered.
   * @return {void} This method does not return any value.
   */
  filterTabel<T>(event: Event, dataSource: MatTableDataSource<T>): void{
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    dataSource.filterPredicate = (data : T, filter: string) => {
      return (
        filterValue == null ||
        // @ts-ignore
        data['name']?.toLowerCase().includes(filterValue))
    };
    dataSource.filter = filterValue;
  }

  //===============================================Room Type==========================================================//
  /**
   * Saves the room type details by validating and sending them to the specified API endpoint.
   *
   * The method uses the provided form and model to send data to the backend. It also includes
   * specific configuration values such as the name of the entity and the endpoint path for room types.
   *
   * @return {void} This method does not return any value.
   */
  saveRoomType(): void {
    this.saveSetupDetails<RoomType>(this.roomTypeForm, this.roomType, "Room Type", "name", ApiEndpoints.paths.roomTypes, "roomType", "roomType");
  }

  /**
   * Updates the room type information based on the form input and existing details.
   * It synchronizes the current room type data with the specified API endpoint.
   *
   * @return {void} This method does not return a value.
   */
  updateRoomType(): void {
    this.updateSetupDetails<RoomType>(this.roomTypeForm, this.roomType, this.oldRoomType, "Room Type", "name", ApiEndpoints.paths.roomTypes, "roomType", "roomType");
  }

  /**
   * Deletes a specified room type from the list of available room types.
   *
   * @param {RoomType} element - The room type object that needs to be deleted.
   * @return {void} No return value.
   */
  deleteRoomType(element: RoomType): void {
    this.deleteSetupDetails<RoomType>(element, this.roomType, "Room Type", "name", ApiEndpoints.paths.roomTypes, "roomType");
  }

  //=================================================Room Facility====================================================//
  /**
   * Saves the room facility details by invoking the saveSetupDetails method with appropriate parameters.
   * This function handles the submission and saving of room facility data.
   *
   * @return {void} Does not return a value.
   */
  saveRoomFacility(): void {
    this.saveSetupDetails<RoomFacility>(this.roomFacilityForm, this.roomFacility, "Room Facility", "name", ApiEndpoints.paths.roomFacilities, "roomFacilities", "roomFacility");
  }

  /**
   * Deletes a specified room facility from the system.
   *
   * @param {RoomFacility} element - The room facility instance to be deleted.
   * @return {void} This method does not return a value.
   */
  deleteRoomFacility(element: RoomFacility): void {
    this.deleteSetupDetails<RoomFacility>(element, this.roomFacility, "Room Facility", "name", ApiEndpoints.paths.roomFacilities, "roomFacilities");
  }

  /**
   * Updates the room facility details by sending the updated information to the specified API endpoint.
   * It ensures that the modifications in the form are reflected in the room facility being updated.
   *
   * @return {void} Does not return a value.
   */
  updateRoomFacility(): void {
    this.updateSetupDetails<RoomFacility>(this.roomFacilityForm, this.roomFacility, this.oldRoomFacility, "Room Facility", "name", ApiEndpoints.paths.roomFacilities, "roomFacilities", "roomFacility");
  }

  //==================================================Pax Types=======================================================//
  /**
   * Saves the passenger type (Pax Type) details using the provided form and setup configuration.
   * This method invokes the saveSetupDetails function with relevant parameters to handle the save operation.
   *
   * @return {void} Does not return any value.
   */
  savePaxType(): void {
    this.saveSetupDetails<PaxType>(this.paxTypeForm, this.paxType, "Pax Type", "name", ApiEndpoints.paths.paxTypes, "paxTypes", "paxType");
  }

  /**
   * Updates the passenger type configuration details based on the provided form and current state.
   * Utilizes the `updateSetupDetails` method for applying updates and manages the associated API endpoint.
   *
   * @return {void} This method does not return any value.
   */
  updatePaxType(): void {
    this.updateSetupDetails<PaxType>(this.paxTypeForm, this.paxType, this.oldPaxType, "Pax Type", "name", ApiEndpoints.paths.paxTypes, "paxTypes", "paxType");
  }

  /**
   * Deletes a specific passenger type (PaxType) from the system.
   *
   * @param {PaxType} element - The PaxType object to be deleted.
   * @return {void} Does not return a value.
   */
  deletePaxType(element: PaxType): void {
    this.deleteSetupDetails<PaxType>(element, this.paxType, "Pax Type", "name", ApiEndpoints.paths.paxTypes, "paxTypes");
  }

  //====================================================Resident Types================================================//
  /**
   * Saves the resident type information by processing form data and invoking the necessary API endpoint.
   *
   * @return {void} Does not return any value.
   */
  saveResidentType(): void {
    this.saveSetupDetails<ResidentType>(this.residentTypeForm, this.residentType, "Resident Type", "name", ApiEndpoints.paths.residentTypes, "residentTypes", "residentType");
  }

  /**
   * Updates the resident type by synchronizing the current form values with the existing resident type data.
   * This method ensures that the necessary setup details are updated consistently and saved via the appropriate API endpoint.
   *
   * @return {void} Does not return a value.
   */
  updateResidentType(): void {
    this.updateSetupDetails<ResidentType>(this.residentTypeForm, this.residentType, this.oldResidentType, "Resident Type", "name", ApiEndpoints.paths.residentTypes, "residentTypes", "residentType");
  }

  /**
   * Deletes a specified resident type.
   *
   * @param {ResidentType} element - The resident type object to be deleted.
   * @return {void} Does not return a value.
   */
  deleteResidentType(element: ResidentType): void {
    this.deleteSetupDetails<ResidentType>(element, this.paxType, "Resident Type", "name", ApiEndpoints.paths.residentTypes, "residentTypes");
  }

  //====================================================Rate Types====================================================//
  /**
   * Saves the rate type details by validating the associated form, mapping the data,
   * and making an API call to persist the information. It updates the required properties
   * and optionally handles additional setup for persistence.
   *
   * @return {void} Does not return any value.
   */
  saveRateType(): void {
    this.saveSetupDetails<RateType>(this.rateTypeForm, this.rateType, "Rate Type", "name", ApiEndpoints.paths.rateTypes, "rateTypes", "rateType");
  }

  /**
   * Updates the rate type by synchronizing the form data with the current state and API endpoint.
   * The method ensures the necessary details are updated and interacts with the specified API endpoint.
   *
   * @return {void} This method does not return a value.
   */
  updateRateType(): void {
    this.updateSetupDetails<RateType>(this.rateTypeForm, this.rateType, this.oldRateType, "Rate Type", "name", ApiEndpoints.paths.rateTypes, "rateTypes", "rateType");
  }

  /**
   * Deletes a specified rate type from the system.
   *
   * @param {RateType} element - The rate type object to be deleted, which includes relevant details for removal.
   * @return {void} This method does not return a value.
   */
  deleteRateType(element: RateType): void {
    this.deleteSetupDetails<RateType>(element, this.rateType, "Rate Type", "name", ApiEndpoints.paths.rateTypes, "rateTypes");
  }

  //========================================================Currency==================================================//
  /**
   * Saves the currency details using the provided form, entity, and endpoint configurations.
   * The method handles the setup process for currency data, including managing API endpoints
   * and associated configuration keys.
   *
   * @return {void} This method does not return a value.
   */
  saveCurrency(): void {
    this.saveSetupDetails<Currency>(this.currencyTypeForm, this.currency, "Currency", "name", ApiEndpoints.paths.currencies, "currencies", "currencyType");
  }

  /**
   * Updates the currency information based on the provided form and relevant details.
   *
   * This method is primarily responsible for synchronizing the updated currency data
   * and ensuring that the new settings are applied correctly.
   *
   * @return {void} Does not return any value.
   */
  updateCurrency(): void {
    this.updateSetupDetails<Currency>(this.currencyTypeForm, this.currency, this.oldCurrency, "Currency", "name", ApiEndpoints.paths.currencies, "currencies", "currencyType");
  }

  /**
   * Deletes a specified currency from the system.
   *
   * @param {Currency} element - The currency object to be deleted.
   * @return {void} This method does not return a value.
   */
  deleteCurrency(element: Currency): void {
    this.deleteSetupDetails<Currency>(element, this.currency, "Currency", "name", ApiEndpoints.paths.currencies, "currencies");
  }

  //====================================================Cancellation Scheme===========================================//
  /**
   * Saves the cancellation scheme using the provided form and configuration details.
   *
   * This method processes the cancellation scheme form, validates the inputs,
   * and sends the data to the appropriate API endpoint to save or update the
   * cancellation scheme in the system.
   *
   * @return {void} Does not return a value.
   */
  saveCancellationScheme(): void {
    this.saveSetupDetails<CancellationScheme>(this.cancellationSchemeForm, this.cancellationScheme, "cancellation Scheme", "name", ApiEndpoints.paths.cancellationSchemes, "cancellationSchemes", "cancellationScheme");
  }

  /**
   * Updates the cancellation scheme by synchronizing the form data with the setup details.
   * This method compares the current and old cancellation scheme data, identifies changes,
   * and updates the corresponding fields and API endpoints accordingly.
   *
   * @return {void} Does not return a value.
   */
  updateCancellationScheme(): void {
    this.updateSetupDetails<CancellationScheme>(this.cancellationSchemeForm, this.cancellationScheme, this.oldCancellationScheme, "cancellation Scheme", "name", ApiEndpoints.paths.cancellationSchemes, "cancellationSchemes", "cancellationScheme");
  }

  /**
   * Deletes a specified cancellation scheme by removing its associated setup details.
   *
   * @param {CancellationScheme} element - The cancellation scheme object to be deleted.
   * @return {void} This method does not return a value.
   */
  deleteCancellationScheme(element: CancellationScheme): void {
    this.deleteSetupDetails<CancellationScheme>(element, this.cancellationScheme, "cancellation Scheme", "name", ApiEndpoints.paths.cancellationSchemes, "cancellationSchemes");
  }

  //=================================================Filter Tables====================================================//
  /**
   * Filters room types based on the specified event.
   *
   * @param {Event} event - The event object that triggers the filtering of room types.
   * @return {void} This method does not return a value.
   */
  filterRoomTypes(event: Event): void {
    this.filterTabel<RoomType>(event, this.roomTypesData);
  }

  /**
   * Filters the room facility data based on the provided event.
   *
   * @param {Event} event - The event triggering the filter operation, typically containing filter criteria.
   * @return {void} This method does not return a value.
   */
  filterRoomFacility(event: Event): void {
    this.filterTabel<RoomFacility>(event, this.roomFacilitiesData);
  }

  /**
   * Filters the PaxType data based on the provided event and updates the relevant data table.
   *
   * @param {Event} event - The event object that triggers the filtering process.
   * @return {void} - This method does not return a value.
   */
  filterPaxType(event: Event): void {
    this.filterTabel<PaxType>(event, this.paxTypeData);
  }

  /**
   * Filters the resident type data based on the given event.
   *
   * @param {Event} event - The event object used to trigger the filtering.
   * @return {void} This method does not return any value.
   */
  filterResidentType(event: Event): void {
    this.filterTabel<ResidentType>(event, this.residentTypeData);
  }

  /**
   * Filters the rate type based on the provided event.
   *
   * @param {Event} event - The event object that triggers the filtering action.
   * @return {void} This method does not return a value.
   */
  filterRateType(event: Event): void {
    this.filterTabel<RateType>(event, this.rateTypeData);
  }

  /**
   * Filters the currency data based on the specified event.
   *
   * @param {Event} event - The event that triggers the currency filtering operation.
   * @return {void} This method does not return a value.
   */
  filterCurrency(event: Event): void {
    this.filterTabel<Currency>(event, this.currencyData);
  }

  /**
   * Filters the cancellation scheme data based on the provided event.
   *
   * @param {Event} event - The event object containing criteria for filtering the cancellation scheme.
   * @return {void} No return value.
   */
  filterCancellationScheme(event: Event): void {
    this.filterTabel<CancellationScheme>(event, this.cancellationSchemeData)
  }

  //====================================================Fill Forms====================================================//
  /**
   * Fills the room type form with the provided RoomType data.
   *
   * @param {RoomType} element - The RoomType object containing the data to fill the form with.
   * @return {void} This method does not return a value.
   */
  fillRoomType(element: RoomType): void {
    this.oldRoomType = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<RoomType>(element, this.roomTypeForm, this.roomType, 'roomType');
  }

  /**
   * Populates the room facility form and its details with the provided room facility data.
   *
   * @param {RoomFacility} element - The room facility object containing data to be filled into the form.
   * @return {void} This method does not return a value.
   */
  fillRoomFacility(element: RoomFacility): void {
    this.oldRoomFacility = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<RoomFacility>(element, this.roomFacilityForm, this.roomFacility, 'roomFacility');
  }

  /**
   * Populates the PaxType form and setup details with the provided PaxType data.
   *
   * @param {PaxType} element The PaxType object containing the data to fill.
   * @return {void} Does not return a value.
   */
  fillPaxType(element: PaxType): void {
    this.oldPaxType = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<PaxType>(element, this.paxTypeForm, this.paxType, 'paxType');
  }

  /**
   * Fills the resident type form with the provided ResidentType element and setup the details.
   *
   * @param {ResidentType} element - The ResidentType object used to populate the form and details.
   * @return {void} Does not return a value.
   */
  fillResidentType(element: ResidentType): void {
    this.oldResidentType = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<ResidentType>(element, this.residentTypeForm, this.residentType, 'residentType');
  }

  /**
   * Populates the RateType data into the corresponding form and setup details.
   *
   * @param {RateType} element - The RateType object to be populated into the form and setup details.
   * @return {void} Does not return a value.
   */
  fillRateType(element: RateType): void {
    this.oldRateType = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<RateType>(element, this.rateTypeForm, this.rateType, 'rateType');
  }

  /**
   * Populates the currency-related details in the corresponding form and data structures.
   *
   * @param {Currency} element - The currency object containing details to be filled.
   * @return {void} Does not return any value.
   */
  fillCurrency(element: Currency): void {
    this.oldCurrency = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<Currency>(element, this.currencyTypeForm, this.currency, 'currencyType');
  }

  /**
   * Populates the cancellation scheme form and sets up details based on the provided scheme element.
   * @param {CancellationScheme} element - The cancellation scheme data to be filled into the form and used for setup.
   * @return {void} - This method does not return any value.
   */
  fillCancellationScheme(element: CancellationScheme): void {
    this.oldCancellationScheme = JSON.parse(JSON.stringify(element));
    this.fillSetupDetails<CancellationScheme>(element, this.cancellationSchemeForm, this.cancellationScheme, 'cancellationScheme');
  }

  ngOnDestroy(): void{
    this.dataSubscriber$.unsubscribe();
  }
}
