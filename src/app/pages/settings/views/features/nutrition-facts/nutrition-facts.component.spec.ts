import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionFactsComponent } from './nutrition-facts.component';

describe('NutritionFactsComponent', () => {
  let component: NutritionFactsComponent;
  let fixture: ComponentFixture<NutritionFactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NutritionFactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NutritionFactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
