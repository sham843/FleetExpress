import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from './reports.service';

interface Food {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];
  tabArrayData:any[]=[];
  selectedIndex: any;
  frm!:FormGroup;
  get f() { return this.frm.controls};
  constructor(private fb:FormBuilder, private reportsService:ReportsService) { }

  ngOnInit(): void {
    this.frm = this.fb.group({
      reportType:[],
      fromDate:['', Validators.required],
      toDate:['', Validators.required],
      vehicleNumber:['', Validators.required],
      timePeriod:[],
     
    }) 
    this.selectedTab('stoppage');
    this.setIndex(0);
    this.getVehicleList();
  }
  getVehicleList(){
    this.reportsService.getvehiclelist().subscribe((res:any)=>{
      console.log(res)
    })
  }
  setIndex(index: number) {
    console.log(this.frm.value)
    this.selectedIndex = index;
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
    ]; break;
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
    ]; break;
      case 'tools':  this.tabArrayData=[{
        label:'Overspeed Report',
        disc:'Report for vehicle over-speeding over certain value in selected timeframe'
      },
      {
        label:'Speed Range Report',
        disc:'Report of temperature inside container at different time in selected timeframe'
      },
    ]; break;
    }
  }
  onSubmit(){
    
  }

}
