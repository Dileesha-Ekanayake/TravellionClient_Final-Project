import {Injectable} from "@angular/core";
import {map, Observable, startWith} from "rxjs";
import {FormGroup} from "@angular/forms";

/**
 * Injectable service to provide data filtering and display functionality for AutoComplete widgets.
 */
@Injectable({
  providedIn: 'root'
})

export class AutoCompleteDataFilterService{

  constructor() {
  }

  /**
   * Filters the provided array of data based on the value changes of a specified form control and filter properties.
   *
   * @param {Array<T>} data - The array of data items to be filtered.
   * @param {FormGroup} form - The FormGroup containing the form control used for filtering.
   * @param {string} controlName - The name of the form control within the FormGroup whose value will be used for filtering.
   * @param {string[]} filterProps - An array of string properties that determines how the filtering is applied to the data.
   * @return {Observable<Array<T>>} - An observable emitting the filtered array of data items.
   */
  public filterData<T>(data: Array<T>, form: FormGroup, controlName: string, filterProps: string[]): Observable<Array<T>> {
    return form.controls[controlName].valueChanges.pipe(
      startWith(''),
      map(value => {
        // Handle both string input and object selection
        const searchValue = typeof value === 'string' ? value : this.getNestedValue(value, filterProps[0]) || '';
        return this._filter(searchValue, data, filterProps);
      })
    );
  }

  /**
   * Retrieves and displays the value of a nested property from the provided object based on the given property path.
   *
   * @param {T} obj - The object from which the value is to be extracted.
   * @param {string[]} propertyPath - An array of strings representing the path to the nested property.
   * @return {string} The value of the nested property as a string, or an empty string if the object is undefined or null.
   */
  public displayValue<T>(obj: T, propertyPath: string[]): string {
    return obj ? this.getNestedValue(obj, propertyPath[0]) : '';
  }

  /**
   * Filters an array of objects based on a search value and specified properties.
   *
   * @param {string} searchValue - The value to filter the data against.
   * @param {Array<T>} data - The array of objects to be filtered.
   * @param {string[]} filterProps - The list of property paths to search within each object.
   * @return {T[]} A new array containing only the objects that match the search criteria.
   */
  private _filter<T>(searchValue: string, data: Array<T>, filterProps: string[]): T[] {
    const filterValue = searchValue.toLowerCase();

    return data.filter(item => {
      // Check if any of the specified properties contain the search value
      return filterProps.some(propPath => {
        const propValue = this.getNestedValue(item, propPath);
        return propValue && propValue.toLowerCase().includes(filterValue);
      });
    });
  }

  /**
   * Retrieves a nested value from an object based on a provided dot-separated path.
   * Handles scenarios where the object contains nested arrays and joins the values for arrays.
   *
   * @param {any} object - The object from which the value is to be retrieved.
   * If the object is null or undefined, a default value is returned.
   * @param {string} path - A dot-separated string representing the path to the desired nested value.
   * The path supports array notation for accessing elements within arrays.
   * @return {any} The value retrieved from the specified path within the object.
   * If the value is an array, its items are joined into a single string separated by commas.
   * If the value does not exist or is undefined, a default value ('-') is returned.
   */
  private getNestedValue(object: any, path: string): any {
    // the object is null or undefined
    if (!object) return '-';

    // Check if a path has array notation
    const keys = path.split('.');
    let value = object;

    // loop to access data
    for (const key of keys) {
      if (Array.isArray(value)) {
        // the current value is an array, map over its items
        value = value.map(item => item[key]).filter(item => item !== undefined);
      } else {
        value = value?.[key]; // Access the next level
      }
    }
    // value is an array, join the values for display
    return Array.isArray(value) ? value.join(', ') : value || '-';
  }

}
