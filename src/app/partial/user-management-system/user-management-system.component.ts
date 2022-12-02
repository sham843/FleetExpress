import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { AddUpdateUserComponent } from './add-update-user/add-update-user.component';

@Component({
  selector: 'app-user-management-system',
  templateUrl: './user-management-system.component.html',
  styleUrls: ['./user-management-system.component.scss']
})
export class UserManagementSystemComponent implements OnInit {
  VehicleDtArr = new Array();
  showTab !: string;
  tableLables = new Array();
  subscription!: Subscription;
  userData = new Array();
  roleDtArr = new Array();
  userformSubmitted: boolean = false;
  userTableData = new Array();
  roleTableData = new Array();
  selectAll!: boolean;
  selectAllRoles!: boolean;
  selectedTableData = new Array();
  selectedRoleTableData = new Array();
  totalRoleTableData: any;
  editFlag: boolean = false
  totalUserTableData: number = 0;
  searchContent = new FormControl('');
  highlightRowindex !: number | string;
  pageNumber: number = 1;
  pageSize: number = 10;
  roleCheckArray = new Array();
  constructor(private apiCall: ApiCallService,
    private commonMethods: CommonMethodsService,
    public validationService: ValidationService,
    private error: ErrorsService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog,
    private webStorage: WebStorageService,
    private configService: ConfigService) { }

  ngOnInit(): void {
    this.userData.push(this.webStorage.getUser());
    this.selectedTab('users');
  }

