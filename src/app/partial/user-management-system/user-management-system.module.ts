import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementSystemRoutingModule } from './user-management-system-routing.module';
import { UserManagementSystemComponent } from './user-management-system.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';

@NgModule({
  declarations: [
    UserManagementSystemComponent
  ],
  imports: [
    CommonModule,
    UserManagementSystemRoutingModule,
    MaterialModule
  ]
})
export class UserManagementSystemModule { }
