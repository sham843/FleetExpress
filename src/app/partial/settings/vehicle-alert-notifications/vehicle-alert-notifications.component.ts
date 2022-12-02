import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';


@Component({
  selector: 'app-vehicle-alert-notifications',
  templateUrl: './vehicle-alert-notifications.component.html',
  styleUrls: ['./vehicle-alert-notifications.component.scss']
})
export class VehicleAlertNotificationsComponent implements OnInit {
  dialogData !: object | any;
  notificationsData = new Array();
  value:number = 0;
  showTicks:boolean = false;
  autoTicks:boolean = false;
  tickInterval:number = 1;
  selectedVehicleNumber!:string;
  vehiclesAlertsData:any;
  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }
    return 0;
  }
  constructor(public dialogRef: MatDialogRef<VehicleAlertNotificationsComponent>,
    public CommonMethod: CommonMethodsService,
    private apiCall: ApiCallService, 
    private webStorage: WebStorageService ,
     private commonMethods: CommonMethodsService, 
    private spinner: NgxSpinnerService, 
    private error:ErrorsService,
    @Inject(MAT_DIALOG_DATA) public data: any, public config: ConfigService) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    console.log(this.dialogData);
    this.getVehiclesAlertsData();
  }

  getVehiclesAlertsData() {
      const url= this.dialogData?.seletedTab!='vehicle'?'settingsNotification/get-glopal-notification?vehicleOwnerId='+this.webStorage.getVehicleOwnerId()
      :'settingsNotification/get-vehiclewise-notification?vehicleOwnerId='+this.webStorage.getVehicleOwnerId()+ '&vehicleId='+this.dialogData?.data?.vehicleId+'&vehicleNumber='+this.dialogData?.data?.vehicleNo;
      this.apiCall.setHttp('get', url, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode === "200") {
            this.vehiclesAlertsData = res.responseData;

          } else {
            if (res.statusCode != "404") {
              this.error.handelError(res.statusCode)
            }
          }
        }
      }, (error: any) => { this.error.handelError(error.status) });
  }

  switchNotification(rowData:any, status:string){ 
    this.spinner.show();
    const url = (status=='alert'?'notification/set-Visibity-Notification?alertype='+ rowData.alertType +'&Isnotification='+ rowData.isNotification
    :'notification/set-Visibity-Notification?alertype='+ rowData.alertType +'&Isvisible='+ rowData.isvisible+'&vehicleNo='+this.selectedVehicleNumber)
    this.apiCall.setHttp('PUT', url, true, false, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.commonMethods.snackBar(res.statusMessage,0);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusMessage)
          }
        }
      }
    },(error: any) => { 
      this.spinner.hide();
      this.error.handelError(error.status)
     } );
  }
  

  onNoClick(flag: any): void {
    // if (flag == 'Yes') {
    //  let obj = { flag: 'Yes' };
    //  this.dialogRef.close(obj);
    // } else {
    this.dialogRef.close(flag);
    //}
  }
}

