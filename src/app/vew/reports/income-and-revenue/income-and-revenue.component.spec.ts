import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeAndRevenueComponent } from './income-and-revenue.component';

describe('IncomeAndRevenueComponent', () => {
  let component: IncomeAndRevenueComponent;
  let fixture: ComponentFixture<IncomeAndRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeAndRevenueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeAndRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
