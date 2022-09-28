import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommanService } from 'src/app/services/comman.service';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ErrorsService } from 'src/app/services/errors.service';
import { BlockUnblockComponent } from 'src/app/dialogs/block-unblock/block-unblock.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
  description: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {
    position: 1,
    name: 'Hydrogen',
    weight: 1.0079,
    symbol: 'H',
    description: `Hydrogen is a chemical element with symbol H and atomic number 1. With a standard
        atomic weight of 1.008, hydrogen is the lightest element on the periodic table.`,
  },
  {
    position: 2,
    name: 'Helium',
    weight: 4.0026,
    symbol: 'He',
    description: `Helium is a chemical element with symbol He and atomic number 2. It is a
        colorless, odorless, tasteless, non-toxic, inert, monatomic gas, the first in the noble gas
        group in the periodic table. Its boiling point is the lowest among all the elements.`,
  },
  {
    position: 3,
    name: 'Lithium',
    weight: 6.941,
    symbol: 'Li',
    description: `Lithium is a chemical element with symbol Li and atomic number 3. It is a soft,
        silvery-white alkali metal. Under standard conditions, it is the lightest metal and the
        lightest solid element.`,
  },
  {
    position: 4,
    name: 'Beryllium',
    weight: 9.0122,
    symbol: 'Be',
    description: `Beryllium is a chemical element with symbol Be and atomic number 4. It is a
        relatively rare element in the universe, usually occurring as a product of the spallation of
        larger atomic nuclei that have collided with cosmic rays.`,
  },
  {
    position: 5,
    name: 'Boron',
    weight: 10.811,
    symbol: 'B',
    description: `Boron is a chemical element with symbol B and atomic number 5. Produced entirely
        by cosmic ray spallation and supernovae and not by stellar nucleosynthesis, it is a
        low-abundance element in the Solar system and in the Earth's crust.`,
  },
  {
    position: 6,
    name: 'Carbon',
    weight: 12.0107,
    symbol: 'C',
    description: `Carbon is a chemical element with symbol C and atomic number 6. It is nonmetallic
        and tetravalent—making four electrons available to form covalent chemical bonds. It belongs
        to group 14 of the periodic table.`,
  },
  {
    position: 7,
    name: 'Nitrogen',
    weight: 14.0067,
    symbol: 'N',
    description: `Nitrogen is a chemical element with symbol N and atomic number 7. It was first
        discovered and isolated by Scottish physician Daniel Rutherford in 1772.`,
  },
  {
    position: 8,
    name: 'Oxygen',
    weight: 15.9994,
    symbol: 'O',
    description: `Oxygen is a chemical element with symbol O and atomic number 8. It is a member of
         the chalcogen group on the periodic table, a highly reactive nonmetal, and an oxidizing
         agent that readily forms oxides with most elements as well as with other compounds.`,
  },
  {
    position: 9,
    name: 'Fluorine',
    weight: 18.9984,
    symbol: 'F',
    description: `Fluorine is a chemical element with symbol F and atomic number 9. It is the
        lightest halogen and exists as a highly toxic pale yellow diatomic gas at standard
        conditions.`,
  },
  {
    position: 10,
    name: 'Neon',
    weight: 20.1797,
    symbol: 'Ne',
    description: `Neon is a chemical element with symbol Ne and atomic number 10. It is a noble gas.
        Neon is a colorless, odorless, inert monatomic gas under standard conditions, with about
        two-thirds the density of air.`,
  },
];
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class SettingsComponent implements OnInit {
  dataSource = ELEMENT_DATA;
  columnsToDisplay:any=['SR.NO','VEHICLE NO','VEHICLE TYPE'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  
  
  


  changePassForm!:FormGroup;
  hide = true;
  hide1=true;
  hide2=true;
  submitted=false;
  value = 0;
  showTicks = false;
  autoTicks = false;
  tickInterval = 1;
  notificatinsData:any[]=[];
  vehicleNotificatinsData:any[]=[];
  subscription!: Subscription;
  notificationForm!:FormGroup;
  currentPage = 1;
  itemsPerPage = 10;
  pageSize: any;
  pageNumber: number=1;
  searchContent = new FormControl();
  expandedElement: any;
  getSliderTickInterval(): number | 'auto' {
    if (this.showTicks) {
      return this.autoTicks ? 'auto' : this.tickInterval;
    }

    return 0;
  }

  constructor(private fb:FormBuilder,
    private tostrService:ToastrService,
    private comman:CommanService,
    private spinner:NgxSpinnerService,
    private error:ErrorsService,
    private modalService:NgbModal,
    private dialog:MatDialog) { }

  ngOnInit(): void {
    this.getChangePwd();
    this.getNotificatinsData();
    this.getVehicleNotificatinsData();
  }
  
  ngAfterViewInit(){
    this.searchContent.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((x:any)=>{
     this.getVehicleNotificatinsData();
    });
 }
getChangePwd(){
  this.changePassForm=this.fb.group({
    currentPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    newPwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]],
    reTypePwd:['',[Validators.compose([Validators.required,Validators.pattern('^(?=.*[a-z0-9])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9\d@$!%*?&]{8,20}$')])]]                                 
  })
  this.notificationForm=this.fb.group({
    BoxopenOff:[],
    BoxopenOn:[],
    GeofenceIn:[],
    GeofenceOut:[],
    IgnitionOff:[],
    IgnitionOn:[],
    PowerCut:[],
    PowerConnected:[],
    Lowbatteryremoved:[],
    ConnectbacktomainBattery:[],
    DisconnectBattery:[],
    Lowbattery:[],  
    OverSpeed:[],
    Tilt:[]                              
  })
}
public onPageChange(pageNum: number): void {
  this.pageNumber=pageNum;
  this.pageSize = this.itemsPerPage * (pageNum - 1);
  this.getVehicleNotificatinsData();
}
onChangePwd(){
  this.submitted=true;
  if(this.changePassForm.invalid){
    this.tostrService.error("Please enter valid value")
    return;
  }
  else{
    if(this.changePassForm.value != this.changePassForm.value){
      this.tostrService.error("new password and confirm password not match");
      return
    }else{
      this.spinner.show();
    this.comman.setHttp('get', 'change-password?UserId='+this.comman.getUserId()+'&NewPassword='+this.changePassForm.value.reTypePwd+'&OldPassword='+this.changePassForm.value.currentPwd, true, false, false, 'loginBaseUrlApi');
      this.comman.getHttp().subscribe((response: any) => {
        if (response.statusCode == "200") {
          this.spinner.hide();
          this.tostrService.success(response.statusMessage);
        }
      })
    }
  }
}
get fpass(){
  return this.changePassForm.controls;
}
get f(){
  return this.notificationForm.controls;
}
getNotificatinsData() {
  this.comman.setHttp('get', 'notification/get-alert-types', true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.notificatinsData = res.responseData;
      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusCode)
        }
      }
    },
    error: ((error: any) => { this.error.handelError(error.status) })
  });
}
getVehicleNotificatinsData() {
  this.vehicleNotificatinsData=[]
  this.comman.setHttp('get', 'notification/get-Alert-linking?NoPage='+(this.searchContent.value?0:1)+'&RowsPerPage=10&SearchText='+this.searchContent.value, true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      if (res.statusCode === "200") {
        this.vehicleNotificatinsData = res.responseData.responseData1 ;
      } else {
        if (res.statusCode != "404") {
          this.vehicleNotificatinsData=[];
          this.error.handelError(res.statusCode)
        }else  if (res.statusCode == "404"){
            this.vehicleNotificatinsData=[];
            this.error.handelError(res.statusCode)
        }
      }
    },
    error: ((error: any) => { this.error.handelError(error.status) })
  });
}
switchNotification(rowData:any, lable:any){ 
  this.spinner.show();
  this.comman.setHttp('PUT', 'notification/set-Visibity-Notification?alertype='+rowData.alertType+'&Isnotification='+rowData.isVisibleToOfficer, true, false, false, 'vehicletrackingBaseUrlApi');
  this.subscription = this.comman.getHttp().subscribe({
    next: (res: any) => {
      this.spinner.hide();
      if (res.statusCode === "200") {
        this.tostrService.success(res.statusMessage);
      } else {
        if (res.statusCode != "404") {
          this.error.handelError(res.statusMessage)
        }
      }
      this.getNotificatinsData();
    }, 
    error: ((error: any) => { 
      this.spinner.hide();
      error: ((error: any) => { this.error.handelError(error.status) })
     } )
  });
}

}

