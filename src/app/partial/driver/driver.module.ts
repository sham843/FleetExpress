import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';


@NgModule({
  declarations: [
    DriverComponent
  ],
  imports: [
    CommonModule,
    DriverRoutingModule
  ]
})
export class DriverModule { }
