import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { CommonMethodsService } from './common-methods.service';
import { WebStorageService } from './web-storage.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {
  vhlCount: any;
  UserLoginDetails: any;
  userObj: any;
  userObjData: any;
  tokanExpiredFlag: boolean = false;
  loginObj: any;
  userData: any;
  disableCloseFlag: boolean = true//modal disableCloseFlag
  private httpObj: any = {
    type: '',
    url: '',
    options: Object
  };

  constructor(private http: HttpClient,
    private webStorage: WebStorageService,
    private spinner: NgxSpinnerService,
    private config: ConfigService,
    private commonMethods: CommonMethodsService) {
  }



  vehicleCount() {
    return new Observable(obj => {
      this.setHttp('get', 'vehicle/get-vehiclelists?', true, false, false, 'fleetExpressBaseUrl');
      this.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode == "200") {
            obj.next(res);
          }
        }
      })
    })
  }
  clearHttp() {
    this.httpObj.type = '';
    this.httpObj.url = '';
    this.httpObj.options = {};
  }

  getHttp(): any {
    !this.httpObj.options.body && (delete this.httpObj.options.body)
    !this.httpObj.options.params && (delete this.httpObj.options.params)
    return this.http.request(this.httpObj.type, this.httpObj.url, this.httpObj.options);
  }

  setHttp(type: string, url: string, isHeader: Boolean, obj: any, params: any, baseUrl: any) {
    // isHeader = false;
    // check user is login or not 
    let checkLOginData: any = localStorage.getItem('loggedInData');
    if (checkLOginData && this.tokanExpiredFlag == false && isHeader) {
      let tokenExp = JSON.parse(checkLOginData);
      let expireAccessToken: any = (Math.round(new Date(tokenExp.responseData3.expireAccessToken).getTime() / 1000));
      let tokenExpireDateTime: any = (Math.round(new Date(tokenExp.responseData3.refreshToken.expireAt).getTime() / 1000));
      let currentDateTime: any = (Math.round(new Date().getTime() / 1000));
      if (currentDateTime >= expireAccessToken) {
        if (currentDateTime <= tokenExpireDateTime) {
          this.tokanExpiredFlag = true
          let obj = {
            UserId: this.webStorage.getUserId(),
            RefreshToken: this.webStorage.tokenExpireRefreshString()
          }
          this.tokenExpiredAndRefresh(obj);
        } else {
          this.spinner.hide();
          localStorage.clear();
          this.commonMethods.routerLinkRedirect('login');
          this.commonMethods.snackBar("Your Session Has Expired. Please Re-Login Again.", 1);
          return;
        }

      }
    }
    try {
      this.userObj = localStorage.getItem('loggedInData');
      this.userObjData = JSON.parse(this.userObj);
    } catch (e) { }
    this.clearHttp();
    this.httpObj.type = type;
    this.httpObj.url = this.config.returnBaseUrl(baseUrl) + url;
    if (isHeader) {
      let tempObj: any = {
        "UserId": this.webStorage.getUserId().toString(),
        "Authorization": "Bearer " + this.userObjData?.responseData3.accessToken // token set
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
    let callRefreshTokenAPI = this.http.post('https://aws-stpltrack-vehicletracking.mahamining.com/fleet-express/login/refresh-token', obj);
    callRefreshTokenAPI.subscribe((res: any) => {
      if (res.statusCode === "200") {
        let loginObj: any = localStorage.getItem('loggedInData');
        loginObj = JSON.parse(loginObj);
        loginObj.responseData3 = res.responseData;
        localStorage.setItem('loggedInData', JSON.stringify(loginObj));
        this.tokanExpiredFlag = false;
      }
      else if (res.statusCode === "409") {
        this.commonMethods.snackBar(res.statusMessage, 1);
        this.spinner.hide();
      }
      else {
        this.spinner.hide();
        localStorage.clear();
        this.commonMethods.routerLinkRedirect('login');
        this.commonMethods.snackBar("Your Session Has Expired. Please Re-Login Again.", 1);
      }
    })
  }
}
