import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGeofenceComponent } from './create-geofence.component';

describe('CreateGeofenceComponent', () => {
  let component: CreateGeofenceComponent;
  let fixture: ComponentFixture<CreateGeofenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateGeofenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGeofenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
