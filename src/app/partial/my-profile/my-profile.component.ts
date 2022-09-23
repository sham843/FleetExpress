import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  myProfileForm!: FormGroup;
  userDetails: any;
  constructor(private tostrService: ToastrService,
    public vs: ValidationService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getLoginUserDetails();
  }
  ProfileFormControl() {
    this.myProfileForm = this.fb.group({
      profilePhoto: [''],
      name: [''],
      designation: [''],
      address: [''],
      contact: [''],
      email: [''],
      website: [''],
    })

  }
  getLoginUserDetails() {
    let sessionData: any;
    if (sessionStorage.getItem('loginDetails')) {
      sessionData = sessionStorage.getItem('loginDetails');
      this.userDetails = JSON.parse(sessionData).responseData[0];
      console.log(this.userDetails)
    }
    else {
      this.tostrService.error("Data not found");
      return
    }
  }
  profileSave() {

  }
  get f(){
    return this.myProfileForm.controls;
  }
}
