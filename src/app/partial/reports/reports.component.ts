import { MapsAPILoader } from '@agm/core';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
import { SharedService } from 'src/app/services/shared.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { ViewReportComponent } from './view-report/view-report.component';

interface timePeriodArray {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  reportForm!: FormGroup;
  maxEndDate = new Date();
  vehicleList = new Array();
  showTimePeriod: boolean = true;
  selectedTablabel!: string;
  reportResponseData = new Array();
  currentDate = moment().toISOString();
  header: any;
  key: any;
  timePeriodArray: timePeriodArray[] = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'Custom' },
  ];
  maxTodayDate !: Date | any;
  tabArrayData = new Array();
  selectedIndex !: number;
  geoCoders: any;
  pageNo: number = 1;
  pageSize: number = 10;
  get f() { return this.reportForm.controls };
  constructor(private fb: FormBuilder,
    private apiCall: ApiCallService,
    private datepipe: DatePipe,
    private webStorage: WebStorageService,
    private commonMethods: CommonMethodsService,
    private master: MasterService,
    private error: ErrorsService,
    public config: ConfigService,
    private mapsAPILoader: MapsAPILoader,
    private sharedService: SharedService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoders = new google.maps.Geocoder;
    });
    this.getStoppageData();
    this.selectedTab('stoppage');
    this.getVehicleData();
  }
  getStoppageData() {
    this.reportForm = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      VehicleNumber: ['', Validators.required],
      timePeriod: ['', Validators.required]
    })
  }
  selectedTab(tab: any) {
    this.tabArrayData = [];
    this.reportForm.patchValue({
      fromDate: '',
      toDate: '',
      VehicleNumber: '', 
      timePeriod: ''
    });
    switch (tab) {
      case 'stoppage': this.tabArrayData = [{
        label: 'Stopage Report',
        disc: 'All the stoppages of a vehicles with certain stoppage time at a particular location'
      },
      {
        label: 'Daywise Stoppage Report',
        disc: 'Report for stoppages of a vehicle in a day'
      },
      {
        label: 'Locationwise Stoppage Report',
        disc: 'All the stoppages of a vehicles, at a particular location'
      },
      ];
        this.setIndex(0, 'Stopage Report');
        break;
      case 'distance': this.tabArrayData = [{
        label: 'Day Distance Report',
        disc: 'Report for distance covered by the vehicle in a day (24 Hrs)'
      },
      {
        label: 'Distance Report',
        disc: 'Report for distance covered by the vehicle between provided given time'
      },
      {
        label: 'Summary Report',
        disc: 'Report of tolls crossed by vehicle in selected timeframe'
      },
      {
        label: 'Trip Report',
        disc: 'Report of ac temperatures of vehicle in selected timeframe'
      },
      {
        label: 'Address Report',
        disc: 'Report of door lock of vehicle in selected timeframe'
      },

      ]; this.setIndex(0, 'Day Distance Report');
        break;
      case 'tools': this.tabArrayData = [{
        label: 'Overspeed Report',
        disc: 'Report for vehicle over-speeding over certain value in selected timeframe'
      },
      {
        label: 'Speed Range Report',
        disc: 'Report of temperature inside container at different time in selected timeframe'
      },

      ]; this.setIndex(0, 'Overspeed Report');
        break;
    }
    
  }
  setIndex(index: number, label: any) {
    this.selectedTablabel = label;
    this.selectedIndex = index;
    this.showTimePeriod = (label == 'Stopage Report' || label == 'Overspeed Report' || label == 'Speed Range Report') ? true : false;
    if (label == 'Stopage Report' || label == 'Overspeed Report' || label == 'Speed Range Report') {
      this.reportForm.controls["timePeriod"].setValidators([Validators.required]);
    } else {
      this.reportForm.controls["timePeriod"].clearValidators();
    }
    this.reportForm.controls["timePeriod"].updateValueAndValidity();
  }

  getVehicleData() {
    let vhlData = this.master.getVehicleListData();
    vhlData.subscribe({
      next: (response: any) => {
        this.vehicleList = response;
      }
    }),
      (error: any) => {
        this.error.handelError(error.status);
      }
  }
  selectTimePeriod(value: any) {
    switch (value) {
      case "1":
        this.reportForm.patchValue({
          fromDate: moment.utc().startOf('day').toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "2": var time = moment.duration("24:00:00");
        var date = moment();
        const oneDaySpan = date.subtract(time);
        this.reportForm.patchValue({
          fromDate: moment(oneDaySpan).toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "3":
        const startweek = moment().subtract(7, 'days').calendar();
        this.reportForm.patchValue({
          fromDate: moment(startweek).toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "4":
        this.reportForm.patchValue({
          fromDate: '',
          toDate: '',
        })
        break;
    }
  }
  settodate(fromDate: any) {
    const selectedmaxTime ='T'+((new Date(fromDate).toISOString()).split("T"))[1];
    const maxTodayDate = (moment(fromDate).add(7, 'days').calendar());
    console.log(maxTodayDate + selectedmaxTime);
    const maxTodayDateTime= moment(moment(maxTodayDate.concat(selectedmaxTime), 'DD/MM/YYYY HH:mm:ss ')).add(5, 'hour').add(30, 'minute');
    this.maxTodayDate = moment(maxTodayDate).toISOString() < moment().toISOString() ? moment(maxTodayDateTime).toISOString() : moment().toISOString();
  }
  checkValidDate() {
    const reportData = this.reportForm.value;
    if (reportData.fromDate && reportData.toDate) {
      if (new Date(reportData.fromDate).toISOString() < new Date(reportData.toDate).toISOString()) {
        this.reportForm.controls['toDate'].patchValue(new Date(reportData.toDate).toISOString())
      } else {
        this.reportForm.controls['toDate'].patchValue('')
      }
    }
  }
  getQueryString() {
    const reportData = this.reportForm.value
    let str = "?";
    const isVenicleNumber = (this.selectedTablabel == 'Summary Report' || this.selectedTablabel == 'Trip Report') ? true : false
    this.reportForm && reportData.fromDate && (str += "fromDate=" + new Date(reportData.fromDate).toISOString())
    this.reportForm && reportData.toDate && (str += "&toDate=" + new Date(reportData.toDate).toISOString())
    this.reportForm && reportData.VehicleNumber && (str += (isVenicleNumber ? "&VehicleNumber=" : "&VehicleNo=") + reportData.VehicleNumber)

    return str;
  }
  SearchReport() {
    if (this.reportForm.invalid) {
      return;
    } else {
      this.reportResponseData = [];
      var url: any;
      switch (this.selectedTablabel) {
        case "Summary Report": url = 'reports/get-summary-report'; break;
        case "Trip Report": url = 'reports/get-trip-report-web'; break;
        case "Address Report": url = 'reports/get-tracking-address-mob'; break;
        case "Overspeed Report": url = 'reports/get-vehicle-details-for-overspeed'; break;
        case "Speed Range Report": url = 'reports/get-overspeed-report-speedrange'; break;
      }
      this.apiCall.setHttp('get', url + this.getQueryString() + '&UserId=' + this.webStorage.getUserId() + '&VehicleOwnerId=' + this.webStorage.getVehicleOwnerId() + '&pageno=' + this.pageNo + '&rowsperpage=' + this.pageSize, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((responseData: any) => {
        if (responseData.statusCode === "200" || responseData.length > 0) {
          let resp: any = this.sharedService.getAddressBylatLong(1, responseData.responseData.data, 10);
          this.reportResponseData = resp;
        }
        else {
          this.commonMethods.snackBar(responseData.statusMessage, 0);
        }
      },
        (error: any) => {
          this.error.handelError(error.status)
        })
    }
  }

  viewReport() {
    let vehicleName: any;
    let dataArr;
    this.vehicleList.find((ele: any) => {
      if (this.reportForm.value.VehicleNumber == ele.vehicleNo) {
        vehicleName = ele.vehTypeName;
      }
      this.reportForm.value['vehicleName'] = vehicleName;
    });
    let resData = this.reportResponseData.map((item: any) => Object.assign({}, item));
    dataArr = resData.map((x: any) => {
      x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a')
      return x
    });
    resData = this.reportResponseData;
    let pageName = this.selectedTablabel;

    let obj: any;
    obj = this.reportForm.value;
    obj.pageNames = pageName;
    obj.data = dataArr;
    const dialog = this.dialog.open(ViewReportComponent, {
      width: '900px',
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(() => {
      this.reportResponseData = [];
      this.reportForm.reset();
    }
    )
  }
}
