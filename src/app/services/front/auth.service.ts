import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AppConfig } from 'src/app/AppConfig';
import { HttpClient } from '@angular/common/http';
import { filter, tap } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  ENDPOINT = AppConfig.ENDPOINT;
  urlLogin = 'login';
  urlRegister = 'register';
  urlRefreshToken = 'refresh-token';
  urlLogout = 'logout';
  userAuth: any;
  redirectNoAuth = "";
  constructor(private http: HttpClient, private router: Router, @Inject(PLATFORM_ID) private platformid: any, private toastrS: ToastrService) { }

  // refreshToken() {
  //   let auth = this.getAuth();
  //   return this.http.post(this.ENDPOINT + this.urlRefreshToken, this.getAuth()).pipe(tap(auth => this.saveAuth(auth)));
  // }

  login(user: User) {
    return this.http.post(this.ENDPOINT + this.urlLogin, user);
  }

  register(user: User) {
    return this.http.post(this.ENDPOINT + this.urlRegister, user);
  }

  saveAuth(user: User) {
    let userAuth: any = user;
    if (isPlatformBrowser(this.platformid)) {
      localStorage.setItem('user', JSON.stringify(userAuth));
    }
    this.router.navigate([this.redirectNoAuth]);
  }

  getAuth() {
    if (isPlatformBrowser(this.platformid)) {
      let user: any = localStorage.getItem('user');
      if (user != undefined && user != null) {
        var array: any = localStorage.getItem('user');
        array = JSON.parse(array);
        return array;
      }
      return user;
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformid)) {

      localStorage.removeItem('user');
      window.location.href = "/";
    }
  }

}
