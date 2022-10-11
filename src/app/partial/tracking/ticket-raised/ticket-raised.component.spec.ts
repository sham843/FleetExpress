import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketRaisedComponent } from './ticket-raised.component';

describe('TicketRaisedComponent', () => {
  let component: TicketRaisedComponent;
  let fixture: ComponentFixture<TicketRaisedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TicketRaisedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketRaisedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
