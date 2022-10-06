import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
  driverRegForm !: FormGroup;
  searchDriverForm!: FormGroup;
  driverDetails: object | any;
  editId: number = 0;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  buttonFlag: boolean = true;
  dobDisabled: boolean = true;
  buttonText: string = 'Save';
  licenceDoc: string | any;
  panDoc: string | any;
  aadharDoc: string | any;
  totalItem!: number;
  paginationNo: number = 1;
  pageSize: number = 10;
  highLightRow!: string;
  date: any = new Date();
  maxDate = new Date();
  subscription!: Subscription;
  profilePhotoupd: string | any = 'assets/images/Driver-profile.svg';

  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  @ViewChild('profileUpload') profileUpload: any;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  constructor(private fb: FormBuilder,
    public validation: ValidationService,
    private apiCall: ApiCallService,
    private datepipe: DatePipe,
    private webStorage: WebStorageService,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    private commonMethods: CommonMethodsService,
    private master: MasterService) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getDriverDetails();
  }
  //--------------------------------------------------------form Controls----------------------------------------------------
  getRegFormData() {
    this.driverRegForm = this.fb.group({
      profilePhoto: [''],
      mobileNo: ['', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$'), Validators.maxLength(10)])],
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      lastName: ['', Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      dob: ['', Validators.required],
      licenceNumber: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{13}$'), Validators.maxLength(20), Validators.minLength(15)])],
      licenceDoc: ['', Validators.required],
      aadharNumber: ['', Validators.compose([Validators.required, Validators.pattern('^[0-9]{12}$'), Validators.maxLength(12), Validators.minLength(12)])],
      aadharCardDoc: ['', Validators.required],
      panNumber: ['', Validators.compose([Validators.required, Validators.pattern('[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}'), Validators.maxLength(10)])],
      panCardDoc: ['', Validators.required],
      presentAddress: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      permanentAddress: ['', Validators.compose([Validators.required, Validators.maxLength(150)])],
      flag: ['i']
    })
    this.searchDriverForm = this.fb.group({
      driverName: ['', Validators.compose([Validators.required, Validators.maxLength(15)])]
    })
  }
  // -----------------------------------------------Driver Details----------------------------------------------------------
  getDriverDetails(flag?: any) {
    this.spinner.show();
    let documentUrl: any = this.master.getDriverListData(this.searchDriverForm.value.driverName, this.paginationNo,this.pageSize);
    documentUrl.subscribe({
      next:(response:any)=>{
          this.spinner.hide();
          this.driverDetails=response.responseData1
          this.driverDetails.forEach((ele: any) => {
            ele['isBlockFlag'] = false;
            if (ele.isBlock) {
              ele.isBlockFlag = true;
            }
          });
          this.totalItem = response.responseData2.totalRecords;
          if (flag == 'search') {
            this.searchHideShow = false;
            this.clearHideShow = true;
          } 
          flag
        }
  })
}

  clearSearchData() {
    this.searchDriverForm.controls['driverName'].setValue('');
    this.getDriverDetails();
    this.searchHideShow = true;
    this.clearHideShow = false;
  }
  // -----------------------------------------Block/Unblock Driver--------------------------------------------------------------
  blobkUnblockDriver(event: any, drData: any) {
    let param = {
      "id": 0,
      "driverId": drData.driverId,
      "blockedDate": this.date.toISOString(),
      "blockBy": 0,
      "isBlock": event.target.checked ? 1 : 0
    }
    this.spinner.show();
    this.apiCall.setHttp('put', 'Block-Unblock-Driver_1', true, param, false, 'driverBaseUrlApi');
    this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.commonMethods.snackBar(response.statusMessage, 1)
      }
      else {
        this.spinner.hide();
        this.error.handelError(response.statusCode);
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }
  // ----------------------------------------------------Upload Document and profile photo-------------------------------------

  profilePhoto(event: any) {
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'driverProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          this.profilePhotoupd = ele.responseData;
        }
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
    this.spinner.hide();
  }


  documentUpload(event: any, flag: any) {
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          flag == 'licence' ? this.licenceDoc = ele.responseData : flag == 'pan' ? this.panDoc = ele.responseData : this.aadharDoc = ele.responseData;
          this.commonMethods.snackBar(ele.statusMessage, 1)
        }
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }


  viewDocument(flag: any) {
    flag == 'licence' ? this.commonMethods.redirectToNewTab(this.licenceDoc) : flag == 'pan' ? this.commonMethods.redirectToNewTab(this.panDoc) : this.commonMethods.redirectToNewTab(this.aadharDoc);
  }

  clearDoc(flag?: any) {
    flag == 'pan' ? (this.panUpload.nativeElement.value = '', this.panDoc = '') :
      flag == 'aadhar' ? (this.aadharUpload.nativeElement.value = '', this.aadharDoc = '') :
        (this.licenceUpload.nativeElement.value = '', this.licenceDoc = '');
  }
  // -------------------------------------------------------Update Driver Details------------------------------------------------------------
  editDriverData(driverData: any) {
    this.buttonFlag = false;
    this.highLightRow = driverData.driverId;
    this.editId = driverData?.driverId
    this.driverRegForm.patchValue({
      firstName: driverData?.name.split(' ').shift(),
      lastName: driverData?.name.split(' ').pop(),
      dob: new Date(driverData.dob),
      mobileNo: driverData?.mobileNo,
      presentAddress: driverData?.presentAddress,
      permanentAddress: driverData?.permanentAddress,
      licenceNumber: driverData?.licenceNumber,
      panNumber: driverData?.panNumber,
      aadharNumber: driverData?.aadharNumber,
      flag: "u"
    })
    this.licenceDoc = driverData?.licenceDoc;
    this.panDoc = driverData?.panCardDoc;
    this.aadharDoc = driverData?.aadharCardDoc;
    this.profilePhotoupd = driverData?.profilePhoto;
  }
  // -----------------------------------------------------close module-----------------------------------------------------------
  closeModels(formDirective: any) {
    this.highLightRow = '';
    formDirective.resetForm();
    this.buttonFlag = true;
    this.profilePhotoupd = 'assets/images/Driver-profile.svg';
    this.panDoc = '';
    this.aadharDoc = '';
    this.licenceDoc = '';
  }
  // ----------------------------------------------Delete Record----------------------------------------------------------------
  removeDriverData(data: any) {
    let param = [
      {
        "driverId": data.driverId,
        "isDeleted": 1
      }
    ]
    this.spinner.show();
    this.apiCall.setHttp('delete', 'Delete-Driver', true, param, false, 'driverBaseUrlApi');
    this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.commonMethods.snackBar(response.statusMessage, 1)
        this.getDriverDetails();
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
  // --------------------------------------------Save--------------------------------------------------------------------------
  registerDriverSave(formDirective: any) {
    this.buttonFlag = false;
    this.highLightRow = '';
    let formData = this.driverRegForm.value;
    formData.id = this.editId;
    formData.middleName = '';
    formData.dob = this.datepipe.transform(formData.dob, 'yyyy/MM/dd');
    formData.createdBy = this.webStorage.getUserId();
    formData.createdDate = this.date.toISOString();
    formData.modifiedBy = 0;
    formData.modifiedDate = this.date.toISOString();
    formData.name = "";
    formData.panCardDoc = this.panDoc;
    formData.aadharCardDoc = this.aadharDoc || '';
    formData.licenceDoc = this.licenceDoc || '';
    formData.profilePhoto = this.profilePhotoupd != 'assets/images/Driver-profile.svg' ? this.profilePhotoupd : '';

    if (this.driverRegForm.invalid) {
      !this.driverRegForm.value.panCardDoc ? this.commonMethods.snackBar("Pancard upload is required", 1) : '';
      !this.driverRegForm.value.aadharCardDoc ? this.commonMethods.snackBar("Aadhar card upload is required", 1) : '';
      !this.driverRegForm.value.licenceDoc ? this.commonMethods.snackBar("Licence upload is required", 1) : '';
      return;
    } else {
      this.closeModel.nativeElement.click();
      this.spinner.show();
      this.apiCall.setHttp('post', 'save-update-deriver-details', true, formData, false, 'driverBaseUrlApi');
      this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.highLightRow = '';
          this.commonMethods.snackBar(response.statusMessage, 1)
          formDirective.resetForm();
          this.getDriverDetails();
        }
        else {
          this.spinner.hide();
          this.error.handelError(response.statusCode);
        }
      },
        (error: any) => {
          this.error.handelError(error.status);
        })
      this.spinner.hide();
    }
  }
  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getDriverDetails();
  }
  get f() { return this.driverRegForm.controls };

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
