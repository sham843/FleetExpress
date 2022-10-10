import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedTrackingComponent } from './shared-tracking.component';

describe('SharedTrackingComponent', () => {
  let component: SharedTrackingComponent;
  let fixture: ComponentFixture<SharedTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharedTrackingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
