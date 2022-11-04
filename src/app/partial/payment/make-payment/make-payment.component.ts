import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
declare var bolt: any;
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
  hash!:string;
  tranId!:string;
  key !: string;
  salt!: string;
  sUrl !:string;
  vehicles=new Array();
  vehiclesID=new Array();
  boltResponse:any;
  paymentDataObj:any;
  continueFlag: boolean = true;
  constructor(public dialogRef: MatDialogRef<MakePaymentComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public validationService: ValidationService,
    private spinner: NgxSpinnerService,
    private configService: ConfigService,
    private dialog: MatDialog,
    private apiCall: ApiCallService,
    private webStorage:WebStorageService,
    private commonMethods:CommonMethodsService,
    private router:Router) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.dialogData.data.map((x:any)=>{
      this.vehicles.push(x.vehicleNo);
      this.vehiclesID.push(x.vehicleId);
    })
    
    this.key = this.dialogData.otherDetails2[0].key;
    this.salt = this.dialogData.otherDetails2[0].salt;
    this.sUrl = this.dialogData.otherDetails2[0].responseUrl;
    this.getformControls();
    this.userData.push(this.webStorage.getUser())
  }
  getformControls() {
    this.paymentForm = this.fb.group({
      fName: [this.dialogData?.data[0]?.name, Validators.required],
      mobileNumber: [this.dialogData?.data[0]?.mobileno1, [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      emailId: [this.dialogData?.data[0]?.emailId, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      gSTNo: [this.dialogData?.data[0]?.gstno || '', [Validators.pattern('^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$')]],
    })
  }
  onNoClick(flag: any): void {
    if(flag=='Yes'){
      const obj={
        flagStatus:flag,
        formData:this.paymentForm.value
      }
      this.dialogRef.close(obj);
    }else{
      const obj={
        flagStatus:flag
      }
      this.dialogRef.close(obj);
    }
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
          if(res=='no'){
          }else{
            this.callHashApi();
            // this.onNoClick('Yes');
          }
        })
      }
      else {
        this.callHashApi();
      //this.onNoClick('Yes');
      }
    }
  }
  callHashApi() {
    let formData = this.paymentForm.value;
    this.udf2 = (this.userData[0]?.id).toString();
    this.udf3 = this.vehiclesID.toString();
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
          this.vehiclePaymentOrder(obj);
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

  vehiclePaymentOrder(obj: any) {
    this.spinner.show();
    let formData = this.paymentForm.value;
    let orderObj = {
      "createdThr": 2,
      "userId": Number(obj.udf2),
      "vehicleOwnerId": this.webStorage.getVehicleOwnerId(),
      "gstNo": this.udf4,
      "noOfVehicle": this.dialogData.data.length,
      "paymentAmount": parseFloat((this.dialogData?.amountTotal).toFixed(2)),
      "trasnsactionId": this.tranId,
      "status": "pending",
      "productInfo": "vtsamc",
      "firstName": formData.fName,
      "emailId": formData.emailId,
      "mobileNo": formData?.mobileNumber,
      "basicAmount": parseFloat((this.dialogData?.basicTotal).toFixed(2)),
      "gstAmount": parseFloat((this.dialogData?.gstTotal).toFixed(2)),
      "transactionCost": parseFloat((this.dialogData?.transactionCostTotal).toFixed(2)),
      "vehicleIds": this.vehiclesID.toString(),
      "amcTypeId": this.dialogData?.otherDetails?.amcTypeId
    } 
    this.apiCall.setHttp('post', 'payment/save-update-vehicle-payment-order', true, orderObj, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.commonMethods.snackBar('Order Created Successfully',0); //responseData.responseData.msg
        this.launchBoltPayment(); //  Launch Bolt
        this.spinner.hide();
      }
      else if (responseData.statusCode === "409") {
        this.commonMethods.snackBar(responseData.statusMessage,0);
      }
      else {
        this.commonMethods.snackBar('Data not found',0);
      }
    },
    );
  }

  launchBoltPayment() {
    this.spinner.show();
    let formData = this.paymentForm.value;
    let obj = {
      "key": this.key,
      "txnid": this.tranId,
      "amount": (this.dialogData?.amountTotal).toFixed(2).toString(),
      "firstname": formData?.fName,
      "email": formData?.emailId,
      "phone": formData?.mobileNumber,
      "productinfo": "vtsamc",
      "hash": this.hash,
      "udf1": "2", // for web
      "udf2": this.udf2, // login Userid
      "udf3": this.udf3, // Vehicle Ids
      "udf4": this.udf4, // Gst No (Not Mandatory)
      "udf5": this.udf5, // Total Count Of Vechicle Selected + Basic Amount + Gst Amount + Transaction Cost
      "surl": this.sUrl,
      "furl": this.sUrl,
    }
    if (Object.keys(obj).length !== 0) {
      this.spinner.hide();
      console.log(bolt)
      bolt.launch(obj, {
        responseHandler: (BOLT: any) => {
          if (BOLT.response.txnStatus != "CANCEL") {
            this.spinner.hide();
            this.boltResponse = BOLT.response;
            this.boltResponse['vechileNo'] = this.udf3;
            this.boltResponse['GSTNo'] = this.udf4;
            this.boltResponse['GSTPer'] = parseFloat((this.dialogData?.gstTotal).toFixed(2));
            this.boltResponse['transactionPer'] = parseFloat((this.dialogData?.transactionCostTotal).toFixed(2));
            sessionStorage.setItem("payment", JSON.stringify(BOLT.response));
            if (this.boltResponse.status == "success" || this.boltResponse.status == "failure") {
              this.vehiclePayment(this.boltResponse);
              this.router.navigate(['../paymentReceipt']);
            }
          } else {
            let failResObj: any = obj;
            failResObj['status'] = 'failure';
            failResObj['vechileNo'] = this.udf3;
            failResObj['GSTNo'] = this.udf4;
            failResObj['GSTPer'] =parseFloat((this.dialogData?.gstTotal).toFixed(2));
            failResObj['transactionPer'] = parseFloat((this.dialogData?.transactionCostTotal).toFixed(2));
            this.vehiclePayment(failResObj);
            this.refresh();
            // this.back();
            this.commonMethods.snackBar('Payment cancelled by user',0)
          }
          return BOLT.response;
        },
        catchException: (BOLT: any) => {
          this.commonMethods.snackBar(BOLT.message,0)
          this.spinner.hide();
        }
      });
    } else {
      this.commonMethods.snackBar('Something went wrong please try again. Try again',0)
    }
  }
  vehiclePayment(paymentObj: any) {
    this.spinner.show();
    this.paymentDataObj = {
      "createdThr": 2,
      "userId":this.udf2,
      "gstNo": this.udf4,
      "noOfVehicles": this.dialogData.data.length,
      "paymentAmount": Number(paymentObj.amount),
      "transactionId": paymentObj.txnid,
      "status": paymentObj.status,
      "productInfo": paymentObj.productinfo,
      "firstName": paymentObj.firstname,
      "emailId": paymentObj.email,
      "mobileNo": paymentObj.phone,
      "mode": paymentObj.mode,
      "error": paymentObj.error,
      "pgType": paymentObj.PG_TYPE,
      "bankRefNum": paymentObj.bank_ref_num,
      "payuMoneyId": paymentObj.payuMoneyId,
      "additionalCharges": 0,
      "basicAmount": parseFloat((this.dialogData?.basicTotal).toFixed(2)),
      "gstAmount": parseFloat((this.dialogData?.gstTotal).toFixed(2)),
      "transactionCost": parseFloat((this.dialogData?.transactionCostTotal).toFixed(2)),
      "vehicleIds": this.udf3,
      "amcTypeId": this.dialogData?.otherDetails?.amcTypeId
    };

    this.apiCall.setHttp('post', 'payment/save-update-vehicle-payment', true, this.paymentDataObj, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.commonMethods.snackBar(responseData.responseData.msg,0);
        this.spinner.hide();
      }
      else if (responseData.statusCode === "409") {
        this.commonMethods.snackBar(responseData.statusMessage,0);
      }
      else {
      }
    },
    );
  }
  continue() {
    if (this.dialogData.data.length == 0) { 
      this.commonMethods.snackBar("Select at least one vehicle",0);
    } else {
      this.continueFlag = false;
      //this.rechargeCal(this.vechileOwnerInfo);
    }
  }

  refresh() {
    // this.getVenicleList();
    // this.submitted = false;
    // this.makePaymentForm.reset({
    //   firstName: this.vehicleOwnerName,
    //   mobileNo: this.vehicleOwnerMobileNo,
    // })
  }

  // rechargeCal(data: any) {
  //   // this.basicAmount = Math.round(data.rate * this.cheArray.length);
  //   // this.GST = Math.round(this.basicAmount / 100) * data.gst;
  //   // this.transactionCost = Math.round((this.basicAmount + this.GST) * data.transactionPercentage) / 100;
  //   // this.PayableAmount = this.basicAmount + this.GST + this.transactionCost;
  //   // this.totalAmount = Math.round(this.PayableAmount * 100) / 100;
  //   // this.totalAmount  = 1
  // }

  back() {
    this.continueFlag = true;
  }
}

