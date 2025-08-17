import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeakSeasonDemandForecastComponent } from './peak-season-demand-forecast.component';

describe('PeakSeasonDemandForecastComponent', () => {
  let component: PeakSeasonDemandForecastComponent;
  let fixture: ComponentFixture<PeakSeasonDemandForecastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeakSeasonDemandForecastComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeakSeasonDemandForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
