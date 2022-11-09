import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { ConfigService } from 'src/app/services/config.service';
import { ViewReportComponent } from './view-report/view-report.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ReportsComponent,
    ViewReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    NgxPaginationModule,
    AgmCoreModule.forRoot(ConfigService.googleApiObj),
  ],
  providers:[]
})
export class ReportsModule { }
