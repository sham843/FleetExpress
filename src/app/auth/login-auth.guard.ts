import { Injectable } from '@angular/core';
import{CanActivate,UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonMethodsService } from '../services/common-methods.service';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {
  constructor(private _authService: AuthServiceService,private commonMethods:CommonMethodsService) { }
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this._authService.isLogged()) {
      return true;
    }
    else {
      this.commonMethods.routerLinkRedirect('login');
      return false;
    }
  }

}
