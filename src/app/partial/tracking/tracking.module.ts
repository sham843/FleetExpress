import {NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingRoutingModule } from './tracking-routing.module';
import { TrackingComponent } from './tracking.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TicketRaisedComponent } from './ticket-raised/ticket-raised.component';
import { ConfigService } from 'src/app/services/config.service';
import { VehicleTrackingDetailsComponent } from './vehicle-tracking-details/vehicle-tracking-details.component';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';


@NgModule({
  declarations: [
    TrackingComponent,
    TicketRaisedComponent,
    VehicleTrackingDetailsComponent
  ],
  imports: [
    CommonModule,
    TrackingRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
     NgbModule,
     NgxMatDatetimePickerModule,
     NgxMatNativeDateModule,
     NgxMatTimepickerModule,
     AgmCoreModule.forRoot(ConfigService.googleApiObj),
     NgxMaterialTimepickerModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class TrackingModule { }
