import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
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
  get paymentHisrory(){
    return this.paymentHisroryFormData.controls
  }
  constructor( private apiCall:ApiCallService,
    private webStorage:WebStorageService,
    private error:ErrorsService,
    private fb:FormBuilder) { }

  ngOnInit(): void {
    this.getpaymentHisroryFormcontrols();
    this.getPaymentHistory();
  } 
  getpaymentHisroryFormcontrols() {
    this.paymentHisroryFormData = this.fb.group({
      fromDate: [],
      toDate: [],
    })
  }
   getPaymentHistory() {
    const formData =this.paymentHisroryFormData.value
    console.log(formData)
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

}
