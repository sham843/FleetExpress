import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-block-unblock',
  templateUrl: './block-unblock.component.html',
  styleUrls: ['./block-unblock.component.scss']
})
export class BlockUnblockComponent implements OnInit {
  dialogData: any;

  constructor(
    public dialogRef: MatDialogRef<BlockUnblockComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.dialogData = this.data;
  }
  onNoClick(flag: any): void {
    this.dialogRef.close(flag);
  }

}
