import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { MasterService } from 'src/app/services/master.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { SharedService } from 'src/app/services/shared.service';
// import { CommonMethodsService } from 'src/app/services/common-methods.service';


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
  notificationData=new Array();
  notificationTotalCount!:string;
  paginationNo: number = 1;
  pageSize: number = 10;
  alertTypeListData=new Array();
  get f() { return this.notificationForm.controls };
  constructor(
    private apiCall: ApiCallService,
    private masterService:MasterService,
    private error: ErrorsService,
    private fb: FormBuilder,
    public config:ConfigService,
    private spinner: NgxSpinnerService,
    private webStorage:WebStorageService,
    private shared:SharedService
    ) { }

  ngOnInit(): void {
    this.getNotificationForm();
    this.getNotificationsData();
    this.getVehicleListData();
    this.getAlertListData();
  }
  getNotificationForm() {
    this.notificationForm = this.fb.group({
      vehicleNumber: [],
      date: [],
      remark: [],
      alertType: [],
    })
  }
  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getNotificationsData();
  }
  getVehicleListData(){
    this.vehicleListData=[];
    this.subscription=this.masterService.getVehicleListData().subscribe({
      next:(res:any)=>{
        this.vehicleListData.push(...res);
      }
    })
  }
  
  getAlertListData(){
    this.alertTypeListData=[];
    this.subscription=this.masterService.getAlertList().subscribe({
      next:(res:any)=>{
        res.map((x:any)=>{
          x.color= this.shared.alertTypeArray.filter(xx=>(xx.alertType== x.alertType) )
        })
        console.log(res)
        this.alertTypeListData.push(...res);
      }
    })
  }
  closeAlertSelect(){
    this.notificationForm.controls['alertType'].patchValue(null);
    this.getNotificationsData();
  }
  
 
  getNotificationsData(){ 
    this.notificationData = [];
    const formData=this.notificationForm.value;
    console.log(formData);
    const fromdate = formData?.date?new Date(formData?.date):new Date();
    const todate = new Date(fromdate.setDate(fromdate.getDate() + 1));
    const obj={
      fromdate: formData?.date?new Date(formData?.date).toISOString():'',
      todate: formData?.date?todate.toISOString():'',
    }
    const url='FromDate='+obj?.fromdate+'&ToDate='+obj?.todate+'&VehicleNumber='+(formData.vehicleNumber?formData.vehicleNumber:"")+
    '&AlertType='+(formData.alertType?formData.alertType:""+ '&pageno=' + this.paginationNo + '&pagesize=' + this.pageSize);
    this.spinner.show();
    this.apiCall.setHttp('get', 'notification/vehicle-alert-report_v1?'+ url+'&UserId=' + this.webStorage.getUserId()  , true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          res.responseData.data.map((x:any)=>{
            x.color= this.shared.alertTypeArray.filter(xx=>(xx.alertType== x.alertType) )
          })
          this.notificationData=res.responseData.data;
          console.log( this.notificationData);
          this.notificationTotalCount=res.responseData.totalCount;
        } else {
            this.notificationData = [];
            // this.error.handelError(res.statusCode)
          } 
      }
    },(error: any) => {
      this.spinner.hide();
      this.error.handelError(error.status) });
  }
  
}

