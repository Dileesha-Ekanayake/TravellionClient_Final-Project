import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {Province} from "../../../entity/province";
import {District} from "../../../entity/district";
import {Airport} from "../../../entity/airport";
import {Port} from "../../../entity/port";
import {City} from "../../../entity/city";
import {Observable, Subscription} from "rxjs";
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
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker,
  MatEndDate,
  MatStartDate
} from "@angular/material/datepicker";
import {MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {User} from "../../../entity/user";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AvDataTable} from "@avoraui/av-data-table";
import {AvFilePicker} from "@avoraui/av-file-picker";

@Component({
  selector: 'app-city',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    DetailViewComponent,
    FormsModule,
    MatButton,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatDateRangeInput,
    MatDateRangePicker,
    MatDatepickerToggle,
    MatEndDate,
    MatFormField,
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
    MatColumnDef,
    MatHeaderCellDef,
    MatNoDataRow,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvDataTable,
    AvFilePicker
  ],
  templateUrl: './city.component.html',
  standalone: true,
  styleUrl: './city.component.css'
})
export class CityComponent implements OnInit, OnDestroy {

  columns: string[] = ['photo', 'code', 'name', 'modify/view'];
  headers: string[] = ['Photo', 'Code', 'Name', 'Modify / View'];

  columnsDetails: string[] = ['photo', 'name'];
  headersDetails: string[] = ['Photo', 'Name'];

  airPortTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Code', align: 'left' },
    { label: 'Name', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  airPortTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'code', align: 'left' ,color : '#3182ce'},
    { field: 'name', align: 'left' }
  ];

  portTableHeaders: { label: string; align: 'left' | 'center' | 'right' }[] = [
    { label: 'Code', align: 'left' },
    { label: 'Name', align: 'left' },
    { label: 'Action', align: 'center' }
  ];

  portTableColumns : { field: string; align: 'left' | 'center' | 'right' , color?: string }[] = [
    { field: 'code', align: 'left' ,color : '#3182ce'},
    { field: 'name', align: 'left' }
  ];

  breadCrumbs: any;

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

  enableForm: boolean = false;
  enableDetailView: boolean = false;
  enableRecordView: boolean = false;

  isLinear = false;
  blinkButton: boolean = false;
  pdfDtls: boolean = true;

  filterFields: Array<string> = []
  isSearchFiledInput: boolean = false;
  isSearchFiledSelect: boolean = false;
  isSearchFiledDate: boolean = false;
  searchSelectOptions: Array<any> = [];

  cityCodeQuery!: URLSearchParams;
  searchQuery!: URLSearchParams;

  cityForm!: FormGroup;
  airportForm!: FormGroup;
  portForm!: FormGroup;
  serverSearchForm!: FormGroup;

  isCityInfor: boolean = false;
  isAirportInfor: boolean = false;
  isPortInfor: boolean = false;

  activeUsers: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  provinces: Array<Province> = [];
  districts: Array<District> = [];
  airports: Array<Airport> = [];
  ports: Array<Port> = [];
  cities: Array<City> = [];

  storeAirports: Array<Airport> = [];
  storePorts: Array<Port> = [];
  isEnableInnerDataModify: boolean = false;
  modifiedDataIndex: number = -1;
  modifiedDataId: number = 0;

  city!: City;
  oldCity!: City;

  filteredDistricts: Array<District> = [];

  data!: MatTableDataSource<City>;
  imageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('stepper') stepper!: MatStepper;

  defaultCityImageURL: string = 'default-city.png';
  defaultAirportImageURL: string = 'airport.png';
  defaultPortImageURL: string = 'port.png';

  private dataSubscriber$ = new Subscription();
  selectedRow: any;

  constructor(
    private breadCrumbService: BreadcrumbService,
    private dataService: DataService,
    private authService: AuthorizationManagerService,
    private formValidationService: FormValidationService,
    private operationFeedBackService: OperationFeedbackService,
    private formBuilder: FormBuilder,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
  ) {

    this.cityForm = this.formBuilder.group({
      user: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      photo: new FormControl('', Validators.required),
      district: new FormControl('', Validators.required),
      province: new FormControl('', Validators.required),
      airports: new FormControl('', Validators.required),
      ports: new FormControl('', Validators.required),
    }, {updateOn: 'change'});

    this.airportForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      photo: new FormControl(''),
    }, {updateOn: 'change'});

    this.portForm = this.formBuilder.group({
      name: new FormControl('', Validators.required),
      code: new FormControl('', Validators.required),
      photo: new FormControl(''),
    }, {updateOn: 'change'});

    this.serverSearchForm = this.formBuilder.group({
      searchInput: new FormControl(),
      searchSelect: new FormControl(),
      filterField: new FormControl(),
      searchStartDate: new FormControl(),
      searchEndDate: new FormControl()
    });
  }

  ngOnInit() {
    this.initialize();
  }

  /**
   * Initializes the component by loading necessary data, setting up forms, and configuring button states and icons.
   *
   * @return {void} This method does not return a value.
   */
  initialize(): void {
    this.breadCrumbs = this.breadCrumbService.getActiveRoute();
    this.loadCityFilterFields();
    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUsers = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUsers, this.cityForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching ActiveUserList : " + error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<Province>(ApiEndpoints.paths.provinces).subscribe({
        next: (provinces) => {
          this.provinces = provinces;
        },
        error: (error: Error) => {
          console.error('Error fetching provinces : ' + error.message);
        }
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<District>(ApiEndpoints.paths.districts).subscribe({
        next: (districts) => {
          this.districts = districts;
        },
        error: (error: Error) => {
          console.error('Error fetching districts : ' + error.message);
        }
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<Airport>(ApiEndpoints.paths.airports).subscribe({
        next: (airports) => {
          this.airports = airports;
        },
        error: (error: Error) => {
          console.error('Error fetching airports : ' + error.message);
        }
      })
    );

    this.dataSubscriber$.add(
      this.dataService.getData<Port>(ApiEndpoints.paths.ports).subscribe({
        next: (ports) => {
          this.ports = ports;
        },
        error: (error: Error) => {
          console.error('Error fetching ports: ' + error.message);
        }
      })
    );

    this.formValidationService.createForm(this.cityForm, this.oldCity, this.city, 'city', ['code'], ['airports','ports']);
    this.formValidationService.createForm(this.airportForm, null, null, 'airport');
    this.formValidationService.createForm(this.portForm, null, null, 'port');
    this.enableButtons(true, false, false);
    this.setIconView(true, false, false);
    this.buttonStates();
  }

  /**
   * A function that retrieves and returns the display name of a user.
   *
   * @param {any} user - The user object whose display name needs to be extracted.
   * @returns {string} - The formatted display name of the user.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Initializes and sets up the view with default properties and configurations.
   * Updates the image URL, enables the record view, activates the search field input,
   * and loads an initial table state.
   *
   * @return {void} Does not return a value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.loadTable('');
    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user by retrieving user data from the authentication service.
   * The method uses `authService.getLogInUser` with the provided `cityForm` and a string identifier 'user'.
   *
   * @return {void} This method does not return a value.
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.cityForm, 'user');
  }

  /**
   * Enables or disables the add, update, and delete buttons based on the provided boolean values.
   *
   * @param {boolean} add - Indicates whether the add button should be enabled.
   * @param {boolean} upd - Indicates whether the update button should be enabled.
   * @param {boolean} del - Indicates whether the delete button should be enabled.
   * @return {void} Does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Updates the button states by determining the user's authority for insert, update, and delete operations
   * on the 'city' entity. The method sets internal properties for these authorities based on the user's permissions.
   *
   * @return {void} Does not return a value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('city', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('city', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('city', 'delete');
  }

  /**
   * Loads data into a table by fetching information based on the provided query.
   *
   * @param {string} query - A query string used to filter or search the data from the API.
   * @return {void} This method does not return any value.
   */
  loadTable(query: string): void {
    this.dataSubscriber$.add(
      this.dataService.getData<City>(ApiEndpoints.paths.cities, query).subscribe({
        next: (cities) => {
          this.cities = cities;
          this.imageURL = 'fullfilled.png';
        },
        error: (error: Error) => {
          console.error('Error fetching cities : ' + error.message);
          this.imageURL = 'rejected.png';
        },
        complete: () => {
          this.data = new MatTableDataSource(this.cities);
          this.data.paginator = this.paginator;
        }
      })
    );
  }

  /**
   * Generates a city code based on the provided district and province information.
   *
   * @param {District} district - The district object containing the necessary code to generate the city code.
   * @return {void} This method does not return a value but updates the city form control with the fetched city code.
   */
  generateCityCode(district: District): void {
    const province = this.cityForm.controls['province'].value;
    if (!province || !district) return;
    this.cityCodeQuery = new URLSearchParams();
    this.cityCodeQuery.append('districtCode', district.code);
    this.cityCodeQuery.append('provinceCode', province.code);
    const queryString = this.cityCodeQuery.toString() ? `?${this.cityCodeQuery.toString()}` : "";
    this.dataService.getRefNumber(ApiEndpoints.paths.cityCode, 'cityCode', queryString).subscribe({
      next: (data) => {
        this.cityForm.controls['code'].setValue(data.cityCode);
      },
      error: (error) => {
        console.error("Error fetching code : " + error.message);
      }
    })

  }

  /**
   * Filters the list of districts based on the selected province.
   *
   * @param event Contains the province information used to filter districts. Typically includes an id property to match with the province id of districts.
   * @return void This method does not return a value. It updates the filteredDistricts property with the filtered list.
   */
  filterDistrictByProvince(event: any): void {
    if (event !== null) {
      this.filteredDistricts = this.districts.filter(district => district.province.id === event.id);
    }
  }

  /**
   * Resets the search query to a new, empty URLSearchParams instance.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery() {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Resets the search query parameter fields in the server search form to their default values.
   * The fields reset include `searchInput`, `searchSelect`, `searchStartDate`, and `searchEndDate`.
   *
   * @return {void} This method does not return a value.
   */
  resetServerSearchQueryParamFields() {
    this.serverSearchForm.patchValue({
      searchInput: '',
      searchSelect: '',
      searchStartDate: null,
      searchEndDate: null
    });
  }

  /**
   * Clears the current search form and resets associated properties to their default state.
   * If no search criteria exist, a feedback message is displayed indicating there is nothing to clear.
   * If search criteria exist, a confirmation dialog is displayed to confirm the clearing action.
   * Upon confirmation, the search form and related states are reset.
   *
   * @return {void} This method does not return a value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedBackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedBackService.showConfirmation('City', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Loads and processes city filter fields by filtering out specific fields and formatting them.
   * This method initializes the `filterFields` property with a list of formatted city field names.
   *
   * @return {void} Does not return a value.
   */
  loadCityFilterFields(): void {
    const city = new City();
    this.filterFields = Object.keys(city)
      .filter(value => !['id', 'photo'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Formats a given string by capitalizing the first letter of each word.
   *
   * @param {string} field - The string to be formatted.
   * @return {string} The formatted string with the first letter of each word capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Configures and updates the component's search field type and options based on the selected filter field value.
   * Determines if the search field will be a select dropdown, input text, or date picker.
   * Updates the options for the select dropdown if applicable.
   *
   * @return {void} Does not return a value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'district', 'airport', 'port'];
    const dateFields = ['dobirth', 'createdon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUsers,
      district: this.districts,
      airport: this.airports,
      port: this.ports
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Handles the search functionality using the provided form values.
   * It validates the existence of required fields, formats dates if present,
   * and constructs a query string for loading table data based on the search criteria.
   *
   * @return {void} This method does not return a value.
   */
  search(): void {
    const formValues = this.serverSearchForm.value;

    const {searchInput, searchSelect, filterField, searchStartDate, searchEndDate} = formValues;

    if (!filterField) {
      this.operationFeedBackService.showMessage('Search', 'No search values...!');
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
   * Filters the table data based on the input provided by the user in the event.
   *
   * @param {Event} event - The event triggered by user interaction, typically an input event, containing the entered filter value.
   * @return {void} This method does not return a value.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (city: City, filter: string) => {
      return (
        filterValue == null ||
        city.name.toLowerCase().includes(filterValue) ||
        city.code?.toLowerCase().includes(filterValue) ||
        city.district.name.toLowerCase().includes(filterValue) ||
        city.airports.some(airport => airport.name.toLowerCase().includes(filterValue)) ||
        city.airports.some(airport => airport.code.toLowerCase().includes(filterValue)) ||
        city.ports.some(port => port.name.toLowerCase().includes(filterValue)) ||
        city.ports.some(port => port.code.toLowerCase().includes(filterValue)))
    };
    this.data.filter = 'filter';
  }

  /**
   * Handles the submission of city details. Validates the form values and updates the UI state accordingly.
   *
   * @param {MatStepper} stepper - The stepper control used to navigate between steps in the form.
   * @return {void} Does not return a value.
   */
  onSubmitCityDetails(stepper: MatStepper) {

    const formValues = this.cityForm.value;
    const {name, district} = formValues;
    if (name && district) {
      this.blinkButton = false;
      stepper.next();
      this.setIconView(false, true, false);
    }
  }

  /**
   * Handles the final form submission or resets the stepper.
   *
   * @param {MatStepper} stepper - The Material stepper instance used for navigating the form steps.
   * @return {void} Does not return a value.
   */
  onSubmitFinal(stepper: MatStepper) {
    // Handle final form submission or reset
    if (this.cityForm.valid) {
      // stepper.reset();
    }
  }

  /**
   * Resets the stepper component to its initial state and reloads form options as necessary.
   *
   * @return {void} No return value.
   */
  resetStepper(): void {
    this.resetAndReloadFormOptions();
  }

  /**
   * Resets the UI elements, form controls and loads default values or configurations for the form options.
   *
   * The method performs the following tasks:
   * - Resets certain internal states and variables.
   * - Clears any selection or active row.
   * - Resets the stepper UI component.
   * - Reloads the table data with default values.
   * - Clears stored airport and port data.
   * - Reinitializes the specified forms.
   * - Configures and enables or disables buttons and icons as required.
   * - Updates view-related state properties.
   *
   * @return {void} No return value. This method is executed for resetting and preparing the form configuration.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.stepper.reset();
    this.loadTable('');
    this.storeAirports = [];
    this.storePorts = [];
    this.formValidationService.createForm(this.cityForm);
    this.formValidationService.createForm(this.airportForm);
    this.formValidationService.createForm(this.cityForm);
    this.enableButtons(true, false, false);
    this.setIconView(true, false, false);
    this.enableGoToView = true;
    this.enableGoToRecode = true;
    this.setLoggedInUser();
  }

  /**
   * Populates the form with the provided city details and updates relevant fields and controls.
   *
   * @param {City} city - The city object whose details will be used to populate the form.
   * @return {void} Does not return any value.
   */
  fillForm(city: City) {
    this.enableButtons(false, true, true);
    this.isEnableInnerDataModify = false;
    this.selectedRow = city;
    this.city = JSON.parse(JSON.stringify(city));
    this.oldCity = JSON.parse(JSON.stringify(city));

    this.city.user = this.activeUsers.find(user => user.id === this.city.user?.id) ?? this.city.user;
    this.city.district = this.districts.find(district => district.id === this.city.district?.id) ?? this.city.district;
    if (this.city.district) {
      const province = this.provinces.find(province => province.id === this.city.district.province?.id) ?? this.city.district.province;
      this.filterDistrictByProvince(province);
      this.cityForm.controls['province'].setValue(province);
    }
    this.city.airports ? this.storeAirports = this.city.airports : [];
    this.city.ports ? this.storePorts = this.city.ports : [];
    this.pdfDtls = true;
    this.cityForm.patchValue(this.city);
    this.formValidationService.createForm(this.cityForm, this.oldCity, this.city);
    this.cityForm.markAsPristine();
  }

  /**
   * Loads the city modify view by enabling the form view and filling its fields with the provided city data.
   *
   * @param {City} element - The city object containing data to populate the modify view form.
   * @return {void} This method does not return any value.
   */
  loadCityModifyView(element: City) {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Loads the city detail view with relevant information and displays it.
   *
   * @param {City} element - The city object containing details to populate the view.
   * @return {void}
   */
  loadCityDetailView(element: City) {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;
    this.selectedRow = element;
    let tables = [];
    if (this.selectedRow?.airports && this.selectedRow.airports.length > 0) {
      tables.push({
        headers: ['Code', 'Name'],
        columns: ['code', 'name'],
        data: this.selectedRow.airports,
        title: "Airports"
      });
    }
    if (this.selectedRow?.ports && this.selectedRow.ports.length > 0) {
      tables.push({
        headers: ['Code', 'Name'],
        columns: ['code', 'name'],
        data: this.selectedRow.ports,
        title: "Ports"
      });
    }

    const data = [
      {Label: "Title", Value: this.selectedRow.name},
      {Label: "Photo", Value: this.selectedRow.photo},
      {Label: "Code", Value: this.selectedRow.code},
      {Label: "Created On", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Updated On", Value: this.datePipe.transform(this.selectedRow.updatedon, 'yyyy-MM-dd, h:mm a')},
      {Label: "District", Value: this.selectedRow.district.name},
      {Label: "Table", Value: tables},
    ];

    this.dataServer.sendData(data);
  }

  /**
   * Selects a row in the table corresponding to the given city.
   *
   * @param {City} city - The city object representing the row to be selected.
   * @return {void} Does not return any value.
   */
  selectRow(city: City) {
    this.selectedRow = city;
  }

  /**
   * Clears the current table selection by resetting the selected row and disabling edit mode.
   * Sends null data to the data server.
   *
   * @return {void} No value is returned by this method.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Updates the current view of the application based on the specified view type.
   *
   * @param {'records' | 'profiles' | 'form'} view - The view to set.
   * 'records' enables the record view, 'profiles' enables the profile detail view,
   * and 'form' enables the form view.
   *
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
   * Sets the visibility of various icon views based on the input parameters.
   *
   * @param {boolean} cityIcon - Determines if the city icon view should be enabled.
   * @param {boolean} airportIcon - Determines if the airport icon view should be enabled.
   * @param {boolean} portIcon - Determines if the port icon view should be enabled.
   * @return {void} Does not return any value.
   */
  setIconView(cityIcon: boolean, airportIcon: boolean, portIcon: boolean) {
    this.isCityInfor = cityIcon;
    this.isAirportInfor = airportIcon;
    this.isPortInfor = portIcon;
  }

  /**
   * Generates a city icon URL based on the provided value. If the value is null or undefined,
   * the default city image URL is returned.
   *
   * @param {string | null | undefined} value - The base64 encoded string representing the city icon, or null/undefined for no value.
   * @return {string} The city icon URL, or the default city image URL if no valid value is provided.
   */
  generateCityIcon(value: string | null | undefined): string {
    if (!value) {
      return this.defaultCityImageURL;
    }
    return atob(value);
  }

  //================================================Create Airport====================================================//

  /**
   * Creates a new airport using the provided form data.
   *
   * @param {FormGroup} airportForm - The form group containing airport details, including name, code, and photo.
   * @return {Airport} The newly created airport object with the provided details.
   * @throws {Error} Throws an error if the form data for the name or code is invalid.
   */
  createNewAirport(airportForm: FormGroup): Airport {
    const {name, code, photo} = airportForm.value;
    if (!name && !code) {
      this.operationFeedBackService.showMessage('Failed', 'Invalid airport form data');
      throw new Error();
    }
    const newAirport = new Airport();
    newAirport.name = name;
    newAirport.code = code;
    newAirport.photo = photo;
    return newAirport;
  }

  /**
   * Adds a new airport to the store. If modification mode is enabled, modifies an existing airport.
   * Otherwise, creates a new airport from the provided form data and checks for duplicates
   * before adding it to the store. Resets the form after a successful addition.
   *
   * @return {void} Does not return a value.
   */
  addNewAirport(): void {
    if (this.isEnableInnerDataModify) {
      this.addModifiedAirport(this.modifiedDataIndex);
    } else {
      let newAirport = this.createNewAirport(this.airportForm);
      const existingValues = this.checkExistingAirPort(newAirport);
      if (existingValues !== '') {
        this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
        return;
      }
      this.storeAirports = [...this.storeAirports, newAirport];

      this.airportForm.reset();
    }
  }

  /**
   * Modifies an airport's data based on the provided event.
   *
   * @param {Object} event - The modification event object.
   * @param {number} event.index - The index of the airport being modified.
   * @param {any} event.modifiedItem - The modified airport data.
   * @return {void} This method does not return a value.
   */
  modifyAirport(event: { index: number; modifiedItem: any }): void {
    this.isEnableInnerDataModify = true;
    this.modifiedDataIndex = event.index;
    this.modifiedDataId = event.modifiedItem.id;
    const airport = this.storeAirports[event.index];
    this.airportForm.patchValue(airport);
    this.formValidationService.createForm(this.airportForm, this.storeAirports[event.index], this.storeAirports[event.index]);
  }

  /**
   * Updates an existing airport entry in the list of stored airports with modified data.
   *
   * @param {number} index - The index of the airport in the `storeAirports` array to be modified.
   * @return {void} No return value.
   */
  addModifiedAirport(index: number): void {
    this.isEnableInnerDataModify = false;
    let modifiedAirport = this.createNewAirport(this.airportForm);
    modifiedAirport.id = this.modifiedDataId;
    const existingValues = this.checkExistingAirPort(modifiedAirport, index);
    if (existingValues !== '') {
      this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
      return;
    }
    console.log("modifiedAirport: ", modifiedAirport);
    this.storeAirports[index] = modifiedAirport;
    this.storeAirports = [...this.storeAirports];
    console.log("this.storeAirports: ", this.storeAirports);
    this.modifiedDataIndex = -1;
    this.airportForm.reset();
  }

  /**
   * Checks if the provided airport's name or code already exists in the stored airports,
   * excluding the airport at the given index if provided.
   *
   * @param {Airport} newAirport - The airport object to be checked for existing name or code.
   * @param {number} [index] - Optional index to exclude from the check.
   * @return {string} A string indicating if the name or code already exists, or an empty string if none exist.
   */
  checkExistingAirPort(newAirport: Airport, index?: number): string {
    let existingValue = "";

    // Filter out the airport at the given index
    const filteredAirports = this.storeAirports.filter((_, i) => i !== index);
    // Check if name or code already exists in filtered data
    const codeExist = filteredAirports.find(
      airport => airport.code.trim().toLowerCase() === newAirport.code.trim().toLowerCase()
    );
    const nameExist = filteredAirports.find(
      airport => airport.name.trim().toLowerCase() === newAirport.name.trim().toLowerCase()
    );
    if (nameExist) {
      existingValue += "<br>Airport name already exists";
    }
    if (codeExist) {
      existingValue += "<br>Airport code already exists";
    }
    return existingValue;
  }

  /**
   * Resets the airport form and disables inner data modification.
   *
   * @return {void} No value is returned by this method.
   */
  clearAirport(): void {
    this.airportForm.reset();
    this.isEnableInnerDataModify = false;
  }

  //================================================Create Port====================================================//

  /**
   * Creates a new airport port object using the provided form data.
   *
   * @param {FormGroup} portForm - The form containing data for the new port, including name, code, and photo.
   * @return {Airport} A new Airport object created using the form data.
   * @throws {Error} Throws an error if the form data is invalid (missing both name and code).
   */
  createNewPort(portForm: FormGroup): Airport {
    const {name, code, photo} = portForm.value;
    console.log(name + "   =    " + code)
    if (!name && !code) {
      this.operationFeedBackService.showMessage('Failed', 'Invalid port form data');
      throw new Error();
    }
    const newPort = new Port();
    newPort.name = name;
    newPort.code = code;
    newPort.photo = photo;
    return newPort;
  }

  /**
   * Adds a new port to the list of stored ports. If inner data modification is enabled,
   * it modifies the port based on the existing data index. Otherwise, it creates a new port
   * using the form data, validates its uniqueness, and adds it to the stored ports.
   * If the port already exists, displays a feedback message without adding it.
   *
   * @return {void} Does not return a value.
   */
  addNewPort(): void {
    if (this.isEnableInnerDataModify) {
      this.addModifiedPort(this.modifiedDataIndex);
    } else {
      let newPort = this.createNewPort(this.portForm);
      const existingValues = this.checkExistingPort(newPort);
      if (existingValues !== '') {
        this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
        return;
      }
      this.storePorts = [...this.storePorts, newPort];
      this.portForm.reset();
    }
  }

  /**
   * Modifies data related to a specific port based on the provided event details.
   *
   * @param {Object} event - The event object containing details for port modification.
   * @param {number} event.index - The index of the port to be modified in the stored ports array.
   * @param {any} event.modifiedItem - The data item containing modifications to be applied to the port.
   * @return {void} Does not return a value.
   */
  modifyPort(event: {index: number, modifiedItem: any}): void {
    this.isEnableInnerDataModify = true;
    this.modifiedDataIndex = event.index;
    const port = this.storePorts[event.index];
    this.portForm.patchValue(port);
    this.formValidationService.createForm(this.portForm, this.storePorts[event.index], this.storePorts[event.index]);
  }

  /**
   * Adds a modified port to the store at the specified index if it does not already exist.
   * Performs validation to check for duplicate entries and updates the store with the new port.
   * Resets the form and any modifications state upon successful addition.
   *
   * @param {number} index - The index at which to add the modified port in the store.
   * @return {void} This function does not return a value.
   */
  addModifiedPort(index: number): void {
    let modifiedPort = this.createNewAirport(this.portForm);
    modifiedPort.id = this.modifiedDataId;
    const existingValues = this.checkExistingPort(modifiedPort, index);
    if (existingValues !== '') {
      this.operationFeedBackService.showMessage('Already Exist', `${existingValues}`);
      return;
    }
    this.isEnableInnerDataModify = false;
    this.storePorts[index] = modifiedPort;
    this.storePorts = [...this.storePorts];
    this.modifiedDataIndex = -1;
    this.portForm.reset();
  }

  /**
   * Checks if the given port's name or code already exists in the filtered list of stored ports, excluding the port at the specified index.
   *
   * @param {Port} newPort - The port object containing the new name and code to be checked.
   * @param {number} [index] - Optional index of the port to exclude from the check.
   * @return {string} A message indicating whether the port name or code already exists. Returns an empty string if neither exists.
   */
  checkExistingPort(newPort: Port, index?: number): string {
    let existingValue = "";
    // Filter out the airport at the given index
    console.log("Port Index : " + index);

    const filteredPorts = this.storePorts.filter((_, i) => i !== index);
    console.log(filteredPorts);
    // Check if name or code already exists in filtered data
    const codeExist = filteredPorts.find(
      port => port.code.trim().toLowerCase() === newPort.code.trim().toLowerCase()
    );
    const nameExist = filteredPorts.find(
      port => port.name.trim().toLowerCase() === newPort.name.trim().toLowerCase()
    );
    if (nameExist) {
      existingValue += "<br>Port name already exists";
    }
    if (codeExist) {
      existingValue += "<br>Port code already exists";
    }
    return existingValue;
  }

  /**
   * Resets the port form to its initial state by clearing all input fields and values.
   *
   * @return {void} This method does not return a value.
   */
  clearPort(): void {
    this.portForm.reset();
    this.isEnableInnerDataModify = false;
  }

  //==================================================================================================================//

  /**
   * Saves the current city form data after performing validation checks.
   * If validation errors are found, an error message is displayed.
   * If the operation is confirmed, attempts to save the data via a data service.
   * Handles server responses and displays appropriate status messages.
   *
   * @return {void} Does not return a value.
   */
  save(): void {
    const formValues = this.cityForm.getRawValue();

    const errors = this.formValidationService.getErrors(this.cityForm, ['photo', 'airports','ports']);
    if (errors) {
      this.operationFeedBackService.showErrors("City", "Save", errors);
      return;
    }
    delete formValues.province;
    this.city = formValues;
    const cityData = this.operationFeedBackService.formatObjectData(this.city, ["code", "name"]);

    this.operationFeedBackService.showConfirmation("City", "Save", cityData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<City>(ApiEndpoints.paths.cities, this.city)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedBackService.showStatus("City", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
                this.operationFeedBackService.showErrors("City", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the city data based on the input from the city form.
   * Validates the form to identify any errors and displays applicable feedback.
   * If there are no errors, prepares the city object for update and confirms the action with the user.
   * Upon confirmation, sends the update request to the server and processes the response.
   * Displays feedback based on the success or failure of the operation.
   *
   * @return {void} No return value.
   */
  update(): void {
    const errors = this.formValidationService.getErrors(this.cityForm, ['photo', 'airports','ports']);
    if (errors) {
      this.operationFeedBackService.showErrors('City', 'Update', errors);
      return;
    }

    const formValues = this.cityForm.getRawValue();
    delete formValues.province;
    this.city = formValues;
    this.city.id = this.oldCity.id;
    let updates = this.formValidationService.getUpdates(this.cityForm);
    this.operationFeedBackService.showConfirmation('City', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {
          if (!isConfirmed) return;

          this.dataService.update<City>(ApiEndpoints.paths.cities, this.city)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }

                this.operationFeedBackService.showStatus("City", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
                this.operationFeedBackService.showErrors("City", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes the specified city record and performs successive operations such as confirmation, API interaction,
   * and feedback display based on the result of the deletion.
   *
   * The method confirms the deletion operation with the user, calls the API to delete the city by its ID,
   * and shows appropriate feedback messages based on the server response or errors encountered.
   *
   * @return {void} This method does not return any value.
   */
  delete(): void {

    const employeeData = this.operationFeedBackService.formatObjectData(this.city, ['code']);
    this.operationFeedBackService.showConfirmation('City', 'Delete', employeeData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.cities, this.city.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedBackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedBackService.showStatus("City", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
                this.operationFeedBackService.showErrors('City', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the form data after user confirmation.
   * Prompts a confirmation message if there are values in the form fields
   * (other than the 'number' field) and clears the form upon user approval.
   *
   * @return {void} Does not return a value.
   */
  clear(): void {

    const hasValue = this.operationFeedBackService.hasAnyFormValue(this.cityForm, ['user', 'code']);

    if (!hasValue) {
      this.operationFeedBackService.showMessage('Clear City', 'Nothing to clear...!');
      return;
    }

    this.operationFeedBackService.showConfirmation('City', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
      })
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }
}
