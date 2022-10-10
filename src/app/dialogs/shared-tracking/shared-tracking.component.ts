
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonMethodsService } from 'src/app/services/common-methods.service';

@Component({
  selector: 'app-shared-tracking',
  templateUrl: './shared-tracking.component.html',
  styleUrls: ['./shared-tracking.component.scss']
})
export class SharedTrackingComponent implements OnInit {


  dialogData= new Array();
  timePeriod = new FormControl('');

  constructor(public dialogRef: MatDialogRef<SharedTrackingComponent>,
    public CommonMethod: CommonMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dialogData = this.data
  }

  onNoClick(flag: any): void {
    if (this.data.inputType && flag == 'Yes') {
      if (this.CommonMethod.checkDataType(this.timePeriod.value) == false) {
        this.CommonMethod.snackBar('Please Enter Remark', 1);
        return;
      }
     // let obj = { remark: this.remark.value, flag: 'Yes' }
     // this.dialogRef.close(obj);
    } else {
      this.dialogRef.close(flag);
    }
  }
}

