import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommanService } from 'src/app/services/comman.service';

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent implements OnInit {
  dialogData: any;
  displayedColumns: string[] = ['Sr No.', 'Driver Name', 'Mob. No.', 'Veh. Type', 'Running Time', 'Stoppage Time', 'Idle Time', 'Max Speed', 'Travelled Distance'];
  tableData:any[]=[];
  constructor(  public commonService: CommanService,

    public dialogRef: MatDialogRef<ReportTableComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dialogData = this.data;
    this.tableData=this.dialogData.p1
    console.log(this.tableData)
  }
  onNoClick(flag: any): void {
    this.dialogRef.close(flag);
  }
  
}
