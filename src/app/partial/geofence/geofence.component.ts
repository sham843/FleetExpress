import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
import { observable, Observable, Subscription } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { interval } from 'rxjs';
declare var google: any;
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit {
  toppings = new UntypedFormControl('');
  GeofenceListTableData = new Array();
  userData: any;
  autoComplete!: MatAutocompleteTrigger;
  geoAddForm!: FormGroup;
  CreateGeoForm!: FormGroup;
  subscription !: Subscription;
  VehicleDtArr: any[] = [];
  address: any;
  geoCoder: any;
  maplocationFlag: any;
  markerHide: boolean = true;
  lat: any = '';
  lng: any = '';
  zoom: number = 12;
  circleradius: number = 1000;
  locationDTArray: any = [{ Scolor: '', latitude: 0, longitude: 0 }];
  @ViewChild('search') searchElementRef!: ElementRef;
  constructor(private common: CommanService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    public validationService: ValidationService,
    private error: ErrorsService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private dialog: MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) { }

  ngOnInit(): void {
    this.CreateGeofence();
    this.getVehicleData();
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      this.getAddress(this.lat, this.lng);
    });
    this.searchAutoComplete();
  }

  //  ------------------------------------------form Controls---------------------------------------------------------------
  CreateGeofence() {
    let data;
    this.CreateGeoForm = this.fb.group({
      vhlNumbers: [''],
      loaction: ['']
    })
    this.geoAddForm = this.fb.group({
      roleName: [],
      topping: [],
    })
    data = [{
      Scolor: '', latitude:18.44215868731478, longitude:73.83636474609375
    },
    {
      Scolor: '', latitude:18.451318499612846, longitude:73.87494564056396
    }]
    this.locationDTArray.push(data);
  }

  //  ---------------------------------------------Get Vehicle List------------------------------------------------------------
  getVehicleData() {
    this.common.setHttp('get', 'userdetail/get-vehicle-list?vehicleOwnerId=' + this.common.getVehicleOwnerId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.VehicleDtArr = res.responseData;
        } else {
          this.error.handelError(res.statusCode);
        }
      }
    },
      (error: any) => {
        this.error.handelError(error.status);
      });
  }
  // --------------------------------------------Checkbox Multiselect-------------------------------------------------------
  unCheckCheckbox(vehicle: any) {
    let index = this.CreateGeoForm.value.vhlNumbers.indexOf(vehicle);
    this.CreateGeoForm.value.vhlNumbers.splice(index, 1);
    this.CreateGeoForm.controls['vhlNumbers'].setValue(this.CreateGeoForm.value.vhlNumbers);
  }
  // -------------------------------------Search Area and map------------------------------------------------------------------
  searchAutoComplete() {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          this.maplocationFlag = true;
          let place: any = google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.getAddress(this.lat, this.lng)
        });
      });
    });
  }
  getAddress(lat: any, long: any) {
    this.spinner.show();
    this.geoCoder.geocode({ 'location': { lat: Number(lat), lng: Number(long) } }, (results: any, status: any) => {
      if (status === 'OK') {
        if (results[0]) {
          this.spinner.hide();
          this.address = results[0].formatted_address;
          this.CreateGeoForm.controls['loaction']?.setValue(this.address)
        } else {
          this.spinner.hide();
        }
      }
      this.spinner.hide();
    });
  }
  mapClicked(data: any) {
    this.lat = '';
    this.lng = '';
    this.markerHide = true;
    this.lat = data?.coords.lat;
    this.lng = data?.coords.lng;
    this.getAddress(this.lat, this.lng)
    console.log(data);
  }
  clearlatlong(event: any) {

  }
  get f() {
    return this.CreateGeoForm.controls;
  }
}
