import { DatePipe } from '@angular/common';
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
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.scss']
})
export class ModalsComponent implements OnInit {
  dialogData: any;
  remark = new FormControl('');
  driverRegForm!: FormGroup;
  maxDate = new Date();
  profilePhotoupd: string | any = 'assets/images/user.jpg';
  licenceDoc!: string;
  panDoc!: string;
  aadharDoc!: string;
  editId: number = 0;
  date = new Date();
  uploadFlag:boolean=false;
  buttonFlag: boolean = true;
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  constructor(public dialogRef: MatDialogRef<ModalsComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private error: ErrorsService,
    public validation: ValidationService,
    public config: ConfigService,
    private webStorage: WebStorageService,
    private datepipe: DatePipe,
    private apiCall: ApiCallService,
    private spinner: NgxSpinnerService,
    private commonMethods: CommonMethodsService) { }

  ngOnInit(): void {
    this.dialogData = this.data ? this.data : '';
    this.getFormControl();
  }
  get f() { return this.driverRegForm.controls };
  // --------------------------------------------------form controls------------------------------------------------------------------
  getFormControl() {
    this.driverRegForm = this.fb.group({
      profilePhoto: [''],
      mobileNo: [this.dialogData ? this.dialogData?.mobileNo : '', Validators.compose([Validators.required, Validators.pattern('^[6-9][0-9]{9}$'), Validators.maxLength(10)])],
      firstName: [this.dialogData ? this.dialogData?.name.split(' ').shift() : '', Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      lastName: [this.dialogData ? this.dialogData?.name.split(' ').pop() : '', Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('[a-zA-Z][a-zA-Z ]+')])],
      dob: [this.dialogData ? new Date(this.dialogData.dob) : '', Validators.required],
      licenceNumber: [this.dialogData ? this.dialogData?.licenceNumber : '', Validators.compose([Validators.required, Validators.pattern('^[A-Z]{2}[0-9]{13}$'), Validators.maxLength(20), Validators.minLength(15)])],
      licenceDoc: ['', Validators.required],
      aadharNumber: [this.dialogData ? this.dialogData?.aadharNumber : '', Validators.compose([Validators.required, Validators.pattern('^[0-9]{12}$'), Validators.maxLength(12), Validators.minLength(12)])],
      aadharCardDoc: ['', Validators.required],
      panNumber: [this.dialogData ? this.dialogData?.panNumber : '', Validators.compose([Validators.required, Validators.pattern('[A-Z]{3}[ABCFGHLJPTF]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}'), Validators.maxLength(10)])],
      panCardDoc: ['', Validators.required],
      presentAddress: [this.dialogData ? this.dialogData?.presentAddress : '', Validators.compose([Validators.required, Validators.maxLength(150)])],
      permanentAddress: [this.dialogData ? this.dialogData?.permanentAddress : '', Validators.compose([Validators.required, Validators.maxLength(150)])],
      flag: [this.dialogData ? 'u' : 'i'],
      licenceExpiryDate:[this.dialogData ?new Date(this.dialogData.licenceExpiryDate): '',Validators.required]
    })
    if (this.dialogData) {
      this.buttonFlag = false;
      this.licenceDoc = this.dialogData?.licenceDoc;
      this.panDoc = this.dialogData?.panCardDoc;
      this.aadharDoc = this.dialogData?.aadharCardDoc;
      this.profilePhotoupd = this.dialogData?.profilePhoto;
    }
  }

  //  --------------------------------------------------uploads-----------------------------------------------------------------
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
  }

  documentUpload(event: any, flag: any) {
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          flag == 'licence' ? this.licenceDoc = ele.responseData : flag == 'pan' ? this.panDoc = ele.responseData : this.aadharDoc = ele.responseData;
        }
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }
  clearDoc(flag?: any) {
    flag == 'pan' ? (this.panUpload.nativeElement.value = null, this.panDoc = '') :
      flag == 'aadhar' ? (this.aadharUpload.nativeElement.value = '', this.aadharDoc = '') :
        (this.licenceUpload.nativeElement.value = '', this.licenceDoc = '');
  }
 
  checkDocumentUpd(flag: any) {
    if (flag == 'licence') {
      if (this.driverRegForm.value.licenceDoc == '') {
        this.commonMethods.snackBar("Please upload licence", 1);
        this.driverRegForm.controls['licenceNumber'].setValue('');
      }
    }
    else if (flag == 'aadhar') {
      if (this.driverRegForm.value.aadharCardDoc == '') {
        this.commonMethods.snackBar("Please upload Aadhar card", 1);
        this.driverRegForm.controls['aadharNumber'].setValue('');
      }
    }
    else if(flag == 'pan'){
      if (this.driverRegForm.value.panCardDoc == '') {
        this.commonMethods.snackBar("Please upload Pan card", 1);
        this.driverRegForm.controls['panNumber'].setValue('');
      }
    }
  }
  onNoClick(flag: any): void {
    this.buttonFlag = true;
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
  // ----------------------------------------------address same or not--------------------------------------------------
  checkArress(event: any) {
    if (event.checked) {
      this.driverRegForm.controls['permanentAddress'].setValue(this.driverRegForm.value.presentAddress);
    }
    else {
      this.driverRegForm.controls['permanentAddress'].setValue('');
    }
  }
  //  ------------------------------------------------------add driver-----------------------------------------------------------------
  onSubmit(formDirective: any) {
    let formData = this.driverRegForm.value;
    formData.id = this.dialogData ? this.dialogData?.driverId : this.editId;
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
      return;
    } else {
      this.spinner.show();
      this.apiCall.setHttp('post', 'driver/save-update-deriver-details', true, formData, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          // this.closeModel.nativeElement.click();
          this.commonMethods.snackBar(response.statusMessage, 1);
          formDirective.resetForm();
          this.dialogRef.close('add');
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

}