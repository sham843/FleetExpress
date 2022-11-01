import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-make-payment',
  templateUrl: './make-payment.component.html',
  styleUrls: ['./make-payment.component.scss']
})
export class MakePaymentComponent implements OnInit {
  dialogData: any;
  paymentForm!:FormGroup;
  constructor(public dialogRef: MatDialogRef<MakePaymentComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb:FormBuilder,
    public validationService: ValidationService) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    console.log(this.dialogData);
    this.getformControls();
  }
  getformControls(){
    this.paymentForm = this.fb.group({
      fName: [this.dialogData?.data[0]?.name, Validators.required],
      mobileNumber: [this.dialogData?.data[0]?.mobileno1, [ Validators.pattern('^[6-9][0-9]{9}$')]],
      emailId: [this.dialogData?.data[0]?.emailId, [Validators.pattern('^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$')]],
      gSTNo: [this.dialogData?.data[0]?.gstno, [Validators.pattern('^([0][1-9]|[1-2][0-9]|[3][0-7])([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$')]],
    })
  }
  onNoClick(flag: any): void {
    // if (flag == 'Yes') {
    //  let obj = { flag: 'Yes' };
    //  this.dialogRef.close(obj);
    // } else {
      this.dialogRef.close(flag);
    //}
  }

  onSubmit(){

  }

}
