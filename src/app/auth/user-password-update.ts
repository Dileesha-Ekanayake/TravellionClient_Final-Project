/**
 * Represents an update operation for a user's password.
 * This class is used to process, validate, and manage
 * the data required when a user requests a password change.
 */
export class UserPasswordUpdate {

  public userName!: string;
  public oldPassword!: string;
  public newPassword!: string;
  public confirmPassword!: string;

}
