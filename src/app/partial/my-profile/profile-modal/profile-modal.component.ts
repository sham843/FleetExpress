import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.scss']
})
export class ProfileModalComponent implements OnInit {
  myProfileForm!:FormGroup;
  dialogData:any;
  remark = new FormControl('');
  profilePhotoupd!:string;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  date=new Date();
  constructor(private fb:FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private CommonMethod:CommonMethodsService,
    public dialogRef: MatDialogRef<ProfileModalComponent>,
    private webStorage:WebStorageService,
    private apiCall:ApiCallService,
    private spinner:NgxSpinnerService,
    private error:ErrorsService,
    private sharedService:SharedService,
    public config:ConfigService,
    public vs: ValidationService,) { }

  ngOnInit(): void {
    this.dialogData = this.data ? this.data : '';
    this.ProfileFormControl();
  }
  ProfileFormControl() {
    this.myProfileForm = this.fb.group({
      profilePhoto: [],
      name: [this.dialogData?this.dialogData.name:'', Validators.compose([Validators.required, Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      designation: [''],
      address: [this.dialogData?this.dialogData.address:'', Validators.compose([Validators.required])],
      mobileNo: [this.dialogData?this.dialogData.mobileNo:'', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$')])],
      emailId: [this.dialogData?this.dialogData.emailId:'', Validators.compose([Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')])],
      webiste: [this.dialogData?this.dialogData.webiste:'', Validators.compose([Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')])],
      licenceNo: ['', Validators.compose([Validators.pattern('^[A-Z]{2}[0-9]{13}$')])],
      licenceNoDoc: [''],
      adharNo: ['', Validators.compose([Validators.pattern('^[0-9]{12}$')])],
      adharNoDoc: [''],
      panNo: ['', Validators.compose([Validators.pattern('[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}')])],
      panDoc: ['']
    })
    this.profilePhotoupd=this.dialogData.profilePhoto
  }
// --------------------------------------------------------------profile photo Upload--------------------------------------------------
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
  // ----------------------------------------------------edit profile---------------------------------------------------------------
  profileSave() {
    if (this.myProfileForm.invalid) {
      return
    }
    else {
      let formData = this.myProfileForm.value;
      formData.id=256;
      formData.profilePhoto=this.profilePhotoupd,
      formData.ownerCompany='',
      formData.gstNo='',
      formData.stateId=0,
      formData.divisionId=0,
      formData.districtId=0,
      formData.latitude=0,
      formData.longitude=0,
      formData.materialIds='',
      formData.createdBy=this.webStorage.getUserId(),
      formData.createdDate=this.date.toISOString(),
      formData.isDeleted=true,
      formData.isSnapToRoadService= 0,
      formData.isAddressLocationService=0,
      formData.flag='u'
      this.apiCall.setHttp('post', 'vehicle-owner/save-update-vehicle-owner', true, formData, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.dialogRef.close('edit');
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
  onNoClick(flag: any): void {
    if (this.data.inputType && flag == 'Yes') {
      if (this.CommonMethod.checkDataType(this.remark.value) == false) {
        this.CommonMethod.snackBar('Please Enter Remark', 1);
        return;
      }
      let obj = { remark: this.remark.value, flag: 'Yes' }
      this.dialogRef.close(obj);
    } else {
      this.dialogRef.close(flag);
    }
  }
}
