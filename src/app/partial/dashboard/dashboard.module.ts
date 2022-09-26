import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxGaugeModule } from 'ngx-gauge';

@NgModule({
  declarations: [
    DashboardComponent,

  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgApexchartsModule,
  NgxGaugeModule
  ]
})
export class DashboardModule { }
