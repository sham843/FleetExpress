import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MasterService } from 'src/app/services/master.service';
// import { NgxSpinnerService } from 'ngx-spinner';
// import { ApiCallService } from 'src/app/services/api-call.service';
// import { ErrorsService } from 'src/app/services/errors.service';
// import { WebStorageService } from 'src/app/services/web-storage.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  notificationForm!:FormGroup;
  subscription !:Subscription;
  vehicleListData=new Array();
  NotificationsData=new Array();
  constructor(
    // private apiCall: ApiCallService,
    private masterService:MasterService,
    // private error: ErrorsService,
    private fb: FormBuilder,
    // private spinner: NgxSpinnerService,
    // private webStorage:WebStorageService
    ) { }

  ngOnInit(): void {
    this.getNotificationForm()
    this.getVehicleListData();
  }
  getNotificationForm() {
    this.notificationForm = this.fb.group({
      vehicleNumber: [],
      date: [],
      remark: [],
      ignitionOn: [],
      ignitionOff: [],
      geofenceEnter: [],
      geofenceExit: [],
      overSpeed: [],
      powerCut: [],
      vibration: [],
      lowbattery: [],
      other: [],
    })
  }
  getVehicleListData(){
    this.subscription=this.masterService.getVehicleListData().subscribe({
      next:(res:any)=>{
        this.vehicleListData=res;
      }
    })
  }
  getNotificationsData(){
    const formData=this.notificationForm.value;
    console.log(formData);
    const fromdate = new Date(formData?.date);
    const todate = new Date(fromdate.setDate(fromdate.getDate() + 1));
    const obj={
      fromdate: formData?.date.toISOString(),
      todate: todate.toISOString(),
    }
    console.log(obj);
     const url='&FromDate='+obj?.fromdate+'&ToDate='+obj?.todate+'&VehicleNumber='+formData.vehicle+'&AlertType='+formData.AlertType;
     console.log(url);
    // this.spinner.show();
    // this.apiCall.setHttp('get', 'notification/vehicle-alert-report_v1?UserId=' + this.webStorage.getUserId() , true, false, false, 'vehicletrackingBaseUrlApi');
    // this.subscription = this.apiCall.getHttp().subscribe({
    //   next: (res: any) => {
    //     if (res.statusCode === "200") {
    //       console.log(res)
    //     } else {
    //       if (res.statusCode != "404") {
    //         this.NotificationsData = [];
    //         this.error.handelError(res.statusCode)
    //       } 
    //     }
    //   }
    // },(error: any) => { this.error.handelError(error.status) });
  }
  
}

