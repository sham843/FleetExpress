import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-vehicle-modal',
  templateUrl: './vehicle-modal.component.html',
  styleUrls: ['./vehicle-modal.component.scss']
})
export class VehicleModalComponent implements OnInit {
  remark = new FormControl('');
  registerVehicleForm!: FormGroup;
  insuranceDoc: string | any;
  registerDoc: string | any;
  pollutionDoc: string | any;
  fitnessDoc: string | any;
  nationalDoc: string | any;
  profilePhotoImg!: string;
  dialogData!: any;
  cardTitle!: string;
  vehiclePhoto: string = 'assets/images/Vehicle-profile.svg';
  highLightRow!: string;
  buttonFlag: boolean = true;
  rgsNo: boolean = true;
  subscription!: Subscription;
  fuelsType: any;
  minDate = new Date();
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('uploadInsurance') uploadInsurance: any;
  @ViewChild('uploadRegister') uploadRegister: any;
  @ViewChild('uploadPollution') uploadPollution: any;
  @ViewChild('uploadFitness') uploadFitness: any;
  @ViewChild('uploadPermit') uploadPermit: any;
  @ViewChild('updVehiclePhoto') updVehiclePhoto: any;
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  constructor(public dialogRef: MatDialogRef<VehicleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonMethods: CommonMethodsService,
    private apiCall: ApiCallService,
    private webStorage: WebStorageService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public sharedService: SharedService,
    private spinner: NgxSpinnerService,
    public vs: ValidationService,
    private error: ErrorsService,
    public config: ConfigService) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.dialogData != 0 ? this.cardTitle = 'Vehicle Details' : this.cardTitle = 'Add Vehicle';
    this.getFormControl();
  }
  getFormControl() {
    this.registerVehicleForm = this.fb.group({
      vehicleNo: [this.dialogData ? this.dialogData.vehicleNo : '', [Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(10), Validators.pattern('^([A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{4})|^([A-Z]{3}[0-9]{3,4})')])]],
      fuelType: [this.dialogData ? this.dialogData.fuelTypeId : ''],
      manufacturer: [this.dialogData ? this.dialogData.manufacturer : '', Validators.required],
      model: [this.dialogData ? this.dialogData.model : '', Validators.required],
      chassicNo: [this.dialogData ? this.dialogData.chassisNo : '', [Validators.compose([Validators.required, Validators.pattern('[A-Z0-9_]{17}')])]],
      engineNo: [this.dialogData ? this.dialogData.engineNo : '', [Validators.compose([Validators.required, Validators.pattern('[A-Z0-9_]{14}')])]],
      insuranceExDate: [this.dialogData ? this.dialogData.insuranceExpiryDate : '', Validators.required],
      registerNo: [this.dialogData ? this.dialogData.vehicleNo : ''],
      pollutionExDate: [this.dialogData ? new Date(this.dialogData.pollutionExpiryDate) : '', Validators.required],
      fitnessExDate: [this.dialogData ? this.dialogData.fitnessExpiryDate : '', Validators.required],
      permitNo: [this.dialogData ? this.dialogData.nationalPermit : '', [Validators.compose([Validators.required])]]
    })
    if (this.dialogData) {
      this.buttonFlag = false;
      this.insuranceDoc = this.dialogData ? this.dialogData.insuranceExpiryDoc : '';
      this.registerDoc = this.dialogData ? this.dialogData.regCertificateDoc : '';
      this.pollutionDoc = this.dialogData ? this.dialogData.pollutionExpiryDoc : '';
      this.fitnessDoc = this.dialogData ? this.dialogData.fitnessDoc : '';
      this.nationalDoc = this.dialogData ? this.dialogData.nationalPermitDoc : '';
      this.profilePhotoImg = this.dialogData ? this.dialogData.profilePhoto : '';
      this.vehiclePhoto = this.profilePhotoImg ? this.profilePhotoImg : 'assets/images/Vehicle-profile.svg';

    }
    // 
    this.apiCall.setHttp('get', 'vehicle/get-fuel-List', true, false, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      this.fuelsType = response.responseData;
    })
  }

  get f() { return this.registerVehicleForm.controls; }
  // ---------------------------------------------------------------------Upload Photo And Document---------------------------
  vehiclePhotoUpd(event: any, flag: any) {
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg", flag);
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          this.profilePhotoImg = ele.responseData;
          this.vehiclePhoto = this.profilePhotoImg;
        }
      }
    }, (error: any) => {
      this.error.handelError(error.status);
    })
  }

  documentUpload(event: any, flag: any) {
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          flag == 'insurance' ? this.insuranceDoc = ele.responseData : flag == 'register' ? this.registerDoc = ele.responseData : flag == 'pollution' ? this.pollutionDoc = ele.responseData : flag == 'fitness' ? this.fitnessDoc = ele.responseData : this.nationalDoc = ele.responseData;
        }
      }
    }, (error: any) => {
      this.error.handelError(error.status);
    })
  }
  clearDoc(flag?: any) {
    flag == 'profile' ? (this.updVehiclePhoto.nativeElement.value = '', this.profilePhotoImg = '', this.vehiclePhoto = 'assets/images/Vehicle-profile.svg') :
      flag == 'insurance' ? (this.uploadInsurance.nativeElement.value = null, this.insuranceDoc = '') :
        flag == 'register' ? (this.uploadRegister.nativeElement.value = '', this.registerDoc = '') :
          flag == 'pollution' ? (this.uploadPollution.nativeElement.value = '', this.pollutionDoc = '') :
            flag == 'fitness' ? (this.uploadFitness.nativeElement.value = '', this.fitnessDoc = '') :
              flag == 'permit' ? (this.uploadPermit.nativeElement.value = '', this.nationalDoc = '') : '';
  }

  checkDocumentUpd(flag: any) {
    if (flag == 'insurance') {
      if (this.registerVehicleForm.value.insuranceExDate.length != 0 && !this.insuranceDoc) {
        this.commonMethods.snackBar("Please upload insurance document", 1);
      }
    }
    else if (flag == 'register') {
      if (!this.registerDoc) {
        this.commonMethods.snackBar("Please upload register certificate", 1);
      }
    }
    else if (flag == 'pollution') {
      if (this.registerVehicleForm.value.pollutionExDate.length != 0 && !this.pollutionDoc) {
        this.commonMethods.snackBar("Please upload pollution document", 1);
      }
    }
    else if (flag == 'fitness') {
      if (this.registerVehicleForm.value.fitnessExDate.length != 0 && !this.fitnessDoc) {
        this.commonMethods.snackBar("Please upload fitness document", 1);
      }
    }
    else if (flag == 'permit') {
      if (this.registerVehicleForm.value.permitNo.length != 0 && !this.nationalDoc) {
        this.commonMethods.snackBar("Please upload national permit document", 1);
      }
    }
  }

  // -------------------------------------------------Add vehicle------------------------------------------------------------------
  saveVehicleDetails(formDirective: any) {
    this.highLightRow = '';
    console.log(this.registerVehicleForm.value.vehicleNo);
    let first, second, third, forth, oldFirst, oldSecond;
    if (this.registerVehicleForm.value.vehicleNo.length == 10) {
      let vhlaData = (this.registerVehicleForm.value.vehicleNo).split('');
      first = vhlaData.splice(0, 2).join('');
      second = vhlaData.splice(0, 2).join('');
      third = vhlaData.splice(0, 2).join('');
      forth = vhlaData.join('');
    }
    else {
      let vhlaData = (this.registerVehicleForm.value.vehicleNo).split('');
      oldFirst = vhlaData.splice(0, 3).join('');
      oldSecond = vhlaData.join('');
    }
    let param = {
      "oldVehNo1": oldFirst ? oldFirst : '',
      "oldVehNo2": oldSecond ? oldSecond : '',
      "newVehNo1": first ? first : '',
      "newVehNo2": second ? second : '',
      "newVehNo3": third ? third : '',
      "newVehNo4": forth ? forth : '',
      "driverName": this.dialogData ? this.dialogData.driverName || '' : "",
      "driverNo": this.dialogData ? this.dialogData.mobileNo || '' : "",
      "vehicleTypeId": 0,
      "capacity": 0,
      "createdBy": this.webStorage.getUserId(),
      "vehRegId": this.dialogData ? this.dialogData.vehicleId : 0,
      "permit": "",
      "licence": "",
      "deviceId": 0,
      "deviceCompanyId": 0,
      "deviceSIMNo": "",
      "vehicleOwnerId": this.webStorage.getVehicleOwnerId(),
      "vehicleMake": this.registerVehicleForm.value.manufacturer,
      "vehicleModel": this.registerVehicleForm.value.model,
      "vehicleChassisNo": this.registerVehicleForm.value.chassicNo,
      "vehicleEngineNo": this.registerVehicleForm.value.engineNo,
      "fuelTypeId": this.registerVehicleForm.value.fuelType,
      "flag": this.dialogData ? "u" : "i",
      "isDeviceInfoChange": true,
      "vehicleAssignStatusId": 0,
      "rate": 0,
      "isGST": true,
      "length": 0,
      "width": 0,
      "height": 0,
      "secondarySimNo": "",
      "primaryTelecomProvider": "",
      "secondaryTelecomProvider": "",
      "pageName": "",
      "otp": "",
      "vehicleFrontSideImage": "",
      "vehicleSideImage": "",
      "vehicleNumberImage": "",
      "insuranceExpiryDate": this.datepipe.transform(this.registerVehicleForm.value.insuranceExDate, 'yyyy-MM-dd'),
      "insuranceExpiryDoc": this.insuranceDoc,
      "registrationCertificate": this.registerVehicleForm.value.registerNo || '',
      "regCertificateDoc": this.registerDoc,
      "pollutionExpiryDate": this.datepipe.transform(this.registerVehicleForm.value.pollutionExDate, 'yyyy-MM-dd'),
      "pollutionExpiryDoc": this.pollutionDoc,
      "fitnessExpiryDate": this.datepipe.transform(this.registerVehicleForm.value.fitnessExDate, 'yyyy-MM-dd'),
      "fitnessDoc": this.fitnessDoc,
      "nationalPermit": this.registerVehicleForm.value.permitNo || '',
      "nationalPermitDoc": this.nationalDoc,
      "profilePhoto": this.profilePhotoImg
    }
    if (this.registerVehicleForm.invalid) {
      return
    }
    else if (!this.insuranceDoc || !this.registerDoc || !this.pollutionDoc || !this.fitnessDoc || !this.nationalDoc) {
      !this.insuranceDoc ? (this.commonMethods.snackBar("Please Upload Insurance Document", 1), this.registerVehicleForm.invalid) :
        !this.registerDoc ? this.commonMethods.snackBar("Please Upload Register Certificate", 1) :
          !this.pollutionDoc ? this.commonMethods.snackBar("Please Upload Pollution Document", 1) :
            !this.fitnessDoc ? this.commonMethods.snackBar("Please Upload Fitness Document", 1) :
              !this.nationalDoc ? this.commonMethods.snackBar("Please Upload National Document", 1) : '';
      // !this.profilePhotoImg? this.commonMethods.snackBar("Please Upload Vahicle Photo", 1) : '';
      return
    }
    else {
      // this.spinner.show();
      this.apiCall.setHttp('post', 'vehicle/save-update-vehicle-details', true, param, false, 'fleetExpressBaseUrl');
      // this.subscription = 
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          formDirective.resetForm();
          this.dialogRef.close('');
          this.commonMethods.snackBar(response.statusMessage, 0)
        } else {
          this.spinner.hide();
          this.dialogRef.close('');
          this.commonMethods.snackBar(response.statusMessage, 1)
        }
      }, (error: any) => {
        this.spinner.hide();
        this.dialogRef.close('');
        this.error.handelError(error.status);
      })
    }
  }
  onNoClick(flag: any): void {
    this.buttonFlag = true;
    if (this.data.inputType && flag == 'Yes') {
      if (this.commonMethods.checkDataType(this.remark.value) == false) {
        this.commonMethods.snackBar('Please Enter Remark', 1);
        return;
      }
      let obj = { remark: this.remark.value, flag: 'Yes' }
      this.dialogRef.close(obj);
    } else {
      this.dialogRef.close(flag);
    }
  }
}
