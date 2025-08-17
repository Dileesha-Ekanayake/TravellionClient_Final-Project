import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {BreadcrumbService} from "../../../util/core-services/ui/breadcrumb.service";
import {DetailViewComponent} from "../../../util/detail-view/detail-view.component";
import {MatButton, MatIconButton} from "@angular/material/button";
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
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {MatOption} from "@angular/material/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSelect} from "@angular/material/select";
import {MatStep, MatStepLabel, MatStepper} from "@angular/material/stepper";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {AuthorizationManagerService} from "../../../auth/authorization-manager.service";
import {FormValidationService} from "../../../util/core-services/validation/formvalidation.service";
import {OperationFeedbackService} from "../../../util/core-services/feedback/operationfeedback.service";
import {DataServerService} from "../../../util/detail-view/data-server.service";
import {AsyncPipe, DatePipe, NgClass} from "@angular/common";
import {User} from '../../../entity/user';
import {City} from "../../../entity/city";
import {Location} from "../../../entity/location";
import {DataService} from "../../../services/data.service";
import {ApiEndpoints} from "../../../services/api-endpoint";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {AutoCompleteDataFilterService} from "../../../util/core-services/ui/auto-complete-data-filter.service";
import {AvFilePicker} from "@avoraui/av-file-picker";

@Component({
  selector: 'app-travel-location',
  imports: [
    MatGridList,
    MatGridTile,
    MatCard,
    MatCardContent,
    DetailViewComponent,
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
    MatColumnDef,
    MatHeaderCellDef,
    NgClass,
    MatNoDataRow,
    AsyncPipe,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AvFilePicker
  ],
  templateUrl: './travel-location.component.html',
  standalone: true,
  styleUrl: './travel-location.component.css'
})
export class TravelLocationComponent implements OnInit, OnDestroy {

  columns: string[] = ['photo', 'code', 'name', 'city', 'modify/view'];
  headers: string[] = ['Photo', 'Code', 'Name', 'City', 'Modify / View'];

  columnsDetails: string[] = ['photo', 'code', 'name'];
  headersDetails: string[] = ['Photo', 'Code', 'Name'];

  public serverSearchForm!: FormGroup;
  public locationForm!: FormGroup;
  isLinear = false;
  blinkButton: boolean = false;

  cities: Array<City> = [];
  filteredCityList!: Observable<Array<City>>;
  location!: Location;
  activeUserList: Array<User> = [];
  filteredUserList!: Observable<Array<User>>;
  oldLocation!: Location;
  pdfDtls: boolean = true;

  selectedRow: any;
  @ViewChild('stepper') stepper!: MatStepper;

  locations: Array<Location> = [];
  data!: MatTableDataSource<Location>;
  imageURL: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  defaultImageURL: string = 'default-city.png';

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

