import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingViewComponent } from './booking-view.component';

describe('BookingViewComponent', () => {
  let component: BookingViewComponent;
  let fixture: ComponentFixture<BookingViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
