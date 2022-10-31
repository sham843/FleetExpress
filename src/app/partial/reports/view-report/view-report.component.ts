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
  constructor(public dialogRef: MatDialogRef<ViewReportComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datepipe: DatePipe,
    private excelService:ExcelPdfDownloadedService) { }

  ngOnInit(): void {
    this.getReportData();
  }
  getReportData() {
    this.dialogData = this.data;
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
   this.header = ["Sr No.", " Date", "Address"];
    }
    else if (this.dialogData.pageNames == "Trip Report") {
      this.header = ["Sr No.", " Distance", "Duration", "Start Date", "Start Address", "End Date", "End Address"];
      this.displayedColumns = ['', 'travelledDistance', 'speed', 'startDateTime', 'startLatLong', 'endDateTime', 'endLatLong'];
    } else {
      this.header = ["SrNo.", " Driver Name", "tripDurationInMins", "Veh.Type", "Running Time", "Stoppage Time", "Idle Time", "Max Speed", "Travelled Distance"];
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
