import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder,FormGroup, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService} from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-add-update-user',
  templateUrl: './add-update-user.component.html',
  styleUrls: ['./add-update-user.component.scss']
})
export class AddUpdateUserComponent implements OnInit {
  dialogData !: object| any;
  userForm !:FormGroup;
  roleForm !:FormGroup;
  status !:string;
  userformSubmitted !:boolean;
  vehicleDtArr=new Array();
  userData=new Array();
  roleDtArr=new Array();
  editFlag!:boolean;
  editData !: object| any;
  get user() { return this.userForm.controls };
  get role() { return this.roleForm.controls };
  filterData=new Array();
  constructor(public dialogRef: MatDialogRef<AddUpdateUserComponent>,
    public CommonMethod: CommonMethodsService, private fb:FormBuilder,
    public validationService:ValidationService, private master:MasterService,
    private error:ErrorsService, private apiCall:ApiCallService, private webStorage:WebStorageService
    ,private commonMethods:CommonMethodsService, private spinner:NgxSpinnerService
    ,@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    console.log(this.dialogData);
    this.editData=this.dialogData?.selectedDataObj;
    this.editFlag=this.editData?true:false;
    this.userData.push(this.webStorage.getUser());
    this.getformControls();
    this.getVehicleData();
    this.getRoleData();
    if(this.editData){
    var vehicleNumber= new Array();
    this.editData.vehicle.forEach((element:any) => {
      vehicleNumber.push(element.vehicleNumber)
    });
    this.userForm.patchValue({
      fName:this.editData.name,
      mobileNumber:this.editData.mobileNo1,
      assignedRole:parseInt(this.editData.userType) ,
    })
    this.userForm.controls['assignedVehicle'].setValue(vehicleNumber);
    }

    
  }
  getformControls(){
    this.userForm = this.fb.group({
      fName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      assignedVehicle: ['', Validators.required],
      assignedRole: ['', Validators.required],
    })
    this.roleForm = this.fb.group({
      roleName: [],
      topping: [],
    })
  }
  getVehicleData() {
    let vhlData=this.master.getVehicleListData();
    vhlData.subscribe({
      next:(response: any) => {
        this.vehicleDtArr = response;
      }
    }),
    (error: any) => {
      this.error.handelError(error.status);
    }
  }
  getRoleData() {
    this.apiCall.setHttp('get', 'userdetail/getallSubusertype_usertype?UserTypeId=1'+'&Subusertypeid='+this.userData[0]?.subUserTypeId, true, false, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.roleDtArr = res.responseData;
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      }
    },
    (error: any) => { this.error.handelError(error.status) });
  }

  removeSelectedValue(Vehicles:any){
    const index: number = this.userForm.value.assignedVehicle.indexOf(Vehicles);
    let selectedVehicleObj= this.userForm.value.assignedVehicle;
    selectedVehicleObj.splice(index, 1);
    this.userForm.controls['assignedVehicle'].setValue(selectedVehicleObj);
  }
   
  submitUser(){
    this.userformSubmitted=true;
    if(this.userForm.invalid){ 
      return;
    }else{
    const userFormData=this.userForm.value;
      let vehiclearray:any=[];
      for(let i=0;i< userFormData.assignedVehicle.length ; i++){
        vehiclearray.push(this.vehicleDtArr.find(x=>x.vehicleRegistrationNo==userFormData?.assignedVehicle[i]));
      }
      if (this.editFlag) {
        const filtervehicles = this.editData.vehicle.filter((x:any) => {
          return vehiclearray.some((f:any) => {
            return f.vehicleRegistrationNo == x.vehicleNumber ;
          });
        });
        this.filterData=[];
        this.filterData = filtervehicles;
        this.filterData.map((x: any) => {
          const index = this.editData.vehicle.findIndex((xx: any) => xx.vehicleNumber == x.vehicleNumber);
          this.editData.vehicle.splice(index, 1);
        })
        vehiclearray.map((x:any)=>{
          x.isAssigned = 1,
          x.userId=this.editFlag==false?0:this.editData.id;
        })
        let vehicleunassignedData:any=[];
        this.editData.vehicle.map((x:any)=>{
          const vehicleunassigned = {
            id:x.vehicleId,
            isAssigned:0,
            userId:this.editData.id,
            vehicleRegistrationNo:x.vehicleNumber

          }
          vehicleunassignedData.push(vehicleunassigned)
        })
        vehiclearray=vehiclearray.concat(vehicleunassignedData);

      }
      if(!this.editFlag){
        vehiclearray.map((x:any)=>{
          x.isAssigned = 1
          x.userId=this.editFlag==false?0:this.editData.id;
        })
      }
      
    const obj = {
      "id": this.editFlag==false?0: this.editData.id ,
      "name": userFormData.fName,
      "userAddress": "",
      "districtId": 0,
      "talukaId": 0,
      "mobileNo1": userFormData.mobileNumber,
      "userName": userFormData.mobileNumber,
      "user_Type": userFormData.assignedRole,
      "emailId": "",
      "acivationKey1": "",
      "createdBy": this.userData[0]?.id,
      "flag": this.editFlag==false?"I":'U',
      "vehicleOwnerId": this.userData[0]?.vehicleOwnerId,
      "vehicle": vehiclearray
    }
    this.spinner.show();
    this.apiCall.setHttp('post', 'userdetail/save-update-user-for-tracking', true, obj, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          if (res.responseData.responseData1[0].isSuccess) {
            this.roleDtArr = res.responseData;
            this.onNoClick('Yes');
            this.commonMethods.snackBar(res.responseData.responseData1[0].msg,0);
          } else {
            this.commonMethods.snackBar(res.responseData.responseData1[0].msg,0);
          }

        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
        this.editFlag = false;
      }
    },(error: any) => { 
      this.spinner.hide();
      this.editFlag=false;
      this.error.handelError(error.status)
     } );
  }

  }
  onNoClick(flag: any): void {
    // if (flag == 'Yes') {
    //  let obj = { flag: 'Yes' };
    //  this.dialogRef.close(obj);
    // } else {
      this.dialogRef.close(flag);
    //}
  }
}
