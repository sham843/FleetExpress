//import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { TicketRaisedComponent } from './ticket-raised/ticket-raised.component';
import { TravelMarker, TravelMarkerOptions } from 'travel-marker';
import { MapsAPILoader } from '@agm/core';
import { ConfigService } from 'src/app/services/config.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { VehicleTrackingDetailsComponent } from './vehicle-tracking-details/vehicle-tracking-details.component';
import { ValidationService } from 'src/app/services/validation.service';
import { ViewReportComponent } from '../reports/view-report/view-report.component';
import { SharedService } from 'src/app/services/shared.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
declare var google: any;
@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit, AfterViewInit {
  private categoriesSubject = new BehaviorSubject<Array<string>>([]);
  searchContent = new FormControl('');
  allVehiclelData = new Array();
  subscription !: Subscription;
  selectedTab!: string;
  allRunningVehiclelData = new Array();
  allStoppedVehiclelData = new Array();
  allIdleVehiclelData = new Array();
  allOfflineVehiclelData = new Array();
  selectedIndex!: number;
  driverDetailsData = new Array();
  vehicleDetailsData = new Array();
  foods = new Array();
  maintananceForm!: FormGroup;
  vehicleDetails: any;
  todayDate = new Date();
  allVehiclelDataClone = new Array();
  itineraryForm!: FormGroup;
  startMarker!: string
  endMarker!: string;
  vehicleNo!: string;
  playPauseBtnFlag: boolean = false;
  recBtnFlag: boolean = false;
  zoom:number = 12;
  selectedCanvasTab!:string;
  timePeriodArray = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'From-To' },
  ];
  videoUrl!:string;
  videoBtnClickFlag:boolean = false;
  viewDeatailsData=new Array();
  map: any;
  line: any;
  trackingData = new Array();
  marker: any;
  directionsService: any;
  speedMultiplier = 1;
  lat!: number;
  long!: number;
  locationArray: any;
  countryRestriction = {
    latLngBounds: {
      east: 23.63936,
      north: 68.14712,
      south: 28.20453,
      west: 97.34466
    },
    strictBounds: true
  };
  viewComplaintDeatailsData=new Array();
  reportResponseData=new Array();
  ItineraryDetailsData=new Array();
  maxTodayDateString:any;
  maxTodayDate:any;
  ItineraryDetailsData1=new Array();
  tableVehicleData=new Array();
  @Output() scrollingFinished = new EventEmitter<void>();
  constructor(private apiCall: ApiCallService, private webStorage: WebStorageService, private mapsAPILoader: MapsAPILoader, private _bottomSheet: MatBottomSheet,
    private error: ErrorsService, public dialog: MatDialog, private fb: FormBuilder, private httpClient: HttpClient,
    public validationService:ValidationService, private config: ConfigService, private sharedService:SharedService,
    private spinner:NgxSpinnerService, private datePipe:DatePipe
    ) { }

  ngOnInit(): void {
    this.lat = this.config.lat;
    this.long = this.config.long;
    this.mapCall(); // temp
    this.getAllVehicleListData(true);
     this.getItineraryForm();
  }

  setnumber(value:any){
    this.searchContent.setValue(value.toUpperCase())
  }

  mapCall() {
    this.mapsAPILoader.load().then(() => {
      new google.maps.Geocoder;
    });
    this.httpClient.get<any>("assets/tracking.json")?.subscribe({   // temp 
      next: (data: any) => {
        this.trackingData = data?.responseData;
        setTimeout(() => {
          this.mockDirections();
        }, 1000);
      }

    });
  }

  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.getAllVehicleListData(false);
    });

    //#region screen recorder fn start heare ---------------
    const start: any = document.getElementById("start");
    const stop: any = document.getElementById("stop");
    const video: any = document.getElementById("video");


    let recorder: any;
    let stream: any;
    async function startRecording() {
      stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: {
          mediaSource: "screen",
          video: true,
          audio: true,
        }
      });
      recorder = new MediaRecorder(stream);

      const chunks: any = [];
      recorder.ondataavailable = (e: any) => chunks.push(e.data);
      recorder.onstop = () => {
        const completeBlob = new Blob(chunks, { type: chunks[0].type });
        video.href =URL.createObjectURL(completeBlob);
      };
      recorder.start();
    }

    start?.addEventListener("click", () => {
      startRecording();
    });

    stop?.addEventListener("click", () => {
      recorder.stop();
      stream.getVideoTracks()[0].stop();
    });

    //#endregion scrren recorder end Fn
  }
