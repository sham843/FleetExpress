import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
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
  isSubmitted: boolean = true;
  driverDetails: any;
  editId: any = 0;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  licenceDoc: any;
  panDoc: any;
  aadharDoc: any;
  totalItem: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  date: any = new Date();
  profilePhoto: any = 'assets/images/Driver-profile.svg';
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  constructor(private fb: FormBuilder,
    public vs: ValidationService,
    private tostrService: ToastrService,
    private comman: CommanService,
    private datepipe: DatePipe,
    private sharedService: SharedService,
    private spinner:NgxSpinnerService) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getDriverDetails();
  }
  getRegFormData() {
    this.driverRegForm = this.fb.group({
      driverPfofile: [''],
      mobileNo: ['', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$'), Validators.maxLength(10)])],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dOB: ['', Validators.required],
      licenceNo: ['',Validators.compose([Validators.required,Validators.pattern('^[A-Z]{2}[0-9]{13}$'),Validators.maxLength(15),Validators.minLength(15)])],
      licenceDoc: [''],
      aadharNo: ['',Validators.compose([Validators.required,Validators.maxLength(12),Validators.minLength(12)])],
      aadharDoc: [''],
      panNo: ['',Validators.compose([Validators.required,Validators.pattern('[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}'),Validators.maxLength(10)])],
      panDoc: [''],
      presentAdr: ['', Validators.required],
      permanentAdr: ['', Validators.required],
      flag: ['i']
    })

    this.searchDriverForm = this.fb.group({
      driverName: ['']
    })
  }
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
        this.tostrService.success(response.statusMessage);
        if (flag == 'search') {
          this.searchHideShow = false;
          this.clearHideShow = true;
        }
      }
    })
  }
  clearSearchData() {
    this.searchDriverForm.controls['driverName'].setValue('');
    this.getDriverDetails();
    this.searchHideShow = true;
    this.clearHideShow = false;
  }
  blobkUnblockDriver(event: any, drData: any) {
    let param = {
      "id": 0,
      "driverId": drData.driverId,
      "blockedDate": this.date.toISOString(),
      "blockBy": 0,
      "isBlock": event.target.checked ? 1 : 0
    }
    this.spinner.show();
    this.comman.setHttp('post', 'Block-Unblock-Driver_1', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.tostrService.success(response.responseData);
      }
    })
  }
  profileUploads(event: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'driverProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.spinner.hide();
        this.profilePhoto = ele.responseData;
      }
    })
  }
  imageUpload(event: any, flag: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.spinner.hide();
        flag == 'licence' ? this.licenceDoc = ele.responseData : flag == 'pan' ? this.panDoc = ele.responseData : this.aadharDoc = ele.responseData;
        this.tostrService.success(ele.statusMessage);
      }
    })
  }
  clearDoc(flag: any) {
    flag == 'pan'?(this.panUpload.nativeElement.value = null,this.driverRegForm.controls['panDoc'].setValue('')):
    flag == 'aadhar'?(this.aadharUpload.nativeElement.value = null,this.driverRegForm.controls['aadharDoc'].setValue('')):
    (this.licenceUpload.nativeElement.value = null,this.driverRegForm.controls['licenceDoc'].setValue(''));
  }
  editDriverData(driverData: any) {
    this.editId = driverData?.driverId
    this.driverRegForm.patchValue({
      firstName: driverData?.name.split(' ').shift(),
      lastName: driverData?.name.split(' ').pop(),
      dOB:new Date(driverData.dob),
      mobileNo: driverData?.mobileNo,
      presentAdr: driverData?.presentAddress,
      permanentAdr: driverData?.permanentAddress,
      licenceNo: driverData?.licenceNumber,
      panNo: driverData?.panNumber,
      aadharNo: driverData?.aadharNumber,
      flag: "u",
      licenceDoc: driverData?.licenceDoc,
      aadharDoc: driverData?.aadharCardDoc,
      panDoc: driverData?.panCardDoc,
      driverPfofile: driverData?.profilePhoto
    })
    this.profilePhoto = driverData.profilePhoto;
  }
  removeDriverData(data: any) {
    let param = [
      {
        "driverId": data.driverId,
        "isDeleted":1
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
    })
  }
  registerDriverSave() {
    let param = {
      "id": this.editId,
      "firstName": this.driverRegForm.value.firstName,
      "middleName": "",
      "lastName": this.driverRegForm.value.lastName,
      "mobileNo": this.driverRegForm.value.mobileNo,
      "presentAddress": this.driverRegForm.value.presentAdr,
      "permanentAddress": this.driverRegForm.value.permanentAdr,
      "dob": this.datepipe.transform(this.driverRegForm.value.dOB, 'yyyy/MM/dd'),
      "licenceNumber": this.driverRegForm.value.licenceNo,
      "panNumber": this.driverRegForm.value.panNo,
      "aadharNumber": this.driverRegForm.value.aadharNo,
      "flag": this.driverRegForm.value.flag,
      "createdBy": this.comman.getUserId(),
      "createdDate": this.date.toISOString(),
      "modifiedBy": 0,
      "modifiedDate": this.date.toISOString(),
      // "isDeleted": true,
      "name": "",
      "panCardDoc": this.panDoc || '',
      "aadharCardDoc": this.aadharDoc || '',
      "licenceDoc": this.licenceDoc || '',
      "profilePhoto": this.profilePhoto != 'assets/images/Driver-profile.svg' ? this.profilePhoto : ''
    }
    this.closeModel.nativeElement.click();
    /* if (this.driverRegForm.invalid) {
      this.tostrService.error("Invalid Form");
      return;
    } else { */
    this.spinner.show();
    this.comman.setHttp('post', 'save-update-deriver-details', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.tostrService.success(response.statusMessage);
      }
    })
    // }
  }
  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getDriverDetails();
  }
  get f() { return this.driverRegForm.controls };
}
