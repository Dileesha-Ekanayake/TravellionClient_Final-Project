import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentCollectionComponent } from './payment-collection.component';

describe('PaymentCollectionComponent', () => {
  let component: PaymentCollectionComponent;
  let fixture: ComponentFixture<PaymentCollectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentCollectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
