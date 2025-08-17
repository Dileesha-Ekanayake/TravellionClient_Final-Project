import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitabilityAnalysisByTourTypeComponent } from './profitability-analysis-by-tour-type.component';

describe('ProfitabilityAnalysisByTourTypeComponent', () => {
  let component: ProfitabilityAnalysisByTourTypeComponent;
  let fixture: ComponentFixture<ProfitabilityAnalysisByTourTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitabilityAnalysisByTourTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitabilityAnalysisByTourTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
