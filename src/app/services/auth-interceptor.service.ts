import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, Subscriber, throwError } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { AuthService } from './front/auth.service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})

export class AuthInterceptorService implements HttpInterceptor {
  urlLogin = '/inicio-de-sesion';
  auth: any;
  refresh: boolean = false;
  tokenIntercept = false;
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformid: any
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let request = req;
    this.auth = this.authService.getAuth();
    if (this.auth) {
      request = req.clone({
        setHeaders: { authorization: `Bearer ${this.auth["token"]}` },
      });
    } else {
      this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
        let index = event.url.indexOf("?");
        let url = event.url;
        if (index != -1)
          url = event.url.substr(0, index);
        if(url != "/iniciar-sesion" && url != "/videos" && url != "/get-video" && url != "/galleries"){
          return
        }
      });
      // if (!request.url.includes('iniciar-sesion') && !request.url.includes('videos') && !request.url.includes('get-video') && !request.url.includes('galleries')) {
      //   this.router.navigateByUrl(this.urlLogin);
      // }
    }

    return <any>next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.toastr.warning("Su sesión ha expirado.");
          this.authService.logout();
        }else{
          this.toastr.warning("Error. no se puedo conectar al servidor, verifique su conexión a internet.");

        }
        return throwError(err);
      })
    );
  }
}
