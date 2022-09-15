import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
  styleUrls: ['./driver.component.scss']
})
export class DriverComponent implements OnInit {
  driverRegForm !: FormGroup;
  get f() { return this.driverRegForm.controls };
  constructor(private fb:FormBuilder) { }

  ngOnInit(): void {
    this.getRegFormData();
  }
  getRegFormData() {
    this.driverRegForm = this.fb.group({
      profileImage: [],
      mobileNumber: [],
      fName: [],
      lName: [],
      licenceNumber: [],
      aadharNumber: [],
      dopanNumberb: [],
      presentAddress: [],
      permanentAddress: []
    })
  }
  SearchReport(){

  }
}
