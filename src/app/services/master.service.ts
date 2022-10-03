import { Injectable } from '@angular/core';
import { ApiCallService } from './api-call.service';
import { WebStorageService } from './web-storage.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  vehicleLists = new Array();
  constructor(private apiCall: ApiCallService, private webStorage: WebStorageService) { }

  getVehicleListData() { // get all Vechile list 
    return new Observable((obj) => {
      this.apiCall.setHttp('get', 'get-vehicle-list?vehicleOwnerId=' + this.webStorage.getVehicleOwnerId(), true, false, false, 'vehicletrackingBaseUrlApi');
      this.apiCall.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode === "200") { this.vehicleLists = res.responseData; obj.next(this.vehicleLists); } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }
  getDriverListData() { // get all Driver list 
    return new Observable((obj) => {
      // 'get', 'get-driver?searchText=' + this.searchDriverForm.value.driverName + '&pageno=' + this.paginationNo + '&rowperPage=' + this.pageSize,
      this.apiCall.setHttp('get', 'get-driver?searchText=' + '&pageno='+'&rowperPage=', true, false, false, 'driverBaseUrlApi');
      this.apiCall.getHttp().subscribe({
        next: (res: any) => { if (res.statusCode === "200") { this.vehicleLists = res.responseData; obj.next(this.vehicleLists); } else { obj.error(res); } },
        error: (e: any) => { obj.error(e) }
      });
    });
  }
}
