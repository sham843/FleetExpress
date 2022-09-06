import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
baseUrl:string=''
  constructor(private http: HttpClient) {
    this.baseUrl='http://awsvehicletracking.mahamining.com/vehicle-tracking/'
   }
  getvehiclelist(){
    return this.http.get(this.baseUrl+'dashboard/get-vehicles-list?UserId=35898')
  }
}
