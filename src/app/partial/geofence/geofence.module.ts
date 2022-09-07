import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeofenceRoutingModule } from './geofence-routing.module';
import { GeofenceComponent } from './geofence.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';


@NgModule({
  declarations: [
    GeofenceComponent
  ],
  imports: [
    CommonModule,
    GeofenceRoutingModule,
    MaterialModule
  ]
})
export class GeofenceModule { }
