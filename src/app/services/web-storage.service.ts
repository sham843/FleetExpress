import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebStorageService {

  constructor() { }

  checkUserIsLoggedIn() { // check user isLoggedIn or not
    let sessionData: any = sessionStorage.getItem('loggedIn');
    sessionData == null || sessionData == '' ? localStorage.clear() : '';
    if (localStorage.getItem('loggedInData') && sessionData == 'true') return true;
    else return false;
  }
  
  getsessionStorageData() {
    let loginObj: any = localStorage.getItem('loggedInData');
    let sessionData = JSON.parse(loginObj).responseData[0];
    return sessionData;
  }
  getUser() {
    return this.getsessionStorageData();
  }
  getUserId() {
    let vehOwnerId = this.getsessionStorageData();
    return vehOwnerId.id;
  }
  getVehicleOwnerId() {
    let vehOwnerId = this.getsessionStorageData();
    return vehOwnerId.vehicleOwnerId
  }
  tokenExpireRefreshString() {
    let loginObj: any = localStorage.getItem('loggedInData');
    let sessionData = JSON.parse(loginObj).responseData3;
    return sessionData.refreshToken.tokenString;
  }
  tokenExpireDateTime() {
    let loginObj: any = localStorage.getItem('loggedInData');
    let sessionData = JSON.parse(loginObj).responseData3;
    return sessionData.expireAccessToken;
  }

  getCreatedDate() {
    const date = new Date();
    return date.getFullYear() +
      "-" + ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) +
      "-" + (date.getDate() < 10 ? '0' : '') + date.getDate() +
      "T" + (date.getHours() < 10 ? '0' : '') + date.getHours() +
      ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +
      ":" + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds() +
      "." + (date.getMilliseconds() < 10 ? '00' : (date.getMilliseconds() < 100 ? '0' : '')) + date.getMilliseconds() +
      "Z"
  }
}
