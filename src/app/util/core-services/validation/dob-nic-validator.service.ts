import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

/**
 * Custom validator function to validate the correspondence between National Identity Card (NIC) number
 * and date of birth (DOB) provided in a form group.
 *
 * This function checks if the year of birth derived from the NIC number matches the year provided
 * in the DOB field. It supports both 10-digit old NIC format (e.g., XXXXXXYYYV) and 12-digit new NIC format.
 *
 * Validation logic:
 * - If the NIC number is 10 characters long, the birth year is derived from the first two digits prefixed with "19".
 * - If the NIC number is 12 characters long, the birth year is derived from the first four digits.
 * - If the derived year does not match the year from the DOB, the validator returns a `nicDobMismatch` error.
 *
 * If either `nic` or `dobirth` is not provided or has an invalid value, the validator returns `null`, assuming no errors.
 *
 * @param group The `AbstractControl` object representing the form group containing `nic` and `dobirth` fields.
 * @returns A `ValidationErrors` object containing `nicDobMismatch: true` if there is a mismatch, or `null` if validation passes.
 */
export const dobNicValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const nic = group.get('nic')?.value;
  const dobirth = group.get('dobirth')?.value;

  if (!nic || !dobirth) return null;

  const birthYear = new Date(dobirth).getFullYear();

  if (nic.length === 10) {
    const nicYear = parseInt('19' + nic.substring(0, 2), 10);
    return nicYear !== birthYear ? { nicDobMismatch: true } : null;
  }

  if (nic.length === 12) {
    const nicYear = parseInt(nic.substring(0, 4), 10);
    return nicYear !== birthYear ? { nicDobMismatch: true } : null;
  }

  return null;
};
