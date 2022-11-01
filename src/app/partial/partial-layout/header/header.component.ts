import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit, Renderer2 } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from 'src/app/dialogs/confirmation/confirmation.component';
import { ConfigService } from 'src/app/services/config.service';
import { SharedService } from 'src/app/services/shared.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @HostBinding('class') className = '';
  themeColor: any = 'light';
  themeClr:any;
  constructor(public sidebarservice: SidebarService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private config: ConfigService,
    private overlay: OverlayContainer,
    private renderer: Renderer2
  ) { }

  themeChange(darkMode: any) {
    localStorage.setItem('themeColor', darkMode);
    this.themeClr = localStorage.getItem('themeColor');
    this.themeClr == 'dark' ? (this.renderer.addClass(document.body, 'darkTheme'), this.renderer.removeClass(document.body, 'lightTheme')) :
      (this.renderer.addClass(document.body, 'lightTheme'), this.renderer.removeClass(document.body, 'darkTheme'));
      this.sharedService.setTheme(this.themeClr);
    const darkClassName = 'darkMode';
    this.className = darkMode == 'dark' ? darkClassName : '';
    if (darkMode) {
      this.overlay.getContainerElement().classList.add(darkClassName);
    } else {
      this.overlay.getContainerElement().classList.remove(darkClassName);
    }
  }
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
    this.themeClr = localStorage.getItem('themeColor');
    this.themeClr == 'dark' ? (this.renderer.addClass(document.body, 'darkTheme'), this.renderer.removeClass(document.body, 'lightTheme')) :
      (this.renderer.addClass(document.body, 'lightTheme'), this.renderer.removeClass(document.body, 'darkTheme'));
  }
  confirmationDialog(flag: boolean, label: string) {
    let obj: any = ConfigService.dialogObj;
    if (label == 'status') {
      obj['p1'] = flag ? 'Are you sure you want to logout?' : '';
      obj['cardTitle'] = flag ? 'Logout' : '';
      obj['successBtnText'] = flag ? 'Logout' : '';
      obj['cancelBtnText'] = 'Cancel';
    }
    const dialog = this.dialog.open(ConfirmationComponent, {
      width: this.config.dialogBoxWidth[0],
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })
    dialog.afterClosed().subscribe(res => {
      res == 'Yes' ? this.sharedService.logOut() : '';
    }
    )
  }
}
