import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { CommanService } from 'src/app/services/comman.service';
import { ErrorsService } from 'src/app/services/errors.service';
import { SharedService } from 'src/app/services/shared.service';

interface Food {
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
  totalVehicle: any;
  allVehiclelData: any[] = [];
  subscription !: Subscription;
  allRunningVehiclelData: any[] = [];
  allStoppedVehiclelData: any[] = [];
  allIdleVehiclelData: any[] = [];
  allOfflineVehiclelData: any[] = [];
  selectedIndex: any;
  selectedTab: any;
  foods: Food[] = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  searchContent = new FormControl();
  maintananceForm!: FormGroup;
  currentDate = new Date();
  vehicleDetails: any;
  get f() { return this.maintananceForm.controls };
  constructor(private sharedService: SharedService,
    private common: CommanService,
    private error: ErrorsService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastrService:ToastrService) { }

  ngOnInit(): void {
    this.getMaintananceForm();
    this.getAllVehicleListData();
    this.setIndex(0)
  }
  ngAfterViewInit() {
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((x: any) => {
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
  setIndex(index: number) {
    this.selectedIndex = index;
  }
  selectionTab(lable: any) {
    this.selectedTab = lable;
    this.selectedIndex=0;
  }

  getAllVehicleListData() {
    this.allVehiclelData = []
    this.common.setHttp('get', 'tracking/get-vehicles-current-location?UserId=' + this.common.getUserId() + '&VehicleNo=' + (!this.searchContent.value ? '' : this.searchContent.value) + '&GpsStatus=', true, false, false, 'vehicletrackingBaseUrlApi');
    this.subscription = this.common.getHttp().subscribe({
      next: (res: any) => {
        if (res.statusCode === "200") {
          res.responseData.map((x: any) => {
            x.deviceDatetime = new Date(x.deviceDatetime);
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
          } else if (res.statusCode == "404") {
            this.allVehiclelData = [];
            this.error.handelError(res.statusCode)
          }
        }
      },
      error: ((error: any) => { this.error.handelError(error.status) })
    });
  }
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
        ...this.common.createdByProps(),
        "id": 0,
        "maintenanceType":parseInt(userFormData?.maintenanceType),
        "vehicleId": this.vehicleDetails?.vehicleId,
        "vehicleNumber":this.vehicleDetails?.vehicleNo,
        "flag": "I",
      }
      this.spinner.show();
      this.common.setHttp('post', 'maintenance/save-update-maintenance', true, obj, false, 'vehicletrackingBaseUrlApi');
      this.subscription = this.common.getHttp().subscribe({
        next: (res: any) => {
          this.spinner.hide();
          if (res.statusCode === "200") {
            if (res.responseData.responseData1[0].isSuccess) {
              this.toastrService.success(res.responseData.statusMessage);
              this.getAllVehicleListData();
            } else {
              this.toastrService.error(res.responseData.statusMessage)
            }

          } else {
            if (res.statusCode != "404") {
              this.error.handelError(res.statusCode)
            }
          }
        },
        error: ((error: any) => {
          this.spinner.hide();
          this.error.handelError(error.status)
        })

      });

    }
  }

}
