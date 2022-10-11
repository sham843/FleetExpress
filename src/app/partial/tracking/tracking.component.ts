//import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef,OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { SharedTrackingComponent } from 'src/app/dialogs/shared-tracking/shared-tracking.component';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
interface timePeriodArray {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
  popContent: any = "Hello World";
  lat: number = 52.488328;
  lng: number = 8.717017;
  foods:any[]=[];
  totalVehicle: any;
  allVehiclelData: any[] = [];
  subscription !: Subscription;
  allRunningVehiclelData: any[] = [];
  allStoppedVehiclelData: any[] = [];
  allIdleVehiclelData: any[] = [];
  allOfflineVehiclelData: any[] = [];
  selectedIndex: any;
  selectedTab: any;
  timePeriodArray: timePeriodArray[] = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'From-To' },
  ];
  maxTodayDate !: Date |any;
  searchContent = new FormControl();
  maintananceForm!: FormGroup;
  currentDate = new Date();
  vehicleDetails: any;
  latitude: any;
  longitude: any;
  pinCode: any;
  geocoder: any;
  itineraryForm!:FormGroup;
  vehicleDetailsData=new Array();
  driverDetailsData=new Array();
  @ViewChild('search') public searchElementRef!: ElementRef;
  get f() { return this.maintananceForm.controls };
  get itinerary() { return this.itineraryForm.controls };
  constructor(
    private apiCall: ApiCallService,
    private error: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
   // private mapsAPILoader: MapsAPILoader,
    private webStorage:WebStorageService,
    private configService:ConfigService,
    public dialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.getMaintananceForm();
    this.getItineraryForm();
    this.getAllVehicleListData();
    this.setIndex(0)
  }
  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.getAllVehicleListData();
    });
  }
  getMaintananceForm() {
    this.maintananceForm = this.fb.group({
      maintenanceFrom: ['Scheduled'],
      maintenanceTo: ['', Validators.required],
      maintenanceType: ['', Validators.required],
      remark: []
    })
  }
  getItineraryForm() {
    this.itineraryForm = this.fb.group({
      timePeriod: ['1'],
      fromDate: [],
      toDate: [],
    })

  }
  setIndex(index: number) {
    this.selectedIndex = index;
  }
  selectionTab(lable: any) {
    this.selectedTab = lable;
    this.selectedIndex=0;
  }
  

  getAllVehicleListData() {
    this.allVehiclelData = []
    this.apiCall.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.webStorage.getUserId() + '&VehicleNo=' + (!this.searchContent.value ? '' : this.searchContent.value) + '&GpsStatus=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.map(async (x: any) => {
            x.deviceDatetime = new Date(x.deviceDatetime);
            // x.gpsStatus = 'Running'
          })
          this.allVehiclelData = res.responseData;
          this.allRunningVehiclelData = res.responseData.filter((x: any) => x.gpsStatus == 'Running');
          this.allStoppedVehiclelData = res.responseData.filter((x: any) => x.gpsStatus == 'Stopped');
          this.allIdleVehiclelData = res.responseData.filter((x: any) => x.gpsStatus == 'Idle');
          this.allOfflineVehiclelData = res.responseData.filter((x: any) => x.gpsStatus == 'Offline');
        } else {
          if (res.statusCode != "404") {
            this.allVehiclelData = [];
            this.error.handelError(res.statusCode)
          } 
        }
      }
    },(error: any) => { this.error.handelError(error.status) });
  }
  // getaddressdata(allVehiclelData:any){
  // //   const promises =  allVehiclelData.map(async (myValue:any) => {
  // //     return {
  // //         address: await this.findAddressByCoordinates(21.061078,78.962603)
  // //     }
  // //     return Promise.all(promises);
  // // });
  // // return Promise.all(promises);
  // }
  mapClicked() {

  }
  getVehicleNumber(element: any) {
    this.vehicleDetails = element
  }
  submitvehicleMarkMaintance() {
    if (this.maintananceForm.invalid) {
      return;
    } else {
      const userFormData = this.maintananceForm.value;
      const obj = {
        ... userFormData, 
        //  ...this.webStorage.createdByProps(),
        "id": 0,
        "maintenanceType":parseInt(userFormData?.maintenanceType),
        "vehicleId": this.vehicleDetails?.vehicleId,
        "vehicleNumber":this.vehicleDetails?.vehicleNo,
        "flag": "I",
      }
      this.spinner.show();
      this.apiCall.setHttp('post', 'maintenance/save-update-maintenance', true, obj, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.statusCode === "200") {
            if (res.responseData.responseData1[0].isSuccess) {
              this.getAllVehicleListData();
            } 
          } else {
            if (res.statusCode != "404") {
              this.error.handelError(res.statusCode)
            }
          }
        }
      },(error: any) => {
        this.spinner.hide();
        this.error.handelError(error.status)
      });
    }
  }



  //address:any
  // findAddressByCoordinates(lat: any, lng: any) {
  //   // let g:any;
  //   // this.mapsAPILoader.load().then(() => {
  //   //   this.geocoder = new google.maps.Geocoder();
  //   //  g= this.geocoder.geocode(
  //   //     { location: { lat: lat, lng: lng, } },
  //   //     (results: any) => {
  //   //      const a=results;
  //   //      // results[0].formatted_address;
  //   //       // addressresults[0].address_components.forEach((element: any) => {
  //   //       // });
  //   //     });
  //   //     return g
  //   // });
    
  // }

  
  selectTimePeriod(value: any) {
    switch (value) {
      case "1":
        this.itineraryForm.patchValue({
          fromDate: moment.utc().startOf('day').toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "2": var time = moment.duration("24:00:00");
        var date = moment();
        const oneDaySpan = date.subtract(time);
        this.itineraryForm.patchValue({
          fromDate: moment(oneDaySpan).toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "3":
        const startweek = moment().subtract(7, 'days').calendar();
        this.itineraryForm.patchValue({
          fromDate: moment(startweek).toISOString(),
          toDate: moment.utc().toISOString(),
        })
        break;
      case "4":
        this.itineraryForm.patchValue({
          fromDate: '',
          toDate: '',
        })
        break;
    }
  }
  settodate(fromDate: any) {
    const maxTodayDate = moment(fromDate).add(7, 'days').calendar();
    this.maxTodayDate = moment(maxTodayDate).toISOString() < moment().toISOString() ? moment(maxTodayDate).toISOString() : moment().toISOString();
  }
  checkValidDate() {
    const reportData = this.itineraryForm.value;
    if (reportData.fromDate && reportData.toDate) {
      if (new Date(reportData.fromDate).toISOString() < new Date(reportData.toDate).toISOString()) {
        this.itineraryForm.controls['toDate'].patchValue(new Date(reportData.toDate).toISOString())
      } else {
        this.itineraryForm.controls['toDate'].patchValue('')
      }
    }
  }
  getVehicleAllDetails(vehicleNo:any){
    this.getVehicleDetails(vehicleNo);
    this.getDriverDetails(vehicleNo);
  }
  getVehicleDetails(vehicleNo:any){
    this.vehicleDetailsData = []
    this.apiCall.setHttp('get', 'vehicle/search-vehicle?Search=' + vehicleNo, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.vehicleDetailsData = res.responseData.responseData;
        } else {
          if (res.statusCode != "404") {
            this.vehicleDetailsData = [];
            this.error.handelError(res.statusCode)
          }
        }
      }
    },(error: any) => { this.error.handelError(error.status) });
  }
  getDriverDetails(vehicleNo:any){
   console.log(vehicleNo) 
    this.driverDetailsData = []
    this.apiCall.setHttp('get', 'vehicle/get-driver-List?VehicleNo=MH12MK2246', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.driverDetailsData = res.responseData;
        } else {
          if (res.statusCode != "404") {
            this.driverDetailsData = [];
            this.error.handelError(res.statusCode)
          }
        }
      }
    },(error: any) => { this.error.handelError(error.status) });
  }
  shareingDialog() {
    let obj: any = ConfigService.dialogObj;
    // if (label == 'status') {
    //   obj['p1'] = flag ? 'Are you sure you want to Active?' : 'Are you sure you want to InActive?';
    //   obj['cardTitle'] = flag ? 'Geofence Active' : 'Geofence InActive';
    //   obj['successBtnText'] = flag ? 'Active' : 'InActive';
    //   obj['cancelBtnText'] = 'Cancel';
    // } else if (label == 'delete') {
    //   obj['p1'] = 'Are you sure you want to delete this record';
    //   obj['cardTitle'] = 'Delete';
    //   obj['successBtnText'] = 'Delete';
    //   obj['cancelBtnText'] = 'Cancel';
    // }

    const dialog = this.dialog.open(SharedTrackingComponent, {
      width: this.configService.dialogBoxWidth[1],
      data: obj,
      disableClose: this.configService.disableCloseBtnFlag,
    })

    dialog.afterClosed().subscribe(res => {
      console.log(res)
    })
  }


}