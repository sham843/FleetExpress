import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  myProfileForm!: FormGroup;
  userDetails!: object |any;
  totalVehicle!: number;
  profilePhotoupd: string = 'assets/images/Driver-profile.svg';
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  @ViewChild('profileUpload') profileUpload: any;
  constructor(
    public vs: ValidationService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    private webStorage:WebStorageService,
    private apiCall:ApiCallService) { }

  ngOnInit(): void {
    this.getLoginUserDetails();
    this.ProfileFormControl();
  }
  // ----------------------------------------------------form-control--------------------------------------------------------------
  ProfileFormControl() {
    this.myProfileForm = this.fb.group({
      profilePhoto: [''],
      name: ['', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      designation: [''],
      address: ['', Validators.compose([Validators.required])],
      mobileNo: ['', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$')])],
      emailId: ['', Validators.compose([Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')])],
      webiste: ['', Validators.compose([Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')])],
      licenceNo: ['', Validators.compose([Validators.pattern('^[A-Z]{2}[0-9]{13}$')])],
      licenceNoDoc: [''],
      adharNo: ['', Validators.compose([Validators.pattern('^[0-9]{12}$')])],
      adharNoDoc: [''],
      panNo: ['', Validators.compose([Validators.pattern('[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}')])],
      panDoc: ['']
    })
  }
  // ----------------------------------------------------get user Details------------------------------------------------------
  getLoginUserDetails() {
    if (this.webStorage.getVehicleOwnerId()) {
      this.apiCall.setHttp('get', 'get-vehicle-owner?VehicleOwnerId='+this.webStorage.getVehicleOwnerId()+'&nopage=1&rowperpage=10', true, false, false, 'vehicleOwnerBaseUrlApi');
      this.apiCall.getHttp().subscribe((res: any) => {
        this.userDetails = res.responseData.responseData1[0];
      })
    }
    else {
      // this.tostrService.error("please login")
    }
  }
  // ----------------------------------------------------edit and save Profile------------------------------------------------------------
  editProfile(profileData: any) {
    console.log(profileData);
    this.myProfileForm.patchValue({
      profilePhoto: profileData.profilePhoto,
      name: profileData.name,
      mobileNo: profileData.mobileNo,
      panNo: profileData.panNo,
      // designation:profileData,
      address: profileData.address,
      emailId: profileData.emailId,
      webiste: profileData.webiste,
      licenceNo: profileData.licenceNo,
      adharNo: profileData.adharNo,
      licenceNoDoc: profileData.licenceNoDoc || '',
      adharNoDoc: profileData.adharNoDoc || '',
      panDoc: profileData.panDoc || ''
    })
  }
  // --------------------------------------------------------------image Upload--------------------------------------------------
  profileUploads(event: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'driverProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.spinner.hide();
        if (ele.statusCode == "200") {
          this.profilePhotoupd = ele.responseData;
        }
        else {
          this.spinner.hide();
          this.error.handelError(ele.statusCode);
        }
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
    this.spinner.hide();
  }
  // ----------------------------------------------------------Edit profile-----------------------------------------------------------
  profileSave() {
    if (this.myProfileForm.invalid) {
      return
    }
    else {
      let formData = this.myProfileForm.value;
      formData.id=this.webStorage.getUserId();
      formData.ownerCompany='',
      formData.gstNo='',
      formData.stateId=0,
      formData.divisionId=0,
      formData.districtId=0,
      formData.latitude=0,
      formData.longitude=0,
      formData.materialIds='',
      formData.createdBy=this.webStorage.getUserId(),
      formData.createdDate='',
      formData.isDeleted=true,
      formData.isSnapToRoadService= 0,
      formData.isAddressLocationService=0,
      formData.flag='u'
     console.log(formData);
      this.apiCall.setHttp('post', 'save-update-vehicle-owner', true, formData, false, 'vehicleOwnerBaseUrlApi');
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          // this.tostrService.success(response.responseData);
        }
        else {
          this.spinner.hide();
          this.error.handelError(response.statusCode);
        }
      },
        (error: any) => {
          this.spinner.hide();
          this.error.handelError(error.status);
        })
    }
  }
  get f() {
    return this.myProfileForm.controls;
  }
}
