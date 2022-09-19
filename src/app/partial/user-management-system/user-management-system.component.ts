import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormControl, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';

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
  tableLables:any[]=[];
  userForm!:FormGroup;
  roleForm!:FormGroup;
  subscription!: Subscription;
  userData:any;
  roleDtArr:any[]=[];
  userformSubmitted:boolean=false;
  userTableData:any[]=[];
  roleTableData:any[]=[];
  selectAll: any;
  selectedTableData:any[]=[];
  editFlag:boolean=false
  editData: any;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize: any;
  pageNumber: number=1;
  totalUserTableData: number=0;
  
  get user() { return this.userForm.controls };
  get role() { return this.roleForm.controls };
  constructor(private common:CommanService,
    private toastrService:ToastrService,
    private fb:FormBuilder,
    public validationService:ValidationService,
    private error:ErrorsService,
    private spinner:NgxSpinnerService,
    private modalService:NgbModal,
    private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.userData=this.common.getUser();
    this.getVehicleData();
    this.getRoleData();
    this.selectedTab('users');
    this.getUserTableData();
    this.getRoleTableData();
  }
  getRegFormData() {
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
  public onPageChange(pageNum: number): void {
    this.pageNumber=pageNum;
    this.pageSize = this.itemsPerPage * (pageNum - 1);
    this.getUserTableData();
    this.getRoleTableData();
  }
  getVehicleData() {
    this.common.setHttp('get', 'userdetail/get-vehicle-list?vehicleOwnerId='+this.common.getVehicleOwnerId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.VehicleDtArr = res.responseData;
        } else {
          if (res.statusCode != "404") {}
        }
      },
      error: ((error: any) => { this.error.handelError(error.statusCode) })
    });
  }
  getRoleData() {
    this.common.setHttp('get', 'userdetail/getallSubusertype_usertype?UserTypeId=1'+'&Subusertypeid='+this.userData.subUserTypeId, true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.roleDtArr = res.responseData;
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.statusCode) })
    });
  }
  getUserTableData(){
    this.common.setHttp('get', 'userdetail/get-user-list?vehicleOwnerId='+this.userData.vehicleOwnerId+'&Subusertypeid=&SearchText=&District=0&TalukaId=0&NoPage='+this.pageNumber+'&RowsPerPage=10', true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.responseData1.map((x:any)=>{
            x.isblocked=x.isblocked==1?true:false;
          })
          this.userTableData = res.responseData.responseData1;
          this.totalUserTableData=res.responseData.responseData2.totalRecords;
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.statusCode) })
    });
  }
  getRoleTableData(){
    this.common.setHttp('get', 'userrights/getUserRights?UserTypeId=1&SubUserTypeId=10', true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.roleTableData = res.responseData;
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.statusCode) })
    });
  }
  selectedTab(tab:any){
    this.showTab=tab;
    if(tab=='users'){
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'NAME'},{id:3,label:'MOBILE NUMBER'},{id:4,label:'ROLE'},{id:5,label:'BLOCK/UNBLOCK'},{id:6,label:'ACTION'}]
    }else{
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'ROLE NAME'},{id:3,label:'ASSIGN RESPONSIBILITIES'},{id:4,label:'ACTION'}]
    }
  }
  removeSelectedValue(Vehicles:any){
    const index: number = this.userForm.value.assignedVehicle.indexOf(Vehicles);
    let selectedVehicleObj= this.userForm.value.assignedVehicle;
    selectedVehicleObj.splice(index, 1);
    this.userForm.controls['assignedVehicle'].setValue(selectedVehicleObj);
  }
  open(modal:any) {
    this.modalService.open(modal, { size: 'lg' });
  }
  
  submitUser(){
    this.userformSubmitted=true;
    if(this.userForm.invalid){ 
      return;
    }else{
    const userFormData=this.userForm.value;
      let vehiclearray=[];
      for(let i=0;i< userFormData.assignedVehicle.length ; i++){
        vehiclearray.push(this.VehicleDtArr.find(x=>x.vehicleRegistrationNo==userFormData?.assignedVehicle[i]));
      }
      vehiclearray.map((x:any)=>{
        x.isAssigned=1
      })
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
      "createdBy": this.userData.id,
      "flag": this.editFlag==false?"I":'U',
      "vehicleOwnerId": this.userData.vehicleOwnerId,
      "vehicle": vehiclearray
    }
    this.spinner.show();
    this.common.setHttp('post', 'userdetail/save-update-user-for-tracking', true, obj, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          
          this.roleDtArr = res.responseData;
          this.getUserTableData();
          this.toastrService.success(res.statusMessage);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
        this.modalClose();
        this.editFlag=false;
      },
      error: ((error: any) => { 
        this.spinner.hide();
        this.editFlag=false;
        this.modalClose();
        this.error.handelError(error.statusCode)
       } )
      
    });
  }

  }
  selectUsers(event: any, id: any){
    for(var i = 0 ; i < this.userTableData.length; i++){
      if(id != 0) {
        this.selectAll = false;
        if(this.userTableData[i].id == id){
          this.userTableData[i].checked = event.checked;
        }
      }else{
        this.userTableData[i].checked = event.checked;
      }
    }
    this.selectedTableData = [];
    this.selectedTableData = this.userTableData.filter((x: any) => x.checked == true);
    this.selectAll =this.userTableData.length == this.selectedTableData.length ?  true : false;
   
  }

  onEdit(editvalues:any,modal:any){
    this.editFlag=true;
    this.editData=editvalues;
    this.getVehicleData();
    this.getRoleData();
    var vehicleNumber:any[]=[];
    editvalues.vehicle.forEach((element:any) => {
      vehicleNumber.push(element.vehicleNumber)
    });
    this.userForm.patchValue({
      fName:editvalues.name,
      mobileNumber:editvalues.mobileNo1,
      assignedRole:parseInt(editvalues.userType) ,
    })
    this.userForm.controls['assignedVehicle'].setValue(vehicleNumber);
    this.open(modal);
  }

  userBlockUnBlockModal(element: any, event: any) {
    let Title: string, dialogText: string;
    event == true ? Title = 'User Block' : Title = 'User Unblock';
    event == true ? dialogText = 'Do you want to User Block ?' : dialogText = 'Do you want to User Unblock ?';
    const dialogRef = this.dialog.open(BlockUnblockComponent, {
      width: '340px',
      data: { p1: dialogText, p2: '', cardTitle: Title, successBtnText: 'Yes', dialogIcon: 'done_outline', cancelBtnText: 'No' },
      disableClose: this.common.disableCloseFlag,
    });
    dialogRef.afterClosed().subscribe((res: any) => {     
        res == 'Yes' ?   this.checkBlock(element, event): element.isBlock = !event;   
    });
  }

  checkBlock(rowData:any,value:any){ 
    this.spinner.show();
    const obj={
      userId:rowData.id,
      id: 0,
      blockedDate: new Date().toISOString(),
      blockBy: this.userData.id,
      isBlock: value==false?0:1,
      remark: ""
    }
    this.common.setHttp('post', 'userdetail/Block-Unblock-User_1?', true, obj, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.toastrService.success(res.responseData);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.responseData)
          }
        }
      },
      error: ((error: any) => { 
        this.spinner.hide();
       } )
    });
  }

  modalClose(){
    this.userForm.reset();
    this.roleForm.reset();
    this.editFlag=false;
    this.modalService.dismissAll();
  }

  DeleteUserData() {
    this.spinner.show();
    let objDeleteData:any[]=[];
    for(let i=0; i < this.selectedTableData.length; i++){
      const obj = {
        id: this.selectedTableData[i].id,
        isDeleted: 1
      }
      objDeleteData.push(obj)
    }
    this.common.setHttp('POST', 'userdetail/Delete-User', true, objDeleteData, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.toastrService.success(res.statusMessage);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusMessage)
          }
        }
      },
      error: ((error: any) => {
        this.spinner.hide();
      })

    });
  }
} 
