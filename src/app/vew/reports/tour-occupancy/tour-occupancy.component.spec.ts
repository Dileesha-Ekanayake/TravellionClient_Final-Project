import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourOccupancyComponent } from './tour-occupancy.component';

describe('TourOccupancyComponent', () => {
  let component: TourOccupancyComponent;
  let fixture: ComponentFixture<TourOccupancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourOccupancyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourOccupancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
