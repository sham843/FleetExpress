import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormControl, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { ValidationService } from 'src/app/services/validation.service';
import { Subscription } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
@Component({
  selector: 'app-geofence',
  templateUrl: './geofence.component.html',
  styleUrls: ['./geofence.component.scss']
})
export class GeofenceComponent implements OnInit {
  toppings = new UntypedFormControl('');
  GeofenceListTableData:any[]=[]
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  userData:any;
  geoAddForm!:FormGroup;
  subscription !:Subscription;
  VehicleDtArr:any[]=[];
  latitude: any;
  longitude: any;
  zoom: any;
  address: any;
  geocoder: any;
  @ViewChild('search')
  public searchElementRef !: ElementRef;
  constructor(private common:CommanService,
    private toastrService:ToastrService,
    private fb:FormBuilder,
    public validationService:ValidationService,
    private error:ErrorsService,
    private spinner:NgxSpinnerService,
    private modalService:NgbModal,
    private dialog:MatDialog,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) { }

  ngOnInit(): void {
    this.getGeoFormData();
    this.userData=this.common.getUser();
    this.getVehicleData();
    this.searchAddressToPincode();
  }
  getGeoFormData() {
    this.geoAddForm = this.fb.group({
      roleName: [],
      topping: [],
    })
  }
  getVehicleData() {
    this.common.setHttp('get', 'Geofencne/get-POI-vehicle-Details?UserId='+this.common.getUserId(), true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          this.VehicleDtArr = res.responseData;
        } else {
          if (res.statusCode != "404") {}
        }
      },
      error: ((error: any) => { this.error.handelError(error.statusCode) })
    });
  }
  searchAddressToPincode() {
    this.mapsAPILoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.findAddressByCoordinates();
        });
      });
    });
  }

  findAddressByCoordinates() {
    this.geocoder.geocode(
      { location: { lat: this.latitude, lng: this.longitude, } },
      (results: any) => {
        results[0].address_components.forEach((element: any) => {
        });
      });
      console.log(this.searchElementRef.nativeElement?.value);
  }
  
}
