import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';




@Component({
  selector: 'app-create-geofence',
  templateUrl: './create-geofence.component.html',
  styleUrls: ['./create-geofence.component.scss']
})
export class CreateGeofenceComponent implements OnInit {
  @ViewChild('search') public searchElementRef!: ElementRef;
  centerMarker: any;
  centerMarkerLatLng: any;
  map: any;
  google:any;
  geofenceForm!:FormGroup;
  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone,private fb:FormBuilder) { }

  ngOnInit(): void {
     this.geofenceForm = this.fb.group({
      geofenceType:[''],
      latitude:[''],
      longitude:[''],
      distance:[''],
      polygonText:['']
    }) 
    
  }

  onMapReady(map?: any) {
    new google.maps.drawing.DrawingManager({ // set agm map controls
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.CIRCLE],
      },
      circleOptions: {
        strokeColor: '#FF0000',
        fillColor: '#FF0000',
        clickable: false,
        editable: true,
        zIndex: 1,
        fillOpacity: 0.35,
      },
      polygonOptions: {
        strokeColor: '#FF0000',
        fillColor: '#FF0000',
        draggable: true,
        editable: true,
        fillOpacity: 0.35,
      },
      map: map
    });

    this.mapsAPILoader.load().then(() => { // set place with marker 
      let autocomplete:any = new google.maps.places.Autocomplete(this.searchElementRef?.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          let place:any= autocomplete.getPlace();
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
              this.map?.panTo(evt.latLng);
            });
          }
          this.centerMarker.setPosition({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          this.centerMarkerLatLng = "Long, Lat:" + place.geometry.location.lng().toFixed(6) + ", " + place.geometry.location.lat().toFixed(6);
        });
      });
    })

    let getFormData =  this.geofenceForm.value

    if (getFormData.geofenceType == 1) { // Create a new record circle or polygon
      //this.pointList.drawnPolytext = this.data.drawnPolytext;
      var OBJ_fitBounds = new google.maps.LatLngBounds();
      const path = getFormData.polygonText.split(',').map((x: any) => { let obj = { lng: Number(x.split(' ')[0]), lat: Number(x.split(' ')[1]) }; OBJ_fitBounds.extend(obj); return obj });
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
          debugger
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'insert_at', () => {
        this.ngZone.run(() => {
          debugger
          this.setSelection(existingShape, "polygon")
        })
      })
      google.maps.event.addListener(existingShape.getPath(), 'remove_at', () => {
        this.ngZone.run(() => {
          debugger
          this.setSelection(existingShape, "polygon")
        })
      })
    }

    //---------Create a new record circle or polygon -----------------//
  
  }

  setSelection(shape: any, type: string) {
    shape
    console.log(type);
    // this.clearSelection(false);
    // this.newRecord.geofenceType = type;
    // type == 'circle' && (this.newRecord.circle = shape, this.newRecord.circle.setMap(this.map), this.newRecord.circle.setEditable(true), this.newRecord.centerMarkerLatLng = this.getLanLongFromCircle(shape), this.newRecord.radius = +shape.getRadius().toFixed(2))
    // type == 'polygon' && (this.newRecord.polygon = shape, this.newRecord.polygon.setMap(this.map), this.newRecord.polygon.setEditable(true), this.newRecord.centerMarkerLatLng = this.getCenterLanLongFromPolygon(shape), this.newRecord.radius = 0, this.centerMarkerRadius = '')
    // try {
    //   var ll = new google.maps.LatLng(+this.centerMarkerLatLng.split(',')[1], +this.centerMarkerLatLng.split(',')[0]);
    //   this.map.panTo(ll);
    // }
    // catch (e) { }

    // this.newRecord.latLng = this.newRecord?.centerMarkerLatLng;
    // this.frmCollary.patchValue({
    //   latitude: +this.newRecord.latLng.split(",")[1],
    //   longitude: +this.newRecord.latLng.split(",")[0],
    //   polygonText: this.newRecord?.polygontext,
    //   geofenceType: this.newRecord?.geofenceType == "circle" ? 2 : 1,
    //   distance: this.newRecord?.geofenceType == "circle" ? this.newRecord?.radius : 0,
    //   collieryAddress: this.searchElementRef.nativeElement.value
    // })
    // this.searchElementRef.nativeElement.value = this.searchElementRef.nativeElement.value;
  }

  clearSelection(isAllClear: any) {
    isAllClear
    // this.newRecord.polygon && (this.newRecord.polygon.setEditable(false), this.newRecord.polygon.setMap(null), this.newRecord.polygon = undefined);
    // this.newRecord.circle && (this.newRecord.circle.setEditable(false), this.newRecord.circle.setMap(null), this.newRecord.circle = undefined);
    // this.centerMarkerLatLng = "";
    // this.centerMarkerRadius = "";
    // this.newRecord.geofenceType = "";
    // this.newRecord.polygontext = "";
    // this.newRecord.radius = 0;
    // if (this.selectedRecord && !isAllClear) {
    //   if (this.selectedRecord.geofenceData) {
    //   }
    // }
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
}
