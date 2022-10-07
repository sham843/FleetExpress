import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ModalsComponent } from 'src/app/dialogs/modals/modals.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
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
  checkArray = new Array();
  flagArray = new Array();
  profilePhotoupd: string | any = 'assets/images/Driver-profile.svg';
  deleteBtn: boolean = false;
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
    public config: ConfigService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getDriverDetails();
  }

  ngAfterViewInit() {
    let formValue = this.searchDriverForm.valueChanges;
    formValue.pipe(
      filter(() => this.searchDriverForm.valid),
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(() => {
        this.paginationNo = 1;
        this.getDriverDetails();
        this.searchHideShow = false;
      this.clearHideShow = true;
      })
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
    if (flag == 'search') {
      this.searchHideShow = false;
      this.clearHideShow = true;
    }
    this.apiCall.setHttp('get', 'driver/get-driver?searchText=' + this.searchDriverForm.value.driverName + '&pageno=' + this.paginationNo + '&rowperPage=' + this.pageSize, true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.driverDetails = res.responseData.responseData1;
        this.driverDetails.forEach((ele: any) => {
          ele['isBlockFlag'] = false;
          ele['isChecked'] = false;
          if (ele.isBlock) {
            ele.isBlockFlag = true;
          }
        });
        this.totalItem = res.responseData.responseData2.totalRecords;
      } else {
        this.driverDetails = [];
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

  // -----------------------------------------------comfirmation module----------------------------------------------------------
  confirmationDialog(flag: boolean, label: string, event?: any, drData?: any) {
    let obj: any = ConfigService.dialogObj;

    if (label == 'status') {
      obj['p1'] = flag ? 'Are you sure you want to approve?' : 'Are you sure you want to reject ?';
      obj['cardTitle'] = flag ? 'Application  Approve' : 'Application  Reject';
      obj['successBtnText'] = flag ? 'Approve' : 'Reject';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {
      obj['p1'] = 'Are you sure you want to delete this record';
      obj['cardTitle'] = 'Delete';
      obj['successBtnText'] = 'Delete';
      obj['cancelBtnText'] = 'Cancel';
    }

    const dialog = this.dialog.open(ConfirmationComponent, {
      width: this.config.dialogBoxWidth[0],
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      console.log(res)
      if (res == 'Yes' && label == 'status') {
        console.log('toggle')
        this.blobkUnblockDriver(event, drData);
      } else if (res == 'Yes' && label == 'delete') {
        console.log('delete');
        this.removeDriverData();
      }
    }
    )
  }
  // -----------------------------------------Block/Unblock Driver--------------------------------------------------------------
  blobkUnblockDriver(event: any, drData: any) {
    console.log(event.checked);
    console.log(drData)
    let param = {
      "id": 0,
      "driverId": drData.driverId,
      "blockedDate": this.date.toISOString(),
      "blockBy": 0,
      "isBlock": event.checked ? 1 : 0
    }
    this.spinner.show();
    this.apiCall.setHttp('put', 'driver/Block-Unblock-Driver_1', true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
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

  onSingleSelected(data: any, event: any) {
    if (event.checked == true) {
      data['isChecked'] = true;
      this.checkArray.push(data);
    } else {
      data['isChecked'] = false;
      this.checkArray = [];
      this.driverDetails.forEach((ele: any) => {
        if (ele.isChecked == true) {
          this.checkArray.push(ele);
        }
      }) 
    }
  } 

  removeDriverData() {
    this.deleteBtn = false;
    let param = new Array();
    for (let i = 0; i < this.driverDetails.length; i++) {
      if (this.driverDetails[i].isChecked == true) {
        let array = {
          "driverId": this.driverDetails[i].driverId,
          "isDeleted": 1
        }
        param.push(array);
      }
    }
    this.spinner.show();
    this.apiCall.setHttp('delete', 'driver/Delete-Driver', true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.getDriverDetails();
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status);
      })
  }
  // --------------------------------------------Save--------------------------------------------------------------------------
  registerDriverSave(formDirective: any) {
    console.log(this.driverRegForm.value)
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
      /*  !this.driverRegForm.value.panCardDoc ? this.commonMethods.snackBar("Pancard upload is required", 1) : '';
       !this.driverRegForm.value.aadharCardDoc ? this.commonMethods.snackBar("Aadhar card upload is required", 1) : '';
       !this.driverRegForm.value.licenceDoc ? this.commonMethods.snackBar("Licence upload is required", 1) : ''; */
      return;
    } else {
      console.log("valid")
      debugger
      this.spinner.show();
      this.apiCall.setHttp('post', 'driver/save-update-deriver-details', true, formData, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.closeModel.nativeElement.click();
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  confirmationDialog1(flag: boolean, label: string, event?: any, drData?: any) {
    let obj: any = ConfigService.dialogObj;
    
    if (label == 'status') {
      obj['p1'] = flag ? 'Are you sure you want to approve?' : 'Are you sure you want to reject ?';
      obj['cardTitle'] = flag ? 'Driver Registration' : 'Application  Reject';
      obj['successBtnText'] = flag ? 'Approve' : 'Reject';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {
      obj['p1'] = 'Are you sure you want to delete this record';
      obj['cardTitle'] = 'Delete';
      obj['successBtnText'] = 'Delete';
      obj['cancelBtnText'] = 'Cancel';
    }

    const dialog = this.dialog.open(ModalsComponent, {
      // width: this.config.dialogBoxWidth[0],
      width: '900px',
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      console.log(res)
      if (res == 'Yes' && label == 'status') {
        console.log('toggle')
        this.blobkUnblockDriver(event, drData);
      } else if (res == 'Yes' && label == 'delete') {
        console.log('delete');
        this.removeDriverData();
      }
    }
    )
  }
}
