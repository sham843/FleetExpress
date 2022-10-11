import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementSystemRoutingModule } from './user-management-system-routing.module';
import { UserManagementSystemComponent } from './user-management-system.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    UserManagementSystemComponent,
  ],
  imports: [
    CommonModule,
    UserManagementSystemRoutingModule,
    MaterialModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule

  ]
})
export class UserManagementSystemModule { }
