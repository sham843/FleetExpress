import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-register-vehicle',
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.scss']
})
export class RegisterVehicleComponent implements OnInit {
  searchVehicleForm!: FormGroup;
  vehicleData=new Array();
  paginationNo:number=1;
  pageSize:number=10;
  totalItem!:number;
  subscription!:Subscription;
  searchHideShow:boolean=true;
  clearSerachBtn:boolean=false;
  date=new Date();
  driverData=new Array();
  constructor(public validation: ValidationService,
    private fb: FormBuilder,
    private apiCall:ApiCallService,
    private spinner:NgxSpinnerService,
    private error:ErrorsService,
    private webStorage:WebStorageService
    ) { }

  ngOnInit(): void {
    this.getFormControl();
    this.getVehiclesData();
  }
  // ----------------------------------------------------------------form-controls----------------------------------------------------------
  getFormControl() {
    this.searchVehicleForm = this.fb.group({
      vehicleNo: ['']
    })
  }
  // --------------------------------------------get vehicle data--------------------------------------------------------------------
  getVehiclesData(flag?: any){
    this.spinner.show();
    let searchText = this.searchVehicleForm.value.vehicleNo || '';
    this.apiCall.setHttp('get', 'vehicle/get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.vehicleData = response.responseData.responseData1;
       this.vehicleData.forEach((ele: any) => {
          ele.isBlock == 1 ? ele['isBlockFlag'] = true : ele['isBlockFlag'] = false;
        });
        flag == 'search' ? (this.searchHideShow = false, this.clearSerachBtn = true) : '';
        this.totalItem = response.responseData.responseData2.totalRecords;
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
  this.apiCall.setHttp('put', 'vehicle/BlockUnblockVehicle', true, param, false, 'fleetExpressBaseUrl');
  // this.subscription = 
  this.apiCall.getHttp().subscribe((response: any) => {
    if (response.statusCode == "200") {
      this.spinner.hide();
      this.getVehiclesData();
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
// --------------------------------------get Driver Data------------------------------------------------------------------
getDriverData(vhlData?: any) { 
  vhlData
  // this.asgVehicleData = vhlData;
  // this.asgVehicleNo = vhlData.vehicleNo;
  this.spinner.show();
  this.apiCall.setHttp('get', 'driver/get-driver-details', true, false, false, 'fleetExpressBaseUrl');
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
  clearSearchData(){
      this.searchVehicleForm.controls['vehicleNo'].setValue('');
      this.getVehiclesData();
      this.searchHideShow = true;
      this.clearSerachBtn = false;
    }
  onPagintion(pageNo: any){
      this.paginationNo = pageNo;
      this.getVehiclesData();
  }
}
