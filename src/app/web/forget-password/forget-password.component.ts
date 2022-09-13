import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  hide = true;
  hide1 = true;
  hide2 = true;
  beforeSendOPT:boolean=true;
  afterSendOPT:boolean=false;
  newPassword:boolean=false;
  sendOTPForm!: FormGroup;
  verifyOTPForm!: FormGroup;
  newPasForm!: FormGroup;
  sendOTPSubmitte:boolean=false;
  verifyOTPSubmitte:boolean=false;
  Submitted:boolean=false;
  get sf() { return this.sendOTPForm.controls };
  get vf() { return this.verifyOTPForm.controls };
  get rf() { return this.newPasForm.controls };
  constructor(private fb:FormBuilder,
    public vs:ValidationService) { }

  ngOnInit(): void {
    this.getformControlData();
  }

  getformControlData() {
    this.sendOTPForm = this.fb.group({
      mobileNo:['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
    })
    this.verifyOTPForm = this.fb.group({
      otpA: ['', Validators.required],
      otpB: ['', Validators.required],
      otpC: ['', Validators.required],
      otpD: ['', Validators.required],
    })
    this.newPasForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    })
  }
  sendOTP(){
    this.sendOTPSubmitte=true;
    if(this.sendOTPForm.invalid){
        return;
    }else{
        alert('submitted');
      this.beforeSendOPT=false;
      this.afterSendOPT=true;
      this.newPassword=false;
    }
  }
  verifyOTP(){
    this.verifyOTPSubmitte=true;
    if(this.verifyOTPForm.invalid){
        return;
    }else{
        alert('submitted');
      this.beforeSendOPT=false;
      this.afterSendOPT=false;
      this.newPassword=true;
    }
  }
  onSubmit(){
    this.Submitted=true;
    if(this.newPasForm.invalid){
        return;
    }else{
        alert('submitted');
      this.beforeSendOPT=true;
      this.afterSendOPT=false;
      this.newPassword=false;
    }
  }
}