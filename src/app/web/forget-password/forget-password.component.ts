import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, map, takeWhile } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit, OnDestroy {
  hide: boolean = false;
  hide1: boolean = true;
  hide2: boolean = true;
  sendOTPForm!: FormGroup;
  verifyOTPForm!: FormGroup;
  changePassword!: FormGroup;
  generateOTPContain: boolean = true;
  OTPContainer: boolean = false;
  passContainer: boolean = false;
  mobileNoSubmitted: boolean = false;
  passwordChenged: boolean = false;
  otpFlag: boolean = false;
  otpLoginUserId!: number;
  mobileNum!: number | string;
  checkOtp: any;
  private maxValue = 10;
  public timers: any;
  public timerFlag:boolean=true;
  subscription: Subscription | any;
  constructor(private fb: FormBuilder,
    private commonMethods: CommonMethodsService,
    private apiCall: ApiCallService,
    public vs: ValidationService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    public config: ConfigService,
  ) { }

  ngOnInit(): void {
    this.getformControlData();
    this.countDown();
  }
  getformControlData() {
    this.sendOTPForm = this.fb.group({
      mobileNo: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
    })
    this.verifyOTPForm = this.fb.group({
      otpA: ['', Validators.required],
      otpB: ['', Validators.required],
      otpC: ['', Validators.required],
      otpD: ['', Validators.required],
      otpE: ['', Validators.required],
    })
    this.changePassword = this.fb.group({
      password: ['', [Validators.compose([Validators.required, Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'), Validators.minLength(8), Validators.maxLength(20)])]],
      confirmPassword: ['', [Validators.compose([Validators.required, Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'), Validators.minLength(8), Validators.maxLength(20)])]]
    })
  }

  // -------------------------------------------OTP-----------------------------------------------------------
  sendOTP(flag?:any) {
    let mobileNom = this.sendOTPForm.value.mobileNo || this.mobileNum;
    if (this.sendOTPForm.invalid && flag!='resend') {
      this.spinner.hide();
    }
    else {
      this.spinner.show();
      this.apiCall.setHttp('get', 'login/get-user-otp?MobileNo=' + mobileNom, false, false, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.countDown();
          this.checkOtp = res.responseData[0].otp;
          this.mobileNum = res.responseData[0].mobileNo;
          this.spinner.hide();
          this.generateOTPContain = false;
          this.OTPContainer = true;
          this.verifyOTPForm.reset();
          this.sendOTPForm.reset();
        }
      },
        (error: any) => {
          this.error.handelError(error.status);
        })
      this.spinner.hide();
    }
  }
  // -----------------------------------------Timer------------------------------------------------------------------------
  public timerValue: any;
  countDown() {
    this.timerFlag=true;
    this.timers = interval(1000).pipe(
      map(value => this.maxValue - value),
      takeWhile(x => x >= 0)
    );
    this.timers.subscribe((res: any) => {
      this.timerValue = res.toString().length != 2 ? '00.0' + res : '00.' + res;
      this.timerValue=='00.00'?this.timerFlag=false:this.timerFlag=true;
    })
  }

  // -----------------------------------------------------verify OTp------------------------------------------------------------
  onchangeOTP() {
    this.otpFlag = true;
  }
  verifyOTP() {
    let otp = this.verifyOTPForm.value.otpA + this.verifyOTPForm.value.otpB + this.verifyOTPForm.value.otpC + this.verifyOTPForm.value.otpD + this.verifyOTPForm.value.otpE;
    if (this.verifyOTPForm.invalid) {
      if (otp.length == 0) {
        this.otpFlag = true;
      }
      this.OTPContainer = true;
      return;
    }
    else if (this.checkOtp != otp) {
      this.OTPContainer = true;
      this.commonMethods.snackBar("Invalid OTP", 1);
      return;
    }
    else {
      this.OTPContainer = false;
      this.spinner.show();
      this.apiCall.setHttp('get', 'login/login-by-otp?MobileNo=' + this.mobileNum + '&OTP=' + otp, false, false, false, 'fleetExpressBaseUrl');
      // this.subscription = 
      this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.otpLoginUserId = res.responseData[0].id;
          this.otpFlag = false;
          this.OTPContainer = false;
          this.passContainer = true;
        }
      },
        (error: any) => {
          this.error.handelError(error.status);
        })
      this.spinner.hide();
    }
  }
  // ---------------------------------------------------------------------submit---------------------------------------
  onSubmit() {
    this.passwordChenged = true;
    if (this.changePassword.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      if (this.changePassword.value.password == this.changePassword.value.confirmPassword) {
        this.apiCall.setHttp('get', 'login/set-password?UserId=' + this.otpLoginUserId + '&NewPassword=' + this.changePassword.value.password, false, false, false, 'fleetExpressBaseUrl');
        this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
          if (res.statusCode == "200") {
            this.spinner.hide();
            this.changePassword.reset();
            this.commonMethods.routerLinkRedirect('/login');
            this.spinner.hide();
          }
        },
          (error: any) => {
            this.error.handelError(error.status);
          })
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.commonMethods.snackBar("New password and Confirm password should not be same", 1)
      }
    }
  }
  get sendOtp() { return this.sendOTPForm.controls };
  get verifyOtp() { return this.verifyOTPForm.controls };
  get passChange() { return this.changePassword.controls };
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}