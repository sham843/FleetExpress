import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { CommanService } from 'src/app/services/comman.service';
import { ExcelPdfDownloadedService } from 'src/app/services/excel-pdf-downloaded.service';
import { ReportsService } from './reports.service';

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
  reportForm!: UntypedFormGroup;
  formData: any;
  maxEndDate: any = new Date();
  EndDateFilter: any;
  VehicleDtArr: any;
  showTimePeriod: boolean = true;
  selectedTablabel: any;
  reportResponseData: any[] = [];
  currentDate = moment().toISOString();

  timePeriodArray: timePeriodArray[] = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'Custom' },
  ];
  maxTodayDate: any;
  tabArrayData: any[] = [];
  selectedIndex: any;
  get f() { return this.reportForm.controls };
  constructor(private fb: UntypedFormBuilder, private reportsService: ReportsService, private comman: CommanService,
    private excelService: ExcelPdfDownloadedService, private datepipe: DatePipe) { }

  ngOnInit(): void {
    this.getStoppageData();
    this.selectedTab('stoppage');
    // this.setIndex(0,'Stopage Report');
    // this.getVehicleList();
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
    this.comman.setHttp('get', 'vehicle/get-vehiclelists', true, false, false, 'vehicletrackingBaseUrlApi');
    this.comman.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.VehicleDtArr = responseData.responseData.responseData1;
      }
      else if (responseData.statusCode === "409") {

      }
      else {
        // this.toastrService.error(responseData.statusMessage);
      }
    })
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
    const maxTodayDate = moment(fromDate).add(7, 'days').calendar();
    this.maxTodayDate = moment(maxTodayDate).toISOString() < moment().toISOString() ? moment(maxTodayDate).toISOString() : moment().toISOString();
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
    // this.reportForm.controls['toDate'].patchValue((new Date(reportData.toDate).toISOString()< new Date(reportData.fromDate).toISOString())?moment(reportData.toDate).toString():'')
  }
  getQueryString() {
   const reportData = this.reportForm.value
    let str = "?";
    const isVenicleNumber = (this.selectedTablabel == 'Summary Report' || this.selectedTablabel == 'Trip Report') ? true : false
    this.reportForm && reportData.fromDate && (str += "fromDate=" + new Date(reportData.fromDate).toISOString())
    this.reportForm && reportData.toDate && (str += "&toDate=" + new Date(reportData.toDate).toISOString())
    this.reportForm && reportData.VehicleNumber && (str += (isVenicleNumber ? "&VehicleNumber=" : "&VehicleNo=") +
      'MH12AC1111'//  reportData.VehicleNumber
    )
    return str;
  }
  SearchReport() {
    console.log(this.reportForm.value.fromDate);
    console.log( this.getQueryString())
    if (this.reportForm.invalid) {
      return;
    } else {
      var url: any
      switch (this.selectedTablabel) {
        case "Summary Report": url = 'reports/get-summary-report'; break;
        case "Trip Report": url = 'reports/get-trip-report-web'; break;
        case "Address Report": url = 'reports/get-tracking-address-mob'; break;
        case "Overspeed Report": url = 'reports/get-vehicle-details-for-overspeed'; break;
        case "Speed Range Report": url = 'reports/get-overspeed-report-speedrange'; break;
      }
     
      this.comman.setHttp('get', url + this.getQueryString() + '&UserId='+this.comman.getUserId()+'&VehicleOwnerId='+this.comman.getVehicleOwnerId(), true, false, false, 'vehicletrackingBaseUrlApi');
      this.comman.getHttp().subscribe((responseData: any) => {
        if (responseData.statusCode === "200" || responseData.length > 0) {
        /*   this.reportResponseData = responseData.responseData;*/
          console.log(responseData) 
        }
        else if (responseData.statusCode === "409") {

        }
        else {
          // this.toastrService.error(responseData.statusMessage);
        }
      })
    }
  }
  onDownloadPDF() {
    let vehicleName: any;
    let data;
    this.VehicleDtArr.find((ele: any) => {
      if (this.reportForm.value.VehicleNumber == ele.vehicleNo) {
        vehicleName = ele.vehTypeName;
      }
      this.reportForm.value['vehicleName']=vehicleName;
    });
    let resData = this.reportResponseData.map((item: any) => Object.assign({}, item));
      data = resData.map((x: any, i:any) => {
        x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a')
        return x
      });
   
    resData = this.reportResponseData;
    let formDataObj: any = this.reportForm.value;
    let pageName = this.selectedTablabel;

    this.excelService.downLoadPdf(data, pageName, formDataObj);
  }
  onDownloadExcel() {
    let vehicleName:any;
    this.VehicleDtArr.find((ele: any) => {
      if (this.reportForm.value.VehicleNumber == ele.vehicleNo) {
        vehicleName = ele.vehTypeName;
      }
      this.reportForm.value['vehicleName']=vehicleName;
    });
    let data=this.reportForm.value;
    let pageName = this.selectedTablabel;
    this.excelService.exportAsExcelFile(data,pageName);
  }
}
