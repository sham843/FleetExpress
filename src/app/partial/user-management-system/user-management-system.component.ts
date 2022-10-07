import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-user-management-system',
  templateUrl: './user-management-system.component.html',
  styleUrls: ['./user-management-system.component.scss']
})
export class UserManagementSystemComponent implements OnInit {
  VehicleDtArr= new Array();
  showTab !:string;
  tableLables= new Array();
  userForm!:FormGroup;
  roleForm!:FormGroup;
  subscription!: Subscription;
  userData= new Array();
  roleDtArr= new Array();
  userformSubmitted:boolean=false;
  userTableData= new Array();
  roleTableData= new Array();
  selectAll!: boolean;
  selectedTableData= new Array();
  editFlag:boolean=false
  editData !: object| any;
  currentPage:number = 1;
  itemsPerPage:number = 10;
  pageSize !:number;
  pageNumber: number=1;
  totalUserTableData: number=0;
  searchContent = new FormControl();
  filterData = new  Array();
  highlightRow !:number;
  get user() { return this.userForm.controls };
  get role() { return this.roleForm.controls };
  constructor(private apiCall:ApiCallService,
    private fb:FormBuilder,
    private commonMethods:CommonMethodsService,
    public validationService:ValidationService,
    private error:ErrorsService,
    private spinner:NgxSpinnerService,
    private modalService:NgbModal,
    private dialog:MatDialog,
    private webStorage:WebStorageService,
    private master:MasterService) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.userData.push(this.webStorage.getUser());
    this.getVehicleData();
    this.getRoleData();
    this.selectedTab('users');
    this.getUserTableData();
    this.getRoleTableData();
  }
  ngAfterViewInit(){
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(()=>{
     this.getUserTableData();
    });
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
    this.selectedTableData=[];
    this.selectAll=false;
    this.getUserTableData();
    this.getRoleTableData();
  }
  clickedRow(index:any){
    this.highlightRow=index;
  }
  getVehicleData() {
    let vhlData=this.master.getVehicleListData();
    vhlData.subscribe({
      next:(response: any) => {
        this.VehicleDtArr = response;
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
  getUserTableData(){
    this.totalUserTableData=0;
    this.userTableData=[];
    this.apiCall.setHttp('get', 'userdetail/get-user-list?vehicleOwnerId='+this.userData[0]?.vehicleOwnerId+'&Subusertypeid=&SearchText='+this.searchContent.value+'&District=0&TalukaId=0&NoPage='+ (!this.searchContent.value?this.pageNumber:0)+'&RowsPerPage='+(!this.searchContent.value?10:0), true, false, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.responseData1.map((x: any) => {
            x.isblocked = x.isblocked == 1 ? true : false;
          })
          this.userTableData = res.responseData.responseData1;
          this.totalUserTableData = res.responseData.responseData2.totalRecords;
        } else {
            this.userTableData=[];
            this.totalUserTableData=0;
            // this.error.handelError(res.statusCode);
        }
      },
      error: ((error: any) => { this.userTableData=[]; this.error.handelError(error.status) })
    });
    
  }
  getRoleTableData(){
    this.apiCall.setHttp('get', 'userrights/getUserRights?UserTypeId=1&SubUserTypeId=10', true, false, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.roleTableData = res.responseData;
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      },
    },(error: any) => { this.error.handelError(error.status) });
  }
  selectedTab(tab:any){
    this.showTab=tab;
    if(tab=='users'){
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'NAME'},{id:3,label:'MOBILE NUMBER'},{id:4,label:'ROLE'},{id:5,label:'BLOCK/UNBLOCK'},{id:6,label:'ACTION'}]
    }else{
      this.tableLables=[{id:1,label:'SR.NO'},{id:2,label:'ROLE NAME'},{id:3,label:'ASSIGN RESPONSIBILITIES'},{id:4,label:'ACTION'}]
    }
    this.searchContent.reset();
  }
  removeSelectedValue(Vehicles:any){
    const index: number = this.userForm.value.assignedVehicle.indexOf(Vehicles);
    let selectedVehicleObj= this.userForm.value.assignedVehicle;
    selectedVehicleObj.splice(index, 1);
    this.userForm.controls['assignedVehicle'].setValue(selectedVehicleObj);
  }
  open(modal:any) {
    this.modalService.open(modal, { size: 'lg' ,centered: true });
  }
  
  submitUser(){
    this.userformSubmitted=true;
    if(this.userForm.invalid){ 
      return;
    }else{
    const userFormData=this.userForm.value;
      let vehiclearray:any=[];
      for(let i=0;i< userFormData.assignedVehicle.length ; i++){
        vehiclearray.push(this.VehicleDtArr.find(x=>x.vehicleRegistrationNo==userFormData?.assignedVehicle[i]));
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
            this.getUserTableData();
            this.commonMethods.snackBar(res.responseData.responseData1[0].msg,0);
          } else {
            this.commonMethods.snackBar(res.responseData.responseData1[0].msg,0);
          }

        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
        this.modalClose();
        this.editFlag = false;
      }
    },(error: any) => { 
      this.spinner.hide();
      this.editFlag=false;
      this.modalClose();
      this.error.handelError(error.status)
     } );
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
    var vehicleNumber= new Array();
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
      disableClose: this.apiCall.disableCloseFlag,
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
      blockBy: this.userData[0].id,
      isBlock: value==false?0:1,
      remark: ""
    }
    this.apiCall.setHttp('put', 'userdetail/Block-Unblock-User_1', true, obj, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.commonMethods.snackBar(res.responseData,0);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.responseData)
          }
        }
      }
    }, (error: any) => {
      this.spinner.hide();
      this.error.handelError(error.status)
    })
  }

  modalClose(){
    this.userForm.reset();
    this.roleForm.reset();
    this.editFlag=false;
    this.modalService.dismissAll();
  }

  DeleteUserData() {
    this.spinner.show();
    let objDeleteData= new Array();
    for(let i=0; i < this.selectedTableData.length; i++){
      const obj = {
        id: this.selectedTableData[i].id,
        isDeleted: 1
      }
      objDeleteData.push(obj)
    }
    this.apiCall.setHttp('DELETE', 'userdetail/Delete-User', true, objDeleteData, false, 'fleetExpressBaseUrl');
    // this.subscription =
     this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.commonMethods.snackBar(res.statusMessage,0);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusMessage)
          }
        }
      }
    },(error: any) => {
      this.spinner.hide();
     this.error.handelError(error.status) ;
    });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 
