import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { ReportsService } from './reports.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    ReportsComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MaterialModule,HttpClientModule ,
    FormsModule, ReactiveFormsModule
  ],
  providers:[ReportsService]
})
export class ReportsModule { }
