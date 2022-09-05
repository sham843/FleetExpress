import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementSystemComponent } from './user-management-system.component';

const routes: Routes = [{ path: '', component: UserManagementSystemComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementSystemRoutingModule { }
