import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupDetailsComponent } from './setup-details.component';

describe('SetupDetailsComponent', () => {
  let component: SetupDetailsComponent;
  let fixture: ComponentFixture<SetupDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
