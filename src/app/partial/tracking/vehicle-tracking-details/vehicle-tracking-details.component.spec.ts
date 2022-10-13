import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleTrackingDetailsComponent } from './vehicle-tracking-details.component';

describe('VehicleTrackingDetailsComponent', () => {
  let component: VehicleTrackingDetailsComponent;
  let fixture: ComponentFixture<VehicleTrackingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleTrackingDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleTrackingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
