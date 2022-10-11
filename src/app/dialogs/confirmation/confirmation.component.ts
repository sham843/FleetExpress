import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  dialogData: any;
  remark = new FormControl('');
  driverName=new FormControl('');
  driverData=new Array();
  constructor(public dialogRef: MatDialogRef<ConfirmationComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiCall:ApiCallService,
    private error:ErrorsService) { }

  ngOnInit(): void {
    console.log(this.data)
    this.dialogData = this.data;
    this.dialogData.cardTitle== 'Assign Driver'?this.getDriverData():'';
  }
// --------------------------------------get Driver Data------------------------------------------------------------------
getDriverData() {
  this.apiCall.setHttp('get', 'driver/get-driver-details', true, false, false, 'fleetExpressBaseUrl');
  this.apiCall.getHttp().subscribe((response: any) => {
    if (response.statusCode == "200") {
      this.driverData = response.responseData;
    }
  },
    (error: any) => {
      this.error.handelError(error.status);
    })
}
  onNoClick(flag: any): void {
    if (this.data.inputType && flag == 'Yes') {
      if (this.CommonMethod.checkDataType(this.remark.value) == false) {
        this.CommonMethod.snackBar('Please Enter Remark', 1);
        return;
      }
      let obj:any = { remark: this.remark.value, flag: 'Yes' };
      this.dialogRef.close(obj);
    }
      else{
      this.dialogRef.close(flag);
    }
    (flag=='Yes' && this.dialogData.cardTitle== 'Assign Driver')?this.dialogRef.close(this.driverName.value):this.dialogRef.close(flag);
    }
  }

