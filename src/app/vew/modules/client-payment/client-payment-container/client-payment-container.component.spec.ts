import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPaymentContainerComponent } from './client-payment-container.component';

describe('ClientPaymentContainerComponent', () => {
  let component: ClientPaymentContainerComponent;
  let fixture: ComponentFixture<ClientPaymentContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientPaymentContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientPaymentContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
