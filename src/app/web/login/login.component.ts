import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  loginForm!:FormGroup | any;
  isSubmitted:boolean=false;
  constructor(private fb: FormBuilder,
    private sharedService:SharedService,
    public valService:ValidationService) { }

  ngOnInit(): void {
    this.defaultLoginForm();
    this.reCaptcha();
  }
  defaultLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.compose([Validators.required])]],
      captcha: ['', Validators.required]
    })
  }
  reCaptcha(){
    this.loginForm.controls['captcha'].reset();
    this.sharedService.createCaptchaCarrerPage();
  }
  onLoginSubmit() {
  if(this.loginForm.invalid){
    
  }
  else{
    console.log(this.loginForm.value)
  }
}
get f(){
  return this.loginForm.controls;
}

}
