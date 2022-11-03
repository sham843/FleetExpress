import { DatePipe, Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, pairwise } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonMethodsService {
  codecareerPage!: string;
  previousUrl!: string;
  previousUrlFlag: any;

  constructor(
    private SnackBar: MatSnackBar,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    public location: Location,
  ) {
  }

  snackBar(data: string, status: number) {
    let snackClassArr: any = ['snack-success', 'snack-danger', 'snack-warning'];
    this.SnackBar.open(data, " ", {
      duration: 2000,
      panelClass: [snackClassArr[status]],
      verticalPosition: 'top', // 'top' | 'bottom'
      horizontalPosition: 'right', //'start' | 'center' | 'end' | 'left' | 'right'

    })
  }

  sanckBarHide() {
    this.SnackBar.dismiss();
  }

  pervPage() {
    this.location.back();
  }

  // Captcha code start 
  createCaptchaCarrerPage() {
    //clear the contents of captcha div first
    let id: any = document.getElementById('captcha');
    id.innerHTML = "";
    // "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";

    var charsArray = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lengthOtp = 5;
    var captcha = [];
    for (var i = 0; i < lengthOtp; i++) {
      //below code will not allow Repetition of Characters
      var index = Math.floor(Math.random() * charsArray.length + 0); //get the next character from the array
      if (captcha.indexOf(charsArray[index]) == -1)
        captcha.push(charsArray[index]);
      else i--;
    }
    var canv = document.createElement("canvas");
    canv.id = "captcha1";
    canv.width = 110;
    canv.height = 25;
    var ctx: any = canv.getContext("2d");
    ctx.font = "24px Arial";
    ctx.fillText(captcha.join(""), 0, 25);
    // ctx.strokeText(captcha.join(""), 0, 30);
    //storing captcha so that can validate you can save it somewhere else according to your specific requirements
    this.codecareerPage = captcha.join("");
    let appendChild: any = document.getElementById("captcha");
    appendChild.appendChild(canv); // adds the canvas to the body element

  }

  checkvalidateCaptcha() {
    return this.codecareerPage;
  }

  checkDataType(val: any) {
    let value: any;
    if (val == "" || val == null || val == "null" || val == undefined || val == "undefined" || val == 'string' || val == null || val == 0) {
      value = false;
    } else {
      value = true;
    }
    return value;
  }

  findIndexOfArrayObject(array: any, key: any, val: any) { // find index of array object  [{'id:0',:name:'john'}, {'id:1',:name:'deo'}]
    let index = array.findIndex((x: any) => x[key] === val);
    return index
  }

  someOfArrayObject(array: any, key: any, val: any) {
    let flag = array.some((x: any) => x[key] === val);
    return flag
  }

  findIndexOfArrayValue(array: any, val: any) { // find index of array value [1,2,3,4] 
    let index = array.indexOf(val);
    return index
  }


  dateWithTimeFormat(dateTime: any) { // 2022-05-11T13:01:46.067Z
    let dateWithTime = this.datePipe.transform(dateTime, 'yyyy-MM-dd' + 'T' + 'hh:mm:ss.ms');
    return dateWithTime + "Z";
  }

  dateFormat(dateTime: any) { // 2022-05-11T13:01:46.067Z
    let date = this.datePipe.transform(dateTime, 'yyyy-MM-dd');
    return date;
  }

  prevUrl(path: string) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd),
      pairwise()).subscribe((e: any[]) => {
        this.previousUrl = e[0].url;
        this.previousUrlFlag = this.previousUrl.includes(path);
        return this.previousUrlFlag
      });
    return this.previousUrlFlag;
  }

  removeFilerLocalStorage(flag: any) {
    if (flag == 'filter') {
      localStorage.getItem('filter') ? localStorage.removeItem('filter') : ''
    } else if (flag == 'filter') {
      localStorage.getItem('pagination') ? localStorage.removeItem('pagination') : ''
    }
  }


  oneMonPrevDate() {
    let prevDate = new Date();
    prevDate.setMonth(prevDate.getMonth() - 1);
    return this.dateFormat(prevDate);
  }

  todayDate() { // Today date sel in date picked
    let date = new Date();
    return this.dateFormat(date);
  }

  filter(value: string, array: any, key: any): string[] {
    const filterValue = value.toLowerCase();
    return array.filter((option: any) => option[key].toLowerCase().includes(filterValue.toLowerCase()));
  }

  redirectToNewTab(path: any) {
    window.open(path, '_blank');
  }

  routerLinkRedirect(path: any) {
    this.router.navigate([path], { relativeTo: this.route })
  }

  removeObjFromArray(array: any, key: any, val: any) {
    return array.filter((item: any) => item[key] !== val);
  }

  scrollBar(value: any) {
    window.scroll({
      top: value,
      behavior: 'smooth'
    });
  }

  // redToNextPageWithPar(id: any, link: string, label: string) {
  //   this.router.navigate([link + encodeURIComponent(CryptoJS.AES.encrypt(id.toString(), label).toString())]);
  // }

  // recParToUrl(id: any, label:string){
  //    let res =  CryptoJS.AES.decrypt(decodeURIComponent(id), label).toString(CryptoJS.enc.Utf8);
  //    return res;
  // }

  //   encryptData(rawData: string){
  //     var rsa = forge.pki.publicKeyFromPem(this.configService.asymmetric_Public_Key);
  //     return window.btoa(rsa.encrypt(rawData));
  // }

  currentDate(){
    return moment.utc().startOf('day').toISOString();
  }

  set24Hours() {
    var time = moment.duration("24:00:00");
    var date = moment();
    return  date.subtract(time);
  }

  setSevenDays() {
    const maxTodayDate = moment(new Date()).add(7, 'days').calendar();
    return moment(maxTodayDate).toISOString() < moment().toISOString() ? moment(maxTodayDate).toISOString() : moment().toISOString();
  }

  setBadgeClass(status: any) {
    let statusLowerCase = status?.toLowerCase();
    return statusLowerCase == 'approved' ? 'bg-success' : statusLowerCase == 'rejected' ? 'bg-danger' : statusLowerCase == 'pending' || statusLowerCase == null ? 'bg-warning text-dark' : statusLowerCase == 'waiting for approval' ? 'bg-info' : ''
  }

}
