import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ErrorsService } from 'src/app/services/errors.service';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
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
getChangePwd(){
  this.changePassForm=this.fb.group({
    currentPwd:['',Validators.required],
    newPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    reTypePwd:['',Validators.required]                                 
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
  console.log(this.changePassForm.value);
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
getNotificatinsData() {
  this.comman.setHttp('get', 'notification/get-alert-types', true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.notificatinsData = res.responseData;
        console.log(this.notificatinsData)
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
  this.comman.setHttp('get', 'notification/get-Alert-linking?NoPage=1&RowsPerPage=10', true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.vehicleNotificatinsData = res.responseData.responseData1 ;
        console.log(this.vehicleNotificatinsData);
      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusCode)
        }
      }
    },
    error: ((error: any) => { this.error.handelError(error.status) })
  });
}
// userBlockUnBlockModal(element: any) {
//   console.log(element)
//   let Title: string, dialogText: string;
//   element.isVisibleToOfficer == true ? Title = 'User Block' : Title = 'User Unblock';
//   element.isVisibleToOfficer == true ? dialogText = 'Do you want to User Block ?' : dialogText = 'Do you want to User Unblock ?';
//   const dialogRef = this.dialog.open(BlockUnblockComponent, {
//     width: '340px',
//     // data: { p1: dialogText, p2: '', cardTitle: Title, successBtnText: 'Yes', dialogIcon: 'done_outline', cancelBtnText: 'No' },
//     disableClose: this.comman.disableCloseFlag,
//   });
//   dialogRef.afterClosed().subscribe((res: any) => {     
//       res == 'Yes' ?   this.checkBlock(element): element.isVisibleToOfficer = !element.isVisibleToOfficer;   
//   });
// }

switchNotification(rowData:any, lable:any){ 
  this.spinner.show();
  this.comman.setHttp('PUT', 'notification/set-Visibity-Notification?alertype='+rowData.alertType+'&Isnotification='+rowData.isVisibleToOfficer, true, false, false, 'vehicletrackingBaseUrlApi');
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

