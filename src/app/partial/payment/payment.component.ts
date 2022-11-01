import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { MakePaymentComponent } from 'src/app/partial/payment/make-payment/make-payment.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  subscription !:Subscription;
  paymentHisroryFormData!:FormGroup;
  paymentHistoryDetails =new Array();
  currentDate=new Date();
  paymentDetails=new Array();
  paymentRateDetails=new Array();
  selectAll:boolean=false;
  selectedTableData=new Array();
  get paymentHisrory(){
    return this.paymentHisroryFormData.controls
  }
  constructor( private apiCall:ApiCallService,
    private webStorage:WebStorageService,
    private error:ErrorsService,
    private fb:FormBuilder,
    private dialog:MatDialog,
    private configService:ConfigService) { }

  ngOnInit(): void {
    this.getpaymentHisroryFormcontrols();
    this.getPaymentData();
    this.getPaymentHistory();
  } 
  getpaymentHisroryFormcontrols() {
    this.paymentHisroryFormData = this.fb.group({
      fromDate: [],
      toDate: [],
    })
  }
  getPaymentData() {
    this.apiCall.setHttp('get', 'payment/get-vehicle-payment?UserId=' + this.webStorage.getUserId() + '&RateTypeId=2&NoPage=10&RowsPerPage=1&SearchText=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.paymentRateDetails = res.responseData1;
          res.responseData.map((x:any)=>{
            x.rate=parseFloat((this.paymentRateDetails[0].rate)).toFixed(2)
            x.BasicAmount=parseFloat((this.paymentRateDetails[0].rate)).toFixed(2)
            x.gSTAmount=((this.paymentRateDetails[0].rate * this.paymentRateDetails[0].gst)/100).toFixed(2)
            x.transactionConst=((this.paymentRateDetails[0].rate * this.paymentRateDetails[0].transactionPercentage)/100).toFixed(2)
            x.totalAmount= (parseFloat(x.BasicAmount) +  parseFloat(x.gSTAmount) + parseFloat(x.transactionConst)).toFixed(2)
          })
          this.paymentDetails = res.responseData;
          console.log(this.paymentRateDetails)
        } else {
          this.paymentDetails = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }
  getPaymentHistory() {
    //const formData =this.paymentHisroryFormData.value/
    this.apiCall.setHttp('get', 'payment/get-vehicle-payment-history?UserId=' + this.webStorage.getUserId() + '&FromDate=1900-01-01%20&ToDate=2023-05-18', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.paymentHistoryDetails = res.responseData;
        } else {
          this.paymentHistoryDetails = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }

  selectedElements(event: any, id: any){
    console.log()
    for(var i = 0 ; i < this.paymentDetails.length; i++){
      if(id != 0) {
        this.selectAll = false;
        if(this.paymentDetails[i].id == id){
          this.paymentDetails[i].checked = event.checked;
        }
      }else{
        this.paymentDetails[i].checked = event.checked;
      }
    }
    this.selectedTableData = [];
    this.selectedTableData = this.paymentDetails.filter((x: any) => x.checked == true);
    this.selectAll =this.paymentDetails.length == this.selectedTableData.length ?  true : false;
   
  }
  openPaymentDia(){
    let obj:any ={
      basicTotal:0 ,
      gstTotal:0 ,
      transactionCostTotal:0 ,
      amountTotal:0 ,
      otherDetails:this.paymentRateDetails[0],
      data:this.selectedTableData
    }
    for(let i=0;i< this.selectedTableData.length; i++){
      obj.basicTotal=obj.basicTotal+ parseFloat(this.selectedTableData[i].BasicAmount);
      obj.gstTotal=obj.gstTotal + parseFloat(this.selectedTableData[i].gSTAmount);
      obj.transactionCostTotal=obj.transactionCostTotal + parseFloat(this.selectedTableData[i].transactionConst);
      obj.amountTotal=obj.amountTotal + parseFloat(this.selectedTableData[i].totalAmount);
    }
    const dialog = this.dialog.open(MakePaymentComponent, {
      width: this.configService.dialogBoxWidth[2],
      data: obj,
      disableClose: this.configService.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(res => {
      console.log(res)
    })
  }
  

}
