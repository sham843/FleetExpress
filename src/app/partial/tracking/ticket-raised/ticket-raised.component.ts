import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-ticket-raised',
  templateUrl: './ticket-raised.component.html',
  styleUrls: ['./ticket-raised.component.scss']
})
export class TicketRaisedComponent implements OnInit {
  maintananceForm !:FormGroup;
  complaintForm !:FormGroup;
  dialogData !:object|any;
  currentDate=new Date();
  subscription!:Subscription;
  timePeriod = new FormControl('');
  timeZone=[{lable:'2 Hours', id:'2_Hours'},{lable:'24 Hours', id:'24_Hours'},{lable:'7 Days', id:'7_Days'}];
  stateData=new Array();
  cityData=new Array();
  userData :any;
  shareLocationForm!:FormGroup; 
  LocsharingOption=[{lable:"What's App", id:1, url:'assets/images/Tracking/whatsapp.svg'},{lable:'Email', id:2, url:'assets/images/Tracking/gmail.svg'},{lable:'SMS', id:3, url:'assets/images/Tracking/sms.svg'}];
  get maintanance() { return this.maintananceForm.controls };
  get complaint() { return this.complaintForm.controls };
  get locnShare() { return this.shareLocationForm.controls };
  constructor(public dialogRef: MatDialogRef<TicketRaisedComponent>,
     private fb:FormBuilder, private commonMethod:CommonMethodsService,
    private error:ErrorsService, private apiCall:ApiCallService,
    private spinner:NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private webStorage:WebStorageService,
  ) { }

  ngOnInit(): void {
    
    this.dialogData = this.data;
    this.userData=this.webStorage.getUser()
    this.getMaintananceForm();
    this.dialogData['flagStatus']=='compliant'? this.getStates():'';
  }
  getMaintananceForm() {
    this.maintananceForm = this.fb.group({
      maintenanceType: ['1'],
      maintenanceTo: ['', Validators.required],
      maintenanceFrom: ['', Validators.required],
      remark: []
    })
    this.complaintForm = this.fb.group({
      userMobileNumber: [this.userData?.mobileNo1],
      DriverMobileNumber: [this.dialogData?.driverMobileNo],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      vehicleDate: ['', Validators.required],
      vehicleTime: ['', Validators.required]
    })
    this.shareLocationForm = this.fb.group({
      sharingOption: ['',Validators.required],
      userMobileNumber: [],
      userEmail: [],
    })

  }
  
  getStates(){
    this.apiCall.setHttp('get', 'master/GetState', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.stateData=res.responseData;
        } else {
          this.stateData = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }
  getCity(StateId:any){
    this.apiCall.setHttp('get', 'master/GetCity?StateId='+StateId, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.cityData=res.responseData;
        } else {
          this.cityData = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }

  submitvehicleMarkMaintance() {
    if (this.maintananceForm.invalid) {
      return;
    } else {
      const userFormData = this.maintananceForm.value;
      const obj = {
        ... userFormData, 
        "id": 0,
        "maintenanceType":parseInt(userFormData?.maintenanceType),
        "vehicleId": this.dialogData?.vehicleId,
        "vehicleNumber":this.dialogData?.vehicleNo,
        "flag": "I",
        "createdBy":this.webStorage.getUserId(),
        "createdDate": new Date().toISOString(),
        "isDeleted": false,
      }
      this.spinner.show();
      this.apiCall.setHttp('post', 'maintenance/save-update-maintenance', true, obj, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.statusCode === "200") {
            this.commonMethod.snackBar('Mantainance ticket raised sucssessfully',0)
              this.onNoClick('Yes');
          } else {
              this.error.handelError(res.statusCode);
          }
        }
      },(error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status)
      });
    }
  }
  submitvehicleComplent(){
    if (this.complaintForm.invalid) {
      return;
    } else {
      const userFormData = this.complaintForm.value;
      const obj = {
        "id": 0,
        "vehicleId": this.dialogData?.vehicleId,
        "subject": "GPS Wire Cut",
        "message": "",
        "complaintDate": new Date().toISOString(),
        "complaintFrom": this.webStorage.getUserId(),
        "forwardedTo": "",
        "complaintTypeId": 2,
        "complaintStatusId": 1,
        "stateId": userFormData?.stateId,
        "cityId": userFormData?.cityId,
        "createdBy": this.webStorage.getUserId(),
        "createdDate": new Date().toISOString(),
        "isDeleted": false,
        "imagePath": "",
        "vehicleDate": new Date(userFormData?.vehicleDate).toISOString(),
        "vehicleTime": userFormData?.vehicleTime
      }
      this.spinner.show();
      this.apiCall.setHttp('post', 'maintenance/save-update-complaint', true, obj, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.statusCode === "200") {
            this.commonMethod.snackBar('Complaint ticket raised sucssessfully',0)
              this.onNoClick('Yes');
          } else {
              this.error.handelError(res.statusCode);
          }
        }
      },(error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status)
      });
    }
  }
  
  onNoClick(flag: any): void {
    this.dialogRef.close(flag);
    // if (flag == 'Yes') {
    //  let obj = { flag: 'Yes' };
    //  this.dialogRef.close(obj);
    // } else {
    //   this.dialogRef.close(flag);
    // }
  }

  selectedOption(){
    if(this.locnShare['sharingOption'].value==2){
      this.locnShare['userEmail'].setValidators([Validators.required, Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')]);
      this.locnShare['userMobileNumber'].clearValidators();
      this.locnShare['userMobileNumber'].setValue('')
    }else{
      this.locnShare['userMobileNumber'].setValidators([Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]);
      this.locnShare['userEmail'].clearValidators();
      this.locnShare['userEmail'].setValue('')
    }
    this.locnShare['userMobileNumber'].updateValueAndValidity();
    this.locnShare['userEmail'].updateValueAndValidity();
  }
  shareLocation() {
    console.log(this.dialogData)
    if (this.shareLocationForm.invalid) {
      return;
    } else {
      if(this.locnShare['sharingOption'].value==1){
        const url = 'https://wa.me/' + this.locnShare['userMobileNumber'].value  + '?text=Dear user,\nVehicle live location details,\nVehicle no: '+ this.dialogData?.vehicleNo+',\nLive Location: http://fleetdemo.mahamining.com/vehicleTracking';
        const encoded = encodeURI(url);
        window.open(encoded)
      }else{
        let formData=this.shareLocationForm.value
        const obj = {
         "emailAddress": formData.sharingOption==2?formData.userEmail:'',
         "mobileNumber": formData.sharingOption==3?formData.userMobileNumber:'',
         "vehicleNumber": this.dialogData?.vehicleNo,
         "vehicleLocation": 'http://fleetdemo.mahamining.com/vehicleTracking'
        }
        this.spinner.show();
        this.apiCall.setHttp('post', 'tracking/send-sms-email-vehicleLocation', true, obj, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.statusCode === "200") {
            this.commonMethod.snackBar(res.statusMessage,0)
              this.onNoClick('Yes');
          } else {
              this.error.handelError(res.statusCode);
          }
        }
      },(error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status)
      })
      }
     
    }
  }

}
