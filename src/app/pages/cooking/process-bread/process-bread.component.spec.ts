import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessBreadComponent } from './process-bread.component';

describe('ProcessBreadComponent', () => {
  let component: ProcessBreadComponent;
  let fixture: ComponentFixture<ProcessBreadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessBreadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessBreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
