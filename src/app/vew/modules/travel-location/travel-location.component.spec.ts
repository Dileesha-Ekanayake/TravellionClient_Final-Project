import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelLocationComponent } from './travel-location.component';

describe('TravelLocationComponent', () => {
  let component: TravelLocationComponent;
  let fixture: ComponentFixture<TravelLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TravelLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
