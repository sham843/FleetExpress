import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  myProfileForm!: FormGroup;
  userDetails: any;
  totalVehicle!: number;
  constructor(private tostrService: ToastrService,
    public vs: ValidationService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private comman: CommanService) { }

  ngOnInit(): void {
    this.getLoginUserDetails();
    this.ProfileFormControl();
    this.sharedService.vehicleCount().subscribe({
      next: (ele: any) => {
        this.totalVehicle = ele.responseData.responseData2.totalRecords;
      }
    })
  }
  // ----------------------------------------------------form-control--------------------------------------------------------------
  ProfileFormControl() {
    this.myProfileForm = this.fb.group({
      profilePhoto: [''],
      name: [''],
      designation: [''],
      address: [''],
      mobileNo1: [''],
      email: [''],
      website: [''],
    })
  }
  // ----------------------------------------------------get user Details------------------------------------------------------
  getLoginUserDetails() {
    if (this.comman.getVehicleOwnerId()) {
      this.comman.setHttp('get', 'get-vehicle-owner?VehicleOwnerId=256&nopage=1&rowperpage=10', true, false, false, 'vehicleOwnerBaseUrlApi');
        this.comman.getHttp().subscribe((res: any) => {
        this.userDetails=res.responseData.responseData1[0];
        console.log(this.userDetails);
        })
      }
    else {
      this.tostrService.error("please login")
    }
  } 
  // ----------------------------------------------------edit and save Profile------------------------------------------------------------
  editProfile(profileData: any) {
    console.log(profileData);
    this.myProfileForm.patchValue({
      name: profileData.name,
      mobileNo1: profileData.mobileNo1
    })
  }
  profileSave() {

  }
  get f() {
    return this.myProfileForm.controls;
  }
}
