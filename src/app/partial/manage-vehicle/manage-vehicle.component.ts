import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
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
  searchHideShow:boolean=true;
  clearHideShow:boolean=false;
  insuranceImg:any;
  registerImg:any;
  pollutionImg:any;
  fitnessImg:any;
  nationalImg:any;
  profilePhotoImg:any
  driverName:string |any;
  vhlId:number |any;
  highLightRow!:string;
  assignUnassignVhl:boolean=false;
  profilePhoto: any = "assets/images/Driver-profile.svg";
  insuranceUpload: any = "assets/images/Driver-profile.svg";
  countVehicle:any;
  totalVehicle:any;
  date: any = new Date();
  @ViewChild('closeModel') closeModel:any;
  @ViewChild('uploadDoc') uploadDoc:any;
  @ViewChild('uploadDoc1') uploadDoc1:any;
  @ViewChild('uploadDoc2') uploadDoc2:any;
  @ViewChild('uploadDoc3') uploadDoc3:any;
  @ViewChild('uploadDoc4') uploadDoc4:any;
  constructor(private comman: CommanService,
    private tostrservice: ToastrService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    public sharedService: SharedService,
    private spinner:NgxSpinnerService,
    public vs:ValidationService) {
     }

  ngOnInit(): void {
    this.getformControls();
    this.getVehicleData();
   this.sharedService.vehicleCount().subscribe({
    next: (ele: any) => {
     this.totalVehicle=ele.responseData.responseData2.totalRecords;
    }
  })
  }

  getformControls() {
    this.serchVehicle = this.fb.group({
      searchVhl: ['']
    })
    this.assignDriverForm = this.fb.group({
      driverName: ['',Validators.required]
    })
    this.editVehicleForm = this.fb.group({
      vhlNumber: ['',Validators.required],
      profile: [''],
      date: [''],
      plateNo: [''],
      chassicNo: [''],
      brand: [''],
      model: [''],
      insuranceExDate: [''],
      insuranceDoc: [''],
      registerNo: [''],
      registerDoc: [''],
      pollutionExDate: [''],
      pollutionDoc: [''],
      fitnessExDate: [''],
      fitnessDoc: [''],
      permitNo: [''],
      permitDoc: [''],
    }) 
  }
  // --------------------------------------------Vehicle data------------------------------------------------------------
  getVehicleData(flag?:any) {
    this.spinner.show();
    let searchText = this.serchVehicle.value.searchVhl || '';
    this.comman.setHttp('get', 'get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.vehicleData = response.responseData.responseData1;
        this.vehicleData.forEach((ele: any) => {
          ele.isBlock == 1?ele['isBlockFlag']= true:ele['isBlockFlag'] = false;
        });
        flag == 'search'?( this.searchHideShow = false, this.clearHideShow = true):'';
        this.totalItem = response.responseData.responseData2.totalRecords;
        this.tostrservice.success(response.statusMessage);
      }
    })
  }
  // --------------------------------------------------------Block/Unblock Vehicle-------------------------------------------
  blockUnblockVhl(vhlData: any, event: any) {
    let isBlock:any;
    event.target.checked == true? isBlock = 1:isBlock = 0;
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
    })
  }
  // --------------------------------------Assign Driver------------------------------------------------------------------
  getAssignDriver(vhlData: any) {
    this.assignVehicle = vhlData;
    this.asgnVehicle = vhlData.vehicleNo
    this.spinner.show();
    this.comman.setHttp('get', 'get-driver?searchText='+'&pageno=1', true, false, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.driverData = response.responseData.responseData1;
        this.tostrservice.success(response.statusMessage);
      }
    })
  }
  assignDriverToVehicle(vehicleData?:any) {
    let param = {
      "id": 0,
      "driverId":this.assignDriverForm.value.driverName?this.assignDriverForm.value.driverName:vehicleData.driverId,
      "vehicleId": this.assignVehicle?.vehicleId?this.assignVehicle?.vehicleId:0,
      "assignedby": this.comman.getUserId(),
      "assignedDate": this.date.toISOString(),
      "isDeleted": 0,
      "vehicleNumber": this.assignVehicle?.vehicleNo?this.assignVehicle?.vehicleNo:vehicleData.vehicleNo,
      "userId": this.comman.getUserId()
    }
    this.spinner.show();
    this.comman.setHttp('put', 'assign-driver-to-vehicle', true, param, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.getVehicleData();
        this.tostrservice.success(response.statusMessage);
        this.assignDriverForm.controls['driverName'].setValue('');
        this.closeModel.nativeElement.click();
      }
    })
  }
  closeModels(){
    this.assignDriverForm.controls['driverName'].setValue('');
  }
  // -----------------------------------Update-----------------------------------------------------------------
  editVehicleDetail(vhl: any) {
    this.spinner.show();
    this.comman.setHttp('get', 'get-vehicles?vehicleId=' + vhl.vehicleId, true, false, false, 'userDetailsBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.editVehicle = response.responseData[0];
        this.tostrservice.success(response.statusMessage);
        this.patchEditVhlData(this.editVehicle, vhl)
      }
    })
  }
  patchEditVhlData(data: any, vehicleName: any) {
    this.highLightRow=data.vehicleId;
    this.vhlId=data.vehicleId;
    this.driverName=vehicleName.driverName;
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
    })
  } 
  // ---------------------------------------------------------------------Upload Photo And Document---------------------------
  profilePhotoUpd(event: any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.spinner.hide();
        this.profilePhotoImg = ele.responseData;
        this.profilePhoto=this.profilePhotoImg;
      }
    })
  }
  imageUpload(event: any,flag:any) {
    this.spinner.show();
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.spinner.hide();
        flag=='insurance'?this.insuranceImg=ele.responseData:flag=='register'?this.registerImg=ele.responseData:flag=='pollution'?this.pollutionImg=ele.responseData:flag=='fitness'?this.fitnessImg=ele.responseData:this.nationalImg=ele.responseData;
      }
    }) 
  } 
  clearDocument(flag:any){
    flag=='uploadDoc'?(this.uploadDoc.nativeElement.value = null,this.editVehicleForm.controls['insuranceDoc'].setValue('')):
    flag=='uploadDoc1'?(this.uploadDoc1.nativeElement.value = null,this.editVehicleForm.controls['registerDoc'].setValue('')):
    flag=='uploadDoc2'?(this.uploadDoc2.nativeElement.value = null,this.editVehicleForm.controls['pollutionDoc'].setValue('')):
    flag=='uploadDoc3'?(this.uploadDoc3.nativeElement.value = null,this.editVehicleForm.controls['fitnessDoc'].setValue('')):
    (this.uploadDoc4.nativeElement.value = null,this.editVehicleForm.controls['permitDoc'].setValue(''));
  }
  // --------------------------------------------save--------------------------------------------------------------
  saveVehicleDetails() {
    this.highLightRow='';
    let vhlaData=(this.editVehicleForm.value.vhlNumber).split('');
    let param = {
  "oldVehNo1": "",
  "oldVehNo2": "",
  "newVehNo1": vhlaData.splice(0,2).join(''),
  "newVehNo2":vhlaData.splice(4,2).join(''),
  "newVehNo3":vhlaData.splice(2,2).join(''),
  "newVehNo4":vhlaData.join(''),
  "driverName":this.driverName,
  "driverNo": "",
  "vehicleTypeId": 0,
  "capacity": 0,
  "createdBy": 0,
  "vehRegId":this.vhlId,
  "permit": "",
  "licence": "",
  "deviceId": 0,
  "deviceCompanyId": 0,
  "deviceSIMNo": "",
  "vehicleOwnerId": this.comman.getVehicleOwnerId(),
  "vehicleMake":this.editVehicleForm.value.brand,
  "vehicleModel":this.editVehicleForm.value.model,
  "vehicleChassisNo":this.editVehicleForm.value.chassicNo,
  "vehicleEngineNo":this.editVehicleForm.value.plateNo,
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
  "insuranceExpiryDate": this.datepipe.transform(this.editVehicleForm.value.insuranceExDate,'yyyy-MM-dd'),
  "insuranceExpiryDoc":this.insuranceImg,
  "registrationCertificate":this.editVehicleForm.value.registerNo || '',
  "regCertificateDoc": this.registerImg,
  "pollutionExpiryDate":this.datepipe.transform(this.editVehicleForm.value.pollutionExDate,'yyyy-MM-dd'),
  "pollutionExpiryDoc":this.pollutionImg,
  "fitnessExpiryDate":this.datepipe.transform(this.editVehicleForm.value.fitnessExDate,'yyyy-MM-dd'),
  "fitnessDoc":this.fitnessImg,
  "nationalPermit":this.editVehicleForm.value.permitNo || '',
  "nationalPermitDoc":this.nationalImg,
  "profilePhoto":this.profilePhotoImg
    }
    if (this.editVehicleForm.invalid) {
      this.tostrservice.error("Please enter valid data")
      return;
    }
    else {
      this.spinner.show();
      this.comman.setHttp('post', 'save-update-vehicle-details', true,param, false, 'vehicleBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.tostrservice.success(response.statusMessage);
        }
      })
    }
  }
  closemodel(){
    this.highLightRow='';
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
}
