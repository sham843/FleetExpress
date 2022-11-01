import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit {
  dialogData: any;
  paymentForm!: FormGroup;
  submitted: boolean = false;
  getData=new Array();
  userData=new Array();
  udf2 !:string;
  udf3!:string;
  udf4!:string;
  udf5!:string;
  get f() { return this.paymentForm.controls; }
  hash:any;
  tranId!:number;
  constructor(public dialogRef: MatDialogRef<MakePaymentComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public validationService: ValidationService,
    private spinner: NgxSpinnerService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private apiCall: ApiCallService,
    private webStorage:WebStorageService) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.getformControls();
    this.userData.push(this.webStorage.getUser())
  }
  getformControls() {
    this.paymentForm = this.fb.group({
      fName: [this.dialogData?.data[0]?.name, Validators.required],
      mobileNumber: [this.dialogData?.data[0]?.mobileno1, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      emailId: [this.dialogData?.data[0]?.emailId, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      gSTNo: [this.dialogData?.data[0]?.gstno || '', [Validators.required, Validators.pattern('^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$')]],
    })
  }
  onNoClick(flag: any): void {
    this.dialogRef.close(flag);
  }

  onSubmit() {
    this.submitted = true;
    if (this.paymentForm.invalid) {
      this.spinner.hide();
      return;
    } else {
      if (this.paymentForm.value.gSTNo == "") {
        let obj: any = ConfigService.dialogObj;
        obj['p1'] = 'Do you want to add GST in bill? Press OK to add GST, Press Submit to Continue.';
        obj['cardTitle'] = 'Confirm!';
        obj['successBtnText'] = 'Submit';
        obj['cancelBtnText'] = 'OK';
        const dialog = this.dialog.open(ConfirmationComponent, {
          width: this.configService.dialogBoxWidth[0],
          data: obj,
          disableClose: this.configService.disableCloseBtnFlag,
        })
        dialog.afterClosed().subscribe(res => {
          console.log(res)
        })
      }
      else {
        this.callHashApi();
      }
    }
  }
  callHashApi() {
    // this.modalFalg = true;
    let formData = this.paymentForm.value;
    // this.getData = data;
    console.log(this.dialogData)
    // let selVehicleIds = this.cheArray.map((item: any) => {
    //   let vechId = item.vechId;
    //   return vechId;
    // });
    
    this.udf2 = (this.userData[0]?.id).toString();
    this.udf3 = (this.dialogData?.data[0]?.vehicleId).toString();
    this.udf4 = formData?.gSTNo ? formData?.gSTNo : '';
    this.udf5 = ''//this.cheArray.length + `$` + this.basicAmount + `$` + this.GST + `$` + this.transactionCost;

    let obj = {
     "amount": ((this.dialogData?.amountTotal).toFixed(2)).toString(),
      "firstname": formData?.fName,
      "email": formData?.emailId,
      "phone": formData?.mobileNumber,
      "productinfo": "vtsamc",
      "service_provider": "payu_paisa",
      "lastname": "",
      "address1": "",
      "address2": "",
      "city": "",
      "state": "",
      "country": "",
      "zipcode": "",
      "udf1": "2", // for web
      "udf2":this.udf2, // login Userid
      "udf3": this.udf3, // Vehicle Ids  vehicleId
      "udf4":this.udf4, // Gst No (Not Mandatory)
      "udf5": this.udf5, // Total Count Of Vechicle Selected + Basic Amount + Gst Amount + Transaction Cost
      "udf6": "",
      "udf7": "",
      "pg": "1"
    }
    this.spinner.show();
    this.apiCall.setHttp('post', 'payment/generate-hash-sequence', true, obj, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.hash = res.responseData.hash;
        this.tranId = res.responseData.transactionId;
        if (this.hash != null && this.tranId != null) {
          //this.vehiclePaymentOrder(obj);
          this.spinner.hide();
        }
      }
      else if (res.statusCode === "409") {
        alert(res.statusMessage);
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
      }
    },
    this.spinner.hide()
    );
  }
}