// ---------------------------------------------view vehicle data---------------------------------------------------------------

  viewVehicleData(){

      let obj: any='Vehicle Tracking';
      const dialog = this.dialog.open(ViewReportComponent, {
        width: '900px',
        data: obj,
        disableClose: this.config.disableCloseBtnFlag,
      })
      dialog.afterClosed().subscribe(() => {
       
      }
      )
  }

  getAllVehicleListData(flag: boolean) {
    this.allVehiclelData = [];
    this.allVehiclelDataClone = [];
    this.allRunningVehiclelData= [];
    this.allStoppedVehiclelData= [];
    this.allIdleVehiclelData= [];
    this.allOfflineVehiclelData= [];
    this.spinner.show();
    this.apiCall.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.webStorage.getUserId() + '&VehicleNo=' + (!this.searchContent.value ? '' : (this.searchContent.value).trim()) + '&GpsStatus=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.statusCode === "200") {
          res.responseData.responseData1.map((x:any)=>{
            x.runningTime=this.config.timeConvert(x.gpsStatus == "Running" ? x.totalRunningTime:x.totalStopageTime);
            let  resp2=[];
            resp2= res.responseData.responseData2.find((xx:any)=> x.vehicleNo==xx.vehicleNumber);
            resp2 ? (x.flag = resp2.flag, x.complaintId=resp2.complaintId ) :  (x.flag = 0, x.complaintId=0 );
          })
          //let resp: any = this.sharedService.getAddressBylatLong(1, res.responseData.responseData1, res.responseData.responseData1.length);
          this.reportResponseData = res.responseData.responseData1;
          this.allVehiclelData = this.reportResponseData;
          this.getNextItems();
          this.categoriesSubject.next(this.totalDtaArray);
          //setTimeout(()=>{
            this.allVehiclelDataClone = this.reportResponseData;
            if (flag) {
              this.reportResponseData.find((x: any) => {
                x.gpsStatus == 'Running' ? this.allRunningVehiclelData.push(x)
                  : x.gpsStatus == 'Stopped' ? this.allStoppedVehiclelData.push(x)
                    : x.gpsStatus == 'Idle' ? this.allIdleVehiclelData.push(x)
                      : x.gpsStatus == 'Offline' ? this.allOfflineVehiclelData.push(x) : ''
              });
            }
         // },10000)
        } else {
          this.allVehiclelData = [];
          this.allVehiclelDataClone = [];
        }
      }
    }, (error: any) => { 
      this.spinner.hide();
      this.error.handelError(error.status) });
  }

  clickOnTrackingTab(flag: string) {
    flag == 'Running' ? this.allVehiclelData = this.allRunningVehiclelData
      : flag == 'Stopped' ? this.allVehiclelData = this.allStoppedVehiclelData
        : flag == 'Idle' ? this.allVehiclelData = this.allIdleVehiclelData
          : flag == 'Offline' ? this.allVehiclelData = this.allOfflineVehiclelData
            : flag == 'TotalVehicles' ? this.allVehiclelData = this.allVehiclelDataClone : '';
  }
