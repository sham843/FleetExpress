import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  codecareerPage:any;
  constructor() { }
  createCaptchaCarrerPage() {
    //clear the contents of captcha div first
    let id :any = document.getElementById('captcha');
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
    var ctx:any = canv.getContext("2d");
    ctx.font = "23px Times New Roman";
    ctx.fillText(captcha.join(""), 0, 32);
    this.codecareerPage = captcha.join("");
    let appendChild :any = document.getElementById("captcha");
    appendChild.appendChild(canv); 
    }
    
    checkvalidateCaptcha() {
      return this.codecareerPage;
    }
}
