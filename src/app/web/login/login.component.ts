import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
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
  constructor(private fb: FormBuilder,
    private sharedService:SharedService,
    public valService:ValidationService,
    private comman:CommanService,
    private router:Router,
    private route:ActivatedRoute,
    private spinner:NgxSpinnerService,
    private toastrService:ToastrService) { }

  ngOnInit(): void {
    this.defaultLoginForm();
    this.reCaptcha();
  }
  defaultLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required,Validators.maxLength(20)],
      password: ['', [Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$'),Validators.minLength(8),Validators.maxLength(20)])]],
      captcha: ['', Validators.required]
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
      this.comman.setHttp('get', 'login/login-web?'+'UserName=' + this.loginData.username.trim() + '&Password=' + this.loginData.password.trim(), false, false, false, 'vehicletrackingBaseUrlApi');
      this.comman.getHttp().subscribe((res: any) => {
        if (res.statusCode === "200") {
          this.spinner.hide();
          sessionStorage.setItem('loginDetails', JSON.stringify(res));
          this.router.navigate(['../dashboard'], { relativeTo: this.route })
          this.toastrService.success(res.statusMessage)
        }
        else {
          this.spinner.hide();
          this.toastrService.error(res.statusMessage)
        }
      })
    }
}
get f(){
  return this.loginForm.controls;
}

}
