import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ErrorsService } from 'src/app/services/errors.service';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}
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
  hide = true;
  hide1=true;
  hide2=true;
  submitted=false;
  value = 0;
  showTicks = false;
  autoTicks = false;
  tickInterval = 1;
  notificatinsData:any[]=[];
  vehicleNotificatinsData:any[]=[];
  subscription!: Subscription;
  notificationForm!:FormGroup;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize: any;
  pageNumber: number=1;
  searchContent = new FormControl();
  expandedElement: any;
  vehicleNotificationFlag:boolean=false;
  totalVehicleNotificatinsData:any;
  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  constructor(private fb:FormBuilder,
    private tostrService:ToastrService,
    private comman:CommanService,
    private spinner:NgxSpinnerService,
    private error:ErrorsService,
    private modalService:NgbModal,
    private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getChangePwd();
    this.getNotificatinsData();
    this.getVehicleNotificatinsData();
  }
  
  ngAfterViewInit(){
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((x:any)=>{
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
onChangePwd(){
  this.submitted=true;
  if(this.changePassForm.invalid){
    this.tostrService.error("Please enter valid value")
    return;
  }
  else{
    if(this.changePassForm.value != this.changePassForm.value){
      this.tostrService.error("new password and confirm password not match");
      return
    }else{
      this.spinner.show();
    this.comman.setHttp('get', 'change-password?UserId='+this.comman.getUserId()+'&NewPassword='+this.changePassForm.value.reTypePwd+'&OldPassword='+this.changePassForm.value.currentPwd, true, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.tostrService.success(response.statusMessage);
        }
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
  this.comman.setHttp('get', 'notification/get-alert-types', true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.notificatinsData = res.responseData;
        // this.notificatinsData.sort((a,b) => a.sortOrder.localeCompare(b.sortOrder));
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
        console.log(this.notificationForm.value);

      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusCode)
        }
      }
    },
    error: ((error: any) => { this.error.handelError(error.status) })
  });
}
getVehicleNotificatinsData() {
  this.vehicleNotificatinsData=[]
  this.comman.setHttp('get', 'notification/get-Alert-linking?NoPage='+(this.searchContent.value?0:1)+'&RowsPerPage=10&SearchText='+this.searchContent.value, true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
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
    },
    error: ((error: any) => { this.error.handelError(error.status) })
  });
}
switchNotification(rowData:any, lable:any){ 
  this.spinner.show();
  this.comman.setHttp('PUT', 'notification/set-Visibity-Notification?alertype='+rowData.alertType+'&Isnotification='+ !rowData.isNotification , true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      this.spinner.hide();
      if (res.statusCode === "200") {
        this.tostrService.success(res.statusMessage);
      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusMessage)
        }
      }
      this.getNotificatinsData();
    }, 
    error: ((error: any) => { 
      this.spinner.hide();
      error: ((error: any) => { this.error.handelError(error.status) })
     } )
  });
}

}