// ------ Dialog View section ----------------------------
  viewManitananceDetails(item:any){
    this.apiCall.setHttp('get', 'maintenance/get-maintenance-details?VehicleId=' + item.vehicleId, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.map((x:any)=>{
            x.maintenanceFrom=this.datePipe.transform(x.maintenanceFrom, 'dd-MM-yyyy hh:MM:ss a');
            x.maintenanceTo=this.datePipe.transform(x.maintenanceTo , 'dd-MM-yyyy hh:MM:ss a');
            switch(x.maintenanceType){
              case 1: x.maintenanceTypeDetails='Scheduled';break;
              case 2: x.maintenanceTypeDetails='Repair';break;
              case 3: x.maintenanceTypeDetails='Accident';break;
            }
          })
          this.viewDeatailsData=res.responseData;
          this.openTicketRaisedDialog(this.viewDeatailsData,'ManitananceViewDetails')
        } else {
          this.viewDeatailsData = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
    
  }

  viewComplaintDetails(item:any){
    this.apiCall.setHttp('get', 'maintenance/get-complaint?UserId='+ this.webStorage.getUserId()+'&ComplaintId=' + item.complaintId, true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.map((x:any)=>{
            x.driverMobileNo=item.driverMobileNo;
            x.address=item.address
          })
          this.viewComplaintDeatailsData=res.responseData;
          
          this.openTicketRaisedDialog(this.viewComplaintDeatailsData,'complentViewDetails')
        } else {
          this.viewComplaintDeatailsData = [];
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
    
  }
// --------- dialog open section ---------
  openTicketRaisedDialog(data: any, flag: string) {
    let obj = { flagStatus: flag, ...data }
    const dialogRef = this.dialog.open(TicketRaisedComponent, {
      width: '520px',
      data: obj,
    });
    dialogRef.afterClosed().subscribe(result => {
      // result == 'Yes' ? flag == 'maintenance' ? this.getAllVehicleListData(true) : '') : ''
      result == 'Yes' ? this.getAllVehicleListData(true) : ''
    });
  }

// ------ loading data aginst srolling -------
  
  onScrollingFinished(){
    console.log('load more');
    this.loadMore()
  }
  totalDtaArray:any[]=[];
  loadMore(): void {
    if (this.getNextItems()) {
      this.categoriesSubject.next(this.totalDtaArray);
    }
  }
  getNextItems(): boolean {
    if (this.totalDtaArray.length >= this.allVehiclelData.length) {
      return false;
    }
    const remainingLength = Math.min( 5, this.allVehiclelData.length - this.totalDtaArray.length );
    let previousTablelength= this.totalDtaArray.length
    this.totalDtaArray.push(
      ...this.allVehiclelData.slice(
        this.totalDtaArray.length,
        this.totalDtaArray.length + remainingLength
      )
    );
    let incomingTableData=[]
    for(let i=previousTablelength; i< this.totalDtaArray.length; i++){
      incomingTableData.push(this.totalDtaArray[i])
    }
    let resp: any = this.sharedService.getAddressBylatLong(1, incomingTableData, incomingTableData.length);
    console.log(resp);
    setTimeout(()=>{
      this.tableVehicleData.push(...resp);
    },1000)
    console.log(this.tableVehicleData)
    return true;
  }


  //----------------------------------------------------------- bottom sheet method start heare ---------------------------------------------//


  // ----------Itinerary form section--------
  getItineraryForm() {
    this.itineraryForm = this.fb.group({
      timePeriod: ['1'],
      fromDate: [],
      toDate: [],
    })
    this.selectTimePeriod(this.itineraryForm.controls['timePeriod'].value);
  }
  get itinerary() { return this.itineraryForm.controls };
  selectTimePeriod(value: any) {
    const currentDateTime = (moment.utc().subtract(1, 'minute')).toISOString();
    switch (value) {
      case "1":
        this.itineraryForm.patchValue({
          fromDate: (moment.utc().startOf('day').subtract(5, 'hour').subtract(30, 'minute')).toISOString(),
          toDate: currentDateTime,
        })
        this.getItineraryDetails();
        break;
      case "2": var time = moment.duration("24:00:00");
        var date = moment();
        const oneDaySpan = date.subtract(time);
        this.itineraryForm.patchValue({
          fromDate: moment(oneDaySpan).toISOString(),
          toDate: currentDateTime,
        })
        this.getItineraryDetails()  ;
        break;
      case "3":
        const startweek = moment().subtract(7, 'days').calendar();
        this.itineraryForm.patchValue({
          fromDate: moment(startweek).toISOString(),
          toDate: currentDateTime,
        })
        this.getItineraryDetails();
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
    this.maxTodayDateString = (moment(fromDate).add(7, 'days').format("YYYY-MM-DD HH:mm:ss"));
    const maxTodayDateTime = moment(moment(this.maxTodayDateString)).toISOString();
    this.maxTodayDate = moment(this.maxTodayDateString).toISOString() < moment().toISOString() ? moment(maxTodayDateTime).toISOString() : moment().toISOString();
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
  getItineraryDetails(){
    this.vehicleNo='MH12DL3698';
    if(this.itineraryForm.value.fromDate && this.itineraryForm.value.toDate){
      this.vehicleDetailsData = [];
      const obj={
        fromDate:this.datePipe.transform(this.itineraryForm.value.fromDate, 'YYYY-MM-dd'),
        toDate:this.datePipe.transform(this.itineraryForm.value.toDate, 'YYYY-MM-dd'),
      }
      this.ItineraryDetailsData=[];
      this.ItineraryDetailsData1=[];
      this.apiCall.setHttp('get', 'tracking/get-vehicle-vehicle-itinerary?vehicleNumber=' + this.vehicleNo + '&fromDate='+obj.fromDate+'&toDate='+obj.toDate, true, false, false, 'fleetExpressBaseUrl');
      this.subscription = this.apiCall.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode === "200") {
            let resp: any = this.sharedService.getAddressBylatLong(1, res.responseData.responseData1, res.responseData.responseData1.length);
            this.ItineraryDetailsData = resp;
            this.ItineraryDetailsData1.push(res.responseData.responseData2) ;
            
          } else {
            if (res.statusCode != "404") {
              this.ItineraryDetailsData = [];
              this.ItineraryDetailsData1= [];
              this.error.handelError(res.statusCode)
            }
          }
        }
      },(error: any) => { this.error.handelError(error.status) });
    }
    
  }
 // ----------vehicle Data view section--------
  getVehicleDetails(){
    this.vehicleDetailsData = []
    this.apiCall.setHttp('get', 'vehicle/search-vehicle?Search=' + this.vehicleNo, true, false, false, 'fleetExpressBaseUrl');
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

   // ----------Driver Data view section--------
  getDriverDetails(){
    this.driverDetailsData = []
    this.apiCall.setHttp('get', 'vehicle/get-driver-List?VehicleNo='+this.vehicleNo, true, false, false, 'fleetExpressBaseUrl');
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

  


  
  //-------------------------------------------------------------- bottom sheet method end heare --------------------------------------------//

  openvechileTrackingDetailsSheet(): void {
    this._bottomSheet.open(VehicleTrackingDetailsComponent);
  }

  //#region -------------------------------------------------------------- map fn strat heare  -----------------------------------------------//
  onMapReady(map: any) {
    this.map = map;
  }

  mockDirections() {
    this.locationArray = this.trackingData?.map((lldt: { latitude: any, longitude: any }) => new google.maps.LatLng(lldt?.latitude, lldt?.longitude));
    this.line = new google.maps.Polyline({
      strokeOpacity: 1,
      path: [],
      map: this.map,
      strokeColor: '#26B86F',
      strokeWeight: 5,
    });
    this.locationArray.forEach((l: any) => this.line.getPath().push(l));

    let $this: any = this;

    this.locationArray.forEach((lt: any) => {
      let clr = '#2A1DCC';
      if ($this.InvoiceData?.length > 0) {
        $this.InvoiceData.map((dlt: any) => {

          let d = new Date(lt.date);
          let d1 = new Date(dlt.validityFrom);
          let d2 = new Date(dlt.validityUpto);
          clr = ((d1 <= d && d <= d2) ? '#26B86F' : '#FBB917');
        });
      }
      $this.line.strokeColor = clr
    });

    this.lat = this.trackingData[0].latitude;
    this.long = this.trackingData[0].longitude;

    const start = this.locationArray[0];
    const end = this.locationArray[this.locationArray?.length - 1];

    const startMarker = new google.maps.Marker({
      position: start,
      map: this.map,
      icon: "assets/images/start.png",
    });

    let smi = "<table class='text-start'><tbody>";
    smi += '<tr><td colspan="2"><p class="mb-1 fw-bold">Colliery Details</p></td></tr>';
    smi += '<tr><td>Name : </td><td>Krishnanagar Coal Area</td></tr>';
    smi += '<tr><td>Address :</td><td>Raghunathpur, West Bengal 722202</td></tr>';
    smi += "</tbody></table>";

    const info = new google.maps.InfoWindow({
      content: smi
    })

    startMarker.addListener('click', () => {
      info.open(this.map, startMarker);
    })

    const endMarker = new google.maps.Marker({
      position: end,
      map: this.map,
      icon: "assets/images/end.png",
      imageWidth: 30, // image width of overlay
      imageHeight: 30,
    });

    let emi = "<table class='text-start'><tbody>";
    emi += '<tr><td colspan="2"><p class="mb-1 fw-bold">MSME Details</p></td></tr>';
    emi += '<tr><td>Name :</td><td>Kalisen Power Station</td></tr>';
    emi += '<tr><td>Address : </td><td>Kalisen, Bankura - Bishnupur Rd, Manipur, West Bengal 722144</td></tr>';
    emi += "</tbody></table>";

    const eminfo = new google.maps.InfoWindow({
      content: emi
    })

    endMarker.addListener('click', () => {
      eminfo.open(this.map, endMarker);
    })

    let latlng = new google.maps.LatLng(this.lat, this.long);
    this.map?.panTo(latlng);
    this.marker && this.marker.setMap(null);
    this.initRoute();
  }

  initRoute() {
    const route = this.line.getPath().getArray();
    // options 
    const options: TravelMarkerOptions = {
      map: this.map,  // map object
      speed: 50,  // default 10 , animation speed
      interval: 10, // default 10, marker refresh time
      speedMultiplier: this.speedMultiplier,
      cameraOnMarker: true,
      markerType: 'overlay', // 'overlay',  // default: 'default'
      overlayOptions: {
        offsetX: 0, // default: 0, x-offset for overlay
        offsetY: 0, // default: 0, y-offset for overlay
        offsetAngle: 0, // default: 0, rotation-offset for overlay
        imageUrl: 'assets/images/location_1.png', // image used for overlay
        imageWidth: 30, // image width of overlay
        imageHeight: 30, // image height of overlay
        // scaledSize: new google.maps.Size(48, 48),
      }
    };

    // define marker
    this.marker = new TravelMarker(options);

    // add locations from direction service

    this.marker?.addLocation(route);

    // setTimeout(() => this.play(), 2000);
  }

  // play animation
  play() {
    this.marker.play();
  }

  // pause animation
  pause() {
    this.marker.pause();
  }

  // reset animation
  reset() {
    this.marker.reset();
  }

  // fast forward
  fast() {
    this.speedMultiplier *= 2;
    this.marker.setSpeedMultiplier(this.speedMultiplier);
  }

  // slow motion
  slow() {
    this.speedMultiplier /= 2;
    this.marker.setSpeedMultiplier(this.speedMultiplier);
  }

  //#endregion -------------------------------------------------------------- map fn end heare  -----------------------------------------------//

}