import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, OnInit, ViewChild, NgZone, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiCallService } from 'src/app/services/api-call.service';
import { CommonMethodsService } from 'src/app/services/common-methods.service';
import { ConfigService } from 'src/app/services/config.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { MasterService } from 'src/app/services/master.service';
import { WebStorageService } from 'src/app/services/web-storage.service';
@Component({
  selector: 'app-create-geofence',
  templateUrl: './create-geofence.component.html',
  styleUrls: ['./create-geofence.component.scss']
})
export class CreateGeofenceComponent implements OnInit {
  @ViewChild('search') public searchElementRef!: ElementRef;
  centerMarker: any;
  centerMarkerLatLng: any;
  mapViewType: any = 'roadmap'; // roadmap,terrain,hybrid,satellite
  map: any;
  google: any;
  geofenceForm: FormGroup | any;
  editFlag:boolean = false;

  newRecord: any = {
    dataObj: undefined,
    geofenceType: "",
    polygon: undefined,
    circle: undefined,
    polygontext: '',
    radius: 0
  };
  selectedRecord = {
    dataObj: undefined,
    geofenceData: undefined,
    polygon: undefined,
    circle: undefined,
  };
  centerMarkerRadius: string = "";
  isShapeDrawn: boolean = false;
  drawingManager!: any;
  isHide: boolean = false;
  VehicleDtArr = new Array();


  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private error: ErrorsService, private apiCall: ApiCallService,
    private fb: FormBuilder, public configService: ConfigService, private master: MasterService, private webStorage: WebStorageService,
    public dialogRef: MatDialogRef<CreateGeofenceComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private spinner: NgxSpinnerService,
    private commonMethods: CommonMethodsService
  ) { }

  ngOnInit(): void {
    if(this.data){
      console.log(this.data);
      this.editFlag = true;
      this.getVehicleData();
      this.data.selectedRecord = {
        geofenceType : this.data.geofenceType,
        polygonText : this.data.polygonText,
        latLng: this.data.latitude + ',' + this.data.longitude,
        distance: this.data.distance,
        vehicleNo: this.data.vehicleNo,
        poiAddress:this.data?.poiAddress
      }
    }else{
      this.getVehicleData()
    }

    this.defaultGeoFanceForm(this.data);
  }

  defaultGeoFanceForm(data:any) {
    console.log("data?.vehicleId",data?.vehicleId)
    this.geofenceForm = this.fb.group({
      id: [data?.poiId || 0],
      vehicleOwnerId: [''],
      title: [''],
      latitude: [data?.latitude || ''],
      longitude: [data?.longitude || ''],
      distance: [data?.distance ||''],
      poiAddress: [data?.poiAddress || ''],
      userId: [this.webStorage.getUserId()],
      createdDate: [new Date()],
      isDeleted: [true],
      vehicleId: [data?.vehicleId || '', [Validators.required]],
      flag: [this.editFlag ? 'u' :'i'],
      geofenceType: [data?.geofenceType ||''],
      polygonText: [data?.polygonText || ''],
    });
  }

  get f(){
    return this.geofenceForm.controls;
  }

  getVehicleData() {
    let vhlData = this.master.getVehicleListData();
    vhlData.subscribe({
      next: (response: any) => {
        this.VehicleDtArr = response;
        this.editFlag ? this.geofenceForm.controls['vehicleId'].setValue(this.data?.vehicleId.split(',').map(Number)) : ''
      }
    }),
      (error: any) => {
        this.error.handelError(error.status);
      }
  }

  //----------------------------------------- geoFance Fn Start Heare -----------------------------------------------------------------------//
  onMapReady(map: any) {
    this.isHide = this.data?.isHide || false;
    this.map = map;
    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.CIRCLE],
      },
      circleOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1,
      },
      polygonOptions: {
        fillColor: "#00FF00",
        strokeColor: "#00FF00",
        draggable: true,
        editable: true,
      },
      map: map
    });

    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          map.setZoom(16);
          map.setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
          if (this.centerMarker == undefined) {
            this.centerMarker = new google.maps.Marker({
              map: map,
              draggable: true
            })
            this.centerMarker.addListener('dragend', (evt: any) => {
              this.centerMarkerLatLng = "Long, Lat:" + evt.latLng.lng().toFixed(6) + ", " + evt.latLng.lat().toFixed(6);
              this.setLatLong(evt.latLng.lat().toFixed(6), evt.latLng.lng().toFixed(6)) // set lat long
              this.centerMarker.panTo(evt.latLng);
            });
          }
          this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
          this.setLatLong(place.geometry.location.lat().toFixed(6), place.geometry.location.lng().toFixed(6)) // set lat long
        });
      });
    })
 
    if (this.data?.selectedRecord && this.data.selectedRecord?.geofenceType == 1) {
      try {
        var OBJ_fitBounds = new google.maps.LatLngBounds();
        const path = this.data.selectedRecord.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
        const existingShape = new google.maps.Polygon({ paths: path, map: map, strokeColor: "#FF0000", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#FF0000", fillOpacity: 0.35, editable: false });
        let latLng = this.FN_CN_poly2latLang(existingShape);
        map.setCenter(latLng); map.fitBounds(OBJ_fitBounds);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latLng });

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><p class="fw-bold mb-2">Vehicle Details</p></td></tr>';
        hc += '<tr><td style="width: 75px;">Vehicle No. :</td><td>' + (this.data?.selectedRecord?.vehicleNo || "-") + '</td></tr>';
        hc += '<tr><td>Address :</td><td>' + (this.data?.selectedRecord?.poiAddress || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }
    if (this.data?.selectedRecord && this.data.selectedRecord?.geofenceType == 2) {
      try {
        let latlng = new google.maps.LatLng(this.data.selectedRecord.polygonText.split(" ")[1], this.data.selectedRecord.polygonText.split(" ")[0]);
        const existingMarker = new google.maps.Marker({ map: map, draggable: false, position: latlng });
        new google.maps.Circle({
          strokeColor: '#FF0000',
          fillColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillOpacity: 0.35,
          map: map,
          center: latlng,
          radius: this.data?.selectedRecord?.distance,
        });
        map.panTo(latlng);
        this.setZoomLevel(this.data?.selectedRecord?.distance);

        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><p class="fw-bold mb-2">Vehicle Details</p></td></tr>';
        hc += '<tr><td style="width: 75px;">Vehicle No. :</td><td>' + (this.data?.selectedRecord?.vehicleNo || "-") + '</td></tr>';
        hc += '<tr><td>Address :</td><td>' + (this.data?.selectedRecord?.poiAddress || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })
        existingMarker.addListener('click', () => {
          info.open(this.map, existingMarker);
        })

      } catch (e) { }
    }
    if (this.data?.newRecord?.geofenceType == 1) {
      var OBJ_fitBounds = new google.maps.LatLngBounds();
      const path = this.data.newRecord.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
      const existingShape = new google.maps.Polygon({ paths: path, strokeColor: "#00FF00", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#00FF00", fillOpacity: 0.35, editable: true, draggable: true });
      existingShape.setMap(map);
      map.setCenter(this.FN_CN_poly2latLang(existingShape));
      map.fitBounds(OBJ_fitBounds);

      google.maps.event.addListener(existingShape, 'dragend', () => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      });
      google.maps.event.addListener(existingShape.getPath(), 'set_at', () => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'insert_at', () => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'remove_at', () => {
        this.ngZone.run(() => {
          this.setSelection(existingShape, "polygon")
        })
      })
    }
    if (this.data?.newRecord?.geofenceType == 2) {
      let latlng = new google.maps.LatLng(this.data.newRecord.latLng.split(",")[1], this.data.newRecord.latLng.split(",")[0]);
      let circle = new google.maps.Circle({
        strokeColor: '#00FF00',
        fillColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillOpacity: 0.35,
        map: map,
        center: latlng,
        radius: this.data.newRecord.radius,
        draggable: true,
        editable: true
      });
      this.setZoomLevel(this.data.newRecord.radius)
      map.panTo(latlng);
      google.maps.event.addListener(circle, 'radius_changed', () => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });
      google.maps.event.addListener(circle, 'dragend', () => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });

      google.maps.event.addListener(circle, 'center_changed', () => {
        this.ngZone.run(() => {
          this.setSelection(circle, "circle");
        })
      });

    }

    if (this.data?.alreadyExistMapAryObj?.length > 0) {
      var OBJ_fitBounds = new google.maps.LatLngBounds();
      this.data.alreadyExistMapAryObj.forEach((obj: any) => {
        let hc = "<table><tbody>";
        hc += '<tr><td colspan="2"><h4>Existing Thana details</h4></td></tr>';
        hc += '<tr><td>Thana Name</td><td>: ' + (obj.thanaName || "-") + '</td></tr>';
        hc += '<tr><td>Zone Name</td><td>: ' + (obj.zoneName || "-") + '</td></tr>';
        hc += '<tr><td>Division</td><td>: ' + (obj.division || "-") + '</td></tr>';
        hc += "</tbody></table>";

        const info = new google.maps.InfoWindow({
          content: hc
        })

        if (obj.geofenceType == 1) {
          const path = obj.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
          const poly = new google.maps.Polygon({ paths: path, map: map, strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 2, fillColor: "#0000FF", fillOpacity: 0.35, editable: false, draggable: false });
          let latLng = this.FN_CN_poly2latLang(poly);
          const marker = new google.maps.Marker({ map: map, draggable: false, position: latLng });
          OBJ_fitBounds.extend(latLng);
          marker.addListener('click', () => {
            info.open(map, marker);
          })
        }

        if (obj.geofenceType == 2) {
          let latlng = new google.maps.LatLng(obj.polygonText.split(" ")[1], obj.polygonText.split(" ")[0]);
          new google.maps.Circle({
            strokeColor: '#0000FF',
            fillColor: '#0000FF',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            map: map,
            //position: latlng,
            center: latlng,
            radius: obj.distance,
            draggable: false,
            editable: false
          });
          OBJ_fitBounds.extend(latlng);
          const marker = new google.maps.Marker({ map: map, draggable: false, position: latlng });
          OBJ_fitBounds.extend(latlng);
          marker.addListener('click', () => {
            info.open(map, marker);
          })
        }
      });
      map.fitBounds(OBJ_fitBounds);
    }

    this.isHide && this.drawingManager.setDrawingMode(null);

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (e) => {
        this.isShapeDrawn = true;
        var newShape = e.overlay;
        if (e.type == 'polygon' || e.type == 'circle') { this.drawingManager.setDrawingMode(null); }

        google.maps.event.addListener(newShape, 'radius_changed', () => {
          this.ngZone.run(() => {
            this.setSelection(newShape, "circle");
          });
        });
        google.maps.event.addListener(newShape, 'dragend', () => {
          this.ngZone.run(() => {
            this.setSelection(newShape, this.newRecord.geofenceType);
          })
        });
        this.setSelection(newShape, e.type);
      }
    );
  }

  setSelection(shape: any, type: string) {
    this.clearSelection(false);
    this.newRecord.geofenceType = type;
    type == 'circle' && (this.newRecord.circle = shape, this.newRecord.circle.setMap(this.map), this.newRecord.circle.setEditable(true), this.newRecord.centerMarkerLatLng = this.getLanLongFromCircle(shape), this.newRecord.radius = +shape.getRadius().toFixed(2))
    type == 'polygon' && (this.newRecord.polygon = shape, this.newRecord.polygon.setMap(this.map), this.newRecord.polygon.setEditable(true), this.newRecord.centerMarkerLatLng = this.getCenterLanLongFromPolygon(shape), this.newRecord.radius = 0, this.centerMarkerRadius = '')
    try {
      var ll = new google.maps.LatLng(+this.centerMarkerLatLng.split(',')[1], +this.centerMarkerLatLng.split(',')[0]);
      this.map.panTo(ll);
    }
    catch (e) { }

    this.newRecord.latLng = this.newRecord?.centerMarkerLatLng;
    this.geofenceForm.patchValue({
      latitude: +this.newRecord.latLng.split(",")[1],
      longitude: +this.newRecord.latLng.split(",")[0],
      polygonText: this.newRecord?.polygontext,
      geofenceType: this.newRecord?.geofenceType == "circle" ? 2 : 1,
      distance: this.newRecord?.geofenceType == "circle" ? this.newRecord?.radius : 0,
      poiAddress: this.searchElementRef.nativeElement.value
    })
  }

  clearSelection(isAllClear: any) {
    this.newRecord.polygon && (this.newRecord.polygon.setEditable(false), this.newRecord.polygon.setMap(null), this.newRecord.polygon = undefined);
    this.newRecord.circle && (this.newRecord.circle.setEditable(false), this.newRecord.circle.setMap(null), this.newRecord.circle = undefined);
    //$('#Latlng, #geofenceRadius').val("");
    this.centerMarkerLatLng = "";
    this.centerMarkerRadius = "";
    this.newRecord.geofenceType = "";
    this.newRecord.polygontext = "";
    this.newRecord.radius = 0;
    if (this.selectedRecord && !isAllClear) {
      if (this.selectedRecord.geofenceData) {
      }
    }
  }

  FN_CN_poly2latLang(poly: any) {
    var lowx,
      highx,
      lowy,
      highy,
      lats = [],
      lngs = [],
      vertices = poly.getPath();
    for (var i = 0; i < vertices.length; i++) {
      lngs.push(vertices.getAt(i).lng());
      lats.push(vertices.getAt(i).lat());
    }
    lats.sort();
    lngs.sort();
    lowx = lats[0];
    highx = lats[vertices.length - 1];
    lowy = lngs[0];
    highy = lngs[vertices.length - 1];
    const center_x = lowx + ((highx - lowx) / 2);
    const center_y = lowy + ((highy - lowy) / 2);
    return (new google.maps.LatLng(center_x, center_y));
  }

  getLanLongFromCircle(circle: any) {
    var lat = circle.getCenter().lat().toFixed(8);
    var long = circle.getCenter().lng().toFixed(8);
    this.newRecord.polygontext = long + ' ' + lat;
    return long + ',' + lat;
  }

  getCenterLanLongFromPolygon(polygon: any) {
    let bounds = new google.maps.LatLngBounds();
    var paths = polygon.getPaths();
    this.newRecord.polygontext = "";
    var tempPolygonText: any[] = [];
    paths.forEach(function (path: any) {
      var ar = path.getArray();
      for (var i = 0, l = ar.length; i < l; i++) {
        tempPolygonText[tempPolygonText.length] = ar[i].lng().toFixed(8) + ' ' + ar[i].lat().toFixed(8);
        bounds.extend(ar[i]);
      }
    })
    tempPolygonText[tempPolygonText.length] = tempPolygonText[0];
    this.newRecord.polygontext = tempPolygonText.join();
    return bounds.getCenter().lng().toFixed(8) + ',' + bounds.getCenter().lat().toFixed(8);
  }

  removeShape() {
    this.isShapeDrawn = false;
    this.clearSelection(false);
    this.resetLatLong();
  }

  setZoomLevel(radius: number) {
    let zoom = 8;
    if (radius < 500) {
      zoom = 16;
    }
    else if (radius < 1000) {
      zoom = 14;
    }
    else if (radius < 2000) {
      zoom = 14;
    }
    else if (radius < 3000) {
      zoom = 12;
    }
    else if (radius < 5000) {
      zoom = 10;
    }
    else if (radius < 15000) {
      zoom = 10;
    }
    this.map.setZoom(zoom)
  }

  //----------------------------------------- geoFance Fn End Heare -----------------------------------------------------------------------//

  onSubmit() {
    if (this.geofenceForm.invalid) {
      return
    }
    else if(!this.geofenceForm.value.geofenceType) {
      this.commonMethods.snackBar('Geofence is required', 1)
      return
    }
    let transmodel = new Array();

    this.geofenceForm.value.vehicleId.find((ele:any)=>{

      let obj = {
        "id": this.geofenceForm.value.id,
        "poiId":  this.geofenceForm.value.id,
        "vehicleId": ele,
        "userId": this.webStorage.getUserId(),
        "createdDate":  new Date(),
        "isDeleted": true
      }
      transmodel.push(obj);
    })
    delete this.geofenceForm.value.vehicleId;
    this.geofenceForm.value.transmodel = transmodel;
    this.geofenceForm.value.vehicleOwnerId = this.webStorage.getVehicleOwnerId();
    this.geofenceForm.value.distance = this.geofenceForm.value.geofenceType == 2 ? this.geofenceForm.value.distance : 0;
    this.spinner.show();
    this.apiCall.setHttp('post', 'Geofencne/save-update-POI', true, [this.geofenceForm.value], false, 'fleetExpressBaseUrl');
    this.apiCall.getHttp().subscribe((response: any) => {
      if (response.statusCode == "200") {
        this.spinner.hide();
        this.commonMethods.snackBar(response.statusMessage, 0);
        this.onNoClick('Yes');
      }
    }, (error: any) => {
      this.error.handelError(error.status);
      this.spinner.hide()
    })
  }
  
  setLatLong(latitude: any, longitude: any) {
    this.geofenceForm.controls['latitude'].setValue(latitude)
    this.geofenceForm.controls['longitude'].setValue(longitude)
  }

  resetLatLong() {
    if (!this.isHide) {
      this.geofenceForm.controls['latitude'].setValue('');
      this.geofenceForm.controls['longitude'].setValue('');
    }
  }

  onNoClick(flag:string): void {
    this.dialogRef.close(flag);
  }

  clearAddress(){
    this.geofenceForm.controls['poiAddress'].setValue('');
  }
  // roadmap,terrain,hybrid,satellite
  selMapType(flag:string){
    flag == 'roadmap' ? this.mapViewType = 'roadmap' : this.mapViewType = 'hybrid';
  }
}
