import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions
} from "ng-apexcharts";
import { of, Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
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
  
  public VehiclesLastUpdatedbarChartOptions: Partial<ChartOptions> | any;
  public FleetStatusPieChartOption: Partial<ChartOptions> | any;
  vehicleAllData= new Array();
  vehicleStatusData= new Array();
  pOIAlertData = new Array();
  overSpeedData=new Array();
  SIMRenewalReminderData= new Array();
  barChartDisplay: boolean = false;
  pieChartDisplay: boolean = false;
  maxSpeedObj!:object| any;
  avarageSpeedObj!:object| any;
  fastestVehicleObj!:object| any;
  gaugeType: string = "arch";
  gaugeValue:number = 28.3;
  gaugeLabel:string  = "Speed";
  gaugeAppendText:string  = "mph";
  gaugeThick:number = 15;
  guageCap:string ='round';
  vehiclesMoving = new Array();
  currentdate=new Date();
  alertTypeArray:any;
  powerCutData=new Array();
  lat!: number;
  long!: number;
  zoom:number = 12;
  subscription!:Subscription;
  @ViewChild('search')
  public searchElementRef !: ElementRef  ;
  geoCoder:any;
  markers:any;
  allVehiclelData=new Array();
  map:any;
  currentDate=new Date();
  interval:any
  icon = { url: '../../assets/images/location.png', scaledSize: {height: 15, width: 20}}
  constructor(private webStorage: WebStorageService, private apiCall:ApiCallService,
    private error:ErrorsService ,private mapsAPILoader: MapsAPILoader, public config: ConfigService) {
    this.VehiclesLastUpdatedbarChartOptions = {
      series: [],
      chart: {
        type: "bar",
        height: 250,
        toolbar: {
          show: false
        },
      },
      colors: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e',
        '#f48024', '#69d2e7'
      ],
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: []
      },
    };
    this.FleetStatusPieChartOption = {
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
    this.alertTypeArray=of('power-cut', 'overspeed');
    this.getvehicleStatusData();
    this.getvehicleAllData();
    this.getPOIAlertData();
    this.getOverSpeedPowerCutData();
    this.getSIMRenewalReminderData();
    this.mapCall();
    this.getAllVehicleListData();
    this.interval = setInterval(() => { 
      this.getvehicleStatusData();
      this.getvehicleAllData();
      this.getPOIAlertData();
      this.getOverSpeedPowerCutData();
      this.getSIMRenewalReminderData();
      this.mapCall();
      this.getAllVehicleListData();
  }, 60000);
  }
  thresholdConfig = {
    '0': {color: 'green'},
    '60': {color: 'orange'},
    '80': {color: 'red'}
  };
  markerConfig = {
    "0": { color: '#555', size: 8, label: '0', type: 'line'},
    "15": { color: '#555', size: 4, type: 'line'},
    "30": { color: '#555', size: 8, label: '30', type: 'line'},
    "40": { color: '#555', size: 4, type: 'line'},
    "50": { color: '#555', size: 8, label: '50', type: 'line'},
    "60": { color: '#555', size: 4, type: 'line'},
    "70": { color: '#555', size: 8, label: '70', type: 'line'},
    "85": { color: '#555', size: 4, type: 'line'},
    "100": { color: '#555', size: 8, label: '100', type: 'line'},
    "120": { color: '#555', size: 4, type: 'line'},
}

  getvehicleAllData() {
    this.vehicleAllData = [];
    this.maxSpeedObj=[];
    this.apiCall.setHttp('get', 'dashboard/get-vehicle-current-location-list?VehicleNo=' + '&UserId=' + this.webStorage.getUserId() + '&GpsStatus=Running', true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.vehicleAllData = responseData.responseData;
        this.vehicleAllData.map((x:any)=>{
          x.deviceDatetime=new Date(x.deviceDatetime);
        })
        this.vehicleAllData.sort((a, b) => { return b.speed - a.speed; });
        const maxSpeed=Math.max(...this.vehicleAllData.map(o => o.speed));
        this.maxSpeedObj=this.vehicleAllData.find(x=>x.speed=maxSpeed);
        this.fastestVehicleObj={
          'gaugeType': "arch",
          'gaugeValue' :maxSpeed,
          'gaugeLabel' : "Speed",
          'gaugeAppendText' : "km/hr",
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
          'gaugeAppendText' : "km/hr",
          'gaugeThick' : 15,
          'guageCap':  'round'
        }
        
        this.getBarChartData(this.vehiclesMoving);
      }
      else {
          this.getBarChartData(this.config.vehicleArray);
          this.fastestVehicleObj=this.config.staticVehicleDataObj;
          this.avarageSpeedObj=this.config.staticVehicleDataObj;
      }
    },(error:any) => {
      this.error.handelError(error.status);
  })
  }
  getvehicleStatusData() {
    this.vehicleAllData = [];
    this.apiCall.setHttp('get', 'dashboard/get-vehicle-status-count?UserId=' + this.webStorage.getUserId(), true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.vehicleStatusData = responseData.responseData;
        console.log(this.vehicleStatusData)
        this.getpieChartData(this.vehicleStatusData);
      }
      else {
        // this.error.handelError(responseData.statusCode);
      }
    },(error: any) => {
      this.error.handelError(error.status);
  })
  }
  getPOIAlertData() {
    this.pOIAlertData = [];
    this.apiCall.setHttp('get', 'dashboard/get-vehicles-count-dashboard?UserId=' + this.webStorage.getUserId(), true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.pOIAlertData = responseData.responseData;
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
  getOverSpeedPowerCutData() {
    this.overSpeedData = [];
    this.powerCutData= [];
    this.alertTypeArray.subscribe((x:any)=>{
      const Fromdate = moment.utc().startOf('day').toISOString();
      const ToDate = moment.utc().toISOString();
      this.apiCall.setHttp('get', 'dashboard/get-vehicle-alert-count-dashboard?UserId=' + this.webStorage.getUserId() + '&Fromdate=' + Fromdate + '&ToDate=' + ToDate+'&alertType='+x, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((responseData: any) => {
        if (responseData.statusCode === "200" || responseData.length > 0) {
          this.powerCutData=responseData.responseData.filter((x:any)=> x.alertType=='power-cut');
          this.overSpeedData=responseData.responseData.filter((x:any)=> x.alertType=='overspeed');
        }
        else {
          (error: any) => {
            this.error.handelError(error.status);
          }
        }
      }, (error: any) => {
        this.error.handelError(error.status);
      })
    })
  }
  getSIMRenewalReminderData() {
    this.SIMRenewalReminderData = [];
    this.apiCall.setHttp('get', 'dashboard/get-sim-due-and-over-due?UserId=' + this.webStorage.getUserId(), true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200" || responseData.length > 0) {
        this.SIMRenewalReminderData = responseData.responseData;
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
  getAllVehicleListData() {
    this.apiCall.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.webStorage.getUserId() + '&VehicleNo=&GpsStatus=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.allVehiclelData = res.responseData;
        } else {
          this.allVehiclelData = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }
  getBarChartData(items: any) {
    this.VehiclesLastUpdatedbarChartOptions.xaxis = {};
    this.VehiclesLastUpdatedbarChartOptions.series = [];
    const seriesData: any[] = [];
    const categoriesData: any[] = [];
    for (let i = 0; i < items.length; i++) {
      seriesData.push(items[i].speed);
      categoriesData.push(items[i].vehicleNo);
    }
    if (items.length > 0) {
      this.VehiclesLastUpdatedbarChartOptions.series = [{
        name: "Speed  (km/hr)",
        data: seriesData
      }];
      this.VehiclesLastUpdatedbarChartOptions.xaxis = {};
      this.VehiclesLastUpdatedbarChartOptions.xaxis.categories = categoriesData;
    } else {
      this.VehiclesLastUpdatedbarChartOptions.series = [];
      this.VehiclesLastUpdatedbarChartOptions.xaxis = {};
      this.VehiclesLastUpdatedbarChartOptions.xaxis.categories = categoriesData;
    }
    this.barChartDisplay = true;
  }
  getpieChartData(items: any) {
    const series = [0, 0, 0, 0];
    series[0] = items.idleVehicles|0;
    series[1] = items.stopVehicles|0;
    series[2] = items.runningVehicles|0;
    series[3] = items.offlineVehicles|0;
    this.FleetStatusPieChartOption.series = series;
    this.pieChartDisplay = true;
  }
  onMapReady(map: any) {
    this.map = map;
  }
  mapCall() {
    this.mapsAPILoader.load().then(() => {
      new google.maps.Geocoder;
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.interval);
}
}
