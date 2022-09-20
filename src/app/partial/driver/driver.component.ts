import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
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
  editId: any=0;
  date: any = new Date();
  constructor(private fb: FormBuilder,
    public vs: ValidationService,
    private tostrService: ToastrService,
    private comman: CommanService,
    private datepipe: DatePipe) { }

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
      licenceNo: [''],
      licenceDoc: [''],
      aadharNo: [''],
      aadharDoc: [''],
      panNo: [''],
      panDoc: [''],
      presentAdr: ['', Validators.required],
      permanentAdr: ['', Validators.required],
      flag: ['i']
    })

    this.searchDriverForm = this.fb.group({
      driverName: ['']
    })
  }
  getDriverDetails() {
    this.comman.setHttp('get', 'get-driver?searchText=' + this.searchDriverForm.value.driverName + '&pageno=' + 1 + '&rowperPage=' + 10, true, false, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.driverDetails = response.responseData.responseData1;
        this.driverDetails.forEach((ele: any) => {
          ele['isBlockFlag'] = false;
          if (ele.isBlock) {
            ele.isBlockFlag = true;
          }
        });
        this.tostrService.success(response.statusMessage);
      }
    })
  }
  clearSearchData() {
    this.searchDriverForm.controls['driverName'].setValue('');
    this.getDriverDetails();
  }
  blobkUnblockDriver(event: any, drData: any) {
    let param = {
      "id": 0,
      "driverId": drData.driverId,
      "blockedDate": this.date.toISOString(),
      "blockBy": 0,
      "isBlock": event.target.checked ? 1 : 0
    }
    this.comman.setHttp('post', 'Block-Unblock-Driver_1', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.tostrService.success(response.responseData);
      }
    })
  }
  editDriverData(driverData: any) {
    this.editId = driverData.driverId
    this.driverRegForm.patchValue({
      firstName: driverData.name.split(' ').shift(),
      lastName: driverData.name.split(' ').pop(),
      dOB: driverData.dob,
      mobileNo: driverData.mobileNo,
      presentAdr: driverData.presentAddress,
      permanentAdr: driverData.permanentAddress,
      licenceNo: driverData.licenceNumber,
      panNo: driverData.panNumber,
      aadharNo: driverData.aadharNumber,
      flag: "u"
    })
  }
  registerDriverSave() {
    let param = {
      "id":this.editId,
      "firstName": this.driverRegForm.value.firstName,
      "middleName": "",
      "lastName": this.driverRegForm.value.lastName,
      "mobileNo": this.driverRegForm.value.mobileNo,
      "presentAddress": this.driverRegForm.value.presentAdr,
      "permanentAddress": this.driverRegForm.value.permanentAdr,
      "dob": this.datepipe.transform(this.driverRegForm.value.dOB,'yyyy/MM/dd'),
      "licenceNumber": this.driverRegForm.value.licenceNo,
      "panNumber": this.driverRegForm.value.panNo,
      "aadharNumber": this.driverRegForm.value.aadharNo,
      "flag": this.driverRegForm.value.flag,
      "createdBy": this.comman.getUserId(),
      "createdDate": this.date.toISOString(),
      "modifiedBy": 0,
      "modifiedDate": this.date.toISOString(),
      "isDeleted": true,
      "name": ""
    }

    /* if (this.driverRegForm.invalid) {
      this.tostrService.error("Invalid Form");
      return;
    } else { */
    this.comman.setHttp('post', 'save-update-deriver-details', true, param, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.tostrService.success(response.statusMessage);
      }
    })
    // }
  }
  get f() { return this.driverRegForm.controls };
}
