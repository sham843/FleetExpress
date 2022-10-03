import { Injectable } from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthServiceService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInAuthGuard implements CanActivate {
  constructor(private authService: AuthServiceService,
    private router: Router,
    private toastrService: ToastrService) { }
  canActivate(): any {
    if (this.authService.isLogged()) {
      this.router.navigate(['./dashboard']);
      this.toastrService.error("You are already logged in");
    }
    else{
      return true;
    }
  }

}
