import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { invalid } from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
  driverRegForm !: FormGroup;
  searchDriverForm!: FormGroup;
  driverDetails: any;
  editId: number = 0;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  buttonFlag:boolean=true;
  buttonText='Save';
  licenceDoc: any;
  panDoc: any;
  aadharDoc: any;
  totalItem: any;
  totalVehicle: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  highLightRow!: string;
  date: any = new Date();
  profilePhotoupd: any = 'assets/images/Driver-profile.svg';
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;

  constructor(private fb: FormBuilder,
    public vs: ValidationService,
    private tostrService: ToastrService,
    private comman: CommanService,
    private datepipe: DatePipe,
    private sharedService: SharedService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getDriverDetails();
  }
  //--------------------------------------------------------form Controls----------------------------------------------------
  getRegFormData() {
    this.driverRegForm = this.fb.group({
      profilePhoto: [''],
      mobileNo: ['', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$'), Validators.maxLength(10)])],
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(15)])],
      lastName: ['', Validators.compose([Validators.required, Validators.maxLength(15)])],
      dob: ['', Validators.required],
      licenceNumber: ['', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{13}$'), Validators.maxLength(20), Validators.minLength(15)])],
      licenceDoc: ['', Validators.required],
      aadharNumber: ['', Validators.compose([Validators.required,Validators.pattern('^[0-9]{12}$'),Validators.maxLength(12), Validators.minLength(12)])],
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
    this.comman.setHttp('get', 'get-driver?searchText=' + this.searchDriverForm.value.driverName + '&pageno=' + this.paginationNo + '&rowperPage=' + this.pageSize, true, false, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.driverDetails = response.responseData.responseData1;
        this.driverDetails.forEach((ele: any) => {
          ele['isBlockFlag'] = false;
          if (ele.isBlock) {
            ele.isBlockFlag = true;
          }
        });
        this.totalItem = response.responseData.responseData2.totalRecords;
        // this.tostrService.success(response.statusMessage);
        if (flag == 'search') {
          this.searchHideShow = false;
          this.clearHideShow = true;
        }
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
    this.comman.setHttp('put', 'Block-Unblock-Driver_1', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.tostrService.success(response.responseData);
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
  imageUpload(event: any, flag: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if(ele.statusCode=="200"){
          this.spinner.hide()
          flag == 'licence' ? this.licenceDoc = ele.responseData : flag == 'pan' ? this.panDoc = ele.responseData : this.aadharDoc = ele.responseData;
          this.tostrService.success(ele.statusMessage);
        }
        else{
          this.spinner.hide();
          this.tostrService.success(ele.statusMessage);
        }
      }
    })
  }
  clearDoc(flag: any) {
    flag == 'pan' ? (this.panUpload.nativeElement.value = null, this.driverRegForm.controls['panDoc'].setValue('')) :
      flag == 'aadhar' ? (this.aadharUpload.nativeElement.value = null, this.driverRegForm.controls['aadharDoc'].setValue('')) :
        (this.licenceUpload.nativeElement.value = null, this.driverRegForm.controls['licenceDoc'].setValue(''));
  }
  // -------------------------------------------------------Update Driver Details------------------------------------------------------------
  editDriverData(driverData: any) {
    this.buttonFlag=false;
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
    console.log(this.aadharDoc)
  }
  closeModels() {
    this.highLightRow = '';
    this.driverRegForm.controls['mobileNo'].setValue('');
    this.formGroupDirective.resetForm();
    this.getRegFormData();
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
    this.comman.setHttp('delete', 'Delete-Driver', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.tostrService.success(response.responseData);
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
  registerDriverSave() {
    this.buttonFlag=false;
    this.highLightRow = '';
    let formData = this.driverRegForm.value;
    formData.id = this.editId;
    formData.middleName = '';
    formData.dob = this.datepipe.transform(formData.dob, 'yyyy/MM/dd')
    formData.createdBy = this.comman.getUserId();
    formData.createdDate = this.date.toISOString();
    formData.modifiedBy = 0,
      formData.modifiedDate = this.date.toISOString(),
      formData.name = "",
      formData.panCardDoc = this.panDoc;
    formData.aadharCardDoc = this.aadharDoc || '',
      formData.licenceDoc = this.licenceDoc || '',
      formData.profilePhoto = this.profilePhotoupd != 'assets/images/Driver-profile.svg' ? this.profilePhotoupd : '';
    if (this.driverRegForm.invalid) {
      !this.driverRegForm.value.panCardDoc ? this.tostrService.error("Pancard upload is required") : '';
      !this.driverRegForm.value.aadharCardDoc ? this.tostrService.error("Aadhar card upload is required") : '';
      !this.driverRegForm.value.licenceDoc ? this.tostrService.error("Licence upload is required") : '';
      return;
    } else { 
      this.closeModel.nativeElement.click();
      this.spinner.show();
      this.comman.setHttp('post', 'save-update-deriver-details', true, formData, false, 'driverBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.formGroupDirective.resetForm();
          this.highLightRow = '';
          this.tostrService.success(response.statusMessage);

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
}
