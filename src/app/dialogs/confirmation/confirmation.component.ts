import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { ModalsComponent } from '../driver_modals/modals.component';
@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  dialogData: any;
  remark = new FormControl('');
  driverName = new FormControl('');
  driverData = new Array();
  changePassForm!: FormGroup;
  CurrentPasswordHide: boolean = true;
  newPasswordHide: boolean = true;
  retypePasswordHide: boolean = true;

  constructor(public dialogRef: MatDialogRef<ConfirmationComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiCall: ApiCallService,
    private error: ErrorsService,
    private commonMethods: CommonMethodsService,
    private spinner: NgxSpinnerService,
    private webStorage: WebStorageService,
    private fb: FormBuilder,
    public config: ConfigService,
    private errorService: ErrorsService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.dialogData.cardTitle == 'Assign Driver' ? this.getDriverData() : '';
    this.dialogData.cardTitle == 'Change Password' ? (this.getChangePwd(), this.dialogData?.p1 == '') : '';
  }
  //----------------------------------------------get Driver Data------------------------------------------------------------------
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
  //-------------------------------------------change password--------------------------------------------------------------------
  getChangePwd() {
    this.changePassForm = this.fb.group({
      currentPwd: ['', [Validators.compose([Validators.required, Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
      newPwd: ['', [Validators.compose([Validators.required, Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
      reTypePwd: ['', [Validators.compose([Validators.required, Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]]
    })
  }
  onChangePassword() {
    if (this.changePassForm.invalid) {
      return;
    }
    else {
      if (this.changePassForm.value.newPwd != this.changePassForm.value.reTypePwd) {
        this.commonMethods.snackBar("New Password and Confirm Password does not match", 1);
        return
      } else if (this.changePassForm.value.currentPwd == this.changePassForm.value.newPwd) {
        this.commonMethods.snackBar("New Password must be different from Current Password.", 1);
      } else {
        this.spinner.show();
        this.apiCall.setHttp('get', 'login/change-password/' + this.changePassForm.value.currentPwd + '?&UserId=' + this.webStorage.getUserId() + '&NewPassword=' + this.changePassForm.value.reTypePwd, true, false, false, 'fleetExpressBaseUrl');
        this.apiCall.getHttp().subscribe((response: any) => {
          if (response.responseData == "Password Changed Successfully...") {
            this.spinner.hide();
            this.commonMethods.snackBar(response.responseData, 0);
            this.onNoClick('Yes');
            this.errorService.logOut();
          }
          else {
            this.spinner.hide();
            this.commonMethods.snackBar(response.responseData, 1);
          }
        },
          (error: any) => {
            this.error.handelError(error.status);
            this.onNoClick('No');
          })
      }
    }
  }
  get fpass() {
    return this.changePassForm.controls;
  }
//---------------------------------------------------------Modal Close Method----------------------------------------------------------
  onNoClick(flag: any): void {
    if (this.data.inputType && flag == 'Yes') {
      if (this.CommonMethod.checkDataType(this.remark.value) == false) {
        this.CommonMethod.snackBar('Please Enter Remark', 1);
        return;
      }
    } if (flag == 'Yes' && this.dialogData.cardTitle == 'Assign Driver') {
      this.dialogRef.close(this.driverName.value)
    }
    else if (flag == 'Yes' && this.dialogData.cardTitle == 'Change Password') {
      if (this.changePassForm.invalid) {
        return
      }
      else {
        this.dialogRef.close(flag);
      }
      let obj: any = { remark: this.remark.value, flag: 'Yes' };
      this.dialogRef.close(obj);
    }
    else if (flag == 'Ok' && this.dialogData.cardTitle == 'Assign Driver') {
      const dialog = this.dialog.open(ModalsComponent, {
        width: '900px',
        data: '',
        disableClose: this.config.disableCloseBtnFlag,
        autoFocus: false
      })
      dialog.afterClosed().subscribe((res: any) => {
        if (res == 'add') {
          this.getDriverData();
        }
      })
    }
    else{
      flag != 'Ok'?this.dialogRef.close(flag):'';
    }

  }
}

