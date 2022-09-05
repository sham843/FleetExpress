import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageVehicleRoutingModule } from './manage-vehicle-routing.module';
import { ManageVehicleComponent } from './manage-vehicle.component';


@NgModule({
  declarations: [
    ManageVehicleComponent
  ],
  imports: [
    CommonModule,
    ManageVehicleRoutingModule
  ]
})
export class ManageVehicleModule { }
