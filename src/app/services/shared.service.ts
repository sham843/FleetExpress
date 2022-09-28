import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinner, Spinner } from 'ngx-spinner/lib/ngx-spinner.enum';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommanService } from './comman.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  vhlData: any;
  codecareerPage: any;
  constructor(private comman: CommanService,
    private spinner: NgxSpinnerService,
    private tostrservice: ToastrService,
    private http: HttpClient,
    private router:Router) {
  }
  ngOnInit() {
  }

  vehicleCount(): any {
    return new Observable(obj => {
      this.comman.setHttp('get', 'get-vehiclelists', true, false, false, 'vehicleBaseUrlApi');
      this.comman.getHttp().subscribe({
        next: (res: any) => {
          if (res.statusCode === "200") {
            obj.next(res);
          }
        }
      })
    })
  }

  createCaptchaCarrerPage() {
    //clear the contents of captcha div first
    let id: any = document.getElementById('captcha');
    id.innerHTML = "";

    var charsArray =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lengthOtp = 6;
    var captcha = [];
    for (var i = 0; i < lengthOtp; i++) {
      var index = Math.floor(Math.random() * charsArray.length + 1);
      if (captcha.indexOf(charsArray[index]) == -1)
        captcha.push(charsArray[index]);
      else i--;
    }
    var canv = document.createElement("canvas");
    canv.id = "captcha1";
    canv.width = 120;
    canv.height = 50;
    var ctx: any = canv.getContext("2d");
    ctx.font = "23px Times New Roman";
    ctx.fillText(captcha.join(""), 0, 32);
    this.codecareerPage = captcha.join("");
    let appendChild: any = document.getElementById("captcha");
    appendChild.appendChild(canv);
  }

  checkvalidateCaptcha() {
    return this.codecareerPage;
  }
  uploadDocuments(event?: any, allowedDocTypes?: any) {
    return new Observable(obj => {
      let selResult = event != '' && event != undefined ? event.target.value.split('.') : '';
      const docExt = selResult.pop();
      let file = '';
      let fileName = '';
      const docExtLowerCase = docExt.toLowerCase();
      if (allowedDocTypes.match(docExtLowerCase)) {
        if (event.target != undefined && event.target.files) {
          if (event != '') {
            file = event.target.files[0];
            fileName = 'files';
          }
          const reader: any = new FileReader();
          reader.onload = () => {
            const formData = new FormData();
            formData.append(fileName, file);
            this.comman.setHttp('post', 'upload-document', true, formData, false, 'uploadDocumentBaseUrlApi');
            this.comman.getHttp().subscribe({
              next: (res: any) => {
                this.spinner.hide();
                if (res.statusCode === "200") {
                  obj.next(res);
                }
                else {
                  // this.commonService.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
                }
              },
              error: ((error: any) => {

              })
            })
          }
          reader.readAsDataURL(file);
        }
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.tostrservice.error('Please Select Valid Document');
      }
    })
  }
  uploadProfilePhoto(event?: any, folderName?: any, allowedDocTypes?: any) {
    return new Observable(obj => {
      let selResult = event != '' && event != undefined ? event.target.value.split('.') : '';
      const docExt = selResult.pop();
      let file = '';
      let fileName = '';
      const docExtLowerCase = docExt.toLowerCase();
      if (allowedDocTypes.match(docExtLowerCase)) {
        if (event.target != undefined && event.target.files) {
          if (event != '') {
            file = event.target.files[0];
            fileName = 'files'
          }
          const reader: any = new FileReader();
          reader.onload = () => {
            const formData = new FormData();
            formData.append('DirName', folderName)
            formData.append(fileName, file);
            this.comman.setHttp('post', 'upload-photo', true, formData, false, 'uploadDocumentBaseUrlApi');
            this.comman.getHttp().subscribe({
              next: (res: any) => {
                this.spinner.hide();
                if (res.statusCode === "200") {
                  obj.next(res);
                }
                else {
                  // this.commonService.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.toastrService.error(res.statusMessage);
                }
              },
              error: ((error: any) => {

              })
            })
          }
          reader.readAsDataURL(file);
        }
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.tostrservice.error('Please Select Valid Document');
      }
    })
  }
  logOut() {
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}


