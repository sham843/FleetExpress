import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyProfileRoutingModule } from './my-profile-routing.module';
import { MyProfileComponent } from './my-profile.component';
import { MaterialModule } from 'src/app/shared/angularMaterialModule/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';



@NgModule({
  declarations: [
    MyProfileComponent,
    ProfileModalComponent
  ],
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class MyProfileModule { }
