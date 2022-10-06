import { Injectable } from '@angular/core';
import { CanActivate, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonMethodsService } from '../services/common-methods.service';
import { WebStorageService } from '../services/web-storage.service';

@Injectable({
  providedIn: 'root'
})
export class LoginAuthGuard implements CanActivate {
  constructor(private WebStorage: WebStorageService, private commonMethods: CommonMethodsService) { }
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.WebStorage.checkUserIsLoggedIn()) {
      return true;
    }
    else {
      this.commonMethods.routerLinkRedirect('login');
      return false;
    }
  }

}
