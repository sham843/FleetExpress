import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CommonMethodsService } from '../services/common-methods.service';
import { WebStorageService } from '../services/web-storage.service';


@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {
  constructor(private WebStorage: WebStorageService,
    private commonMethods: CommonMethodsService) { }
  canActivate(): any {
    if (this.WebStorage.checkUserIsLoggedIn()) {
      this.commonMethods.routerLinkRedirect('./dashboard');
      this.commonMethods.snackBar("You are already logged in", 1);
    }
    else {
      return true;
    }
  }

}
