
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  geofenceForm!:FormGroup;

  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.geofenceForm = this.fb.group({
      geofenceType:[''],
      latitude:[''],
      longitude:[''],
      distance:[''],
      polygonText:['']
    })
    
  }

  onMapReady() {
  }
}
