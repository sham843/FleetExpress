import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-manage-vehicle',
  templateUrl: './manage-vehicle.component.html',
  styleUrls: ['./manage-vehicle.component.scss']
})
export class ManageVehicleComponent implements OnInit,OnDestroy {
  serchVehicle!: FormGroup;
  assignDriverForm!: FormGroup;
  editVehicleForm!: FormGroup;
  vehicleData: object | any;
  driverData: object | any;
  totalItem!: number;
  paginationNo: number = 1;
  pageSize: number = 10;
  asgVehicleData: string | any;
  asgVehicleNo: any;
  editVehicle: any;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  insuranceImg: string |any;
  registerImg: string|any;
  pollutionImg: string|any;
  fitnessImg: string|any;
  nationalImg: string|any;
  profilePhotoImg!: string;
  driverName: string | any;
  vhlId: number | any;
  highLightRow!: string | any;
  assignUnassignVhl: boolean = false;
  profilePhoto: string = "assets/images/Driver-profile.svg";
  insuranceUpload: string = "assets/images/Driver-profile.svg";
  date: any = new Date();
  subscription!: Subscription;
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('uploadInsurance') uploadInsurance: any;
  @ViewChild('uploadRegister') uploadRegister: any;
  @ViewChild('uploadPollution') uploadPollution: any;
  @ViewChild('uploadFitness') uploadFitness: any;
  @ViewChild('uploadPermit') uploadPermit: any;
  constructor(
    private commonMethods: CommonMethodsService,
    private apiCall: ApiCallService,
    private webStorage: WebStorageService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public sharedService: SharedService,
    private spinner: NgxSpinnerService,
    public vs: ValidationService,
    private error: ErrorsService
   ) {
  }

  ngOnInit(): void {
    this.getformControls();
    this.getVehicleData();
  }

