import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeofenceRoutingModule } from './geofence-routing.module';
import { GeofenceComponent } from './geofence.component';


@NgModule({
  declarations: [
    GeofenceComponent
  ],
  imports: [
    CommonModule,
    GeofenceRoutingModule
  ]
})
export class GeofenceModule { }