  private dataSubscriber$ = new Subscription();

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
    private formValidationService: FormValidationService,
    private operationFeedbackService: OperationFeedbackService,
    private dataServer: DataServerService,
    private datePipe: DatePipe,
    private autoCompleteDataFilterService: AutoCompleteDataFilterService,
  ) {

    this.locationForm = this.formBuilder.group({
      user: new FormControl('', [Validators.required],),
      code: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      photo: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
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
  }

  /**
   * Initializes the required data and configurations for the component.
   * It sets up the location filter fields, breadcrumb navigation, subscription to city and user data streams,
   * form validation, enables/disables specific buttons, and updates button states for actions.
   *
   * @return {void} No return value.
   */
  initialize(): void {

    this.loadLocationFilterFields();
    this.breadcrumb = this.breadcrumbService.getActiveRoute();

    this.createView();

    this.dataSubscriber$.add(
      this.dataService.getData<City>(ApiEndpoints.paths.cityList).subscribe({
        next: (cities) => {
          this.cities = cities;
          this.filteredCityList = this.autoCompleteDataFilterService.filterData<City>(this.cities, this.locationForm, 'city', ['name']);
        },
        error: (error) => {
          console.error("Error fetching cities : ", error.message);
        }
      })
    )

    this.dataSubscriber$.add(
      this.dataService.getData<User>(ApiEndpoints.paths.activeUsersList).subscribe({
        next: (users) => {
          this.activeUserList = users;
          this.filteredUserList = this.autoCompleteDataFilterService.filterData<User>(this.activeUserList, this.locationForm, 'user', ['employee.callingname']);
        },
        error: (error) => {
          console.error("Error fetching ActiveUserList : " + error.message);
        }
      })
    )

    this.formValidationService.createForm(this.locationForm, this.oldLocation, this.location, 'location', ['code']);
    this.enableButtons(true, false, false);

    this.buttonStates();

  }

  /**
   * Retrieves and returns the display name of a user.
   *
   * This function extracts the display value of a user object by utilizing
   * the `autoCompleteDataFilterService`. It specifically fetches the value
   * associated with the provided property key `['employee.callingname']`.
   *
   * @param {any} user - The user object containing the necessary data fields.
   * @returns {string} - The display name of the user derived from the specified key.
   */
  displayUserName = (user: any): string => {
    return this.autoCompleteDataFilterService.displayValue<User>(user, ['employee.callingname']);
  }

  /**
   * Returns the formatted name of a city based on the provided input data.
   *
   * This function processes the `city` input using the `autoCompleteDataFilterService`
   * and extracts a formatted display value based on the properties specified.
   *
   * @param {any} city - The input data representing a city object to be formatted.
   * @returns {string} The formatted city name as a string.
   */
  displayCityName = (city: any): string => {
    return this.autoCompleteDataFilterService.displayValue<City>(city, ['name']);
  }

  /**
   * Initializes the view by setting default values for the image URL, enabling record view, activating search field input, and loading the table with initial data.
   *
   * @return {void} This method does not return a value.
   */
  createView(): void {
    this.imageURL = 'pending.gif';
    this.enableRecordView = true;
    this.isSearchFiledInput = true;
    this.loadTable("");
    this.setLoggedInUser();
  }

  /**
   * Sets the logged-in user by utilizing the authentication service.
   * This function retrieves the current user based on the provided location form and user identifier.
   *
   * @return {void}
   */
  setLoggedInUser(): void {
    this.authService.getLogInUser(this.locationForm, 'user');
  }

  /**
   * Enables or disables specific buttons based on the provided boolean values.
   *
   * @param {boolean} add - Determines whether the "Add" button should be enabled.
   * @param {boolean} upd - Determines whether the "Update" button should be enabled.
   * @param {boolean} del - Determines whether the "Delete" button should be enabled.
   * @return {void} This method does not return a value.
   */
  enableButtons(add: boolean, upd: boolean, del: boolean): void {
    this.enableAdd = add;
    this.enableUpdate = upd;
    this.enableDelete = del;
  }

  /**
   * Sets the states for button visibility or accessibility based on user authority
   * for different operations (`insert`, `update`, `delete`) on `locations`.
   * The authority for each button state is determined using the `authService`.
   *
   * @return {void} Does not return any value.
   */
  buttonStates(): void {
    this.hasInsertAuthority = this.authService.hasOperationAuthority('location', 'insert');
    this.hasUpdateAuthority = this.authService.hasOperationAuthority('location', 'update');
    this.hasDeleteAuthority = this.authService.hasOperationAuthority('location', 'delete');
  }

  /**
   * Loads data into a table by fetching it from the specified API endpoint with the provided query.
   *
   * @param {string} query The query string to filter or retrieve data from the API.
   * @return {void} This method does not return any value.
   */
  loadTable(query: string): void {

    this.dataSubscriber$.add(
      this.dataService.getData<Location>(ApiEndpoints.paths.locations, query).subscribe({
        next: (locations) => {
          this.locations = locations;
          this.imageURL = 'fullfilled.png';
        },
        error: (err) => {
          console.error(err);
          this.imageURL = 'rejected.png';
        },
        complete: (() => {
          this.data = new MatTableDataSource(this.locations);
          this.data.paginator = this.paginator;
        })
      })
    )
  }

  /**
   * Generates a location code based on the provided city event.
   * Retrieves the location code from a data service and updates the location form's code control if successful.
   *
   * @param {City} event The city event containing the code used to generate the location code.
   * @return {void} This method does not return any value.
   */
  generateLocationCode(event: City): void {
    const cityCode = event.code;
    if (cityCode){
      this.dataService.getRefNumber(ApiEndpoints.paths.locationCode, 'locationCode', cityCode).subscribe({
        next: (data) => {
          this.locationForm.controls['code'].setValue(data.locationCode);
        }
      })
    }
  }

  /**
   * Loads and formats the location filter fields by excluding specific keys
   * and applies formatting to the remaining ones.
   * Updates the filterFields property with the processed field names.
   *
   * @return {void} Does not return a value.
   */
  loadLocationFilterFields(): void {
    const location = new Location();
    this.filterFields = Object.keys(location)
      .filter(value => !['id', 'photo'].includes(value))
      .map(value => this.formatField(value));
  }

  /**
   * Capitalizes the first letter of each word in a given string.
   *
   * @param {string} field - The input string to be formatted.
   * @return {string} The formatted string with the first letter of each word capitalized.
   */
  formatField(field: string): string {
    return field
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Updates the state of search field type based on the selected filter field and loads select options accordingly.
   * This function determines whether the search field is a select dropdown, an input field, or a date picker,
   * and sets the corresponding options if the field is a select dropdown.
   *
   * @return {void} This method does not return any value.
   */
  loadSearchSelectOptions(): void {
    const selectedValue = this.serverSearchForm.controls['filterField'].value.toLowerCase();

    if (!selectedValue) return;

    const selectFields = ['user', 'city'];
    const dateFields = ['createdon', 'updatedon'];

    this.isSearchFiledSelect = selectFields.includes(selectedValue);
    this.isSearchFiledInput = !this.isSearchFiledSelect && !dateFields.includes(selectedValue);
    this.isSearchFiledDate = dateFields.includes(selectedValue);

    const optionsMap: Record<string, any[]> = {
      user: this.activeUserList,
      city: this.cities,
    };

    this.searchSelectOptions = optionsMap[selectedValue] || [];

  }

  /**
   * Filters the data in the table based on the input provided by the user.
   *
   * @param {Event} event - The event triggered by the input field, typically from a user typing in a search box. The target of the event is used to extract the filter value.
   * @return {void} - This method does not return a value. It updates the filter criteria for the table's data source.
   */
  filterTable(event: Event): void {
    //@ts-ignore
    const filterValue = ((event.target as HTMLInputElement).value).trim().toLowerCase();
    this.data.filterPredicate = (location: Location, filter: string) => {
      return (
        filterValue == null ||
        location.code.toLowerCase().includes(filterValue) ||
        location.name.toLowerCase().includes(filterValue) ||
        location.city.name.toLowerCase().includes(filterValue) ||
        location.city.code.toLowerCase().includes(filterValue))
    };
    this.data.filter = 'filter';
  }

  /**
   * Selects a specific row by setting it as the selected row.
   *
   * @param {Location} element - The location object representing the row to select.
   * @return {void} Does not return a value.
   */
  selectRow(element: Location): void {
    this.selectedRow = element;
  }

  /**
   * Resets the search query to a new instance of URLSearchParams.
   *
   * @return {void} Does not return a value.
   */
  resetSearchQuery(): void {
    this.searchQuery = new URLSearchParams();
  }

  /**
   * Executes a search operation using the values provided in the server search form.
   * The method validates the inputs, constructs the search query, and triggers data loading.
   *
   * @return {void} This method does not return a value but performs operations such as building a query,
   * showing feedback messages, and loading data into a table.
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
   * This includes clearing input fields and resetting date fields to null.
   *
   * @return {void} Does not return a value.
   */
  resetServerSearchQueryParamFields(): void{
    this.serverSearchForm.patchValue({
      searchInput: '',
      searchSelect: '',
      searchStartDate: null,
      searchEndDate: null
    });
  }

  /**
   * Clears the search form and resets related state variables. If the form has no values, displays a feedback message.
   * If the form has values, prompts the user for confirmation before clearing the form and resetting related variables.
   *
   * @return {void} No return value.
   */
  clearSearch(): void {
    const hasValue = Object.values(this.serverSearchForm.controls).some(control => control.value);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Search', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Location', 'Search Clear', 'Are you sure you want to clear the search?')
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
   * Fills the form fields using the specified location data and sets up initial form state.
   *
   * @param {Location} location - The location object containing data to populate the form.
   * @return {void} This method does not return a value.
   */
  fillForm(location: Location): void {
    this.enableButtons(false, true, true);
    this.selectedRow = location;
    this.location = JSON.parse(JSON.stringify(location));
    this.oldLocation = JSON.parse(JSON.stringify(location));

    this.location.user = this.activeUserList.find(user => user.id === this.location.user?.id) ?? this.location.user;
    this.location.city = this.cities.find(city => city.id === this.location.user?.id) ?? this.location.city;

    this.pdfDtls = true;
    this.locationForm.patchValue(this.location);
    this.formValidationService.createForm(this.locationForm, this.oldLocation, this.location);
    this.locationForm.markAsPristine();
  }

  // onSubmitPersonalDetails(stepper: MatStepper) {
  //   const formValues = this.locationForm.value;
  //   const {user, name, bankAccount} = formValues;
  //   if (user && name && bankAccount) {
  //     this.blinkButton = false;
  //     stepper.next();
  //   }
  // }

  /**
   * Loads the location detail view and updates the UI accordingly based on the selected element.
   *
   * @param {Location} element - The location object containing all necessary details to populate the detail view.
   * @return {void} This method does not return a value.
   */
  loadLocationDetailView(element: Location): void {
    this.loadTable('');
    this.enableRecordView = false;
    this.enableDetailView = true;
    this.enableEdit = true;

    this.selectedRow = element;
    const data = [
      {Label: "Title", Value: this.selectedRow.name},
      {Label: "Name", Value: this.selectedRow.name},
      {Label: "Photo", Value: this.selectedRow.photo},
      {Label: "Code", Value: this.selectedRow.code},
      {Label: "City", Value: this.selectedRow.city.name},
      {Label: "Date Of Created", Value: this.datePipe.transform(this.selectedRow.createdon, 'yyyy-MM-dd, h:mm a')},
      {Label: "Date Of Updated", Value: this.datePipe.transform(this.selectedRow.updatedon, 'yyyy-MM-dd, h:mm a')},
    ];

    this.dataServer.sendData(data);

  }

  /**
   * Loads the location modification view by updating the necessary view states
   * and populating the form with the provided location data.
   *
   * @param {Location} element - The location data to be filled into the form.
   * @return {void} Does not return a value.
   */
  loadLocationModifyView(element: Location): void {
    this.enableRecordView = false;
    this.enableDetailView = false;
    this.enableForm = true;
    this.enableGoToView = false;
    this.enableGoToRecode = false;
    this.fillForm(element);
  }

  /**
   * Sets the current view of the application and updates related state variables accordingly.
   *
   * @param {('records' | 'profiles' | 'form')} view - The view to set. Accepted values are 'records', 'profiles', or 'form'.
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
   * Generates a location icon string based on the provided value.
   *
   * @param {string | null | undefined} value - The input value used to generate the location icon. If null or undefined, a default image URL is returned.
   * @return {string} The generated location icon string or the default image URL.
   */
  generateLocationIcon(value: string | null | undefined): string {
    if (!value) {
      return this.defaultImageURL;
    }
    return atob(value);
  }

  /**
   * Saves the current form state after validating the form and showing confirmation prompts.
   * Handles the result of the save operation and displays feedback messages based on response status.
   *
   * @return {void} This method does not return a value. It performs operations such as validation, confirmation, and saving, as well as providing feedback.
   */
  save(): void {
    const formValues = this.locationForm.getRawValue();

    const errors = this.formValidationService.getErrors(this.locationForm, ['photo']);
    if (errors) {
      this.operationFeedbackService.showErrors("Location", "Save", errors);
      return;
    }
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    this.location = formValues;
    const locationData = this.operationFeedbackService.formatObjectData(this.location, ["code", "name"]);

    this.operationFeedbackService.showConfirmation("Location", "Save", locationData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.save<Location>(ApiEndpoints.paths.locations, this.location)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {
                  this.resetAndReloadFormOptions();
                }
                this.operationFeedbackService.showStatus("Location", "Save", responseMessage);
              },
              error: (error) => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors("Location", "Save", responseMessage
                );
              }
            });
        })
      })
  }

  /**
   * Updates the location data by validating form input, preparing updated location data,
   * and calling the appropriate services to execute the update operation.
   * The method ensures confirmation from the user before proceeding and handles success or error responses accordingly.
   *
   * @return {void} No return value. The method manages the update operation and user feedback internally.
   */
  update(): void {
    // 1. Form Validation
    const errors = this.formValidationService.getErrors(this.locationForm);
    if (errors) {
      this.operationFeedbackService.showErrors('Location', 'Update', errors);
      return;  // Exit if there are errors
    }

    // 2. Prepare Employee Data
    const formValues = this.locationForm.getRawValue();
    formValues.user = {
      id: formValues.user.id,
      username: formValues.user.username,
    }
    this.location = formValues;  // Get form values
    this.location.id = this.oldLocation.id;  // Maintain the ID
    const updates = this.formValidationService.getUpdates(this.locationForm);

    // 3. Show Confirmation Dialog (First Observable)
    this.operationFeedbackService.showConfirmation('Location', 'Update', updates)
      .subscribe({
        next: (isConfirmed) => {  // When dialog closes, we get true or false
          if (!isConfirmed) return;  // If user cancels, stop here

          // 4. Update Employee (Second Observable)
          this.dataService.update<Location>(ApiEndpoints.paths.locations, this.location)
            .subscribe({
              next: (response) => {  // When update completes successfully
                // Handle the response
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Location", "Update", responseMessage + " : " + serverInfo);
              },
              error: (error) => {  // If update fails
                // Handle error response
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                // Show error message
                this.operationFeedbackService.showErrors("Location", "Update", responseMessage
                );
              }
            });
        }
      });
  }

  /**
   * Deletes the current location by sending a delete request to the API.
   * Before taking any action, it prompts the user for confirmation.
   * If the deletion is successful, it reloads form options and displays a success message.
   * If an error occurs during the process, an appropriate error message is displayed.
   *
   * @return {void} Does not return a value. Displays status or error feedback to the user based on the operation result.
   */
  delete(): void {

    const locationData = this.operationFeedbackService.formatObjectData(this.location, ['code']);
    this.operationFeedbackService.showConfirmation('Location', 'Delete', locationData)
      .subscribe({
        next: (isConfirmed => {
          if (!isConfirmed) return;

          this.dataService.delete(ApiEndpoints.paths.locations, this.location.id)
            .subscribe({
              next: (response) => {
                const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                if (status) {  // If update was successful
                  this.resetAndReloadFormOptions();
                }
                // Show status message
                this.operationFeedbackService.showStatus("Location", "Delete", responseMessage + " : " + serverInfo);
              },
              error: (error => {
                const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                this.operationFeedbackService.showErrors('Location', 'Delete', responseMessage);
              })
            })
        })
      })
  }

  /**
   * Clears the location form fields excluding the "code" field.
   * If no fields contain a value, it displays a message indicating there is nothing to clear.
   * If fields do contain values, it prompts the user for confirmation before clearing the form.
   *
   * @return {void} No return value.
   */
  clear(): void {

    const hasValue = this.operationFeedbackService.hasAnyFormValue(this.locationForm, ['user', 'code']);

    if (!hasValue) {
      this.operationFeedbackService.showMessage('Clear Location', 'Nothing to clear...!');
      return;
    }

    this.operationFeedbackService.showConfirmation('Location', 'Clear', 'Are you sure to clear the following details?')
      .subscribe(isConfirmed => {
        if (!isConfirmed) return;
        this.resetAndReloadFormOptions();
      })
  }

  /**
   * Clears the current table selection by disabling edit mode, deselecting any row,
   * and sending a null value to the data server.
   *
   * @return {void} This method does not return a value.
   */
  clearTableSelection(): void {
    this.enableEdit = false;
    this.selectedRow = null;
    this.dataServer.sendData(null);
  }

  /**
   * Resets the current form state and reloads form options to their default values.
   * The method performs the following actions:
   * - Resets some component flags and selections.
   * - Resets the stepper to its initial state.
   * - Reloads the table data with default parameters.
   * - Creates or resets the form using the form validation service.
   * - Updates the state of action buttons.
   * - Enables navigation options such as "Go To View" and "Go To Recode".
   *
   * @return {void} This method does not return a value.
   */
  resetAndReloadFormOptions(): void {
    this.pdfDtls = false;
    this.selectedRow = null;
    this.stepper.reset();
    this.locationForm.reset();
    this.setLoggedInUser();
    this.loadTable('');
    this.formValidationService.createForm(this.locationForm);
    this.enableButtons(true, false, false);

    this.enableGoToView = true;
    this.enableGoToRecode = true;
  }

  ngOnDestroy() {
    this.dataSubscriber$.unsubscribe();
  }

}
