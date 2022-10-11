import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, filter, Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ModalsComponent } from 'src/app/dialogs/driver_modals/modals.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
  driverRegForm !: FormGroup;
  searchDriverForm!: FormGroup;
  driverDetails: object | any;
  editId: number = 0;
  searchHideShow: boolean = true;
  clearHideShow: boolean = false;
  buttonFlag: boolean = true;
  dobDisabled: boolean = true;
  buttonText: string = 'Save';
  totalItem!: number;
  paginationNo: number = 1;
  pageSize: number = 10;
  highLightRow!: string;
  date: any = new Date();
  maxDate = new Date();
  subscription!: Subscription;
  checkArray = new Array();
  flagArray = new Array();
  deleteBtn: boolean = false;
  selectAll!: boolean;
  constructor(private fb: FormBuilder,
    public validation: ValidationService,
    public config: ConfigService,
    private apiCall: ApiCallService,
    private spinner: NgxSpinnerService,
    private error: ErrorsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getRegFormData();
    this.getDriverDetails();
  }

  ngAfterViewInit() {
    let formValue = this.searchDriverForm.valueChanges;
    formValue.pipe(
      filter(() => this.searchDriverForm.valid),
      debounceTime(1000),
      distinctUntilChanged())
      .subscribe(() => {
        this.paginationNo = 1;
        this.getDriverDetails();
        this.searchHideShow = false;
      this.clearHideShow = true;
      })
  }
  //--------------------------------------------------------form Controls----------------------------------------------------
  getRegFormData() {
    this.searchDriverForm = this.fb.group({
      driverName: ['', Validators.compose([Validators.required, Validators.maxLength(15)])]
    })
  }
  // -----------------------------------------------Driver Details----------------------------------------------------------
  getDriverDetails(flag?: any) {
    this.checkArray=[];
    if (flag == 'search') {
      this.searchHideShow = false;
      this.clearHideShow = true;
    }
    this.apiCall.setHttp('get', 'driver/get-driver?searchText=' + this.searchDriverForm.value.driverName + '&pageno=' + this.paginationNo + '&rowperPage=' + this.pageSize, true, false, false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((res: any) => {
      if (res.statusCode === "200") {
        this.driverDetails = res.responseData.responseData1;
        this.driverDetails.forEach((ele: any) => {
          ele['isBlockFlag'] = false;
          ele['isChecked'] = false;
          if (ele.isBlock) {
            ele.isBlockFlag = true;
          }
        });
        this.totalItem = res.responseData.responseData2.totalRecords;
      } else {
        this.driverDetails = [];
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }

  clearSearchData() {
    this.searchDriverForm.controls['driverName'].setValue('');
    this.getDriverDetails();
    this.searchHideShow = true;
    this.clearHideShow = false;
  }

  // -----------------------------------------------comfirmation module----------------------------------------------------------
  confirmationDialog(flag: boolean, label: string, event?: any, drData?: any) {
    this.selectAll ? this.uncheckAllDriver():'';
    let obj: any = ConfigService.dialogObj;
    if (label == 'status') {
      obj['p1'] = flag ? 'Are you sure you want to Block Driver?' : 'Are you sure you want to Unblock Driver?';
      obj['cardTitle'] = flag ? 'Block Driver' : 'Unblock Driver';
      obj['successBtnText'] = flag ? 'Block' : 'Unblock';
      obj['cancelBtnText'] = 'Cancel';
    } else if (label == 'delete') {
      obj['p1'] = 'Are you sure you want to delete this record';
      obj['cardTitle'] = 'Delete';
      obj['successBtnText'] = 'Delete';
      obj['cancelBtnText'] = 'Cancel';
    }

    const dialog = this.dialog.open(ConfirmationComponent, {
      width: this.config.dialogBoxWidth[0],
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      if (res == 'Yes' && label == 'status') {
        this.blobkUnblockDriver(event, drData);
      } else if (res == 'Yes' && label == 'delete') {
        console.log('delete');
        this.removeDriverData();
      }
    }
    )
  }
  // -----------------------------------------Block/Unblock Driver--------------------------------------------------------------
  blobkUnblockDriver(event: any, drData: any) {
    console.log(event.checked);
    console.log(drData)
    let param = {
      "id": 0,
      "driverId": drData.driverId,
      "blockedDate": this.date.toISOString(),
      "blockBy": 0,
      "isBlock": event.checked ? 1 : 0
    }
    this.spinner.show();
    this.apiCall.setHttp('put', 'driver/Block-Unblock-Driver_1', true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        this.error.handelError(response.statusCode);
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      })
  }
  
  // ----------------------------------------------Delete Record----------------------------------------------------------------

  removeDriver(event: any,driverId:number) {
   for (var i = 0; i < this.driverDetails.length; i++) {
      if (driverId != 0) {
        this.selectAll = false;
        if (this.driverDetails[i].driverId == driverId) {
          this.driverDetails[i].checked = event.checked;
        }
      } else {
        this.driverDetails[i].checked = event.checked;
      }
    }
    this.checkArray = [];
    this.checkArray = this.driverDetails.filter((x: any) => x.checked == true);
    this.selectAll = this.driverDetails.length == this.checkArray.length ? true : false;
  } 

  uncheckAllDriver(){
    this.selectAll = false;
    this.driverDetails.map((ele:any)=>{
      ele.checked = false
      this.checkArray=[];
    })
  }
  removeDriverData() {
    this.deleteBtn = false;
    let param = new Array();
    for (let i = 0; i < this.driverDetails.length; i++) {
      if (this.driverDetails[i].isChecked == true) {
        let array = {
          "driverId": this.driverDetails[i].driverId,
          "isDeleted": 1
        }
        param.push(array);
      }
    }
    this.spinner.show();
    this.apiCall.setHttp('delete', 'driver/Delete-Driver', true, param, false, 'fleetExpressBaseUrl');
    // this.subscription = 
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.checkArray=[];
        this.spinner.hide();
        this.getDriverDetails();
      }
    },
      (error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status);
      })
  }

  onPagintion(pageNo: any) {
    this.selectAll=false;
    this.paginationNo = pageNo;
    this.getDriverDetails();
  }
  get f() { return this.driverRegForm.controls };

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  commonModule(label: string,driverData?:any) {
    this.selectAll ? this.uncheckAllDriver():'';
   let obj: any;
   label=='edit'?(obj=driverData,this.highLightRow=driverData?.driverId):obj='';
    const dialog = this.dialog.open(ModalsComponent, {
      width: '900px',
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      this.highLightRow='';
      console.log(res)
      if(res=='add'){
        this.getDriverDetails();
      }
    }
    )
  }
}
