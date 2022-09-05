import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserManagementSystemComponent } from './user-management-system.component';

describe('UserManagementSystemComponent', () => {
  let component: UserManagementSystemComponent;
  let fixture: ComponentFixture<UserManagementSystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserManagementSystemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserManagementSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
