import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonMethodsService } from 'src/app/services/common-methods.service';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.scss']
})
export class ViewReportComponent implements OnInit {
  dialogData: any;
  fromDate:any;
  toDate:any;
  constructor(public dialogRef: MatDialogRef<ViewReportComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dialogData = this.data ;
    this.fromDate=this.dialogData.fromDate.transform(this.dialogData.fromDate,'dd/MM/yyyy');
    console.log(this.dialogData);
  }

}
