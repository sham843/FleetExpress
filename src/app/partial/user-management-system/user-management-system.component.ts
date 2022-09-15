import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormControl} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';

@Component({
  selector: 'app-user-management-system',
  templateUrl: './user-management-system.component.html',
  styleUrls: ['./user-management-system.component.scss']
})
export class UserManagementSystemComponent implements OnInit {
  toppings = new UntypedFormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  VehicleDtArr:any[]=[];
  showTab:any;
  tableLables:any[]=[]
  userForm!:FormGroup;
  roleForm!:FormGroup;

  get user() { return this.userForm.controls };
  get role() { return this.roleForm.controls };
  constructor(private comman:CommanService,
    private toastrService:ToastrService,
    private fb:FormBuilder) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getVehicleData();
    this.selectedTab('users');
  }
  getRegFormData() {
    this.userForm = this.fb.group({
      fName: [],
      mobileNumber: [],
      assignedVehicle: [],
      assignedRole: [],
    })
    this.roleForm = this.fb.group({
      roleName: [],
      topping: [],
    })
  }
  getVehicleData() {
    this.comman.setHttp('get', 'userdetail/get-vehicle-list?vehicleOwnerId='+this.comman.getVehicleOwnerId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.comman.getHttp().subscribe((responseData: any) => {
      if (responseData.statusCode === "200") {
        this.VehicleDtArr = responseData.responseData.responseData1;
        console.log(this.VehicleDtArr)
      }
      else if (responseData.statusCode === "409") {

      }
      else {
        this.toastrService.error(responseData.statusMessage);
      }
    })
  }
  selectedTab(tab:any){
    this.showTab=tab;
    if(tab=='users'){
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'NAME'},{id:3,label:'MOBILE NUMBER'},{id:4,label:'ROLE'},{id:5,label:'BLOCK/UNBLOCK'},{id:6,label:'ACTION'}]
    }else{
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'ROLE NAME'},{id:3,label:'ASSIGN RESPONSIBILITIES'},{id:4,label:'ACTION'}]
    }
  }
  submitUser(){}
}
