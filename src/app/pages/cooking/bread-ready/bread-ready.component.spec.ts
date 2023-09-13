import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadReadyComponent } from './bread-ready.component';

describe('BreadReadyComponent', () => {
  let component: BreadReadyComponent;
  let fixture: ComponentFixture<BreadReadyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BreadReadyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BreadReadyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
