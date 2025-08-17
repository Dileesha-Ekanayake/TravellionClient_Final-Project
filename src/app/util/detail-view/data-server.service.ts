import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";

/**
 * Injectable service for managing and sharing data across components using a BehaviorSubject.
 * Provides a mechanism to send and observe data updates within the application.
 */
@Injectable({
  providedIn: 'root'
})
export class DataServerService {

  constructor() { }

  /**
   * A BehaviorSubject that acts as the source of data within the application.
   * It initializes with a default value of `null` and can emit new values
   * to its subscribers whenever they are updated. Particularly useful for
   * scenarios where components need to react to or initialize with the
   * latest emitted value.
   *
   * @type {BehaviorSubject<any>}
   */
  private dataSource = new BehaviorSubject<any>(null);
  /**
   * An observable instance derived from the data source.
   * It provides a stream of data that can be subscribed to for reactive operations.
   * The variable is typically used to monitor changes in the data source and respond reactively.
   */
  currentData = this.dataSource.asObservable();

  /**
   * Sends data to the data source by emitting the provided value.
   *
   * @param {any} data The data to be emitted to the data source.
   * @return {void} No return value.
   */
  sendData(data: any) {
    this.dataSource.next(data);
  }
}