  //---------------------------------------------------Common methods for both user and role-------------------------------------------------------------------------
  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.pageNumber = 1;
      this.showTab == 'role' ? this.getRoleTableData() : this.getUserTableData();
    });
  }
  onPagintion(pageNo: any, flag: any) {
    this.pageNumber = pageNo;
    this.selectedTableData = [];
    flag == 'user' ? this.getUserTableData() : this.getRoleTableData();
  }

  selectedTab(tab: any) {
    if (tab == 'users') {
      this.tableLables = [{ id: 1, label: 'SR.NO' }, { id: 2, label: 'NAME' }, { id: 3, label: 'MOBILE NUMBER' }, { id: 4, label: 'ROLE' }, { id: 5, label: 'UNBLOCK/BLOCK' }, { id: 6, label: 'ACTION' }]
      this.showTab != tab ? this.getUserTableData() : '';
    } else {
      this.tableLables = [{ id: 1, label: 'SR.NO' }, { id: 2, label: 'ROLE NAME' }, { id: 4, label: 'ACTION' }]
      this.showTab != tab ? this.getRoleTableData() : '';
    }
    this.showTab = tab;
    this.pageNumber = 1;
    this.searchContent.reset();
  }
  // -----------------------------------------------start user section-------------------------------------------------------------------
  // -----------------------------------------------get user data--------------------------------------------------------------------
  getUserTableData() {
    this.totalUserTableData = 0;
    this.userTableData = [];
    this.apiCall.setHttp('get', 'userdetail/get-user-list?vehicleOwnerId=' + this.userData[0]?.vehicleOwnerId + '&Subusertypeid=&SearchText=' + this.searchContent.value + '&District=0&TalukaId=0&NoPage=' + (!this.searchContent.value ? this.pageNumber : 0) + '&RowsPerPage=' + (!this.searchContent.value ? 10 : 0), true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.responseData1.map((x: any) => {
            x.isblocked = x.isblocked == 1 ? true : false;
          })
          this.userTableData = res.responseData.responseData1;
          this.totalUserTableData = res.responseData.responseData2.totalRecords;
        } else {
          this.userTableData = [];
          this.totalUserTableData = 0;
        }
      },
      error: ((error: any) => { this.userTableData = []; this.error.handelError(error.status) })
    });
  }
  selectUsers(event: any, id: any) {
    for (var i = 0; i < this.userTableData.length; i++) {
      if (id != 0) {
        this.selectAll = false;
        if (this.userTableData[i].id == id) {
          this.userTableData[i].checked = event.checked;
        }
      } else {
        this.userTableData[i].checked = event.checked;
      }
    }
    this.selectedTableData = [];
    this.selectedTableData = this.userTableData.filter((x: any) => x.checked == true);
    this.selectAll = this.userTableData.length == this.selectedTableData.length ? true : false;
  }

  // --------------------------------------block unblock user--------------------------------------------------------------------
  checkBlock(rowData: any, value: any) {
    const obj = {
      userId: rowData.id,
      id: 0,
      blockedDate: new Date().toISOString(),
      blockBy: this.userData[0].id,
      isBlock: value == false ? 0 : 1,
      remark: ""
    }
    this.apiCall.setHttp('put', 'userdetail/Block-Unblock-User_1', true, obj, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.commonMethods.snackBar(res.responseData, 0);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.responseData)
          }
        }
      }
    }, (error: any) => {
      this.error.handelError(error.status)
    })
  }
  // -----------------------------------------------------delete user------------------------------------------------------------
  DeleteUserData() {
    this.spinner.show();
    let objDeleteData = new Array();
    this.selectAll = false;
    for (let i = 0; i < this.selectedTableData.length; i++) {
      const obj = {
        id: this.selectedTableData[i].id,
        isDeleted: 1
      }
      objDeleteData.push(obj)
    }
    this.apiCall.setHttp('DELETE', 'userdetail/Delete-User', true, objDeleteData, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          this.getUserTableData();
          this.selectedTableData = [];
          this.commonMethods.snackBar(res.statusMessage, 0);
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusMessage)
          }
        }
      }
    }, (error: any) => {
      this.spinner.hide();
      this.error.handelError(error.status);
    });
  }

  uncheckAllUser() {
    this.selectAll = false;
    this.userTableData.map((ele: any) => {
      ele.checked = false
    })
  }
  // ----------------------------------------------------------end user section--------------------------------------------------------
  // -------------------------------------------------------Start role section----------------------------------------------------------
  getRoleTableData() {
    this.roleCheckArray = [];
    this.apiCall.setHttp('get', 'Roles/getRolesList-Table-View?pageNo=' + this.pageNumber + '&pageSize=' + this.pageSize + '&searchText=' + (this.searchContent.value || ''), true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.roleTableData = res.responseData.responseData1;
          this.totalRoleTableData = res.responseData.responseData2.totalRecords;
          // 
        } else {
          if (res.statusCode != "404") {
            this.error.handelError(res.statusCode)
          }
        }
      },
    }, (error: any) => { this.error.handelError(error.status) });
  }
  selectRoles(event: any, id: any) {
    for (var i = 0; i < this.roleTableData.length; i++) {
      if (id != 0) {
        this.selectAllRoles = false;
        if (this.roleTableData[i].id == id) {
          this.roleTableData[i].checked = event.checked;
        }
      } else {
        this.roleTableData[i].checked = event.checked;
      }
    }
    this.selectedRoleTableData = [];
    this.selectedRoleTableData = this.roleTableData.filter((x: any) => x.checked == true);
    this.selectAllRoles = this.roleTableData.length == this.selectedRoleTableData.length ? true : false;

  }
  removeCheckRole(event: any, driverId: number) {
    for (var i = 0; i < this.roleTableData.length; i++) {
      if (driverId != 0) {
        this.selectAllRoles = false;
        if (this.roleTableData[i].driverId == driverId) {
          this.roleTableData[i].checked = event.checked;
        }
      } else {
        this.roleTableData[i].checked = event.checked;
      }
    }
    this.roleCheckArray = [];
    this.roleCheckArray = this.roleTableData.filter((x: any) => x.checked == true);
    this.selectAllRoles = this.roleTableData.length == this.roleCheckArray.length ? true : false;
  }

  uncheckAllRole() {
    this.selectAllRoles = false;
    this.roleTableData.map((ele: any) => {
      ele.checked = false
      this.roleCheckArray = [];
    })
  }
  deleteRole() {
    let param = new Array();
    this.roleCheckArray.find((ele: any) => {
      let obj =  {
        "id": ele.id,
        "roleName": ele.roleName,
        "isDeleted": true,
        "userId": this.webStorage.getUserId(),
        "responsiblitiesLists": [
          {
            "id": 0,
            "responsiblities": "",
            "isResponsible": true
          }
        ]
      }
      param.push(obj);
    });
    this.spinner.show();
    this.apiCall.setHttp('delete', 'Roles/delete-roles-and-responsiblity',true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.getRoleTableData();
        this.uncheckAllRole();
        this.spinner.hide();
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status);
      })
  }
  //-------------------------------------------------------End role section-----------------------------------------------------------------

  confirmationDialog(flag: boolean, label: string, selectedRowObj?: any, tabName?: any) {   //blobk-unblock & delete modal
    label != 'delete'?this.selectAllRoles || this.roleCheckArray ? (this.uncheckAllRole(), this.roleCheckArray = []) : '':'';
    let obj: any = ConfigService.dialogObj;
    if (label == 'status') {
      obj['p1'] = 'Are you sure you want to ' + (flag ? 'block' : 'unblock') + ' user?';
      obj['cardTitle'] = flag ? 'User Block' : 'User Unblock';
      obj['successBtnText'] = flag ? 'Block' : 'Unblock';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {
      obj['p1'] = 'Are you sure you want to delete this record';
      obj['cardTitle'] = 'Delete';
      obj['successBtnText'] = 'Delete';
      obj['cancelBtnText'] = 'Cancel';
    }
    const dialog = this.dialog.open(ConfirmationComponent, {
      width: this.configService.dialogBoxWidth[0],
      data: obj,
      disableClose: this.configService.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(res => {
      if (res == 'Yes' && label == 'delete' && tabName == 'role') {
        this.deleteRole();
      }
      res == 'Yes' && label == 'delete' ? this.DeleteUserData() : '';
      res == 'Yes' && label == 'status' ? this.checkBlock(selectedRowObj, flag) : selectedRowObj.isBlock = !flag;;
    })
  }


  addUpdateDialog(status: string, selectedObj?: any) {  
  this.selectAllRoles || this.roleCheckArray ? (this.uncheckAllRole(), this.roleCheckArray = []) : '';               // create and update User & role modal
    status == 'user' ? (this.selectAll || this.selectedTableData.length ? (this.uncheckAllUser(), this.selectedTableData = []) : '') : this.selectAllRoles || this.selectedRoleTableData.length ? (this.uncheckAllUser(), this.roleTableData = []) : '';
    this.highlightRowindex = selectedObj?.id;
    let obj: any = ConfigService.dialogObj;
    obj['cardTitle'] = status == 'user' ? (!selectedObj ? 'Create User' : 'Update User') : (!selectedObj ? 'Create Role' : 'Update Role');
    obj['seletedTab'] = status;
    obj['cancelBtnText'] = 'Cancel';
    obj['submitBtnText'] = !selectedObj ? 'Submit' : 'Update';
    obj['selectedDataObj'] =selectedObj;
    const dialog = this.dialog.open(AddUpdateUserComponent, {
      width: this.configService.dialogBoxWidth[2],
      data: obj,
      disableClose: this.configService.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(res => {
      this.highlightRowindex = '';
      if (res == 'add' && status == 'role') {
        this.getRoleTableData();
      }
      else{
        res == 'Yes' ? this.getUserTableData() : '';
      }
    })
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 
