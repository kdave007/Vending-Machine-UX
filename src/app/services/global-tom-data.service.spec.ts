import { TestBed } from '@angular/core/testing';

import { GlobalTomDataService } from './global-tom-data.service';

describe('GlobalTomDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GlobalTomDataService = TestBed.get(GlobalTomDataService);
    expect(service).toBeTruthy();
  });
});
