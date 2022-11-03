import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
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
  vehicleNo = new FormControl();
  vehicleNoWithSpace: any;
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
  highLightRow!: string;
  vehicleDetails: any;
  checkedVehicle = new Array();
  pathImg: any;
  deleteBtn: boolean = false;
  constructor(public validation: ValidationService,
    private apiCall: ApiCallService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    private webStorage: WebStorageService,
    private dialog: MatDialog,
    private config: ConfigService
  ) { }

  ngOnInit(): void {
    this.getVehiclesData();
  }
  ngAfterViewInit() {
    let formValue = this.vehicleNo.valueChanges;
    formValue.pipe(
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(() => {
        this.paginationNo = 1;
        this.getVehiclesData();
      })
  }

  // --------------------------------------------get vehicle data--------------------------------------------------------------------
  getVehiclesData(flag?: any) {
    this.checkedVehicle = [];
    this.spinner.show();
    let searchText = this.vehicleNo.value || '';
    this.apiCall.setHttp('get', 'vehicle/get-vehiclelists?searchtext=' + searchText + '&nopage=' + this.paginationNo, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.vehicleData = response.responseData.responseData1;
        !this.vehicleNo.value ? this.vehicleDetails = response.responseData.responseData1 : '';
        this.vehicleData.forEach((ele: any) => {
          ele.isBlock == 1 ? ele['isBlockFlag'] = true : ele['isBlockFlag'] = false;
          let vhlNo;
          vhlNo = ele.vehicleNo.split('');
          vhlNo.splice(2, 0, " ");
          vhlNo.splice(5, 0, " ");
          vhlNo.splice(8, 0, " ");
          this.vehicleNoWithSpace=vhlNo.join(' ');
          ele['vhlNos']=this.vehicleNoWithSpace;
          console.log("in api",ele.vhlNos)
          console.log(ele);
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
      obj['p1'] = flag ? '' : 'Are you sure you want to unassign driver?';
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
        this.deleteVehicle();
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
    }
    )
  }
  // ---------------------------------------------------------------Assign Driver---------------------------------------------------
  assignDriverToVehicle(flag: any, data: any, id: number) {
    let param = {
      "id": 0,
      "driverId": flag == 'assign' ? id : data.driverId,
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
    })
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
  // ----------------------------------------------------------Remove Vehicle------------------------------------------------
  deleteVehicle() {
    this.deleteBtn = false;
    let param = new Array();
    for (let i = 0; i < this.vehicleData.length; i++) {
      if (this.vehicleData[i].checked == true) {
        let array = {
          "vehicleId": this.vehicleData[i].vehicleId,
          "isDeleted": true
        }
        param.push(array);
      }
    }
    this.spinner.show();
    this.apiCall.setHttp('delete', 'vehicle/Delete-vehicle', true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.checkedVehicle = [];
        this.spinner.hide();
        this.getVehiclesData();
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status);
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
    this.vehicleNo.setValue('');
    this.getVehiclesData();
  }

  // -----------------------------------modal ----------------------------------------------------------------------------
  vehicleModal(label: string, vehicleData?: any) {
    this.selectAll || this.vehicleData ? (this.uncheckVehicle()) : '';
    let obj: any;
    label == 'edit' ? (obj = vehicleData, this.highLightRow = vehicleData?.vehicleId) : obj = '';
    const dialog = this.dialog.open(VehicleModalComponent, {
      width: '900px',
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      this.highLightRow = '';
      this.getVehiclesData();
      if (res == 'Yes') {
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
