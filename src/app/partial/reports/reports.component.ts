import { MapsAPILoader } from '@agm/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
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
  @ViewChild(FormGroupDirective) formGroupDirective!: FormGroupDirective;
  timePeriodArray: timePeriodArray[] = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'Custom' },
  ];
  maxTodayDate !: Date | any;
  maxTodayDateString !: Date | any;
  tabArrayData = new Array();
  selectedIndex !: number;
  geoCoders: any;
  pageNo: number = 1;
  pageSize: number = 10;
  isSubmitted: boolean = false;
  get f() { return this.reportForm.controls };
  constructor(private fb: FormBuilder,
    private master: MasterService,
    private error: ErrorsService,
    public config: ConfigService,
    private mapsAPILoader: MapsAPILoader,
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
    switch (tab) {
      case 'stoppage': this.tabArrayData = [{
        label: 'Stopage Report',
        disc: 'All the stoppages of a vehicles with certain stoppage time at a particular location'
      },
      {
        label: 'Daywise Stoppage Report',
        disc: 'Report for stoppages of a vehicle in a day'
      },
        // {
        //   label: 'Locationwise Stoppage Report',
        //   disc: 'All the stoppages of a vehicles, at a particular location'
        // },
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
    if (label == 'Stopage Report' || label == 'Distance Report') {
      this.timePeriodArray = [
        { value: '1', viewValue: 'Today' },
        { value: '2', viewValue: '24hr' },
        { value: '3', viewValue: 'Weekly' },
        { value: '4', viewValue: 'Custom' },
      ];
    } else {
      this.timePeriodArray = [
        { value: '1', viewValue: 'Today' },
        { value: '2', viewValue: '24hr' },
        { value: '4', viewValue: 'Custom' },
      ];
    }
    this.showTimePeriod = (label == 'Stopage Report' || label == 'Overspeed Report' || label == 'Speed Range Report') ? true : false;
    if (label == 'Stopage Report' || label == 'Overspeed Report' || label == 'Speed Range Report') {
      this.reportForm.controls["timePeriod"].setValidators([Validators.required]);
    } else {
      this.reportForm.controls["timePeriod"].clearValidators();
    }
    this.reportForm.controls["timePeriod"].updateValueAndValidity();
    if (label == 'Daywise Stoppage Report') {
      this.selectTimePeriod('1');
    } else if (label == 'Day Distance Report' || label == 'Overspeed Report') {
      this.selectTimePeriod('2')
    } else {

    }
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
    const currentDateTime = (moment.utc().subtract(1, 'minute')).toISOString();
    switch (value) {
      case "1":
        this.reportForm.patchValue({
          fromDate: (moment.utc().startOf('day').subtract(5, 'hour').subtract(30, 'minute')).toISOString(),
          toDate: currentDateTime,
        })
        break;
      case "2": var time = moment.duration("24:00:00");
        var date = moment();
        const oneDaySpan = date.subtract(time);
        this.reportForm.patchValue({
          fromDate: moment(oneDaySpan).toISOString(),
          toDate: currentDateTime,
        })
        break;
      case "3":
        const startweek = moment().subtract(7, 'days').calendar();
        this.reportForm.patchValue({
          fromDate: moment(startweek).toISOString(),
          toDate: currentDateTime,
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
    const label = this.selectedTablabel;
    this.reportForm.controls['toDate'].setValue('');
    if (label == 'Stopage Report' || label == 'Distance Report') {
      this.maxTodayDateString = (moment(fromDate).add(7, 'days').format("YYYY-MM-DD HH:mm:ss"));
    } else {
      this.maxTodayDateString = (moment(fromDate).add(1, 'days').format("YYYY-MM-DD HH:mm:ss"));
    }
    const maxTodayDateTime = moment(moment(this.maxTodayDateString)).toISOString();
    this.maxTodayDate = moment(this.maxTodayDateString).toISOString() < moment().toISOString() ? moment(maxTodayDateTime).toISOString() : moment().toISOString();
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
    const reportData = this.reportForm.value;
    const selectedVehicle = this.vehicleList.find(x => x.vehicleRegistrationNo == reportData.VehicleNumber)
    let str = "?";
    const isVenicleNumber = (this.selectedTablabel == 'Summary Report' || this.selectedTablabel == 'Trip Report') ? true : false
    this.reportForm && reportData.fromDate && (str += "fromDate=" + new Date(reportData.fromDate).toISOString())
    this.reportForm && reportData.toDate && (str += "&toDate=" + new Date(reportData.toDate).toISOString())
    this.reportForm && reportData.VehicleNumber && (str += (isVenicleNumber ? "&VehicleNumber=" : "&VehicleNo=") + reportData.VehicleNumber)
      && (str += "&VehicleId=" + selectedVehicle?.id)
    return str;
  }
  SearchReport(formDirective:any) {
    this.isSubmitted = true;
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
        case "Stopage Report":
        case "Daywise Stoppage Report": url = 'reports/get-Stoppage-Report'; break;
        case "Day Distance Report":
        case "Distance Report": url = 'reports/get-Distance-Report'; break;
      }

      let obj: any;
      //let pageName = this.selectedTablabel;
      obj = this.reportForm.value;
      obj.pageNames = this.selectedTablabel;
      obj.url = url;
      obj.queryString = this.getQueryString();
      obj.vehicleList = this.vehicleList;
      const dialog = this.dialog.open(ViewReportComponent, {
        width: '100vw',
        data: obj,
        disableClose: this.config.disableCloseBtnFlag,
      })
      dialog.afterClosed().subscribe(() => {
        formDirective.resetForm();
        this.reportResponseData = [];
        this.isSubmitted = false;
        this.getStoppageData();
        this.setIndex(this.selectedIndex, this.selectedTablabel);
      }
      )
    }
  }


}