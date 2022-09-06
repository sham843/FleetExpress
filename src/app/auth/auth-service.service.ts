import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }
  isLogged(){
    if(localStorage.getItem('loginData')){
      return true
    }
    else{
      return false;
    }
  }
}
