import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';

@Component({
  selector: 'app-ticket-raised',
  templateUrl: './ticket-raised.component.html',
  styleUrls: ['./ticket-raised.component.scss']
})
export class TicketRaisedComponent implements OnInit {
  maintananceForm !:FormGroup;
  dialogData !:object|any;
  currentDate=new Date();
  subscription!:Subscription;
  timePeriod = new FormControl('');
  timeZone=[{lable:'2 Hours', id:'2_Hours'},{lable:'24 Hours', id:'24_Hours'},{lable:'7 Days', id:'7_Days'}];

  get maintanance() { return this.maintananceForm.controls };
  constructor(public dialogRef: MatDialogRef<TicketRaisedComponent>,
     private fb:FormBuilder, private commonMethod:CommonMethodsService,
     //public validationService:ValidationService, 
    private error:ErrorsService, private apiCall:ApiCallService,
    private spinner:NgxSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.getMaintananceForm();
  }
  getMaintananceForm() {
    this.maintananceForm = this.fb.group({
      maintenanceType: ['1'],
      maintenanceTo: ['', Validators.required],
      maintenanceFrom: ['', Validators.required],
      remark: []
    })
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
        "createdBy": 0,
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
  
  onNoClick(flag: any): void {
    this.dialogRef.close(flag);
    // if (flag == 'Yes') {
    //  let obj = { flag: 'Yes' };
    //  this.dialogRef.close(obj);
    // } else {
    //   this.dialogRef.close(flag);
    // }
  }

}
