import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';
import { ValidationService } from 'src/app/services/validation.service';

@Component({
  selector: 'app-manage-vehicle',
  templateUrl: './manage-vehicle.component.html',
  styleUrls: ['./manage-vehicle.component.scss']
})
export class ManageVehicleComponent implements OnInit {
  serchVehicle!: FormGroup;
  assignDriverForm!: FormGroup;
  editVehicleForm!: FormGroup;
  vehicleData: any;
  driverData: any;
  totalItem!: number;
  paginationNo: number = 1;
  pageSize: number = 10;
  assignVehicle: any;
  asgnVehicle: any;
  editVehicle: any;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  insuranceImg: any;
  registerImg: any;
  pollutionImg: any;
  fitnessImg: any;
  nationalImg: any;
  profilePhotoImg: any
  driverName: string | any;
  vhlId: number | any;
  highLightRow!: string;
  assignUnassignVhl: boolean = false;
  profilePhoto: any = "assets/images/Driver-profile.svg";
  insuranceUpload: any = "assets/images/Driver-profile.svg";
  countVehicle: any;
  totalVehicle: any;
  date: any = new Date();
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('uploadDoc') uploadDoc: any;
  @ViewChild('uploadDoc1') uploadDoc1: any;
  @ViewChild('uploadDoc2') uploadDoc2: any;
  @ViewChild('uploadDoc3') uploadDoc3: any;
  @ViewChild('uploadDoc4') uploadDoc4: any;
  constructor(private comman: CommanService,
    private tostrservice: ToastrService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public sharedService: SharedService,
    private spinner: NgxSpinnerService,
    public vs: ValidationService,
    private error: ErrorsService) {
  }

  ngOnInit(): void {
    this.getformControls();
    this.getVehicleData();
    this.sharedService.vehicleCount().subscribe({
      next: (ele: any) => {
        this.totalVehicle = ele.responseData.responseData2.totalRecords;
      }
    })
  }

