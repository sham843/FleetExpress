import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MasterService } from 'src/app/services/master.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';


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
  currentDate: Date =new Date();
  constructor(
    private apiCall: ApiCallService,
    private masterService:MasterService,
    private error: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private webStorage:WebStorageService,
    private commonMethod:CommonMethodsService
    ) { }

  ngOnInit(): void {
    this.getNotificationForm();
    this.getNotificationsData();
    this.getVehicleListData();
  }
  getNotificationForm() {
    this.notificationForm = this.fb.group({
      vehicleNumber: [],
      date: [],
      remark: [],
      alertType: [],
      // ignitionOff: [],
      // geofenceEnter: [],
      // geofenceExit: [],
      // overSpeed: [],
      // powerCut: [],
      // vibration: [],
      // lowbattery: [],
      // other: [],
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
    const fromdate = formData?.date?new Date(formData?.date):new Date();
    const todate = new Date(fromdate.setDate(fromdate.getDate() + 1));
    const obj={
      fromdate: formData?.date?new Date(formData?.date).toISOString():null,
      todate: formData?.date?todate.toISOString():null,
    }
    const url='FromDate='+obj?.fromdate+'&ToDate='+obj?.todate+'&VehicleNumber='+formData.vehicleNumber+'&AlertType='+formData.alertType;
    this.spinner.show();
    this.apiCall.setHttp('get', 'notification/vehicle-alert-report_v1?'+ url+'&UserId=' + this.webStorage.getUserId()  , true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.commonMethod.snackBar(res.statusCode,0)
        } else {
          if (res.statusCode != "404") {
            this.NotificationsData = [];
            this.error.handelError(res.statusCode)
          } 
        }
      }
    },(error: any) => { this.error.handelError(error.status) });
  }
  
}

