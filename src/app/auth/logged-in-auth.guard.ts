import { Injectable } from '@angular/core';
import {CanActivate} from '@angular/router';
import { CommonMethodsService } from '../services/common-methods.service';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {
  constructor(private authService: AuthServiceService,
    private commonMethods:CommonMethodsService) { }
  canActivate(): any {
    if (this.authService.isLogged()) {
      this.commonMethods.routerLinkRedirect('./dashboard');
      this.commonMethods.snackBar("You are already logged in", 1);
    }
    else{
      return true;
    }
  }

}
