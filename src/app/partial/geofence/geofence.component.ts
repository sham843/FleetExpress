import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { filter, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { CreateGeofenceComponent } from './create-geofence/create-geofence.component';
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit, AfterViewInit, OnDestroy {
  geofenceListArray = new Array();
  paginationNo: number = 1;
  searchContent = new FormControl('');
  subscription!: Subscription;
  checkedGeoFenceArray = new Array();
  totalRecords!: number;
  totalPages!: number;
  highlightRow!: string;
  selectAll!: boolean;

  constructor(public dialog: MatDialog, private configService: ConfigService,
    private apiCall: ApiCallService, private error: ErrorsService, private commonMethods: CommonMethodsService) { }

  ngOnInit(): void {
    this.getAllGeofecneData();
  }

  ngAfterViewInit() {
    let formValue = this.searchContent.valueChanges;
    formValue.pipe(
      filter(() => this.searchContent.valid),
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(() => {
        this.paginationNo = 1;
        this.getAllGeofecneData();
      })
  }

  getAllGeofecneData() {
    this.selectAll = false;
    this.checkedGeoFenceArray = []; // clear prev checked data
    this.apiCall.setHttp('get', 'Geofencne/get-All-POI?userId=23895&NoPage=' + this.paginationNo + '&RowsPerPage=' + this.configService.pageSize + '&searchText=' + this.searchContent.value, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.geofenceListArray = res.responseData?.responseData1;
          this.totalRecords = res?.responseData?.responseData2?.totalRecords;
          this.totalPages = res?.responseData?.responseData2?.totalRecords;
        } else {
          this.geofenceListArray = [];
        }
      },
      error: ((error: any) => { this.geofenceListArray = []; this.error.handelError(error.status) })
    });
  }

  openCreateGeofenceDialog(data?: any) {
    this.selectAll || this.checkedGeoFenceArray.length ? this.uncheckAllGeofence():'';
    this.highlightRow = data?.poiId;
    const dialogRef = this.dialog.open(CreateGeofenceComponent, {
      width: this.configService.dialogBoxWidth[2],
      data: data,
      disableClose: this.configService.disableCloseBtnFlag,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'Yes') {
        this.getAllGeofecneData();
      }
      this.highlightRow = '';
    });
  }

  onPagintion(pageNo: any) {
    this.paginationNo = pageNo;
    this.getAllGeofecneData();
  }

  confirmationDialog(flag: boolean, label: string, poiId?: any) {
    let obj: any = ConfigService.dialogObj;
    if (label == 'status') {
      obj['p1'] = flag ? 'Are you sure you want to Active?' : 'Are you sure you want to InActive?';
      obj['cardTitle'] = flag ? 'Geofence Active' : 'Geofence InActive';
      obj['successBtnText'] = flag ? 'Active' : 'InActive';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {
      obj['p1'] = 'Are you sure you want to delete this record';
      obj['cardTitle'] = 'Delete';
      obj['successBtnText'] = 'Delete';
      obj['cancelBtnText'] = 'Cancel';
    }

    const dialog = this.dialog.open(ConfirmationComponent, {
      width: this.configService.dialogBoxWidth[0],
      data: obj,
      disableClose: this.configService.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      if (res == 'Yes') {
        label == 'status' ? this.blockUnBlockGeofence(flag, poiId) : this.deleteGeoFence();
      } else {
        this.getAllGeofecneData();
      }
    })
  }

  blockUnBlockGeofence(flag: any, poiId: number) {
    let obj = {
      "poiId": poiId,
      "isActive": flag
    }
    this.apiCall.setHttp('PUT', 'Geofencne/Block-Unblock-POI_1', true, obj, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethods.snackBar(res.statusMessage, 0);
          this.getAllGeofecneData();
        }
      },
      error: ((error: any) => { this.geofenceListArray = []; this.error.handelError(error.status) })
    });
  }

  selAllGeofence(event: any, id: any) {
    for (var i = 0; i < this.geofenceListArray.length; i++) {
      if (id != 0) {
        this.selectAll = false;
        if (this.geofenceListArray[i].id == id) {
          this.geofenceListArray[i].checked = event.checked;
        }
      } else {
        this.geofenceListArray[i].checked = event.checked;
      }
    }
    this.checkedGeoFenceArray = [];
    this.checkedGeoFenceArray = this.geofenceListArray.filter((x: any) => x.checked == true);
    this.selectAll = this.geofenceListArray.length == this.checkedGeoFenceArray.length ? true : false;
  }

  uncheckAllGeofence(){
    this.selectAll = false;
    this.geofenceListArray.map((ele:any)=>{
      ele.checked = false
    })
  }

  deleteGeoFence() {
    let checkedArray = new Array();
    this.checkedGeoFenceArray.find((ele: any) => {
      let obj = {
        "id": ele.poiId,
        "isDeleted": true
      }
      checkedArray.push(obj);
    });

    this.apiCall.setHttp('DELETE', 'Geofencne/Delete-POI', true, checkedArray, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode == "200") {
          this.commonMethods.snackBar(res.statusMessage, 0);
          this.getAllGeofecneData();
        }
      },
      error: ((error: any) => { this.geofenceListArray = []; this.error.handelError(error.status) })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
