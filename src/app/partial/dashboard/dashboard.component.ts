import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions
} from "ng-apexcharts";
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component'
import { ErrorsService } from 'src/app/services/errors.service';
import { Router } from '@angular/router';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
};
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | any;
  public chartOptions: Partial<ChartOptions> | any;
  public chartOptions1: Partial<ChartOptions> | any;
  public chartOptions2: Partial<ChartOptions> | any;
  public chartOptions3: Partial<ChartOptions> | any;
  vehicleAllData: any[] = [];
  vehicleStatusData: any[] = [];
  pOIAlertData: any[] = [];
  overSpeedData: any[] = [];
  SIMRenewalReminderData: any[] = [];
  barChartDisplay: boolean = false;
  pieChartDisplay: boolean = false;
  maxSpeedObj:any;
  avarageSpeedObj:any;
  fastestVehicleObj:any;
  gaugeType: any = "arch";
  gaugeValue = 28.3;
  gaugeLabel = "Speed";
  gaugeAppendText = "mph";
  gaugeThick = 15;
  guageCap:any ='round';
  vehiclesMoving:any;
  currentdate=new Date()
  constructor(private cs: CommanService,
    public dialog: MatDialog,
    private error:ErrorsService,
    private router:Router) {
    this.chartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 220
      },
      plotOptions: {
        bar: {
          horizontal: true
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: []
      },
    };
    this.chartOptions1 = {
      series: [],
      chart: {
        type: 'donut'
      },
      labels: ["Idle", "Stopped", "Running", "Offline"],
      fill: {
        type: "solid",
        colors: ["#00E396", "#F9CE1D", "#D4526E", "#D7263D"]
      },
      legend: {
        show: true,
        position: 'bottom',
        colors: [],
      },
      stroke: {
        width: 0,
        colors: undefined
      },
      yaxis: {
        show: false
      },
      plotOptions: {
        polarArea: {
          rings: {
            strokeWidth: 0
          }
        }
      }
    };
  }

  ngOnInit(): void {
    this.getvehicleStatusData();
    this.getvehicleAllData();
    this.getPOIAlertData();
    this.getOverSpeedData();
    this.getSIMRenewalReminderData();
  }

  getvehicleAllData() {
    this.vehicleAllData = [];
    this.maxSpeedObj=[];
    this.cs.setHttp('get', 'dashboard/get-vehicle-current-location-list?VehicleNo=' + '&UserId=' + this.cs.getUserId() + '&GpsStatus=Running', true, false, false, 'vehicletrackingBaseUrlApi');
    this.cs.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.vehicleAllData = responseData.responseData;
        this.vehicleAllData.map((x:any)=>{
          x.deviceDatetime=new Date(x.deviceDatetime);
        })
        this.vehicleAllData.sort((a, b) => { return b.speed - a.speed; });
        const items = this.vehicleAllData.slice(0, 10);
        const maxSpeed=Math.max(...this.vehicleAllData.map(o => o.speed));
        this.maxSpeedObj=this.vehicleAllData.find(x=>x.speed=maxSpeed);
        this.fastestVehicleObj={
          'gaugeType': "arch",
          'gaugeValue' :maxSpeed,
          'gaugeLabel' : "Speed",
          'gaugeAppendText' : "mph",
          'gaugeThick' : 15,
          'guageCap':  'round'
        }
        let vehicleSpeed:any[]=[];
        this.vehiclesMoving=[];
       this.vehiclesMoving= this.vehicleAllData.filter((x:any)=> x.speed)
        this.vehiclesMoving.map((x:any)=>{
          vehicleSpeed.push(x.speed)
        })
        const sum = vehicleSpeed.reduce((a, b) => a + b, 0);
        const avg = (sum / vehicleSpeed.length) || 0;
        this.avarageSpeedObj={
          'gaugeType': "arch",
          'gaugeValue' :avg,
          'gaugeLabel' : "Speed",
          'gaugeAppendText' : "mph",
          'gaugeThick' : 15,
          'guageCap':  'round'
        }
        this.getBarChartData(this.vehiclesMoving);

        
      }
      else if (responseData.statusCode === "404") {
        this.error.handelError(responseData.statusCode);
      }
      else {
        (error: any) => {
          this.error.handelError(error.status);
      }
      }
    },(error: any) => {
      this.error.handelError(error.status);
  })
  }
  getvehicleStatusData() {
    this.vehicleAllData = [];
    this.cs.setHttp('get', 'dashboard/get-vehicle-status-count?UserId=' + this.cs.getUserId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.cs.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.vehicleStatusData = responseData.responseData;
        this.getpieChartData(this.vehicleStatusData);
      }
      else if (responseData.statusCode === "409") {
        this.error.handelError(responseData.statusCode);
      }
      else {
        (error: any) => {
          this.error.handelError(error.status);
      }
      }
    })
  }
  getPOIAlertData() {
    this.pOIAlertData = [];
    this.cs.setHttp('get', 'dashboard/get-vehicles-count-dashboard?UserId=' + this.cs.getUserId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.cs.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.pOIAlertData = responseData.responseData;
      }
      else if (responseData.statusCode === "409") {
        this.error.handelError(responseData.statusCode);
      }
      else {
        (error: any) => {
          this.error.handelError(error.status);
      }
      }
    })
  }
  getOverSpeedData() {
    this.overSpeedData = [];
    const Fromdate=moment.utc().startOf('day').toISOString();
    const ToDate=moment.utc().toISOString();
    this.cs.setHttp('get', 'dashboard/get-vehicle-alert-count-dashboard?UserId=' + this.cs.getUserId()+'&Fromdate='+Fromdate+'&ToDate='+ToDate, true, false, false, 'vehicletrackingBaseUrlApi');
    this.cs.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.overSpeedData = responseData.responseData;
      }
      else if (responseData.statusCode === "409") {
        this.error.handelError(responseData.statusCode);
      }
      else {
        (error: any) => {
          this.error.handelError(error.status);
      }
      }
    })
  }
  getSIMRenewalReminderData() {
    this.SIMRenewalReminderData = [];
    const Fromdate=moment.utc().startOf('day').toISOString();
    const ToDate=moment.utc().toISOString();
    this.cs.setHttp('get', 'dashboard/get-sim-due-and-over-due?UserId=' + this.cs.getUserId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.cs.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.SIMRenewalReminderData = responseData.responseData;
      }
      else if (responseData.statusCode === "409") {
        this.error.handelError(responseData.statusCode);
      }
      else {
        (error: any) => {
          this.error.handelError(error.status);
      }
      }
    })
  }
  getBarChartData(items: any) {
    this.chartOptions.xaxis = {};
    this.chartOptions.series = [];
    const seriesData: any[] = [];
    const categoriesData: any[] = [];
    for (let i = 0; i < items.length; i++) {
      seriesData.push(items[i].speed);
      categoriesData.push(items[i].vehicleNo);
    }
    if (items.length > 0) {
      this.chartOptions.series = [{
        name: "basic",
        data: seriesData
      }];
      this.chartOptions.xaxis = {};
      this.chartOptions.xaxis.categories = categoriesData;
    } else {
      this.chartOptions.series = [];
      this.chartOptions.xaxis = {};
      this.chartOptions.xaxis.categories = categoriesData;
    }
    this.barChartDisplay = true;
  }
  getpieChartData(items: any) {
    const series = [0, 0, 0, 0];
    series[0] = items.idleVehicles|0;
    series[1] = items.stopVehicles|0;
    series[2] = items.runningVehicles|0;
    series[3] = items.offlineVehicles|0;
    this.chartOptions1.series = series;
    this.pieChartDisplay = true;
  }
}
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>
 ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
