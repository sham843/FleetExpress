import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterVehicleRoutingModule } from './register-vehicle-routing.module';
import { RegisterVehicleComponent } from './register-vehicle.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { VehicleModalComponent } from './vehicle-modal/vehicle-modal.component';


@NgModule({
  declarations: [
    RegisterVehicleComponent,
    VehicleModalComponent
  ],
  imports: [
    CommonModule,
    RegisterVehicleRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ]
})
export class RegisterVehicleModule { }
