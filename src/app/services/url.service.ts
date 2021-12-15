import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class UrlService {


  constructor(private router: Router) { }
    let index = event.url.indexOf("?");
    this.url = event.url;
    if (index != -1)
      this.url = event.url.substr(0, index);
    // current(){
    //   this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
    //     return "hola"
    //   });
    // }


}
