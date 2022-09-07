import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { CommanService } from 'src/app/services/comman.service';
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
  reportForm!:FormGroup;
  formData:any;
  maxEndDate:any=new Date();
  EndDateFilter:any;
  VehicleDtArr:any;
  showTimePeriod:boolean=true;
  currentDate=moment().toISOString();
  timePeriodArray: timePeriodArray[] = [
    {value: '1', viewValue: 'Today'},
    {value: '2', viewValue: '24hr'},
    {value: '3', viewValue: 'Weekly'},
    {value: '4', viewValue: 'Custom'},
  ];
  maxTodayDate:any;
  tabArrayData:any[]=[];
  selectedIndex: any;
  get f() { return this.reportForm.controls};
  constructor(private fb:FormBuilder, private reportsService:ReportsService,private comman:CommanService,
    private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.getStoppageData();
    this.selectedTab('stoppage');
    // this.setIndex(0,'Stopage Report');
    // this.getVehicleList();
    this.getVehicleData();
  }
  getStoppageData(){
    this.reportForm = this.fb.group({
      fromDate:['',Validators.required],
      toDate:['',Validators.required],
      vehicleNo:['',Validators.required],
      timePeriod:['',Validators.required]
    })
  }
  selectedTab(tab:any){
    this.tabArrayData=[];
    switch (tab) {
      case 'stoppage':  this.tabArrayData=[{
        label:'Stopage Report',
        disc:'All the stoppages of a vehicles with certain stoppage time at a particular location'
      },
      {
        label:'Daywise Stoppage Report',
        disc:'Report for stoppages of a vehicle in a day'
      },
      {
        label:'Locationwise Stoppage Report',
        disc:'All the stoppages of a vehicles, at a particular location'
      },
    ];
    this.setIndex(0,'Stopage Report');
     break;
      case 'distance': this.tabArrayData=[{
        label:'Day Distance Report',
        disc:'Report for distance covered by the vehicle in a day (24 Hrs)'
      },
      {
        label:'Distance Report',
        disc:'Report for distance covered by the vehicle between provided given time'
      },
      {
        label:'Summary Report',
        disc:'Report of tolls crossed by vehicle in selected timeframe'
      },
      {
        label:'Trip Report',
        disc:'Report of ac temperatures of vehicle in selected timeframe'
      },
      {
        label:'Address Report',
        disc:'Report of door lock of vehicle in selected timeframe'
      },
     
    ]; this.setIndex(0,'Day Distance Report');
     break;
      case 'tools':  this.tabArrayData=[{
        label:'Overspeed Report',
        disc:'Report for vehicle over-speeding over certain value in selected timeframe'
      },
      {
        label:'Speed Range Report',
        disc:'Report of temperature inside container at different time in selected timeframe'
      },
     
    ];  this.setIndex(0,'Overspeed Report');
    break;
    }
  }
  setIndex(index: number, label:any) {
    this.selectedIndex = index;
    this.showTimePeriod=(label=='Stopage Report'||label=='Overspeed Report'||label=='Speed Range Report')?true:false;
    if(label=='Stopage Report'||label=='Overspeed Report'||label=='Speed Range Report'){
      this.reportForm.controls["timePeriod"].setValidators([Validators.required]); 
    }else{
      this.reportForm.controls["timePeriod"].clearValidators(); 
    }
    this.reportForm.controls["timePeriod"].updateValueAndValidity();
 }
  
  getVehicleData(){
    this.comman.setHttp('get', 'vehicle-tracking/dashboard/get-vehicles-list?UserId=35898', true, false, false, 'VehicleListBaseUrlApi');
    this.comman.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.VehicleDtArr = responseData.responseData;
        this._snackBar.open('Message archived', 'Undo', {
          duration: 1000,
          panelClass:'custom_sneak_bar'

        });
      }
      else if (responseData.statusCode === "409") {
        
      }
      else {
        // this.toastrService.error(responseData.statusMessage);
      }
    })
  }
  selectTimePeriod(value:any){
    switch (value) {
      case "1":  
      this.reportForm.patchValue({
        fromDate:moment.utc().startOf('day').toISOString(),
        toDate:moment.utc().toISOString(),
      })
     break;
     case "2":var time = moment.duration("24:00:00");
      var date = moment();
      const oneDaySpan =date.subtract(time); 
      this.reportForm.patchValue({
        fromDate:moment(oneDaySpan).toISOString(),
        toDate:moment.utc().toISOString(),
      })
     break;
     case "3": 
     const startweek =moment().subtract(7, 'days').calendar(); 
     this.reportForm.patchValue({
       fromDate:moment(startweek).toISOString(),
       toDate:moment.utc().toISOString(),
     })
    break;
    case "4": 
     this.reportForm.patchValue({
       fromDate:'',
       toDate:'',
     })
    break;
    }
  }
  settodate(fromDate:any){
    const maxTodayDate=moment(fromDate).add(7, 'days').calendar();
    this.maxTodayDate=moment(maxTodayDate).toISOString() < moment().toISOString()?moment(maxTodayDate).toISOString():moment().toISOString() ;
  }

  SearchReport(){
    if(this.reportForm.invalid){
        return;
    }else{
      console.log(this.reportForm.value);
    }
  }

/* this.formData=this.reportForm.value;
  let fromDate:any = this.datePipe.transform(this.formData.startDate, 'yyyy-MM-dd HH:mm');
  let todate:any = this.datePipe.transform(this.formData.endDate, 'yyyy-MM-dd HH:mm');
  let date1: any = new Date(fromDate);
  let timeStamp = Math.round(new Date(todate).getTime() / 1000);
  let timeStampYesterday = timeStamp - (24 * 3600);
  let is24 = date1 >= new Date(timeStampYesterday * 1000).getTime();
  if(!is24){
            this._snackBar.open("Date difference does not exceed 24hr.");
  } */
}
