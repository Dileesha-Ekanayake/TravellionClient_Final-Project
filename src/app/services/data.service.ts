import {HttpClient, HttpParams} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {catchError, map, Observable, of} from "rxjs";
import {ServerResponse} from "../util/api-response/server-response";

/**
 * DataService is an Angular service that allows HTTP communication with a backend server.
 * It provides methods for CRUD operations as well as data retrieval with optional query parameters.
 *
 * This service is injectable globally using the `providedIn: 'root'` configuration.
 */
@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private http: HttpClient) {
  }

  /**
   * Fetches a list of regex patterns based on the provided endpoint and type.
   *
   * @param {string} endpoint - The base URL to fetch regex patterns from.
   * @param {string} type - The type of regex patterns to be fetched.
   * @return {Observable<string[]>} An observable containing an array of regex patterns.
   */
  getRegex(endpoint: string, type: string): Observable<string[]> {
    return this.http.get<string[]>(`${endpoint}/${type}`).pipe(
      catchError(error => {
        console.error(`Error fetching regex patterns for type: ${type}`, error);
        return of([]);
      })
    );
  }

  /**
   * Fetches data from the specified endpoint with optional query parameters.
   *
   * @param {string} endpoint The API endpoint to fetch data from.
   * @param {string | number} [query] Optional query or path parameter to append to the endpoint.
   *                                  If it starts with '?', it is treated as a query string.
   *                                  Otherwise, it is treated as a path parameter.
   * @return {Observable<Array<T>>} An observable that emits an array of the fetched data of type T.
   */
  getData<T>(endpoint: string, query?: string | number): Observable<Array<T>> {

    let url = endpoint;

    // Handle path parameter
    if (query && typeof query === 'string') {
      // Check if the parameter is a query string (starts with '?')
      if (query.startsWith('?')) {
        url = `${endpoint}${query}`; // Append query string directly
      } else if (query.includes('=')) {
        url = `${endpoint}?${query}`; // Treat as query parameter
      } else {
        url = `${endpoint}/${query}`; // Treat as path parameter
      }
    }

    return this.http.get<ServerResponse<Array<T>>>(url).pipe(
      map(response => response.data || []),
      catchError(() => {
        console.error(`Error fetching data`);
        return of([]);
      })
    );
  }

  /**
   * Fetches a data object from the given endpoint with an optional query parameter.
   *
   * @param {string} endpoint The API endpoint to fetch the data from.
   * @param {string | number} [query] An optional query parameter to append to the endpoint.
   * @return {Observable<T>} An observable that emits the fetched data object of type T.
   */
  getDataObject<T>(endpoint: string, query?: string | number): Observable<T> {
    return this.http.get<ServerResponse<T>>(query ? `${endpoint}/${query}` : endpoint).pipe(
      map(response => {
        if (!response.data) throw new Error('No data returned from server');
        return response.data;
      })
    );
  }
  /**
   * Retrieves a reference number by making an HTTP GET request to the specified endpoint.
   *
   * @param {string} endpoint - The API endpoint to target for the request.
   * @param {T} responseKey - The key in the response data used to retrieve the reference number.
   * @param {string | {[key: string]: string | number | boolean}=} parameter - Optional parameter that can either be:
   *        1) A string representing a path or query parameter.
   *        2) An object representing query parameters as key-value pairs.
   * @return {Observable<{[K in T]: string}>} An observable containing an object with the specified response key mapped to the reference number as a string.
   */
  getRefNumber<T extends string>(endpoint: string, responseKey: T, parameter?: string | {[key: string]: string | number | boolean }): Observable<{ [K in T]: string }> {
    let url = endpoint;
    let params = new HttpParams();

    // Handle path parameter
    if (parameter && typeof parameter === 'string') {
      // Check if the parameter is a query string (starts with '?')
      if (parameter.startsWith('?')) {
        url = `${endpoint}${parameter}`; // Append query string directly
      } else {
        url = `${endpoint}/${parameter}`; // Treat as path parameter
      }
    }

    // Handle query parameter object
    else if (parameter && typeof parameter === 'object') {
      Object.entries(parameter).forEach(([key, value]) => {
        params = params.set(key, value.toString());
      });
    }

    return this.http.get<ServerResponse<{ [K in T]: string }>>(
      url,
      parameter && typeof parameter === 'object' ? {params} : {}
    ).pipe(
      map(response => response.data ?? { [responseKey]: '' } as { [K in T]: string })
    );
  }

  /**
   * Sends a POST request to the specified endpoint with the provided data.
   *
   * @param {string} endpoint - The API endpoint to which the request should be sent.
   * @param {T | T[]} data - The data to be sent in the request body, either a single object or an array of objects.
   * @return {Observable<ServerResponse<string>>} An observable containing the server response.
   */
  save<T>(endpoint: string, data: T | T[]): Observable<ServerResponse<string>> {
    return this.http.post<ServerResponse<string>>(endpoint, data);
  }

  /**
   * Sends an HTTP PUT request to the specified endpoint with the provided data.
   *
   * @param {string} endpoint - The URL endpoint to which the HTTP PUT request should be sent.
   * @param {T} data - The data object to be updated and sent with the HTTP PUT request.
   * @return {Observable<ServerResponse<string>>} An observable emitting the server's response containing a string message.
   */
  update<T>(endpoint: string, data: T): Observable<ServerResponse<string>> {
    return this.http.put<ServerResponse<string>>(endpoint, data);
  }

  /**
   * Sends a DELETE request to the specified endpoint with a given value.
   *
   * @param {string} endpoint - The API endpoint to which the DELETE request is sent.
   * @param {number | string} value - The identifier or value appended to the endpoint for deletion.
   * @return {Observable<ServerResponse<string>>} An observable containing the server response for the deletion request.
   */
  delete(endpoint: string, value: number | string): Observable<ServerResponse<string>> {
    return this.http.delete<ServerResponse<string>>(`${endpoint}/${value}`);
  }
}
