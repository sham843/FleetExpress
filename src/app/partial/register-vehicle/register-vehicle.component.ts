import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
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
    private webStorage:WebStorageService,
   private dialog:MatDialog,
   private config:ConfigService
    ) { }

  ngOnInit(): void {
    this.getFormControl();
    this.getVehiclesData();
  }
  ngAfterViewInit() {
    let formValue = this.searchVehicleForm.valueChanges;
    formValue.pipe(
      filter(() => this.searchVehicleForm.valid),
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(() => {
        this.paginationNo = 1;
        this.getVehiclesData();
      })
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
        console.log(this.vehicleData)
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
  // ---------------------------------------------------------Comfirmation dialog------------------------------------------------------
  confirmationDialog(flag: boolean, label: string, event?: any, vhlData?: any) {
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
      if (res == 'Yes' && label == 'status') {
        this.blockUnblockVhl(vhlData,event);
      } 
    }
    )
  }
 // --------------------------------------------------------Block/Unblock Vehicle-------------------------------------------
 blockUnblockVhl(vhlData: any, event: any) {
  let isBlock: any;
  event.checked == true ? isBlock = 1 : isBlock = 0;
  let param = {
    "vehicleId": vhlData.vehicleId,
    "blockedDate": this.date.toISOString(),
    "blockedBy": this.webStorage.getUserId(),
    "isBlock": isBlock,
    "remark": ""
  }
  console.log(param)
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
