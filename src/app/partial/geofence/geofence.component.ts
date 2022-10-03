import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit {

  @ViewChild('search') searchElementRef!: ElementRef;
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {

  }

  openCreateGeofenceDialog() {
    const dialogRef = this.dialog.open(CreateGeofenceComponent, {
      width: '250px',
      data: '',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }

}
