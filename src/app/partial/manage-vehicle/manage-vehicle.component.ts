import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-vehicle',
  templateUrl: './manage-vehicle.component.html',
  styleUrls: ['./manage-vehicle.component.scss']
})



export class ManageVehicleComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

}
interface Food {
  value: string;
  viewValue: string;
}