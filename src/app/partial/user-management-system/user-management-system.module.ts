import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementSystemRoutingModule } from './user-management-system-routing.module';
import { UserManagementSystemComponent } from './user-management-system.component';


@NgModule({
  declarations: [
    UserManagementSystemComponent
  ],
  imports: [
    CommonModule,
    UserManagementSystemRoutingModule
  ]
})
export class UserManagementSystemModule { }
