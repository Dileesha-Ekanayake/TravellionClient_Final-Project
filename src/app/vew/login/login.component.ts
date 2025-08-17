import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AuthenticateService} from "../../auth/authenticate.service";
import {AuthorizationManagerService} from "../../auth/authorization-manager.service";
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel, MatSuffix} from "@angular/material/form-field";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {MatButton, MatMiniFabButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {NgClass} from "@angular/common";
import {provideNativeDateAdapter} from "@angular/material/core";
import {OperationFeedbackService} from "../../util/core-services/feedback/operationfeedback.service";
import {MatCheckbox} from "@angular/material/checkbox";
import {StorageLockService} from "../../auth/storage-lock.service";
import {AvNotificationService} from "@avoraui/av-notifications";
import {Subscription} from "rxjs";

/**
 * LoginComponent is responsible for handling the user authentication, registration, and password reset functionalities.
 *
 * The component provides a user interface for logging in, signing up, and resetting passwords. It also manages
 * form validations and interactions with services for authentication, token management, and notifications.
 *
 * Features:
 * - Log-In functionality with username and password validation.
 * - Sign-Up functionality (currently disabled for public use).
 * - Reset Password functionality with multi-step processes and a countdown timer.
 * - OAuth2-based login functionality (placeholder for future implementation).
 * - State management for UI elements such as forms and buttons.
 * - LocalStorage support for saving user credentials (optional "Remember Me").
 * - Notifications and feedback for user actions and API responses.
 **/
@Component({
  selector: 'app-login',
  imports: [
    MatLabel,
    MatFormField,
    MatCardContent,
    ReactiveFormsModule,
    MatCardHeader,
    MatCard,
    MatGridList,
    MatGridTile,
    MatButton,
    MatInput,
    MatCardTitle,
    MatIcon,
    MatSuffix,
    NgClass,
    FormsModule,
    MatMiniFabButton,
    MatCheckbox,


  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LoginComponent implements OnInit, OnDestroy {

  //=======Log-In=======//

  loginform: FormGroup;
  isSignInActive: boolean = true;

  //=======Sign-Up=======//

  signUpForm: FormGroup;


  //=======Reset-Password=======//

  @ViewChildren('pinInput') pinInputs!: QueryList<ElementRef>;

  timeLeft: number = 180;
  displayTime: string = '03:00';
  countdownInterval: any;
  startCountDown: boolean = false;

  enableResend: boolean = false;
  enableLastBack: boolean = false;
  enableForgetPassword: boolean = false;

  pinFields = Array(6).fill({value: ''});
  pinFormControls: FormControl[] = [];

  isForgetPassword: boolean = false;
  userEmail: string = 'dileesha65@gmail.com';
  step: number = 1;
  username: string = '';

  isCheckedRememberMe: boolean = false;

  dataSubscriber$ = new Subscription();

  constructor(
    private router: Router,
    private authenticateService: AuthenticateService,
    private authService: AuthorizationManagerService,
    private operationFeedBackService: OperationFeedbackService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private avNotificationService: AvNotificationService,
    private storageLockService: StorageLockService,
  ) {

    //==========Log-In==========//

    this.loginform = this.formBuilder.group({

      "username": new FormControl("", [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10)
        ]
      ),

      "password": new FormControl("", Validators.required)

    });

    this.loginform.controls['username'].setValue("");
    this.loginform.controls['password'].setValue("");

    //==========Sign-Up==========//

    this.signUpForm = this.formBuilder.group({

      "username": new FormControl("", [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10)
        ]
      ),

      "password": new FormControl("", Validators.required),
      "confirmPassword": new FormControl("", Validators.required)

    });

    this.signUpForm.controls['username'].setValue("");
    this.signUpForm.controls['password'].setValue("");
    this.signUpForm.controls['confirmPassword'].setValue("");

  }

  /**
   * Initializes the component by performing specific setup operations.
   *
   * The ngOnInit lifecycle hook is called when Angular initializes the component.
   * In this method, credentials expiration is checked, form controls for pin inputs are created,
   * the first pin input field gains focus, and previously stored username and password
   * (if available) are set in the login form.
   *
   * @return {void} This method does not return any value.
   */
  ngOnInit(): void {

    this.checkCredentialsExpiration();
    //=========Reset-Password==========//

    for (let i = 0; i < this.pinFields.length; i++) {
      this.pinFormControls.push(new FormControl(''));
    }
    setTimeout(() => {
      this.pinInputs.first.nativeElement.focus();
    });

    const {username, password} = this.getUserNameAndPasswordFromLocalStorage();
    if (username && password) {
      this.loginform.controls['username'].setValue(username);
      this.loginform.controls['password'].setValue(password);
      // this.authenticate();
    }
  }

  //========================================Log-In=================================================//
  /**
   * Authenticates the user using the provided credentials from the login form.
   * Sends the username and password to the authentication service, and processes
   * the response to perform the necessary actions such as storing the authentication token,
   * showing notifications, and navigating to the dashboard.
   * Handles failures by displaying appropriate messages and redirects to the login page if needed.
   *
   * @return {void} This method does not return a value.
   */
  authenticate(): void {
    let username = this.loginform.controls["username"].value;
    let password = this.loginform.controls["password"].value;

    this.dataSubscriber$.add(
      this.authenticateService.authenticate(username, password).subscribe({
        next: (response) => {
          let token = response.headers.get('Authorization');

          if (token) {
            //@ts-ignore
            localStorage.setItem('authToken', token);
            this.avNotificationService.showSuccess('Successfully Logged In',
              {
                theme: "light"
              });
            this.router.navigateByUrl("Home/dashboard");
            this.authService.getAuth(username);
            if (this.isCheckedRememberMe) {
              this.saveUserNameAndPasswordToLocalStorage(username, password);
            }
          } else {
            this.operationFeedBackService.showMessage("Authentication Error", "Token is missing from response.");
          }
        },
        error: (error) => {
          const {responseMessage} = this.operationFeedBackService.handleResponse(error.error);
          if (error.status === 401) {

            this.operationFeedBackService.showMessage("Invalid Login", responseMessage);
            this.avNotificationService.showFailure("Invalid Login",
              {
                theme: "light"
              });
          } else {
            this.operationFeedBackService.showMessage("Login Failed", responseMessage);
          }

          if (this.router.url !== "/login") {
            this.router.navigateByUrl("login");
          }
        }
      })
    )
  }

  oAuth2Redirect() {
    this.operationFeedBackService.showMessage("Login failed", "Open account login not supported yet")
    // this.authenticateService.oAuth2Redirect()
    //   .then((response: any) => {
    //     const token = response.headers.get('Authorization');
    //     if (token) {
    //       // @ts-ignore
    //       localStorage.setItem('Authorization', token);
    //       this.router.navigateByUrl("Home/dashboard");
    //     } else {
    //       this.dialogService.showMessage("Login failed", "No token received.");
    //       this.router.navigateByUrl("login");
    //     }
    //   })
    //   .catch((error) => {
    //     this.dialogService.showMessage("Login failed", "Invalid login or user cancelled.");
    //     this.router.navigateByUrl("login");
    //   });
  }

  /**
   * Toggles the authentication state based on the provided option.
   * Updates the state variables to reflect the authentication flow.
   *
   * @param {string} option - Determines the authentication action to be performed.
   *                         If the value is 'signIn', the sign-in state is activated.
   * @return {void} Does not return a value.
   */
  toggleAuth(option: string) {
    this.isSignInActive = option === 'signIn';
    this.isForgetPassword = false;
  }

  //========================================Sign-Up=================================================//

  /**
   * Handles the signup operation by displaying a message to inform the user
   * that public registration is not allowed and they should contact the system administrator.
   *
   * @return {void} Does not return any value.
   */
  signup(): void {
    this.operationFeedBackService.showMessage("Sign Up Not Available", "Public Registration Not Allowed. Please Contact System Administrator");
  }


  //========================================Reset-Password=================================================//

  /**
   * Initializes the forgetPassword process by resetting relevant properties.
   * Updates the step to the first stage, clears the username, and sets the forget password flag.
   *
   * @return {void} Does not return a value.
   */
  forgetPassword() {
    this.step = 1;
    this.username = "";
    this.isForgetPassword = true;
  }

  /**
   * Advances the process to the next step if the username is defined.
   *
   * @return {void} Does not return a value.
   */
  goToNextStep() {
    if (this.username) {
      this.step = 2;
    }
  }

  /**
   * Navigates back to the previous step in the process. If the current step is 4, it skips back to step 2.
   * For all other steps greater than 1, it decrements the step by 1.
   *
   * @return {void} This method does not return a value.
   */
  goToBackStep() {
    if (this.step === 4) {
      this.step = 2;
    } else if (this.step > 1) {
      this.step -= 1;
    }
  }

  /**
   * Updates the application logic based on the selected option.
   *
   * @param {string} option - The option selected by the user. Accepts 'email' or 'support'.
   * @return {void} This method does not return a value.
   */
  selectOption(option: string) {
    if (option === 'email') {
      this.startCountdown();
      this.step = 3;
    } else if (option === 'support') {
      this.step = 4;
    }
  }

  /**
   * Converts a time duration in seconds into a formatted string in the format "MM:SS".
   *
   * @param {number} seconds - The time duration in seconds to format.
   * @return {string} A string representing the formatted time in "MM:SS" format.
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Starts a countdown timer for 3 minutes and updates the state accordingly.
   * It enables or disables specific buttons and updates the displayed time at 1-second intervals.
   * The countdown is reset once the time reaches zero.
   * @return {void} This method does not return a value.
   */
  startCountdown(): void {
    this.startCountDown = true;
    this.enableResend = false;
    this.enableLastBack = false;
    this.enableForgetPassword = true;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const endTime = Date.now() + 3 * 60 * 1000;
    this.countdownInterval = setInterval(() => {
      const timeLeftInMs = endTime - Date.now();
      this.timeLeft = Math.floor(timeLeftInMs / 1000);

      if (this.timeLeft <= 0) {
        // Clear the interval first to prevent any more updates
        clearInterval(this.countdownInterval);

        // Reset everything
        this.displayTime = '03:00';
        this.enableResend = true;
        this.enableLastBack = true;
        this.enableForgetPassword = false;
        this.startCountDown = false;

        // Force change detection for the final state
        this.cdr.detectChanges();
      } else {
        // Update the display time normally
        this.displayTime = this.formatTime(this.timeLeft);
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  /**
   * Handles the 'keyup' event for input elements in a pin input form.
   * This function validates the input to ensure only numeric values are entered, updates the corresponding form controls, and manages focus movement among input elements.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered on keyup.
   * @param {number} index - The index of the current input element in the pin input form.
   * @return {void} Does not return any value.
   */
  //@ts-ignore
  onKeyup(event: KeyboardEvent, index: number): void {
    const inputs = this.pinInputs.toArray();
    //@ts-ignore
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (!/^\d*$/.test(value)) {
      input.value = '';
      return;
    }

    if (value.length > 1) {
      const numbers = value.split('');
      numbers.forEach((num: any, idx: any) => {
        if (index + idx < inputs.length) {
          this.pinFormControls[index + idx].setValue(num);
          inputs[index + idx].nativeElement.value = num;
        }
      });
      const nextIndex = Math.min(index + value.length, inputs.length - 1);
      inputs[nextIndex].nativeElement.focus();
      input.value = value[0];
      return;
    }

    if (value && index < inputs.length - 1) {
      inputs[index + 1].nativeElement.focus();
    }
  }


  /**
   * Handles the keydown event for pin input fields, specifically for the Backspace key.
   * Clears the current input or focuses the previous input field if applicable.
   *
   * @param {KeyboardEvent} event - The keydown event triggered by a user interacting with the input field.
   * @param {number} index - The index of the current input field within the set of pin inputs.
   * @return {void} This method does not return a value.
   */
  //@ts-ignore
  onKeydown(event: KeyboardEvent, index: number): void {
    const inputs = this.pinInputs.toArray();
    if (event.key === 'Backspace') {
      event.preventDefault();
      //@ts-ignore
      const input = event.target as HTMLInputElement;

      if (input.value) {
        this.pinFormControls[index].setValue('');
        input.value = '';
        return;
      }

      if (index > 0) {
        inputs[index - 1].nativeElement.focus();
        inputs[index - 1].nativeElement.value = '';
        this.pinFormControls[index - 1].setValue('');
      }
    }
  }

  // @ts-ignore
  /**
   * Handles the paste event on the input fields for entering PIN. This method processes
   * the clipboard data, filters out numeric values, populates the respective input fields,
   * and sets focus on the last filled input field.
   *
   * @param {ClipboardEvent} event - The clipboard event triggered by the paste action. Contains the clipboard data to be processed.
   * @return {void} This method does not return any value.
   */
  //@ts-ignore
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text');
    const inputs = this.pinInputs.toArray();

    if (!clipboardData) return;

    const numbers = clipboardData.match(/\d/g);
    if (!numbers) return;

    numbers.forEach((num: any, index: any) => {
      if (index < inputs.length) {
        this.pinFormControls[index].setValue(num);
        inputs[index].nativeElement.value = num;
      }
    });

    const lastFilledIndex = Math.min(numbers.length, inputs.length) - 1;
    inputs[lastFilledIndex].nativeElement.focus();
  }

  /**
   * Retrieves the concatenated string of pin values from the form controls.
   *
   * @return {string} The pin represented as a single concatenated string.
   */
  getPin(): string {
    return this.pinFormControls.map(control => control.value).join('');
  }

  /**
   * Navigates the application to the home page by changing the current URL.
   *
   * @return {void} This method does not return a value.
   */
  goToHome() {
    this.router.navigateByUrl("home");
  }

  /**
   * Toggles the "remember me" state for user credentials. When toggled on,
   * a success notification is displayed indicating the credentials will
   * be saved for the next 7 days.
   *
   * @return {void} Does not return a value.
   */
  rememberMe() {
    this.isCheckedRememberMe = !this.isCheckedRememberMe;
    if (this.isCheckedRememberMe) {
      this.avNotificationService.showSuccess("Credentials Saved for next 7 days",
        {
          theme: "light"
        });
    }
  }

  /**
   * Saves the provided username and password to the localStorage along with an expiration timestamp.
   * The credentials are encrypted before being stored.
   *
   * @param {string} username - The username to be stored.
   * @param {string} password - The password to be stored.
   * @return {void} This method does not return a value.
   */
  saveUserNameAndPasswordToLocalStorage(username: string, password: string): void {
    // Calculate expiration date (7 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    // Create storage object with credentials and expiration
    const storageData = {
      username: this.storageLockService.encrypt(username),
      password: this.storageLockService.encrypt(password),
      expiresAt: expirationDate.getTime() // Save as timestamp
    };

    // Save to localStorage as JSON string
    //@ts-ignore
    localStorage.setItem('userCredentials', JSON.stringify(storageData));
  }

  /**
   * Retrieves the username and password from the browser's localStorage if they exist and are not expired.
   * Any expired credentials will be removed from localStorage.
   *
   * @return {Object} An object containing the decrypted username and password.
   *   If credentials are not found or expired, both values will be `null`.
   */
  getUserNameAndPasswordFromLocalStorage(): { username: string | null; password: string | null } {
    //@ts-ignore
    const storageDataStr = localStorage.getItem('userCredentials');

    if (!storageDataStr) {
      return {username: null, password: null};
    }

    const storageData = JSON.parse(storageDataStr);
    const now = new Date().getTime();

    // Check if credentials have expired
    if (now > storageData.expiresAt) {
      // Expired - remove from localStorage
      //@ts-ignore
      localStorage.removeItem('userCredentials');
      return {username: null, password: null};
    }

    // Not expired - return decrypted credentials
    return {
      username: this.storageLockService.decrypt(storageData.username),
      password: this.storageLockService.decrypt(storageData.password)
    };
  }

  /**
   * Checks the expiration status of the stored user credentials.
   * Invokes a function to retrieve the username and password from local storage.
   *
   * @return {void} Does not return any value.
   */
  checkCredentialsExpiration(): void {
    this.getUserNameAndPasswordFromLocalStorage();
  }

  ngOnDestroy(): void {
    this.dataSubscriber$.unsubscribe();
  }
}
