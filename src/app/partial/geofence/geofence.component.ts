import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit {
  geofenceListArray = new Array();
  paginationNo:number = 1;
  @ViewChild('search') searchElementRef!: ElementRef;
  
  constructor(public dialog: MatDialog, private configService: ConfigService, private apiCall: ApiCallService) { }

  ngOnInit(): void {
    this.getAllGeofecneData();
  }

  getAllGeofecneData() {
    this.apiCall.setHttp('get', 'Geofencne/get-All-POI?userId=23895&NoPage='+this.paginationNo+'&RowsPerPage='+this.configService.pageSize+'', true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.geofenceListArray = res.responseData?.responseData1;
        }else{
          this.geofenceListArray = [];
        }
      },
      error: (e: any) => {
        console.log(e)
      }
    });
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

  onPagintion(pageNo:any) {
    this.paginationNo = pageNo;
  }
}
