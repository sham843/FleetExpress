import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ExcelPdfDownloadedService } from 'src/app/services/excel-pdf-downloaded.service';

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
  constructor(public dialogRef: MatDialogRef<ViewReportComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datepipe: DatePipe,
    private excelService:ExcelPdfDownloadedService) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.getReportData();
  }
  onPagintion(pageNo: any) {
    this.pageNumber = pageNo;
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
    this.header = ["Sr No.", "From Date", "To Date", "Address"];
    this.displayedColumns = ['rowNumber', 'fromDate', 'toDate', 'address'];
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

    this.dataSource=this.dialogData.data;
  }
  onDownloadPDF(){
    this.excelService.downLoadPdf(this.dialogData.data, this.dialogData.pageNames,this.dialogData,this.header,this.displayedColumns);
  }
  onDownloadExcel(){
    this.excelService.exportAsExcelFile(this.dialogData.data, this.dialogData, this.dialogData.pageNames, this.header, this.displayedColumns);
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
