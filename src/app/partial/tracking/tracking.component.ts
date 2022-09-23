import{Component,OnInit}from '@angular/core'
import { SharedService } from 'src/app/services/shared.service';

interface Food {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
  popContent:any = "Hello World";
  lat: number = 52.488328;
  lng: number = 8.717017;
  totalVehicle:any;
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];
  
  constructor(private sharedService:SharedService) { }

  ngOnInit(): void {
    this.sharedService.vehicleCount().subscribe({
      next: (ele: any) => {
       this.totalVehicle=ele.responseData.responseData2.totalRecords;
      }
    })
  }
  mapClicked(){
    
  }

}
