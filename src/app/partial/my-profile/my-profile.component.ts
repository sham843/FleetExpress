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
  profilePhoto:string="assets/images/Driver-profile.svg";
  date: any = new Date();
  vehicleCount:any;
  // profilePhotoupd: string = 'assets/images/Driver-profile.svg';
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
    this.vehicleCount=this.apiCall.vehicleCount();
    this.vehicleCount.subscribe((res:any)=>{
     this.totalVehicle=res.responseData.responseData2.totalRecords;
    })
  }

  // ----------------------------------------------------get user Details------------------------------------------------------
/*   getLoginUserDetails() {
    if (this.webStorage.getVehicleOwnerId()) {
      this.apiCall.setHttp('get', 'vehicle-owner/get-vehicle-owner?VehicleOwnerId='+this.webStorage.getVehicleOwnerId()+'&nopage=1&rowperpage=10', true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((res: any) => {
        this.userDetails = res.responseData.responseData1[0];
        this.profilePhoto=this.userDetails.profilePhoto?this.userDetails.profilePhoto:'assets/images/Driver-profile.svg';
      })
    }
    else {
      // this.tostrService.error("please login")
    }
  } */
  getLoginUserDetails() {
    if (this.webStorage.getVehicleOwnerId()) {
      this.apiCall.setHttp('get', 'userdetail/get-user?userId='+this.webStorage.getUserId(), true, false, false, 'fleetExpressBaseUrl');
      this.apiCall.getHttp().subscribe((res: any) => {
        this.userDetails = res.responseData[0];
        this.profilePhoto=this.userDetails.profilePhoto?this.userDetails.profilePhoto:'assets/images/Driver-profile.svg';
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
      autoFocus: false
    })

    dialog.afterClosed().subscribe(res => {
      if(res=='edit'){
      this.getLoginUserDetails();
      }
    }
    )
  }
}
