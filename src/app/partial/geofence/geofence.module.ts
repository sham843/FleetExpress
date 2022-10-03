import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeofenceRoutingModule } from './geofence-routing.module';
import { GeofenceComponent } from './geofence.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { AgmCoreModule } from '@agm/core';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';

@NgModule({
  declarations: [
    GeofenceComponent,
    CreateGeofenceComponent
  ],
  imports: [
    CommonModule,
    GeofenceRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAkNBALkBX7trFQFCrcHO2I85Re2MmzTo8',
      language: 'en',
      libraries: ['places', 'drawing', 'geometry'],
    }),
  ]
})
export class GeofenceModule { }
