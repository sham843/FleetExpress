import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleAlertNotificationsComponent } from './vehicle-alert-notifications.component';

describe('VehicleAlertNotificationsComponent', () => {
  let component: VehicleAlertNotificationsComponent;
  let fixture: ComponentFixture<VehicleAlertNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleAlertNotificationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleAlertNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
