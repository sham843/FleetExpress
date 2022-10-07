import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { SharedService } from 'src/app/services/shared.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public sidebarservice: SidebarService,private sharedService:SharedService,
    private dialog:MatDialog,private apiCall:ApiCallService) { }
  toggleSidebar() {
    this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
  }
  toggleBackgroundImage() {
    this.sidebarservice.hasBackgroundImage = !this.sidebarservice.hasBackgroundImage;
  }
  getSideBarState() {
    return this.sidebarservice.getSidebarState();
  }

  hideSidebar() {
    this.sidebarservice.setSidebarState(true);
  }

  ngOnInit(): void {
  }
  logOut() {
    let dialogText: string;
   dialogText = 'Do you want to Logout ?';
    const dialogRef = this.dialog.open(BlockUnblockComponent, {
      width: '340px',
      data: { p1: dialogText, p2: '', cardTitle: '', successBtnText: 'Yes', dialogIcon: 'done_outline', cancelBtnText: 'No' },
      disableClose: this.apiCall.disableCloseFlag,
    });
    dialogRef.afterClosed().subscribe((res: any) => {     
        res == 'Yes' ?  this.sharedService.logOut():'';   
    });
  }
}
