import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm!:UntypedFormGroup | any;
  loginData:any;
  constructor(
    public config:ConfigService,
    private fb: FormBuilder,
    private sharedService:SharedService,
    public valService:ValidationService,
    private apiCall:ApiCallService,
    private router:Router,
    private route:ActivatedRoute,
    private spinner:NgxSpinnerService,
    private toastrService:ToastrService,
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
    this.toastrService.error("Invalid Captcha");
    }

    else {
      this.spinner.show();
      this.loginData = this.loginForm.value;
      this.apiCall.setHttp('get', 'login/login-web?'+'UserName=' + this.loginData.username.trim() + '&Password=' + this.loginData.password.trim(), false, false, false, 'vehicletrackingBaseUrlApi');
      this.apiCall.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          this.spinner.hide();
          sessionStorage.setItem('loginDetails', JSON.stringify(res));
          this.router.navigate(['../dashboard'], { relativeTo: this.route })
          this.toastrService.success(res.statusMessage)
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

}
