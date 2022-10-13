//import { MapsAPILoader } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ApiCallService } from 'src/app/services/api-call.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
import { TicketRaisedComponent } from './ticket-raised/ticket-raised.component';
import { TravelMarker, TravelMarkerOptions } from 'travel-marker';
import { MapsAPILoader } from '@agm/core';
import { ConfigService } from 'src/app/services/config.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { VehicleTrackingDetailsComponent } from './vehicle-tracking-details/vehicle-tracking-details.component';
declare var google: any;
@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit {
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


  timePeriodArray = [
    { value: '1', viewValue: 'Today' },
    { value: '2', viewValue: '24hr' },
    { value: '3', viewValue: 'Weekly' },
    { value: '4', viewValue: 'From-To' },
  ];

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


  constructor(private apiCall: ApiCallService, private webStorage: WebStorageService, private mapsAPILoader: MapsAPILoader, private _bottomSheet: MatBottomSheet,
    private error: ErrorsService, public dialog: MatDialog, private fb: FormBuilder, private httpClient: HttpClient, private config: ConfigService) { }

  ngOnInit(): void {
    this.lat = this.config.lat;
    this.long = this.config.long;
    this.mapCall(); // temp
    this.getAllVehicleListData(true);
    this.getItineraryForm();
  }

  mapCall() {
    this.mapsAPILoader.load().then(() => {
      new google.maps.Geocoder;
    });
    this.httpClient.get<any>("assets/tracking.json")?.subscribe({   // temp 
      next: (data: any) => {
        this.trackingData = data?.responseData;
        // setTimeout(() => {
        //   this.mockDirections();
        // }, 1000);
      }

    });
  }

  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.getAllVehicleListData(false);
    });
  }

  getAllVehicleListData(flag: boolean) {
    this.apiCall.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.webStorage.getUserId() + '&VehicleNo=' + (!this.searchContent.value ? '' : this.searchContent.value) + '&GpsStatus=', true, false, false, 'fleetExpressBaseUrl');
    this.subscription = this.apiCall.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.allVehiclelData = res.responseData;
          if (flag) {
            this.allVehiclelDataClone = res.responseData;
            res.responseData.find((x: any) => {
              x.gpsStatus == 'Running' ? this.allRunningVehiclelData.push(x)
                : x.gpsStatus == 'Stopped' ? this.allStoppedVehiclelData.push(x)
                  : x.gpsStatus == 'Idle' ? this.allIdleVehiclelData.push(x)
                    : x.gpsStatus == 'Offline' ? this.allOfflineVehiclelData.push(x) : ''
            });
          }
        } else {
          this.allVehiclelData = [];
          this.allVehiclelDataClone = [];
          // this.error.handelError(res.statusCode)
        }
      }
    }, (error: any) => { this.error.handelError(error.status) });
  }

  clickOnTrackingTab(flag: string) {
    flag == 'Running' ? this.allVehiclelData = this.allRunningVehiclelData
      : flag == 'Stopped' ? this.allVehiclelData = this.allStoppedVehiclelData
        : flag == 'Idle' ? this.allVehiclelData = this.allIdleVehiclelData
          : flag == 'Offline' ? this.allVehiclelData = this.allOfflineVehiclelData
            : flag == 'TotalVehicles' ? this.allVehiclelData = this.allVehiclelDataClone : '';
  }

  submitvehicleMarkMaintance() {

  }

  openTicketRaisedDialog(data: any, flag: string) {
    let obj = { flag: flag, ...data }
    const dialogRef = this.dialog.open(TicketRaisedComponent, {
      width: '520px',
      data: obj,
    });
    dialogRef.afterClosed().subscribe(result => {
      result == 'Yes' ? (flag == 'maintenance' ? this.getAllVehicleListData(true) : '') : ''
    });
  }

  //----------------------------------------------------------- bottom sheet method start heare ---------------------------------------------//
  getItineraryForm() {
    this.itineraryForm = this.fb.group({
      timePeriod: ['1'],
      fromDate: [],
      toDate: [],
    })
  }
  get itinerary() { return this.itineraryForm.controls };
  //-------------------------------------------------------------- bottom sheet method end heare --------------------------------------------//

  openvechileTrackingDetailsSheet(): void {
    this._bottomSheet.open(VehicleTrackingDetailsComponent);
  }

  //#region -------------------------------------------------------------- map fn strat heare  -----------------------------------------------//

  mockDirections() {
    this.locationArray = this.trackingData?.map((lldt: { latitude: any, longitude: any }) => {
      new google.maps.LatLng(lldt?.latitude, lldt?.longitude)
    });

    this.line = new google.maps.Polyline({
      strokeOpacity: 0.5,
      path: [],
      map: this.map,
      strokeColor: '#26B86F',
      strokeWeight: 5,
    });
    this.locationArray.forEach((l: any) => this.line.getPath().push(l));

    let $this: any = this;
    this.locationArray.forEach(function (lt: any) {
      let clr = '#FBB917';
      if ($this.InvoiceData?.length > 0) {
        $this.InvoiceData.map(function (dlt: any) {
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
      icon: "assets/images/start_pin.svg"
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
      icon: "assets/images/end_pin.svg",
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

    this.endMarker = new google.maps.Marker({ position: end, map: this.map, icon: "assets/images/e.png" }); //label: 'E'
    this.startMarker = new google.maps.Marker({ position: start, map: this.map, icon: "assets/images/s.png" }); // label: 'S'

    let latlng = new google.maps.LatLng(this.lat, this.long);
    this.map?.panTo(latlng);
    this.marker && this.marker.setMap(null);
    this.initRoute();
  }

  calcRoute() {
    this.line = new google.maps.Polyline({
      strokeOpacity: 0.5,
      path: [],
      map: this.map,
    });

    const start = new google.maps.LatLng(23.445367108452267, 87.30157282922659);
    const end = new google.maps.LatLng(23.185180849461496, 87.15678626936689);

    const request = {
      origin: start,
      destination: end,
      travelMode: google.maps.TravelMode.BICYCLING,
    };
    this.directionsService = new google.maps.DirectionsService();
    this.directionsService.route(request, (response: any, status: any) => {
      // Empty response as API KEY EXPIRED

      if (status == google.maps.DirectionsStatus.OK) {
        var legs = response.routes[0].legs;
        for (let i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (let j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (let k = 0; k < nextSegment.length; k++) {
              this.line.getPath().push(nextSegment[k]);
            }
          }
        }
        this.initRoute();
      }
    });
  }

  initRoute() {
    const route = this.line.getPath().getArray();
    // options
    const options: TravelMarkerOptions = {
      map: this.map, // map object
      speed: 50, // default 10 , animation speed
      interval: 10, // default 10, marker refresh time
      speedMultiplier: this.speedMultiplier,
      cameraOnMarker: true,
      markerOptions: {
        draggable: true,
        title: 'Travel Marker',
        animation: google.maps.Animation.DROP,
        icon: {
          url: 'assets/images/s.png',
          // This marker is 20 pixels wide by 32 pixels high.
          animation: google.maps.Animation.DROP,
          // size: new google.maps.Size(256, 256),
          scaledSize: new google.maps.Size(28, 28),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image is the base of the flagpole at (0, 32).
          anchor: new google.maps.Point(17, 30),
        },
      },
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