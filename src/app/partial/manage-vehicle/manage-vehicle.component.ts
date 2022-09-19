import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { SharedService } from 'src/app/services/shared.service';

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
  totalItem: any;
  paginationNo: number = 1;
  pageSize: number = 10;
  assignVehicle: any;
  asgnVehicle: any;
  editVehicle: any;
  insurance:boolean=false;
  register:boolean=false;
  pollution:boolean=false;
  fitness:boolean=false;
  national:boolean=false;
  insuranceImg:any;
  registerImg:any;
  pollutionImg:any;
  fitnessImg:any;
  nationalImg:any;
  profilePhotoImg:any
  driverName:string |any;
  vhlId:number |any;
  profilePhoto: any = "assets/images/Driver-profile.svg";
  insuranceUpload: any = "assets/images/Driver-profile.svg";
  date: any = new Date();
  constructor(private comman: CommanService,
    private tostrservice: ToastrService,
    private fb: FormBuilder,
    private datepipe: DatePipe,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    this.getformControls();
    this.getVehicleData();
  }

  getformControls() {
    this.serchVehicle = this.fb.group({
      searchVhl: ['']
    })
    this.assignDriverForm = this.fb.group({
      driverName: ['']
    })
    this.editVehicleForm = this.fb.group({
      vhlNumber: [''],
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
  getVehicleData() {
    let searchText = this.serchVehicle.value.searchVhl || '';
    this.comman.setHttp('get', 'get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.vehicleData = response.responseData.responseData1;
        this.vehicleData.forEach((ele: any) => {
          ele['isBlockFlag'] = false;
          if (ele.isBlock == 1) {
            ele.isBlockFlag = true;
          }
        });
        this.totalItem = response.responseData.responseData2.totalRecords;
        this.tostrservice.success(response.statusMessage);
        // this.getDriverName();
      }
    })
  }
  blockUnblockVhl(vhlData: any, event: any) {
    let isBlock = 0;
    if (event.target.checked == true) {
      isBlock = 1;
    }
    let param = {
      "vehicleId": vhlData.vehicleId,
      "blockedDate": this.date.toISOString(),
      "blockedBy": this.comman.getUserId(),
      "isBlock": isBlock,
      "remark": ""
    }
    this.comman.setHttp('put', 'BlockUnblockVehicle', true, param, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.tostrservice.success(response.statusMessage);
        this.getVehicleData();
      }
    })
  }
  assignDriver(vhlData: any) {
    this.assignVehicle = vhlData;
    this.asgnVehicle = vhlData.vehicleNo
    this.comman.setHttp('get', 'get-driver?searchText='+'&pageno=1', true, false, false, 'driverBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        console.log(response)
        this.driverData = response.responseData.responseData1;
        this.tostrservice.success(response.statusMessage);
      }
    })
  }
  assignDriverToVehicle() {
    let param = {
      "id": 0,
      "driverId": this.assignDriverForm.value.driverName,
      "vehicleId": this.assignVehicle.vehicleId,
      "assignedby": this.comman.getUserId(),
      "assignedDate": this.date.toISOString(),
      "isDeleted": 0,
      "vehicleNumber": this.assignVehicle.vehicleNo,
      "userId": this.comman.getUserId()
    }
    this.comman.setHttp('put', 'assign-driver-to-vehicle', true, param, false, 'vehicleBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.tostrservice.success(response.statusMessage);
      }
    })
  }
  editVehicleDetail(vhl: any) {
    this.comman.setHttp('get', 'get-vehicles?vehicleId=' + vhl.vehicleId, true, false, false, 'userDetailsBaseUrlApi');
    this.comman.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        console.log(response.responseData)
        this.editVehicle = response.responseData[0];
        this.tostrservice.success(response.statusMessage);
        this.patchEditVhlData(this.editVehicle, vhl)
      }
    })
  }
  patchEditVhlData(data: any, vehicleName: any) {
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
      // permitDoc: data?.nationalPermitDoc,
    })
  }
  profilePhotoUpd(event: any) {
    let documentUrl: any = this.sharedService.uploadProfilePhoto(event, 'vehicleProfile', "png,jpg,jpeg");
    documentUrl.subscribe({
      next: (ele: any) => {
        this.profilePhotoImg = ele.responseData;
        this.profilePhoto=this.profilePhotoImg;
      }
    })
  }
  imageUpload(event: any,flag:any) {
    let documentUrl: any = this.sharedService.uploadDocuments(event, "pdf");
    documentUrl.subscribe({
      next: (ele: any) => {
        if(flag=='insurance'){
          this.insuranceImg=ele.responseData;
          this.insurance=true;
        }else if(flag=='register'){
          this.registerImg=ele.responseData;
          this.register=true;
        }else if(flag=='pollution'){
          this.pollutionImg=ele.responseData;
          this.pollution=true;
        }else if(flag=='fitness'){
          this.fitnessImg=ele.responseData;
          this.fitness=true;
        }else{
          this.nationalImg=ele.responseData;
          this.national=true;
        }
      }
    }) 
  } 
  saveVehicleDetails() {
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
      this.comman.setHttp('post', 'save-update-vehicle-details', true,param, false, 'vehicleBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.tostrservice.success(response.statusMessage);
        }
      })
    }
  }
  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getVehicleData();
  }
  clearSearchData() {
    this.serchVehicle.reset();
    this.getVehicleData();
  }
}
