import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigService } from 'src/app/services/config.service';
import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit {
  geofenceListArray = new Array();
  @ViewChild('search') searchElementRef!: ElementRef;
  constructor(public dialog: MatDialog, private configService: ConfigService) { }

  ngOnInit(): void {
    this.getAllGeofecneData();
  }

  getAllGeofecneData() {
    // https://aws-stpltrack-vehicletracking.mahamining.com/fleet-express/Geofencne/get-All-POI?userId=23895&NoPage=1&RowsPerPage=10
  }

  openCreateGeofenceDialog() {
    const dialogRef = this.dialog.open(CreateGeofenceComponent, {
      width: this.configService.dialogBoxWidth[2],
      data: '',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }
}
