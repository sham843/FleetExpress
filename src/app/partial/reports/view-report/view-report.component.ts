import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
// import { ErrorsService } from 'src/app/services/errors.service';
import { ExcelPdfDownloadedService } from 'src/app/services/excel-pdf-downloaded.service';
import { SharedService } from 'src/app/services/shared.service';
import { WebStorageService } from 'src/app/services/web-storage.service';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss']
})
export class ViewReportComponent implements OnInit {
  remark = new FormControl('');
  dialogData: any;
  fromDate: any;
  toDate: any;
  currentDate: any;
  header=new Array();
  key: any;
  dataSource:any;
  displayedColumns=new Array();
  pageNumber: number = 1;
  pageSize: number = 10;
  totalItem!:number;
  reportResponseData=new Array();
  colunms=new Array();
  constructor(public dialogRef: MatDialogRef<ViewReportComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datepipe: DatePipe,
    private excelService:ExcelPdfDownloadedService,
    private apiCall: ApiCallService,
    private sharedService: SharedService,
    private webStorage: WebStorageService,
    // private commonMethods: CommonMethodsService,
    private spinner:NgxSpinnerService,
    // private error:ErrorsService,
    ) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.fromDate = this.datepipe.transform(this.dialogData.fromDate, 'dd/MM/yyyy HH:mm:ss a');
    this.toDate = this.datepipe.transform(this.dialogData.toDate, 'dd/MM/yyyy HH:mm:ss a');
    this.currentDate = this.datepipe.transform(new Date, 'dd/MM/yyyy HH:mm:ss a');
    this.searchTableData()
  }
  onPagintion(pageNo: any) {
    this.pageNumber = pageNo;
    this.searchTableData();
  }

  searchTableData(){
    this.spinner.show();
    this.apiCall.setHttp('get', this.dialogData.url + this.dialogData.queryString+'&UserId=' + this.webStorage.getUserId()+'&DeviceId= 0' + '&VehicleOwnerId=' + this.webStorage.getVehicleOwnerId()  + '&pageno=' + this.pageNumber + '&rowsperpage=' + this.pageSize, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((responseData: any) => {
        if ((responseData.statusCode === "200") && responseData.responseData.data) {
          if (this.dialogData.pageNames != 'Summary Report') {
            let resp: any = this.sharedService.getAddressBylatLong(1, responseData.responseData.data, 10);
            this.reportResponseData = resp;
            this.totalItem=responseData.responseData.totalCount;
          } else {
            this.reportResponseData.push(responseData.responseData);
          }
        setTimeout(()=>{                      // <<<---using ()=> syntax   
          this.viewReport();
      }, 2000);
       
        }
        else { 
          this.reportResponseData=[];
          this.spinner.hide()    
          // this.commonMethods.snackBar(responseData.statusMessage, 0);
        }
      },
        () => { 
          this.reportResponseData=[];
          this.spinner.hide()    
          // this.error.handelError(error.status);
        })
  }
  viewReport() {
    let vehicleType: any;
    this.spinner.hide()   
    this.dialogData.vehicleList.find((ele: any) => {
      if (this.dialogData.VehicleNumber == ele.vehicleRegistrationNo) {
        vehicleType = ele.vehicleType;
      }
      this.dialogData.vehicleType=vehicleType;
    });
    this.reportResponseData.map((x: any) => {
      x.deviceDateTime?x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a'):'';
      x.startDateTime? x.startDateTime=this.datepipe.transform(x.startDateTime, 'dd-MM-YYYY hh:mm a'):'';
      x.endDateTime? x.endDateTime=this.datepipe.transform(x.endDateTime, 'dd-MM-YYYY hh:mm a'):'';
      x.dateOff? x.dateOff=this.datepipe.transform(x.dateOff, 'dd-MM-YYYY hh:mm a'):'';
      x.dateOn? x.dateOn=this.datepipe.transform(x.dateOn, 'dd-MM-YYYY hh:mm a'):'';
      x.fromDate? x.fromDate=this.datepipe.transform(x.fromDate, 'dd-MM-YYYY hh:mm a'):'';
      x.toDate? x.toDate=this.datepipe.transform(x.toDate, 'dd-MM-YYYY hh:mm a'):'';
      return x
    });
    this.getReportData();
  }

  getReportData() {
    if (this.dialogData.pageNames == "Speed Range Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Date", column:'deviceDateTime', status:true },{header:"Speed(Km/h)", column:'speed', status:true },{header:"Address", column:'address', status:true }];
    }
    else if (this.dialogData.pageNames == "Overspeed Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Date", column:'deviceDateTime', status:true },{header:"Speed(Km/h)", column:'speed', status:true },{header:"Address", column:'address', status:true }];
    }
    else if (this.dialogData.pageNames == "Address Report") {
    this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Date", column:'deviceDateTime', status:true },{header:"Address", column:'address', status:true }];
    }
    else if (this.dialogData.pageNames == "Trip Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Distance", column:'travelledDistance', status:true },{header:"Duration", column:'tripDurationInMins', status:true },
      {header:"Start Date", column:'startDateTime', status:true },{header:"Start Address", column:'startaddress', status:true },{header:"End Date", column:'endDateTime', status:true },{header:"End Address", column:'endaddress', status:true }];
    } 
    else if(this.dialogData.pageNames == "Stopage Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Vehicle no", column:'vehicleNo', status:true },{header:"From", column:'dateOn', status:true },{header:"To", column:'dateOff', status:true }
      ,{header:"Duration", column:'dateOff', status:true },{header:"To", column:'dateOff', status:true },{header:"STPL Device", column:'isMahaMiningDevice', status:true }];
    }
    else if(this.dialogData.pageNames == "Daywise Stoppage Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{ header:"Duration", column:'tripDurationInMins', status:true },{header:"Location", column:'address', status:true },{header:"From Time", column:'dateOn', status:true },{header:"To Time", column:'address', status:true },{header:"Duration", column:'tripDurationInMins', status:true }];
    }
     else if(this.dialogData.pageNames == "Day Distance Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Vehicle no", column:'vehicleNo', status:true },{header:"From Time", column:'fromDate', status:true },{header:"To Time", column:'toDate', status:true }
      ,{header:"Total Distance[KM]", column:'travelledDistance', status:true },{header:"STPL Device", column:'isMahaMiningDevice', status:true }];
    }
    else if(this.dialogData.pageNames == "Distance Report") {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Vehicle no", column:'vehicleNo', status:true },{header:"From Date Time", column:'fromDate', status:true },{header:"To Date Time", column:'toDate', status:true }
      ,{header:"Distance travelled [KM]", column:'travelledDistance', status:true },{header:"Time Taken [hr]", column:'runningTime', status:true },{header:"STPL Device", column:'isMahaMiningDevice', status:true }];
    }
    else {
      this.colunms = [{ header:"Sr No.", column:'rowNumber', status:true },{header:"Driver Name", column:'driverName', status:true },{header:"Mobile Number", column:'mobileNo', status:true },{header:"Veh.Type", column:'vehicleType', status:true }
      ,{header:"Running Time", column:'runningTime', status:true },{header:"Stoppage Time", column:'stoppageTime', status:true },{header:"Idle Time", column:'idleTime', status:true },{header:"Max Speed", column:'maxSpeed', status:true },{header:"Travelled Distance", column:'travelledDistance', status:true }];
    }
    this.dataSource=this.reportResponseData;
    this.selecteColumn()
  }
  selecteColumn(){
    this.displayedColumns=[];
    this.header=[];
    this.colunms.map((x:any)=>{
      if(x.status==true ){
        this.displayedColumns.push(x.column);
        this.header.push(x.header);
      }
    })
  }
  onDownloadPDF(){
    this.excelService.downLoadPdf(this.reportResponseData, this.dialogData.pageNames,this.dialogData,this.header,this.displayedColumns);
  }
  onDownloadExcel(){
    this.excelService.exportAsExcelFile(this.reportResponseData, this.dialogData, this.dialogData.pageNames, this.header, this.displayedColumns);
  }
  onNoClick(flag: any): void {
    if (this.data.inputType && flag == 'Yes') {
      if (this.CommonMethod.checkDataType(this.remark.value) == false) {
        this.CommonMethod.snackBar('Please Enter Remark', 1);
        return;
      }
      let obj = { remark: this.remark.value, flag: 'Yes' }
      this.dialogRef.close(obj);
    } else {
      this.dialogRef.close(flag);
    }
  }
}
