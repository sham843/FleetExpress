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
  dialogData!:any;
  cardTitle!:string;
  vehiclePhoto!: string;
  highLightRow!: string;
  buttonFlag: boolean = true;
  subscription!: Subscription;
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
    console.log(this.dialogData)
    this.dialogData!=0? this.cardTitle='Edit Vehicle' :this.cardTitle='Add Vehicle';
    this.getFormControl();
  }
  getFormControl() {
    this.registerVehicleForm = this.fb.group({
      vehiclePhoto: [''],
      vehicleNo: [this.dialogData?this.dialogData.vehicleNo:'', [Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('^[A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{4}')])]],
      fuelType:[this.dialogData?'-':''],
      manufacturer: [this.dialogData?this.dialogData.manufacturer:''],
      model: [this.dialogData?this.dialogData.model:'',Validators.required],
      chassicNo: [this.dialogData?this.dialogData.chassisNo:'',[Validators.compose([Validators.required,Validators.pattern('[0-9]{17}')])]],
      engineNo: [this.dialogData?this.dialogData.engineNo:'',[Validators.compose([Validators.required,Validators.pattern('[a-zA-Z0-9_]{17}')])]],
      insuranceExDate: ['',Validators.required],
      insuranceDoc: ['',Validators.required],
      registerNo: [''],
      registerDoc: [''],
      pollutionExDate: ['', Validators.required],
      pollutionDoc: ['',Validators.required],
      fitnessExDate: [''],
      fitnessDoc: [''],
      permitNo: ['',[Validators.compose([Validators.required,Validators.pattern('[a-zA-Z0-9_]{12}')])]],
      permitDoc: ['',Validators.required]
    })
    if(this.dialogData){
      this.buttonFlag=false;
    }
  }
  
  get f(){return this.registerVehicleForm.controls;}
  // ---------------------------------------------------------------------Upload Photo And Document---------------------------
  vehiclePhotoUpd(event: any) {
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg");
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
          this.commonMethods.snackBar(ele.statusMessage, 1)
        }
      }
    }, (error: any) => {
      this.error.handelError(error.status);
    })
  }
  clearDoc(flag?: any) {
    flag == 'insurance' ? (this.uploadInsurance.nativeElement.value = null, this.insuranceDoc = '') :
      flag == 'register' ? (this.uploadRegister.nativeElement.value = '', this.registerDoc = '') :
      flag == 'pollution' ? (this.uploadPollution.nativeElement.value = '', this.pollutionDoc = '') :
      flag == 'fitness' ? (this.uploadFitness.nativeElement.value = '', this.fitnessDoc = '') :
        (this.uploadPermit.nativeElement.value = '', this.nationalDoc = '');
  }

  checkDocumentUpd(flag: any) {
     if (flag == 'insurance') {
      if (this.registerVehicleForm.value.insuranceDoc == '') {
        this.commonMethods.snackBar("Please upload insurance document", 1);
      }
    }
    else if (flag == 'register') {
      if (this.registerVehicleForm.value.registerDoc == '') {
        this.commonMethods.snackBar("Please upload register certificate", 1);
      }
    }
    else if (flag == 'pollution') {
      if (this.registerVehicleForm.value.pollutionDoc == '') {
        this.commonMethods.snackBar("Please upload pollution document", 1);
      }
    } 
    else if (flag == 'fitness') {
      if (this.registerVehicleForm.value.fitnessDoc == '') {
        this.commonMethods.snackBar("Please upload fitness document", 1);
      }
    } 
    else if (flag == 'permit') {
      if (this.registerVehicleForm.value.permitDoc == '') {
        this.commonMethods.snackBar("Please upload national permit document", 1);
      }
    } 
  }
  saveVehicleDetails(formDirective: any) {
    this.highLightRow = '';
    let vhlaData = (this.registerVehicleForm.value.vhlNumber).split('');
    let first = vhlaData.splice(0, 2).join('');
    let second = vhlaData.splice(0, 2).join('');
    let third = vhlaData.splice(0, 2).join('');
    let forth = vhlaData.join('');
    let param = {
      "oldVehNo1": "",
      "oldVehNo2": "",
      "newVehNo1": first,
      "newVehNo2": second,
      "newVehNo3": third,
      "newVehNo4": forth,
      // "driverName": this.driverName,
      "driverNo": "",
      "vehicleTypeId": 0,
      "capacity": 0,
      "createdBy": 0,
      // "vehRegId": this.vhlId,
      "permit": "",
      "licence": "",
      "deviceId": 0,
      "deviceCompanyId": 0,
      "deviceSIMNo": "",
      "vehicleOwnerId": this.webStorage.getVehicleOwnerId(),
      "vehicleMake": this.registerVehicleForm.value.brand,
      "vehicleModel": this.registerVehicleForm.value.model,
      "vehicleChassisNo": this.registerVehicleForm.value.chassicNo,
      "vehicleEngineNo": this.registerVehicleForm.value.plateNo,
      "flag": "u",
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
    else {
      this.spinner.show();
      this.apiCall.setHttp('post', 'vehicle/save-update-vehicle-details', true, param, false, 'fleetExpressBaseUrl');
      // this.subscription = 
      this.apiCall.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          formDirective.resetForm();
          this.commonMethods.snackBar(response.statusMessage, 1)
        }
      }, (error: any) => {
        this.error.handelError(error.status);
        this.spinner.hide()
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
