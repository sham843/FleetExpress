import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommanService {
  UserLoginDetails: any;
  userObj: any;
  tokanExpiredFlag: boolean = false;
  accessToken:any="eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMjM4OTUiLCJleHAiOjE2NjI5ODE5MDYsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTY2OTAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjU2NjkwIn0.Xy4qNEraCoMzOsZVhddRiGRYL4U0FObrJYJYHTrzc5A";
  getBaseurl(url: string) {
    switch (url) {
      case 'vehicletrackingBaseUrlApi': return 'https://aws-stpltrack-vehicletracking.mahamining.com/fleet-express/'; break   
       default: return '';break;
    }
  }
  private httpObj: any = {
    type: '',
    url: '',
    options: Object
  };
  clearHttp() {
    this.httpObj.type = '';
    this.httpObj.url = '';
    this.httpObj.options = {};
  }

  constructor(private http: HttpClient,
    private router:Router) { }

    getVehicleOwnerId() {
      let vehOwnerId = 256;
      return vehOwnerId
    }
    tokenExpireRefreshString() {
      let loginObj = "yBIGXBAiw/wBxXMqLGvIwAm4T81k+48wSI0Y+3bN2bg=";
      return loginObj;
    }
    tokenExpireDateTime() {
      let loginObj = "2022-09-12T14:00:55.3674331+05:30";
      return loginObj;
    }
    
  getHttp(): any {
    let temp: any = undefined;
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }
  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any) {
    // isHeader = false;
    // check user is login or not 
    let checkLOginData = sessionStorage.getItem('loggedInDetails');
    if (checkLOginData && this.tokanExpiredFlag == false && isHeader) {
      let tokenExp = JSON.parse(checkLOginData);
      let expireAccessToken: any = (Math.round(new Date("2022-09-12T14:00:55.3674331+05:30").getTime() / 1000));
      let tokenExpireDateTime: any = (Math.round(new Date("2022-09-12T14:40:55.3673315+05:30").getTime() / 1000));
      let currentDateTime: any = (Math.round(new Date().getTime() / 1000));
      if (currentDateTime >= expireAccessToken) {
        if (currentDateTime <= tokenExpireDateTime) {
          // this.tokanExpiredFlag = true
          let obj = {
            UserId: 23895,
            RefreshToken: this.tokenExpireRefreshString()
          }
          // this.tokenExpiredAndRefresh(obj);
        } else {
          // this.spinner.hide();
          sessionStorage.clear();
          this.router.navigate(['/login']);
          // this.toastrService.info('Your Session Has Expired. Please Re-Login Again.');
          return
          //this.UserLoginDetails = JSON.parse(sessionStorage.loggedInDetails);
          // this.tokanExpiredFlag = true
        
        }

      }
    }

/* 
"responseData3": {
      "accessToken": "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMzU4OTgiLCJleHAiOjE2NjI1NDEzNTcsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTY2OTAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjU2NjkwIn0.fYYxBql-zJYyqi-Q29Wc96S0gDrvT8q4IOIvJHPCI1A",
      "expireAccessToken": "2022-09-07T14:32:37.2544598+05:30",
      "refreshToken": {
        "UserId": "23895",
        "tokenString": "gPbE4f1q7mPr3haepepf467XqGNdC1a226sBsPPk/c4=",
        "expireAt": "2022-09-08T07:12:37.2543302+05:30"
      }
    }, */

  try {
      // this.userObj = JSON.parse(sessionStorage.loggedInDetails);
      // this.UserLoginDetails = JSON.parse(sessionStorage.loggedInDetails);
    } catch (e) { }
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.getBaseurl(baseUrl) + url;
    if (isHeader) {
      let tempObj: any = {
        "UserId": "23895",
        "Authorization": "Bearer " + this.accessToken // token set
      };
     
      this.httpObj.options.headers = new HttpHeaders(tempObj);
    }

    if (obj !== false) {
      this.httpObj.options.body = obj;
    }
    else {
      this.httpObj.options.body = false;
    }
    if (params !== false) {
      this.httpObj.options.params = params;
    }
    else {
      this.httpObj.options.params = false;
    } 
  }
}
