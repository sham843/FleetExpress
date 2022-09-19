import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageVehicleRoutingModule } from './manage-vehicle-routing.module';
import { ManageVehicleComponent } from './manage-vehicle.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ManageVehicleComponent
  ],
  imports: [
    CommonModule,
    ManageVehicleRoutingModule,
    MaterialModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ManageVehicleModule { }
