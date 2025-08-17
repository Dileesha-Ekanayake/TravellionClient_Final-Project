import { TestBed } from '@angular/core/testing';

import { DataServerService } from './data-server.service';

describe('DataServerService', () => {
  let service: DataServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
