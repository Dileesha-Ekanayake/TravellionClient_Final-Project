import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {Tour} from "../../../entity/tour";

@Injectable({
  providedIn: 'root'
})

export class TourDataShareService {

  constructor() { }

  private dataSource = new BehaviorSubject<Tour | null>(null);
  tourData$ = this.dataSource.asObservable();

  private triggerTourViewChangeSubject = new Subject<void>();
  public triggerTourView$ = this.triggerTourViewChangeSubject.asObservable();

  sendTourData(data: Tour) {
    this.dataSource.next(data);
  }

  getTourData(): Tour | null {
    return this.dataSource.getValue();
  }

  clearTourData() {
    this.dataSource.next(null);
  }

  triggerTourViewChange() {
    this.triggerTourViewChangeSubject.next();
  }
}
