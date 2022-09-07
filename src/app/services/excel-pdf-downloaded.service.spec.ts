import { TestBed } from '@angular/core/testing';

import { ExcelPdfDownloadedService } from './excel-pdf-downloaded.service';

describe('ExcelPdfDownloadedService', () => {
  let service: ExcelPdfDownloadedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcelPdfDownloadedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
