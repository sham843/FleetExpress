import { Component, OnInit } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ErrorsService } from 'src/app/services/errors.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ApiCallService } from 'src/app/services/api-call.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SettingsComponent implements OnInit {
  columnsToDisplay:any=['SR.NO','vehicle-icon','VEHICLE NO','VEHICLE TYPE'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  changePassForm!:FormGroup;
  CurrentPasswordHide:boolean = true;
  newPasswordHide:boolean=true;
  retypePasswordHide:boolean=true;
  submitted:boolean=false;
  value:number = 0;
  showTicks:boolean = false;
  autoTicks:boolean = false;
  tickInterval:number = 1;
  notificatinsData = new Array();
  vehicleNotificatinsData= new Array();
  subscription!: Subscription;
  notificationForm!:FormGroup;
  currentPage:number = 1;
  itemsPerPage:number = 10;
  pageSize !:number ;
  pageNumber: number=1;
  searchContent = new FormControl();
  expandedElement: any;
  vehicleNotificationFlag:boolean=false;
  totalVehicleNotificatinsData !:number;
  highlightedRow!:number;
  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }
    return 0;
  }

  constructor(private fb:FormBuilder,
    private spinner:NgxSpinnerService,
    private error:ErrorsService,
    private commonMethods:CommonMethodsService,
    private apiCall:ApiCallService,
    private webStorage:WebStorageService,
    public config:ConfigService,) { }

  ngOnInit(): void {
    this.getChangePwd();
    this.getNotificatinsData();
    this.getVehicleNotificatinsData();
  }
  
  ngAfterViewInit(){
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(()=>{
     this.getVehicleNotificatinsData();
    });
 }
getChangePwd(){
  this.changePassForm=this.fb.group({
    currentPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    newPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    reTypePwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]]                                 
  })
  this.notificationForm=this.fb.group({
    BoxopenOff:[],
    BoxopenOn:[],
    GeofenceIn:[],
    GeofenceOut:[],
    IgnitionOff:[],
    IgnitionOn:[],
    PowerCut:[],
    PowerConnected:[],
    Lowbatteryremoved:[],
    ConnectbacktomainBattery:[],
    DisconnectBattery:[],
    Lowbattery:[],  
    OverSpeed:[],
    Tilt:[]                              
  })
}
public onPageChange(pageNum: number): void {
  this.pageNumber=pageNum;
  this.pageSize = this.itemsPerPage * (pageNum - 1);
  this.getVehicleNotificatinsData();
}
clickedRow(index:any){
  this.highlightedRow=index;
}
onChangePwd(){
  this.submitted=true;
  if(this.changePassForm.invalid){
    return;
  }
  else{
    if(this.changePassForm.value != this.changePassForm.value){
      this.commonMethods.snackBar("new password and confirm password not match",0);
      return
    }else{
      this.spinner.show();
    this.apiCall.setHttp('get', 'notification/change-password?UserId='+this.webStorage.getUserId()+'&NewPassword='+this.changePassForm.value.reTypePwd+'&OldPassword='+this.changePassForm.value.currentPwd, true, false, false, 'loginBaseUrlApi');
      // this.subscription=
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
        }
      },
      (error:any)=>{
        this.error.handelError(error.status)
      })
    }
  }
}
get fpass(){
  return this.changePassForm.controls;
}
get f(){
  return this.notificationForm.controls;
}
showvehicleNotification(tabLabel:any){
  if(tabLabel=='VehicleNotifications'){
    this.vehicleNotificationFlag=true;
  }else{
    this.vehicleNotificationFlag=false;
  }
}
getNotificatinsData() {
  this.apiCall.setHttp('get', 'notification/get-alert-types', true, false, false, 'fleetExpressBaseUrl');
  // this.subscription = 
  this.apiCall.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.notificatinsData = res.responseData;
        this.notificatinsData.sort(function (a, b) {
          return a.sortOrder - b.sortOrder;
        });
        this.notificationForm.patchValue({
          BoxopenOff:this.notificatinsData[0].isNotification,
          BoxopenOn:this.notificatinsData[1].isNotification,
          GeofenceIn:this.notificatinsData[4].isNotification,
          GeofenceOut:this.notificatinsData[5].isNotification,
          IgnitionOff:this.notificatinsData[7].isNotification,
          IgnitionOn:this.notificatinsData[8].isNotification,
          PowerCut:this.notificatinsData[11].isNotification,
          PowerConnected:this.notificatinsData[10].isNotification,
          Lowbatteryremoved:false,
          ConnectbacktomainBattery:false,
          DisconnectBattery:false,
          Lowbattery:false,
          OverSpeed:false,
          Tilt:false,   
        })

      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusCode)
        }
      }
    }
  },(error: any) => { this.error.handelError(error.status) });
}
getVehicleNotificatinsData() {
  this.vehicleNotificatinsData=[]
  this.apiCall.setHttp('get', 'notification/get-Alert-linking?NoPage='+(this.searchContent.value?0:1)+'&RowsPerPage=10&SearchText='+this.searchContent.value, true, false, false, 'fleetExpressBaseUrl');
  this.apiCall.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.vehicleNotificatinsData = res.responseData.responseData1 ;
        this.totalVehicleNotificatinsData=res.responseData.responseData2?.totalRecords

      } else {
        if (res.statusCode != "404") {
          this.vehicleNotificatinsData=[];
          this.error.handelError(res.statusCode)
        }else  if (res.statusCode == "404"){
            this.vehicleNotificatinsData=[];
            this.error.handelError(res.statusCode)
        }
      }
    }
  },(error: any) => { this.error.handelError(error.status) });
}
switchNotification(rowData:any){ 
  this.spinner.show();
  this.apiCall.setHttp('PUT', 'notification/set-Visibity-Notification?alertype='+rowData.alertType+'&Isnotification='+ !rowData.isNotification , true, false, false, 'fleetExpressBaseUrl');
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
      this.getNotificatinsData();
    }
  },(error: any) => { 
    this.spinner.hide();
    this.error.handelError(error.status)
   } );
}
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

