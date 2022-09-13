import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }
  isLogged(){
    if(sessionStorage.getItem('loginDetails')){
      return true
    }
    else{
      return false;
    }
  }
}
