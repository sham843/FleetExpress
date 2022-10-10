import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ValidationService } from 'src/app/services/validation.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { ProfileModalComponent } from './profile-modal/profile-modal.component';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  myProfileForm!: FormGroup;
  userDetails!: object |any;
  totalVehicle!: number;
  date: any = new Date();
  profilePhotoupd: string = 'assets/images/Driver-profile.svg';
  @ViewChild('closeModel') closeModel: any;
  @ViewChild('panUpload') panUpload: any;
  @ViewChild('aadharUpload') aadharUpload: any;
  @ViewChild('licenceUpload') licenceUpload: any;
  @ViewChild('profileUpload') profileUpload: any;
  constructor(
    public vs: ValidationService,
    private webStorage:WebStorageService,
    private apiCall:ApiCallService,
    public config:ConfigService,
    private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getLoginUserDetails();
  }

  // ----------------------------------------------------get user Details------------------------------------------------------
  getLoginUserDetails() {
    if (this.webStorage.getVehicleOwnerId()) {
      this.apiCall.setHttp('get', 'vehicle-owner/get-vehicle-owner?VehicleOwnerId='+this.webStorage.getVehicleOwnerId()+'&nopage=1&rowperpage=10', true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((res: any) => {
        this.userDetails = res.responseData.responseData1[0];
      })
    }
    else {
      // this.tostrService.error("please login")
    }
  }
 
  
  // ----------------------------------------------------------Edit profile-----------------------------------------------------------
  profileModule(profileData?:any) {
    let obj=profileData;
    const dialog = this.dialog.open(ProfileModalComponent, {
      width: '900px',
      data: obj,
      disableClose: this.config.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      if(res=='edit'){
      this.getLoginUserDetails();
      }
    }
    )
  }
}
