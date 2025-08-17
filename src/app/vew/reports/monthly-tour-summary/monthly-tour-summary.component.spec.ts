import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTourSummaryComponent } from './monthly-tour-summary.component';

describe('MonthlyTourSummaryComponent', () => {
  let component: MonthlyTourSummaryComponent;
  let fixture: ComponentFixture<MonthlyTourSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyTourSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyTourSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
