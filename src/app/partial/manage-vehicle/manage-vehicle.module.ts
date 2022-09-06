import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageVehicleRoutingModule } from './manage-vehicle-routing.module';
import { ManageVehicleComponent } from './manage-vehicle.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';


@NgModule({
  declarations: [
    ManageVehicleComponent
  ],
  imports: [
    CommonModule,
    ManageVehicleRoutingModule,
    MaterialModule
  ]
})
export class ManageVehicleModule { }
