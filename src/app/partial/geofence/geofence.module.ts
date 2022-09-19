import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeofenceRoutingModule } from './geofence-routing.module';
import { GeofenceComponent } from './geofence.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { AgmCoreModule } from '@agm/core';


@NgModule({
  declarations: [
    GeofenceComponent
  ],
  imports: [
    CommonModule,
    GeofenceRoutingModule,
    MaterialModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'geometry'],
    }),
  ]
})
export class GeofenceModule { }
