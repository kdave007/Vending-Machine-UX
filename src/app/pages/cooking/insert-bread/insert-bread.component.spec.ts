import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertBreadComponent } from './insert-bread.component';

describe('InsertBreadComponent', () => {
  let component: InsertBreadComponent;
  let fixture: ComponentFixture<InsertBreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsertBreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsertBreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
