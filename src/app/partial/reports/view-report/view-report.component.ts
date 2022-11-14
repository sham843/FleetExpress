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
  header: any;
  key: any;
  dataSource:any;
  displayedColumns:any;
  pageNumber: number = 1;
  pageSize: number = 10;
  reportResponseData=new Array();
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
    this.searchTableData()
  }
  onPagintion(pageNo: any) {
    this.pageNumber = pageNo;
  }

  searchTableData(){
    this.spinner.show();
    this.apiCall.setHttp('get', this.dialogData.url + this.dialogData.queryString+'&UserId=' + this.webStorage.getUserId()+'&DeviceId= 0' + '&VehicleOwnerId=' + this.webStorage.getVehicleOwnerId()  + '&pageno=' + this.pageNumber + '&rowsperpage=' + this.pageSize, true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((responseData: any) => {
        if (responseData.statusCode === "200" || responseData.length > 0) {
          if (this.dialogData.pageNames != 'Summary Report') {
            // responseData.responseData.data.map((x: any) => {
            //   (x.latitude || x.latOff) ? (x.latitude = x.latitude ? x.latitude : x.latOff) : '';
            //   (x.longitude || x.longOff) ? (x.longitude = x.longitude ? x.longitude : x.longOff) : '';
            // })
            let resp: any = this.sharedService.getAddressBylatLong(1, responseData.responseData.data, 10);
            this.reportResponseData = resp;
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
    let vehicleName: any;
    this.spinner.hide()   
    this.dialogData.vehicleList.find((ele: any) => {
      if (this.dialogData.VehicleNumber == ele.vehicleNo) {
        vehicleName = ele.vehTypeName;
      }
      this.dialogData.VehicleNumber = vehicleName;
    });
    // console.log(this.reportResponseData);
    // let resData = this.reportResponseData.map((item: any) => Object.assign({}, item));
    // this.reportResponseData.map((x: any) => {
    //   x.deviceDateTime = this.datepipe.transform(x.deviceDateTime, 'dd-MM-YYYY hh:mm a')
    //   //return x
    // });
    // resData = this.reportResponseData;
    // console.log(resData)
    this.getReportData();
  }


  getReportData() {
    this.fromDate = this.datepipe.transform(this.dialogData.fromDate, 'dd/MM/yyyy');
    this.toDate = this.datepipe.transform(this.dialogData.toDate, 'dd/MM/yyyy');
    this.currentDate = this.datepipe.transform(new Date, 'dd/MM/yyyy');

    if (this.dialogData.pageNames == "Speed Range Report") {
      this.header = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      this.displayedColumns= ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    }
    else if (this.dialogData.pageNames == "Overspeed Report") {
      this.header = ["Sr No.", " Date", "Speed(Km/h)", "Address"];
      this.displayedColumns = ['rowNumber', 'deviceDateTime', 'speed', 'address'];
    }
    else if (this.dialogData.pageNames == "Address Report") {
    this.header = ["Sr No.", "Date",  "Address"];
    this.displayedColumns = ['rowNumber', 'deviceDateTime', 'address'];
    }
    else if (this.dialogData.pageNames == "Trip Report") {
      this.header = ["Sr No.", " Distance", "Duration", "Start Date", "Start Address", "End Date", "End Address"];
      this.displayedColumns = ['rowNumber', 'travelledDistance', 'tripDurationInMins', 'startDateTime', 'startaddress', 'endDateTime', 'endaddress'];
    } 
    else if(this.dialogData.pageNames == "Stopage Report") {
      this.header = ["SrNo.", "Vehicle no", "From", "To", "Duration", "Location", "STPL Device"];
      this.displayedColumns = ['rowNumber', 'vehicleNo', 'dateOn', 'dateOff', 'tripDurationInMins', 'address','isMahaMiningDevice'];
    }
    else if(this.dialogData.pageNames == "Daywise Stoppage Report") {
      this.header = ["SrNo.", "Vehicle no", "From Time", "To Time", "Duration"];
      this.displayedColumns = ['rowNumber', 'vehicleNo', 'dateOn', 'dateOff', 'tripDurationInMins'];
    }
     else if(this.dialogData.pageNames == "Day Distance Report") {
      this.header = ["SrNo.", "Vehicle no", "From Time", "To Time", "Total Distance[KM]", "STPL Device"];
      this.displayedColumns = ['rowNumber', 'vehicleNo', 'fromDate', 'toDate', 'travelledDistance','isMahaMiningDevice'];
    }
    else if(this.dialogData.pageNames == "Distance Report") {
      this.header = ["SrNo.", "Vehicle no", "From Date Time", "To Date Time", "Distance travelled [KM]", "Time Taken [hr]", "STPL Device"];
      this.displayedColumns = ['rowNumber', 'vehicleNo', 'fromDate', 'toDate', 'travelledDistance','runningTime','isMahaMiningDevice'];
    }
    else {
      this.header = ["SrNo.", " Driver Name", "Mobile Number", "Veh.Type", "Running Time", "Stoppage Time", "Idle Time", "Max Speed", "Travelled Distance"];
      this.displayedColumns = ['rowNumber', 'driverName', 'mobileNo', 'vehicleType', 'runningTime','stoppageTime','idleTime','maxSpeed','travelledDistance'];
    }

    this.dataSource=this.reportResponseData;
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
