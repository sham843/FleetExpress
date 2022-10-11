//import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { TicketRaisedComponent } from './ticket-raised/ticket-raised.component';


@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
  searchContent = new FormControl('');
  allVehiclelData = new Array();
  subscription !: Subscription;
  selectedTab!:string;
  allRunningVehiclelData = new Array();
  allStoppedVehiclelData = new Array();
  allIdleVehiclelData = new Array();
  allOfflineVehiclelData = new Array();
  selectedIndex!: number;
  driverDetailsData=new Array();
  vehicleDetailsData=new Array();
  foods = new Array();
  maintananceForm!: FormGroup;
  vehicleDetails: any;
  todayDate = new Date();
  allVehiclelDataClone=new Array();

  constructor(private apiCall: ApiCallService, private webStorage: WebStorageService,
    private error: ErrorsService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getAllVehicleListData();
  }

  getAllVehicleListData() {
    this.allVehiclelData = []
    this.apiCall.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.webStorage.getUserId() + '&VehicleNo=' + (!this.searchContent.value ? '' : this.searchContent.value) + '&GpsStatus=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.allVehiclelDataClone = res.responseData;
          this.allVehiclelData = res.responseData;
          res.responseData.find((x: any) => {
           x.gpsStatus == 'Running' ? this.allRunningVehiclelData.push(x) 
          : x.gpsStatus == 'Stopped' ? this.allStoppedVehiclelData.push(x) 
          : x.gpsStatus == 'Idle' ? this.allIdleVehiclelData.push(x)
          : x.gpsStatus == 'Offline' ?this.allOfflineVehiclelData.push(x) : ''
         });

        } else {
          if (res.statusCode != "404") {
            this.allVehiclelData = [];
            this.error.handelError(res.statusCode)
          }
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }

  clickOnTrackingTab(flag: string) {
    flag == 'Running' ? this.allVehiclelData = this.allRunningVehiclelData
    : flag == 'Stopped' ? this.allVehiclelData = this.allStoppedVehiclelData
    : flag == 'Idle' ? this.allVehiclelData = this.allIdleVehiclelData
    : flag == 'Offline' ? this.allVehiclelData = this.allOfflineVehiclelData
    : flag == 'TotalVehicles' ? this.allVehiclelData = this.allVehiclelDataClone:'';
  }

  submitvehicleMarkMaintance() {

  }

  openTicketRaisedDialog(data:any,flag:string){
    let obj = {flag:flag ,...data}
    const dialogRef = this.dialog.open(TicketRaisedComponent, {
      width: '250px',
      data: obj,
    });
    dialogRef.afterClosed().subscribe(result => {
      result
    });
  
  }
}