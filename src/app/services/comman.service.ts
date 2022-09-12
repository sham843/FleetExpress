import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommanService {
  UserLoginDetails: any;
  userObj: any;
  userObjData: any;
  tokanExpiredFlag: boolean = false;
  loginObj: any;
  accessToken: any = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiMjM4OTUiLCJleHAiOjE2NjI5NzI4NzMsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTY2OTAiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjU2NjkwIn0.WZ5IQOYMfCB1IO7NNvlCJYMdptVZ30M2Q-se0ytBFbM";
  getBaseurl(url: string) {
    switch (url) {
      case 'vehicletrackingBaseUrlApi': return 'https://aws-stpltrack-vehicletracking.mahamining.com/fleet-express/'; break
      default: return ''; break;
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
    private router: Router) {
  }

  getsessionStorageData() {
    let loginObj: any = sessionStorage.getItem('loginDetails');
    let sessionData = JSON.parse(loginObj).responseData[0];
    return sessionData;
  }
  getUserId(){
    let vehOwnerId = this.getsessionStorageData();
    return vehOwnerId.id;
  }
  getVehicleOwnerId() {
    let vehOwnerId = this.getsessionStorageData();
    return vehOwnerId.vehicleOwnerId
  }
  tokenExpireRefreshString() {
    let loginObj: any = sessionStorage.getItem('loginDetails');
    let sessionData = JSON.parse(loginObj).responseData3;
    return sessionData.refreshToken.tokenString;
  }
  tokenExpireDateTime() {
    let loginObj: any = sessionStorage.getItem('loginDetails');
    let sessionData = JSON.parse(loginObj).responseData3;
    return sessionData.expireAccessToken;
  }

  /*   
  */

  getHttp(): any {
    let temp: any = undefined;
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }
  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any) {
    // isHeader = false;
    // check user is login or not 
    let checkLOginData: any = sessionStorage.getItem('loginDetails');
    if (checkLOginData && this.tokanExpiredFlag == false && isHeader) {
      let tokenExp = JSON.parse(checkLOginData);
      let expireAccessToken: any = (Math.round(new Date(tokenExp.responseData3.expireAccessToken).getTime() / 1000));
      let tokenExpireDateTime: any = (Math.round(new Date(tokenExp.responseData3.refreshToken.expireAt).getTime() / 1000));
      let currentDateTime: any = (Math.round(new Date().getTime() / 1000));
      if (currentDateTime >= expireAccessToken) {
        if (currentDateTime <= tokenExpireDateTime) {
          this.tokanExpiredFlag = true
          let obj = {
            UserId: 23895,
            RefreshToken: this.tokenExpireRefreshString()
          }
          this.tokenExpiredAndRefresh(obj);
        } else {
          // this.spinner.hide();
          sessionStorage.clear();
          this.router.navigate(['/login']);
          // this.toastrService.info('Your Session Has Expired. Please Re-Login Again.');
          return
          this.UserLoginDetails = JSON.parse(sessionStorage['loginDetails']);
          this.tokanExpiredFlag = true

        }

      }
    }

    try {
      this.userObj = sessionStorage.getItem('loginDetails');
      this.userObjData = JSON.parse(this.userObj);
    } catch (e) { }
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.getBaseurl(baseUrl) + url;
    if (isHeader) {
      let tempObj: any = {
        // "UserId": "23895",
        "Authorization": "Bearer " + this.userObjData.responseData3.accessToken // token set
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

  tokenExpiredAndRefresh(obj: any) {
    let callRefreshTokenAPI =  this.http.post('https://aws-stpltrack-vehicletracking.mahamining.com/fleet-express/login/refresh-token', obj);
     callRefreshTokenAPI.subscribe((res: any) => {
       if (res.statusCode === "200") {
         let loginObj: any = sessionStorage.getItem('loginDetails');
         loginObj = JSON.parse(loginObj);
         loginObj.responseData3 = res.responseData;
         sessionStorage.setItem('loginDetails', JSON.stringify(loginObj));
         this.tokanExpiredFlag = false;
       }
       else if (res.statusCode === "409") {
        //  this.spinner.hide();
       }
       else {
        //  this.spinner.hide();
         sessionStorage.clear();
         this.router.navigate(['/login']);
        //  this.toastrService.info('Your Session Has Expired. Please Re-Login Again.')
       }
     })
   }
}
