import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessDenideComponent } from './access-denide.component';

describe('AccessDenideComponent', () => {
  let component: AccessDenideComponent;
  let fixture: ComponentFixture<AccessDenideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccessDenideComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessDenideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
