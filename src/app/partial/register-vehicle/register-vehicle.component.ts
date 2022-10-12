import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ModalsComponent } from 'src/app/dialogs/driver_modals/modals.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { VehicleModalComponent } from './vehicle-modal/vehicle-modal.component';

@Component({
  selector: 'app-register-vehicle',
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.scss']
})
export class RegisterVehicleComponent implements OnInit {
  searchVehicleForm!: FormGroup;
  vehicleData = new Array();
  paginationNo: number = 1;
  pageSize: number = 10;
  totalItem!: number;
  subscription!: Subscription;
  searchHideShow: boolean = true;
  clearSerachBtn: boolean = false;
  date = new Date();
  driverData = new Array();
  selectAll!: boolean;
  highLightRow!:string;
  checkedVehicle = new Array();
  constructor(public validation: ValidationService,
    private fb: FormBuilder,
    private apiCall: ApiCallService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    private webStorage: WebStorageService,
    private dialog: MatDialog,
    private config: ConfigService
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
  getVehiclesData(flag?: any) {
    this.checkedVehicle = [];
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
        this.vehicleData = [];
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
    this.spinner.hide();
  }

   // ---------------------------------------------------------Comfirmation dialog------------------------------------------------------
   confirmationDialog(flag: boolean, label: string, event?: any, editData?: any) {
   
    this.selectAll ? this.uncheckVehicle() : '';
    let obj: any = ConfigService.dialogObj;
    if (label == 'status') {    //block vehicle
      obj['p1'] = flag ? 'Are you sure you want to Block Vehicle?' : 'Are you sure you want to Unblock Vehicle?';
      obj['cardTitle'] = flag ? 'Block Vehicle' : 'Unblock Vehicle';
      obj['successBtnText'] = flag ? 'Block' : 'Unblock';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'assign') {  //Assign vehicle
      obj['v1'] = editData?.vehicleNo;
      obj['p1'] = flag ?  '' : 'Are you sure you want to unassign driver?';
      obj['cardTitle'] = flag ? 'Assign Driver' : 'Unassign Driver';
      obj['successBtnText'] = flag ? 'Assign' : 'Unassign';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {  //Delete vehiclen
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
        this.blockUnblockVhl(editData, event);
      }
      else if (res == 'Yes' && label == 'delete') {
        this.getVehiclesData();
      }
      else if (label == 'assign') {
        if (res == 'Ok') {
          const dialog = this.dialog.open(ModalsComponent, {
            width: '900px',
            data: '',
            disableClose: this.config.disableCloseBtnFlag,
          })
          dialog.afterClosed().subscribe(res => {
            if (res == 'Yes') {
            }
          })
        }
        else {
          this.assignDriverToVehicle(event, editData, res);
        }
      }
      /* else {
        this.getVehiclesData();
      } */
    }
    )
  }
  // ---------------------------------------------------------------Assign Driver---------------------------------------------------
  assignDriverToVehicle(flag: any, data: any, id: number) {
    console.log(flag)
    console.log(data)
    let param = {
      "id": 0,
      "driverId": flag == 'assign' ?id:data.driverId,
      "vehicleId": flag == 'assign' ? data?.vehicleId : 0,
      "assignedby": this.webStorage.getUserId(),
      "assignedDate": this.date.toISOString(),
      "isDeleted": 0,
      "vehicleNumber": data?.vehicleNo,
      "userId": this.webStorage.getUserId()
    }
    this.apiCall.setHttp('put', 'vehicle/assign-driver-to-vehicle', true, param, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe(() => {
      this.getVehiclesData();
    })/* ,
      (error: any) => {
        this.error.handelError(error.status);
      }) */
  }
  // ---------------------------------------------------------checkbox----------------------------------------------------------------
  selectVehicle(event: any, driverId: number) {
    for (var i = 0; i < this.vehicleData.length; i++) {
      if (driverId != 0) {
        this.selectAll = false;
        if (this.vehicleData[i].driverId == driverId) {
          this.vehicleData[i].checked = event.checked;
        }
      } else {
        this.vehicleData[i].checked = event.checked;
      }
    }
    this.checkedVehicle = [];
    this.checkedVehicle = this.vehicleData.filter((x: any) => x.checked == true);
    this.selectAll = this.vehicleData.length == this.checkedVehicle.length ? true : false;
  }

  uncheckVehicle() {
    this.selectAll = false;
    this.vehicleData.map((ele: any) => {
      ele.checked = false
      this.checkedVehicle = [];
    })
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
    this.spinner.show();
    this.apiCall.setHttp('put', 'vehicle/BlockUnblockVehicle', true, param, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
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
  clearSearchData() {
    this.searchVehicleForm.controls['vehicleNo'].setValue('');
    this.getVehiclesData();
    this.searchHideShow = true;
    this.clearSerachBtn = false;
  }
  vehicleModal(label: string, driverData?: any){
      this.selectAll || this.vehicleData ? (this.uncheckVehicle(), this.vehicleData = []) : '';
      let obj: any;
      label == 'edit' ? (obj = driverData, this.highLightRow = driverData?.driverId) : obj = '';
      const dialog = this.dialog.open(VehicleModalComponent, {
        width: '900px',
        data: obj,
        disableClose: this.config.disableCloseBtnFlag,
      })
  
      dialog.afterClosed().subscribe(res => {
        this.highLightRow = '';
        if (res == 'add') {
          this.getVehiclesData();
        }
      }
      )
    
  }
  onPagintion(pageNo: any) {
    this.selectAll = false;
    this.paginationNo = pageNo;
    this.getVehiclesData();
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