  getformControls() {
    this.serchVehicle = this.fb.group({
      searchVhl: ['']
    })
    this.assignDriverForm = this.fb.group({
      driverName: ['', Validators.required]
    })
    this.editVehicleForm = this.fb.group({
      vhlNumber: ['', [Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('^[A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{4}')])]],
      profile: ['', Validators.required],
      date: ['', Validators.required],
      plateNo: ['', [Validators.compose([Validators.required, Validators.maxLength(17), Validators.pattern('[a-zA-Z0-9_]{17}')])]],
      chassicNo: ['', [Validators.compose([Validators.required, Validators.maxLength(18), Validators.pattern('[0-9]{18}')])]],
      brand: ['', [Validators.compose([Validators.required, Validators.maxLength(15), Validators.pattern('[a-zA-Z][a-zA-Z ]{15}')])]],
      model: ['', [Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('[a-zA-Z0-9_]{10}')])]],
      insuranceExDate: ['', Validators.required],
      insuranceDoc: [''],
      registerNo: ['', [Validators.compose([Validators.required, Validators.maxLength(10), Validators.pattern('[a-zA-Z0-9_]{10}')])]],
      registerDoc: [''],
      pollutionExDate: ['', Validators.required],
      pollutionDoc: [''],
      fitnessExDate: [''],
      fitnessDoc: [''],
      permitNo: ['', [Validators.compose([Validators.required, Validators.maxLength(12), Validators.pattern('[a-zA-Z0-9_]{12}')])]],
      permitDoc: [''],
    })
  }
  // --------------------------------------------Vehicle data------------------------------------------------------------
  getVehicleData(flag?: any) {
    this.spinner.show();
    let searchText = this.serchVehicle.value.searchVhl || '';
    this.apiCall.setHttp('get', 'vehicle/get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'vehicletrackingBaseUrlApi');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.vehicleData = response.responseData.responseData1;
        this.vehicleData.forEach((ele: any) => {
          ele.isBlock == 1 ? ele['isBlockFlag'] = true : ele['isBlockFlag'] = false;
        });
        flag == 'search' ? (this.searchHideShow = false, this.clearHideShow = true) : '';
        this.totalItem = response.responseData.responseData2.totalRecords;
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
    this.spinner.hide();
  }
  // --------------------------------------------------------Block/Unblock Vehicle-------------------------------------------
  blockUnblockVhl(vhlData: any, event: any) {
    let isBlock: any;
    event.target.checked == true ? isBlock = 1 : isBlock = 0;
    let param = {
      "vehicleId": vhlData.vehicleId,
      "blockedDate": this.date.toISOString(),
      "blockedBy": this.webStorage.getUserId(),
      "isBlock": isBlock,
      "remark": ""
    }
    this.spinner.show();
    this.apiCall.setHttp('put', 'vehicle/BlockUnblockVehicle', true, param, false, 'vehicletrackingBaseUrlApi');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.commonMethods.snackBar(response.statusMessage, 1)
        this.getVehicleData();
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
  // --------------------------------------Assign Driver------------------------------------------------------------------
  getAssignDriver(vhlData?: any) { 
    this.asgVehicleData = vhlData;
    this.asgVehicleNo = vhlData.vehicleNo;
    this.spinner.show();
    this.apiCall.setHttp('get', 'driver/get-driver-details', true, false, false, 'vehicletrackingBaseUrlApi');
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.driverData = response.responseData;
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }
  assignDriverToVehicle(flag: any, vehicleData?: any) {
    let param = {
      "id": 0,
      "driverId": flag == 'unassign' ? vehicleData.driverId : this.assignDriverForm.value.driverName,
      "vehicleId": flag == 'unassign' ? 0: this.asgVehicleData?.vehicleId,
      "assignedby": this.webStorage.getUserId(),
      "assignedDate": this.date.toISOString(),
      "isDeleted": 0,
      "vehicleNumber": this.asgVehicleData?.vehicleNo ? this.asgVehicleData?.vehicleNo : vehicleData.vehicleNo,
      "userId": this.webStorage.getUserId()
    }
    this.spinner.show();
    this.apiCall.setHttp('put', 'vehicle/assign-driver-to-vehicle', true, param, false, 'vehicletrackingBaseUrlApi');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.getVehicleData();
        this.closeModel.nativeElement.click();
        this.commonMethods.snackBar(response.statusMessage, 1)
        this.assignDriverForm.controls['driverName'].setValue('');
      } else {
        this.spinner.hide();
        this.error.handelError(response.statusCode);
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
        this.spinner.hide();
      })
  }
  // -------------------------------------------close Model-------------------------------------------------------------------
  closeModels(formDirective: any) {
    formDirective.resetForm();
    this.assignDriverForm.controls['driverName'].setValue('');
  }
  // -----------------------------------Update---------------------------------------------------------------------------------
  editVehicleDetail(vhl: any) {
    this.spinner.show();
    this.apiCall.setHttp('get', 'userdetail/get-vehicles?vehicleId=' + vhl.vehicleId, true, false, false, 'vehicletrackingBaseUrlApi');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.editVehicle = response.responseData[0];
        this.patchEditVhlData(this.editVehicle, vhl)
      } else {
        this.spinner.hide();
        this.error.handelError(response.statusCode);
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }

  patchEditVhlData(data: any, vehicleName: any) {
    console.log(data)
    this.highLightRow = data.vehicleId;
    this.vhlId = data.vehicleId;
    this.driverName = vehicleName.driverName;
    this.editVehicleForm.patchValue({
      vhlNumber: vehicleName.vehicleNo,
      profile: '',
      date: data?.createdDate,
      plateNo: data?.vehicleEngineNo,
      chassicNo: data?.vehicleChassisNo,
      brand: data?.vehicleMake,
      model: data?.vehicleModel,
      insuranceExDate: this.datepipe.transform(data?.insuranceExpiryDate, 'dd-MM-yyyy'),
      insuranceDoc: data?.insuranceExpiryDoc,
      registerNo: data?.registrationCertificate,
      registerDoc: data?.regCertificateDoc,
      pollutionExDate: this.datepipe.transform(data?.pollutionExpiryDate, 'dd-MM-yyyy'),
      pollutionDoc: data?.pollutionExpiryDoc,
      fitnessExDate: this.datepipe.transform(data?.fitnessExpiryDate, 'dd-MM-yyyy'),
      fitnessDoc: data?.fitnessDoc,
      permitNo: data?.nationalPermit,
      permitDoc: data?.nationalPermitDoc
    })
  }
  // ---------------------------------------------------------------------Upload Photo And Document---------------------------
  profilePhotoUpd(event: any) {
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          this.profilePhotoImg = ele.responseData;
          this.profilePhoto = this.profilePhotoImg;
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
          flag == 'insurance' ? this.insuranceImg = ele.responseData : flag == 'register' ? this.registerImg = ele.responseData : flag == 'pollution' ? this.pollutionImg = ele.responseData : flag == 'fitness' ? this.fitnessImg = ele.responseData : this.nationalImg = ele.responseData;
          this.commonMethods.snackBar(ele.statusMessage, 1)
        }
      }
    }, (error: any) => {
      this.error.handelError(error.status);
    })
  }

  clearDocument(flag: any) {
    flag == 'uploadInsurance' ? (this.uploadInsurance.nativeElement.value = '', this.insuranceImg = '') :
      flag == 'uploadRegister' ? (this.uploadRegister.nativeElement.value = '', this.registerImg = '') :
        flag == 'uploadPollution' ? (this.uploadPollution.nativeElement.value = '', this.pollutionImg = '') :
          flag == 'uploadFitness' ? (this.uploadFitness.nativeElement.value = '', this.fitnessImg = '') :
            (this.uploadPermit.nativeElement.value = '', this.nationalImg = '');
  }
  viewDocument(flag: any) {
    flag == 'insurance' ? this.commonMethods.redirectToNewTab(this.insuranceImg) : flag == 'register' ? this.commonMethods.redirectToNewTab(this.registerImg) : flag == 'pollution' ? this.commonMethods.redirectToNewTab(this.pollutionImg) : flag == 'fitness' ? this.commonMethods.redirectToNewTab(this.fitnessImg) : this.commonMethods.redirectToNewTab(this.nationalImg);
  }
  // --------------------------------------------save--------------------------------------------------------------
  saveVehicleDetails(formDirective: any) {
    this.highLightRow = '';
    let vhlaData = (this.editVehicleForm.value.vhlNumber).split('');
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
      "driverName": this.driverName,
      "driverNo": "",
      "vehicleTypeId": 0,
      "capacity": 0,
      "createdBy": 0,
      "vehRegId": this.vhlId,
      "permit": "",
      "licence": "",
      "deviceId": 0,
      "deviceCompanyId": 0,
      "deviceSIMNo": "",
      "vehicleOwnerId": this.webStorage.getVehicleOwnerId(),
      "vehicleMake": this.editVehicleForm.value.brand,
      "vehicleModel": this.editVehicleForm.value.model,
      "vehicleChassisNo": this.editVehicleForm.value.chassicNo,
      "vehicleEngineNo": this.editVehicleForm.value.plateNo,
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
      "insuranceExpiryDate": this.datepipe.transform(this.editVehicleForm.value.insuranceExDate, 'yyyy-MM-dd'),
      "insuranceExpiryDoc": this.insuranceImg,
      "registrationCertificate": this.editVehicleForm.value.registerNo || '',
      "regCertificateDoc": this.registerImg,
      "pollutionExpiryDate": this.datepipe.transform(this.editVehicleForm.value.pollutionExDate, 'yyyy-MM-dd'),
      "pollutionExpiryDoc": this.pollutionImg,
      "fitnessExpiryDate": this.datepipe.transform(this.editVehicleForm.value.fitnessExDate, 'yyyy-MM-dd'),
      "fitnessDoc": this.fitnessImg,
      "nationalPermit": this.editVehicleForm.value.permitNo || '',
      "nationalPermitDoc": this.nationalImg,
      "profilePhoto": this.profilePhotoImg
    }
    if (this.editVehicleForm.invalid) {
      /* !this.editVehicleForm.value.insuranceDoc ? this.commonMethods.error("Please Upload insurance document") : '';
      !this.editVehicleForm.value.registerDoc ? this.commonMethods.error("Please Upload Register document") : '';
      !this.editVehicleForm.value.pollutionDoc ? this.commonMethods.error("Please Upload Pollution document") : '';
      !this.editVehicleForm.value.fitnessDoc ? this.commonMethods.error("Please Upload Fitness document") : '';
      !this.editVehicleForm.value.permitDoc ? this.commonMethods.error("Please Upload permit document") : ''; */
    }
    else {
      this.spinner.show();
      this.apiCall.setHttp('post', 'vehicle/save-update-vehicle-details', true, param, false, 'vehicletrackingBaseUrlApi');
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
  closemodel(formDirective: any) {
    this.highLightRow = '';
    formDirective.resetForm()
  }
  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getVehicleData();
  }
  clearSearchData() {
    this.serchVehicle.reset();
    this.searchHideShow = true;
    this.clearHideShow = false;
    this.getVehicleData();
  }
  get f() {
    return this.editVehicleForm.controls;
  }
  ngOnDestroy() {
    if (this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
