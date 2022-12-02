import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VehicleAlertNotificationsComponent } from './vehicle-alert-notifications/vehicle-alert-notifications.component';
import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [
    SettingsComponent,
    VehicleAlertNotificationsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class SettingsModule { }
