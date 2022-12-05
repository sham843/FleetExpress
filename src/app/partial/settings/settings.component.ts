import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ErrorsService } from 'src/app/services/errors.service';
import { ApiCallService } from 'src/app/services/api-call.service';
import { FormControl } from '@angular/forms';
import { ConfigService } from 'src/app/services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { VehicleAlertNotificationsComponent } from './vehicle-alert-notifications/vehicle-alert-notifications.component';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  columnsToDisplay: any = ['SR.NO', '', 'VEHICLE NO', 'VEHICLE TYPE', ''];
  vehiclenotificationsData = new Array();
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pageSize : number=10;
  pageNumber: number = 1;
  searchContent = new FormControl();
  vehicleNotificationFlag: boolean = false;
  totaltableDataCount !: number;
  highlightedRow: any;
  vehiclesAlertsData = new Array();
  selectedVehicleNumber!: string;
  constructor(
    private error: ErrorsService,
    private dialog: MatDialog,
    private apiCall: ApiCallService,
    public config: ConfigService,
    private spinner:NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.onPageChange(this.pageNumber)
  }

  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.getVehiclenotificationsData();
    });
  }
  onPageChange(pageNum: number): void {
    this.pageNumber = pageNum;
    // this.pageSize = this.itemsPerPage * (pageNum - 1);
    this.getVehiclenotificationsData();
  }
  getVehiclenotificationsData() {
    this.vehiclenotificationsData = []
    this.spinner.show();
    this.apiCall.setHttp('get', 'notification/get-Alert-linking?NoPage=' + (this.searchContent.value ? 0 : 1) + '&RowsPerPage=' + (!this.searchContent.value ? 10 : 0) + '&SearchText=' + this.searchContent.value, true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.vehiclenotificationsData = res.responseData.data;
          this.totaltableDataCount = parseInt(res.responseData.totalCount);
        } else {
            this.vehiclenotificationsData = [];
            this.error.handelError(res.statusCode)
        }
      }
    }, (error: any) => { 
      this.spinner.hide();
       this.error.handelError(error.status) });
  }

  openNotificationData(status: string, objData?: any) {
    this.highlightedRow = objData?.rowNumber;
    let obj: any = ConfigService.dialogObj;
    obj['cardTitle']= (status=='ALlVehicle'?'All Vehicles Alerts': objData.vehicleNo+' Vehicle Alerts' )
    obj['seletedTab'] = status;
    obj['data'] = objData;
    const dialog = this.dialog.open(VehicleAlertNotificationsComponent, {
      width: this.config.dialogBoxWidth[3],
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(res => {
      res == 'Yes' ? this.getVehiclenotificationsData() : '';
      this.highlightedRow='';
    })
  }
  getVehiclesAlertsData(vehicleNo: any) {
    if (this.selectedVehicleNumber == vehicleNo) {
      return;
    } else {
      this.selectedVehicleNumber = vehicleNo;
      this.apiCall.setHttp('get', 'notification/get-vehicleWise-Notification-List?vehicleNo=' + vehicleNo, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode === "200") {
            this.vehiclesAlertsData = res.responseData.responseData1;
          } else {
              this.error.handelError(res.statusCode);
          }
        }
      }, (error: any) => { this.error.handelError(error.status) });
    }
  }
}

