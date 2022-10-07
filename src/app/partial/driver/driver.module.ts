import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
@NgModule({
  declarations: [
    DriverComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  NgxPaginationModule
  ]
})
export class DriverModule { }
