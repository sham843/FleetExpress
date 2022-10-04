import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { Subscription } from 'rxjs';
import { CommonMethodsService } from 'src/app/services/common-methods.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide:boolean = true;
  loginForm!:FormGroup | any;
  loginData:object | any;
  subscription!: Subscription;
  
  constructor(
    public config:ConfigService,
    private fb: FormBuilder,
    private sharedService:SharedService,
    public valService:ValidationService,
    private apiCall:ApiCallService,
    private commonMethods:CommonMethodsService,
    private spinner:NgxSpinnerService,
    private error:ErrorsService) { }

  ngOnInit(): void {
    this.defaultLoginForm();
    this.reCaptcha();
  }
  defaultLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required,Validators.maxLength(20)]],
      password: ['', [Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'),Validators.minLength(8),Validators.maxLength(20)])]],
      captcha: ['', [Validators.compose([Validators.required,Validators.minLength(5),Validators.maxLength(6)])]]
    })
  }

  reCaptcha(){
    this.loginForm.controls['captcha'].reset();
    this.sharedService.createCaptchaCarrerPage();
  }
  onLoginSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
   else if (this.loginForm.value.captcha !=  this.sharedService.checkvalidateCaptcha()){
    this.commonMethods.snackBar("Invalid Captcha", 1)
    }

    else {
      this.spinner.show();
      this.loginData = this.loginForm.value;
      this.apiCall.setHttp('get', 'login-web?'+'UserName=' + this.loginData.username.trim() + '&Password=' + this.loginData.password.trim(), false, false, false, 'loginBaseUrlApi');
      this.subscription = this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode == "200") {
          this.spinner.hide();
          sessionStorage.setItem('loginDetails', JSON.stringify(res));
          this.commonMethods.routerLinkRedirect('../dashboard');
          this.commonMethods.snackBar(res.statusMessage, 1);
        }
        else {
          this.spinner.hide();
            this.error.handelError(res.statusCode);
       
        }
      },(error: any) => {
        this.error.handelError(error.status);
    })
  }
}
get f(){
  return this.loginForm.controls;
}

ngOnDestroy() {
  this.subscription.unsubscribe();
}

}
