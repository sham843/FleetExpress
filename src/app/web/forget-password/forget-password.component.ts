import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
// import { FormBuilder, FormGroup, Validators, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
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
  otpLoginUserId: any;
  mobileNum:any;
  intervalId = 0;
  timer = '';
  seconds = 10;
  get sf() { return this.sendOTPForm.controls };
  get vf() { return this.verifyOTPForm.controls };
  get rf() { return this.changePassword.controls };
  constructor(private fb: FormBuilder,
    public vs: ValidationService,
    private comman: CommanService,
    private router: Router,
    private spinner:NgxSpinnerService,
    private toastrService:ToastrService) { }

  ngOnInit(): void {
    this.getformControlData();
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
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    })
  }
  clearTimer() { 
    clearInterval(this.intervalId);
    this.sendOTP();
   }
  ngOnDestroy() { this.clearTimer(); }
  start() { this.countDown(); }
  stop()  { this.clearTimer();}

   countDown() {
    this.clearTimer();
    this.intervalId = window.setInterval(() => {
      this.seconds -= 1;
      if (this.seconds === 0) {
      } else {
        if (this.seconds < 0) { this.seconds = 10; } // reset
        this.timer = `Reset otp in ${this.seconds}`;
      }
    }, 1000);
  }
  sendOTP() {
    this.mobileNum=this.sendOTPForm.value.mobileNo;
    this.mobileNoSubmitted = true;
    if (this.sendOTPForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      // this.sendOTPForm.value.mobileNo
      this.spinner.show();
      this.comman.setHttp('get', 'get-user-otp?MobileNo=' + this.mobileNum, false, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.generateOTPContain = false;
          this.OTPContainer = true;
          this.start();
          this.sendOTPForm.reset();
        }
      })
    }
  }
  verifyOTP() {
    if (this.verifyOTPForm.invalid) {
      this.spinner.hide();
      return;
    }
    else {
      this.spinner.show();
      let otp = this.verifyOTPForm.value.otpA + this.verifyOTPForm.value.otpB + this.verifyOTPForm.value.otpC + this.verifyOTPForm.value.otpD + this.verifyOTPForm.value.otpE;
      this.comman.setHttp('get', 'login-by-otp?MobileNo=' + this.mobileNum + '&OTP=' + otp, false, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          this.toastrService.success(res.statusMessage);
          this.otpLoginUserId = res.responseData[0].id
          console.log(this.otpLoginUserId);
          this.OTPContainer = false;
          this.passContainer = true;
          this.verifyOTPForm.reset();

        }
      })
    }
  }
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
            this.toastrService.success(res.statusMessage);
            this.changePassword.reset();
            this.router.navigate(['/login']);
            this.toastrService.success(res.status)
            this.spinner.hide();
            // this.clearForm();
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
        alert("error");
        this.toastrService.error("New password and Confirm password should not be same")
      }
    }

  }
}