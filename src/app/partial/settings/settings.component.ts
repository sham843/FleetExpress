import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  changePassForm!:FormGroup;
  hide = true;
  submitted=false;
  value = 0;
  showTicks = false;
  autoTicks = false;
  tickInterval = 1;
  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  constructor(private fb:FormBuilder,
    private tostrService:ToastrService,
    private comman:CommanService,
    private spinner:NgxSpinnerService) { }

  ngOnInit(): void {
    this.getChangePwd();
  }
getChangePwd(){
  this.changePassForm=this.fb.group({
    currentPwd:['',Validators.required],
    newPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    reTypePwd:['',Validators.required]                                 
  })
}
onChangePwd(){
  this.submitted=true;
  console.log(this.changePassForm.value);
  if(this.changePassForm.invalid){
    this.tostrService.error("Please enter valid value")
    return;
  }
  else{
    if(this.changePassForm.value != this.changePassForm.value){
      this.tostrService.error("new password and confirm password not match");
      return
    }else{
      this.spinner.show();
    this.comman.setHttp('get', 'change-password?UserId='+this.comman.getUserId()+'&NewPassword='+this.changePassForm.value.reTypePwd+'&OldPassword='+this.changePassForm.value.currentPwd, true, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.tostrService.success(response.statusMessage);
        }
      })
    }
  }
}
get fpass(){
  return this.changePassForm.controls;
}

}
