import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeofenceRoutingModule } from './geofence-routing.module';
import { GeofenceComponent } from './geofence.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';

import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';
import { ConfigService } from 'src/app/services/config.service';

import { AgmCoreModule } from '@agm/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    AgmCoreModule.forRoot(ConfigService.googleApiObj),
  ]
})
export class GeofenceModule { }
