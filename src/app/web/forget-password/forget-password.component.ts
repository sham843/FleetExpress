import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
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
  mobileNum!: number |string;
  checkOtp: any;
  intervalId:number = 0;
  timer:string|number = '';
  timerFlag: boolean = true;
  timeLeft:number= 10;
  interval: any;
  subscription!: Subscription;
  constructor(private fb: FormBuilder,
    private commonMethods:CommonMethodsService,
    private apiCall:ApiCallService,
    public vs: ValidationService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private error: ErrorsService
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
  sendOTP() {
    this.countDown();
    let mobileNom = this.sendOTPForm.value.mobileNo || this.mobileNum;
    if (this.sendOTPForm.invalid) {
      this.spinner.hide();
    }
    else {
      this.spinner.show();
      this.apiCall.setHttp('get', 'get-user-otp?MobileNo=' + mobileNom, false, false, false, 'loginBaseUrlApi');
      this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.checkOtp = res.responseData[0].otp;
          this.mobileNum = res.responseData[0].mobileNo;
          this.spinner.hide();
          this.commonMethods.snackBar(res.statusMessage, 1)
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
  countDown() {
    this.timeLeft = 60;
    this.pauseTimer();
    this.timerFlag = true;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
        this.timer = this.timeLeft;
      } else {
        this.timeLeft = 60;
        // this.pauseTimer();
        this.timerFlag = false;
      }
    }, 1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }

  // -----------------------------------------------------verify OTp------------------------------------------------------------
  onchangeOTP() {
    this.otpFlag = true;
  }
  verifyOTP() {
    let otp = this.verifyOTPForm.value.otpA + this.verifyOTPForm.value.otpB + this.verifyOTPForm.value.otpC + this.verifyOTPForm.value.otpD + this.verifyOTPForm.value.otpE;
    if (this.verifyOTPForm.invalid) {
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
      this.apiCall.setHttp('get', 'login-by-otp?MobileNo=' + this.mobileNum + '&OTP=' + otp, false, false, false, 'loginBaseUrlApi');
      this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.commonMethods.snackBar(res.statusMessage, 1)
          this.otpLoginUserId = res.responseData[0].id;
          this.otpFlag = false;
          this.OTPContainer = false;
          this.passContainer = true;

        }
        else {
          this.spinner.hide();
          this.error.handelError(res.statusCode);
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
        this.apiCall.setHttp('get', 'set-password?UserId=' + this.otpLoginUserId + '&NewPassword=' + this.changePassword.value.password, false, false, false, 'loginBaseUrlApi');
        this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
          if (res.statusCode == "200") {
            this.spinner.hide();
            this.commonMethods.snackBar(res.statusMessage, 1)
            this.changePassword.reset();
            this.router.navigate(['/login']);
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
    this.subscription.unsubscribe();
  }
}