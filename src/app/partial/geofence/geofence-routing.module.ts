import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeofenceComponent } from './geofence.component';

const routes: Routes = [{ path: '', component: GeofenceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeofenceRoutingModule { }
