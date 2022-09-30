import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
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
  otpFlag:boolean=false;
  otpLoginUserId!: number;
  mobileNum: any;
  checkOtp:any;
  intervalId = 0;
  timer = '';
  timerFlag: boolean = true;
  timeLeft: any = 10;
  interval:any;
  constructor(private fb: FormBuilder,
    public vs: ValidationService,
    private comman: CommanService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService) { }

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
      password: ['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'),Validators.minLength(8),Validators.maxLength(20)])]],
      confirmPassword: ['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'),Validators.minLength(8),Validators.maxLength(20)])]]
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
    this.comman.setHttp('get', 'get-user-otp?MobileNo=' + mobileNom, false, false, false, 'loginBaseUrlApi');
    this.comman.getHttp().subscribe((res: any) => {
      if (res.statusCode == "200") {
        this.checkOtp=res.responseData[0].otp;
        this.mobileNum = res.responseData[0].mobileNo;
        this.spinner.hide();
        this.toastrService.success(res.statusMessage);
        this.generateOTPContain = false;
        this.OTPContainer = true;
        this.verifyOTPForm.reset();
        this.sendOTPForm.reset();
      }
      else{
        this.spinner.hide();
        this.toastrService.error('Mobile Number Not Register');
      }
    })

    }
  }
  // -----------------------------------------Timer------------------------------------------------------------------------
countDown() {
    this.timeLeft = 60;
    this.timerFlag = true;
      this.interval = setInterval(() => {
        if(this.timeLeft > 0) {
          this.timeLeft--;
          this.timer=this.timeLeft;
        } else {
          this.pauseTimer();
          this.timerFlag=false;
        }
      },1000)
  }
  pauseTimer() {
    clearInterval(this.interval);
  }

// -----------------------------------------------------verify OTp------------------------------------------------------------
onchangeOTP(){
  this.otpFlag=true;
}  
verifyOTP() {
    let otp = this.verifyOTPForm.value.otpA + this.verifyOTPForm.value.otpB + this.verifyOTPForm.value.otpC + this.verifyOTPForm.value.otpD + this.verifyOTPForm.value.otpE;
    if (this.verifyOTPForm.invalid) {
      this.OTPContainer=true;
      return;
    }
    else if(this.checkOtp!=otp){
      this.OTPContainer=false;
      this.toastrService.error("Invalid OTP")
      return;
    }
    else {
      this.OTPContainer=false;
      this.spinner.show();
      this.comman.setHttp('get', 'login-by-otp?MobileNo=' + this.mobileNum + '&OTP=' + otp, false, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.otpLoginUserId = res.responseData[0].id;
          this.otpFlag=false;
          this.OTPContainer = false;
          this.passContainer = true;

        }
      })
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
        this.comman.setHttp('get', 'set-password?UserId=' + this.otpLoginUserId + '&NewPassword=' + this.changePassword.value.password, false, false, false, 'loginBaseUrlApi');
        this.comman.getHttp().subscribe((res: any) => {
          if (res.statusCode == "200") {
            this.spinner.hide();
            this.toastrService.success(res.responseData);
            this.changePassword.reset();
            this.router.navigate(['/login']);
            this.spinner.hide();
          }
          else {
            this.spinner.hide();
            this.toastrService.error("error")
          }
        })
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.toastrService.error("New password and Confirm password should not be same")
      }
    }
  }
  get sendOtp() { return this.sendOTPForm.controls };
  get verifyOtp() { return this.verifyOTPForm.controls };
  get passChange() { return this.changePassword.controls };
}