  getformControls() {
    this.serchVehicle = this.fb.group({
      searchVhl: ['']
    })
    this.assignDriverForm = this.fb.group({
      driverName: ['', Validators.required]
    })
    this.editVehicleForm = this.fb.group({
      vhlNumber: ['', [Validators.compose([Validators.required, Validators.maxLength(15),Validators.pattern('^[A-Z]{2}[0-9]{2}[A-Z]{2,3}[0-9]{4}')])]],
      profile: ['', Validators.required],
      date: ['', Validators.required],
      plateNo: ['', [Validators.compose([Validators.required, Validators.maxLength(17),Validators.pattern('[a-zA-Z0-9_]{17}')])]],
      chassicNo: ['', [Validators.compose([Validators.required, Validators.maxLength(18),Validators.pattern('[0-9]{18}')])]],
      brand: ['', [Validators.compose([Validators.required, Validators.maxLength(15),Validators.pattern('[a-zA-Z][a-zA-Z ]{15}')])]],
      model: ['', [Validators.compose([Validators.required, Validators.maxLength(10),Validators.pattern('[a-zA-Z0-9_]{10}')])]],
      insuranceExDate: ['', Validators.required],
      insuranceDoc: [''],
      registerNo: ['',[Validators.compose([Validators.required, Validators.maxLength(10),Validators.pattern('[a-zA-Z0-9_]{10}')])]],
      registerDoc: [''],
      pollutionExDate: ['', Validators.required],
      pollutionDoc: [''],
      fitnessExDate: [''],
      fitnessDoc: [''],
      permitNo: ['',[Validators.compose([Validators.required, Validators.maxLength(12),Validators.pattern('[a-zA-Z0-9_]{12}')])]],
      permitDoc: [''],
    })
  }
  // --------------------------------------------Vehicle data------------------------------------------------------------
  getVehicleData(flag?: any) {
    console.log(this.serchVehicle.value.searchVhl)
    this.spinner.show();
    let searchText = this.serchVehicle.value.searchVhl || '';
    this.comman.setHttp('get', 'get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.vehicleData = response.responseData.responseData1;
        this.vehicleData.forEach((ele: any) => {
          ele.isBlock == 1 ? ele['isBlockFlag'] = true : ele['isBlockFlag'] = false;
        });
        flag == 'search' ? (this.searchHideShow = false, this.clearHideShow = true) : '';
        this.totalItem = response.responseData.responseData2.totalRecords;
        // this.tostrservice.success(response.statusMessage);
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
      "blockedBy": this.comman.getUserId(),
      "isBlock": isBlock,
      "remark": ""
    }
    this.spinner.show();
    this.comman.setHttp('put', 'BlockUnblockVehicle', true, param, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.tostrservice.success(response.statusMessage);
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
  getAssignDriver(vhlData: any) {
   this.assignVehicle = vhlData;
    this.asgnVehicle = vhlData.vehicleNo
    this.spinner.show();
    this.comman.setHttp('get', 'get-driver?searchText=' + '&pageno=1', true, false, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        console.log(response)
        this.spinner.hide();
        this.driverData = response.responseData.responseData1;
        this.tostrservice.success(response.statusMessage);
      } else {
        this.spinner.hide();
        this.error.handelError(response.statusCode);
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      }) 
  }
  assignDriverToVehicle(flag:any,vehicleData?: any) {
   let param = {
      "id": 0,
      "driverId":flag=='unassign'?vehicleData.driverId:this.assignDriverForm.value.driverName,
      "vehicleId": this.assignVehicle?.vehicleId ? this.assignVehicle?.vehicleId : 0,
      "assignedby": this.comman.getUserId(),
      "assignedDate": this.date.toISOString(),
      "isDeleted": 0,
      "vehicleNumber": this.assignVehicle?.vehicleNo ? this.assignVehicle?.vehicleNo : vehicleData.vehicleNo,
      "userId": this.comman.getUserId()
    }
    this.spinner.show();
    this.comman.setHttp('put', 'assign-driver-to-vehicle', true, param, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.getVehicleData();
        this.closeModel.nativeElement.click();
        this.tostrservice.success(response.statusMessage);
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
    this.comman.setHttp('get', 'get-vehicles?vehicleId=' + vhl.vehicleId, true, false, false, 'userDetailsBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.editVehicle = response.responseData[0];
        this.tostrservice.success(response.statusMessage);
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
    console.log(data);
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
      permitDoc:data?.nationalPermitDoc
    })
  }
  // ---------------------------------------------------------------------Upload Photo And Document---------------------------
  profilePhotoUpd(event: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          this.spinner.hide();
          this.profilePhotoImg = ele.responseData;
          this.profilePhoto = this.profilePhotoImg;
        }
        else {
          this.spinner.hide();
          this.error.handelError(ele.statusCode);
        }
      }
    },(error: any) => {
      this.error.handelError(error.status);
    })
    this.spinner.hide();
  }

  imageUpload(event: any, flag: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if (ele.statusCode == "200") {
          this.spinner.hide();
          flag == 'insurance' ? this.insuranceImg = ele.responseData : flag == 'register' ? this.registerImg = ele.responseData : flag == 'pollution' ? this.pollutionImg = ele.responseData : flag == 'fitness' ? this.fitnessImg = ele.responseData : this.nationalImg = ele.responseData;
          this.tostrservice.success(ele.statusMessage);
        }
        else {
          this.spinner.hide();
          this.tostrservice.success(ele.statusMessage);
        }
      }
    },(error: any) => {
      this.error.handelError(error.status);
    })
    this.spinner.hide();
  }
  clearDocument(flag: any) {
    flag == 'uploadDoc' ? (this.uploadDoc.nativeElement.value = '', this.insuranceImg ='') :
      flag == 'uploadDoc1' ? (this.uploadDoc1.nativeElement.value = '',this.registerImg='') :
        flag == 'uploadDoc2' ? (this.uploadDoc2.nativeElement.value = '',this.pollutionImg='') :
          flag == 'uploadDoc3' ? (this.uploadDoc3.nativeElement.value = '', this.fitnessImg='') :
            (this.uploadDoc4.nativeElement.value = '', this.nationalImg='');
  }
  viewDocument(flag:any){
    flag=='insurance'?window.open(this.insuranceImg):flag=='register'?window.open(this.registerImg):flag=='pollution'?window.open(this.pollutionImg):flag=='fitness'?window.open(this.fitnessImg):window.open(this.nationalImg);
  }
  // --------------------------------------------save--------------------------------------------------------------
  saveVehicleDetails(formDirective: any) {
    this.highLightRow = '';
    let vhlaData = (this.editVehicleForm.value.vhlNumber).split('');
    let first=vhlaData.splice(0, 2).join('');
    let second=vhlaData.splice(0, 2).join('');
    let third=vhlaData.splice(0, 2).join('');
    let forth=vhlaData.join('');
    let param = {
      "oldVehNo1": "",
      "oldVehNo2": "",
      "newVehNo1":first ,
      "newVehNo2":second ,
      "newVehNo3":third,
      "newVehNo4":forth,
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
      "vehicleOwnerId": this.comman.getVehicleOwnerId(),
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
      /* !this.editVehicleForm.value.insuranceDoc ? this.tostrservice.error("Please Upload insurance document") : '';
      !this.editVehicleForm.value.registerDoc ? this.tostrservice.error("Please Upload Register document") : '';
      !this.editVehicleForm.value.pollutionDoc ? this.tostrservice.error("Please Upload Pollution document") : '';
      !this.editVehicleForm.value.fitnessDoc ? this.tostrservice.error("Please Upload Fitness document") : '';
      !this.editVehicleForm.value.permitDoc ? this.tostrservice.error("Please Upload permit document") : ''; */
    }
    else {
      this.spinner.show();
      this.comman.setHttp('post', 'save-update-vehicle-details', true, param, false, 'vehicleBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          formDirective.resetForm();
          this.tostrservice.success(response.statusMessage);
        }
        else {
          this.spinner.hide();
          this.tostrservice.success(response.statusMessage);
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
}
