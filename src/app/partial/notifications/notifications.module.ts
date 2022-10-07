import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    NotificationsComponent,
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ]
})
export class NotificationsModule { }
