import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourViewComponent } from './tour-view.component';

describe('TourViewComponent', () => {
  let component: TourViewComponent;
  let fixture: ComponentFixture<TourViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
