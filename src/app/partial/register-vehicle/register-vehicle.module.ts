import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterVehicleRoutingModule } from './register-vehicle-routing.module';
import { RegisterVehicleComponent } from './register-vehicle.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';


@NgModule({
  declarations: [
    RegisterVehicleComponent
  ],
  imports: [
    CommonModule,
    RegisterVehicleRoutingModule,
    MaterialModule
  ]
})
export class RegisterVehicleModule { }
