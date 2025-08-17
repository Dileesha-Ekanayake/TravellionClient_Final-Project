import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierPaymentComponent } from './supplier-payment.component';

describe('SupplierPaymentComponent', () => {
  let component: SupplierPaymentComponent;
  let fixture: ComponentFixture<SupplierPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplierPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
