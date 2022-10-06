import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subscription } from 'rxjs';
import { ApiCallService } from './api-call.service';
import { CommonMethodsService } from './common-methods.service';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  codecareerPage!: string;
  subscription!: Subscription;
  constructor(private commonMethods:CommonMethodsService,
    private error:ErrorsService,
    private apiCall:ApiCallService,
    private spinner: NgxSpinnerService,
) {
  }
  createCaptchaCarrerPage() {
    //clear the contents of captcha div first
    let id: any = document.getElementById('captcha');
    id.innerHTML = "";
    var charsArray =
      "0123456789";
    var lengthOtp = 4;
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
            this.apiCall.setHttp('post', 'upload-document', true, formData, false, 'uploadDocumentBaseUrlApi');
            // this.subscription =
            this.apiCall.getHttp().subscribe({
              next: (res: any) => {
                this.spinner.hide();
                if (res.statusCode === "200") {
                  obj.next(res);
                }
                else {
                  this.commonMethods.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) : this.commonMethods.snackBar(res.statusMessage, 1);
                }
              },
            })
          }
          reader.readAsDataURL(file);
        }
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.commonMethods.snackBar('Please Select Valid Document', 1);
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
            this.apiCall.setHttp('post', 'upload-photo', true, formData, false, 'uploadDocumentBaseUrlApi');
            // this.subscription =
            this.apiCall.getHttp().subscribe({
              next: (res: any) => {
                this.spinner.hide();
                if (res.statusCode === "200") {
                  obj.next(res);
                }
                else {
                  this.commonMethods.checkDataType(res.statusMessage) == false ? this.error.handelError(res.statusCode) :this.commonMethods.snackBar(res.statusMessage, 1);
                }
              },
            })
          }
          reader.readAsDataURL(file);
        }
      }

      else {
        obj.error("Only " + allowedDocTypes + " file format allowed.");
        this.commonMethods.snackBar('Please Select Valid Document', 1);
      }
    })
  }
  logOut() {
    sessionStorage.clear();
    this.commonMethods.routerLinkRedirect('login');
  }
  ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}


