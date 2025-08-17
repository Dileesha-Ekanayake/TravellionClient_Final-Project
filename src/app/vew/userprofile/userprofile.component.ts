import {Component, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {MatError, MatFormField, MatLabel, MatPrefix, MatSuffix} from "@angular/material/form-field";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatChip} from "@angular/material/chips";
import {EmployeeForUserDetails} from "../../entity/employee-for-user-details";
import {UserPasswordUpdate} from "../../auth/user-password-update";
import {Subscription} from "rxjs";
import {DataService} from "../../services/data.service";
import {ApiEndpoints} from "../../services/api-endpoint";
import {OperationFeedbackService} from "../../util/core-services/feedback/operationfeedback.service";
import {AuthorizationManagerService} from "../../auth/authorization-manager.service";
import {NgClass} from "@angular/common";
import {AvNotificationService} from "@avoraui/av-notifications";

@Component({
  selector: 'app-userprofile',
  imports: [
    MatCard,
    MatIcon,
    MatLabel,
    MatButton,
    MatCardContent,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatCardHeader,
    MatCardTitle,
    MatChip,
    MatPrefix,
    MatSuffix,
    MatError,
    NgClass
  ],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.css',
  standalone: true,
})
export class UserprofileComponent implements OnInit {

  employee!: EmployeeForUserDetails;

  pwdHide = true;
  newPwdHide = true;
  pwdConfHide = true;

  passwordForm!: FormGroup;
  showPasswordSection = false;

  dataSubscriber$ = new Subscription();

  userProfileImage: string = '';

  constructor(
    private fb: FormBuilder,
    protected authorizationMangerService: AuthorizationManagerService,
    private dataService: DataService,
    private operationFeedbackService: OperationFeedbackService,
    private avNotificationService: AvNotificationService,
  ) {

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  /**
   * Initializes the component by loading the user profile and setting up value change subscribers
   * for specific form controls to trigger password verification logic.
   *
   * @return {void} No return value.
   */
  ngOnInit() {
    this.loadUserProfile();

    ['newPassword', 'confirmPassword'].forEach(field => {
      const control = this.passwordForm.get(field);
      if (control) {
        control.valueChanges.subscribe(() => this.verifyPassword());
      }
    });
  }

  /**
   * Loads the user profile data from the local storage and assigns it to the employee property.
   * If no data is found in local storage, the operation is aborted without any changes to the employee property.
   *
   * @return {void} Does not return any value.
   */
  loadUserProfile(): void {
    //@ts-ignore
    const e = localStorage.getItem('employee');
    if (e) {
      this.employee = JSON.parse(e);
    }
  }

  /**
   * Toggles the visibility of the password section. When the password section is hidden,
   * it resets the form associated with the password input fields.
   *
   * @return {void} No return value.
   */
  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
    if (!this.showPasswordSection) {
      this.passwordForm.reset();
    }
  }

  /**
   * Updates the user's password after validating the provided form data.
   * This method performs the following actions:
   * - Validates the input form for current password, new password, and confirm password.
   * - Sends a request to update the password if the form data is valid.
   * - Displays confirmation prompts and error messages as needed.
   * - Resets the form and logs out the user upon successful password update.
   *
   * @return {void} Does not return any value.
   */
  updatePassword(): void {
    if (this.passwordForm.valid) {

      const {currentPassword, newPassword, confirmPassword} = this.passwordForm.value;
      const updatePasswordRequest = new UserPasswordUpdate();
      updatePasswordRequest.userName = this.employee.users[0].username;
      updatePasswordRequest.oldPassword = currentPassword;
      updatePasswordRequest.newPassword = newPassword;
      updatePasswordRequest.confirmPassword = confirmPassword;

      this.operationFeedbackService.showConfirmation('User Password', 'Update', "")
        .subscribe({
          next: (isConfirmed) => {
            if (!isConfirmed) return;
            this.dataService.update<UserPasswordUpdate>(ApiEndpoints.paths.userPasswordUpdate, updatePasswordRequest)
              .subscribe({
                next: (response) => {
                  // Handle the response
                  const {status, responseMessage, serverInfo} = this.operationFeedbackService.handleResponse(response);

                  if (status) {
                    this.passwordForm.reset();
                    this.showPasswordSection = false;
                    this.authorizationMangerService.logout();
                  }

                  this.operationFeedbackService.showStatus("User Password", "Update", responseMessage);
                },
                error: (error) => {
                  const {responseMessage} = this.operationFeedbackService.handleResponse(error.error);
                  this.operationFeedbackService.showErrors("User Password", "Update", responseMessage
                  );
                }
              });
          }
        });
    } else {
      this.avNotificationService.showFailure('Please fill in all fields correctly', {
        theme: "light"
      });
    }
  }

  /**
   * Verifies if the new password matches the confirmation password in a form.
   * If the passwords do not match, sets an error on the confirmPassword control.
   * If they match, clears any existing errors on the confirmPassword control.
   *
   * @return {void} Returns nothing. Performs validation and updates form control errors directly.
   */
  verifyPassword(): void {
    const password = this.passwordForm.controls['newPassword'].value;
    const confirmPassword = this.passwordForm.controls['confirmPassword'].value;

    if (password !== confirmPassword) {
      this.passwordForm.controls['confirmPassword'].setErrors({passwordsNotMatching: true});
    } else {
      this.passwordForm.controls['confirmPassword'].setErrors(null);
    }
  }

  /**
   * Returns the corresponding color based on the provided status.
   *
   * @param {string} status - The status string that determines the color.
   *                          Expected values are 'Active' or other statuses.
   * @return {string} The corresponding color value. Returns 'primary' for 'Active' status
   *                  and 'warn' for all other statuses.
   */
  getStatusColor(status: string): string {
    return status === 'Active' ? 'primary' : 'warn';
  }

  /**
   * Formats a given date string into a human-readable date format (e.g., "Month Day, Year").
   *
   * @param {string} dateString - The date string to be formatted.
   * @return {string} The formatted date string in "Month Day, Year" format.
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
