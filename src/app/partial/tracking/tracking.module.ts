import {NgModule,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingRoutingModule } from './tracking-routing.module';
import { TrackingComponent } from './tracking.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { AgmCoreModule } from '@agm/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';


@NgModule({
  declarations: [
    TrackingComponent,
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
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
    }),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class TrackingModule { }
