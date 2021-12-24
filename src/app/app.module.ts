import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/front/navbar/navbar.component';
import { HomeComponent } from './components/front/home/home.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { ValidationsMessagePipe } from './pipes/validations-message.pipe';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { MyAccountComponent } from './components/front/my-account/my-account.component';
import { MyShoppingComponent } from './components/front/my-shopping/my-shopping.component';
import { MySalesComponent } from './components/front/my-sales/my-sales.component';
import { MySalesImagesComponent } from './components/front/my-sales-images/my-sales-images.component';
import { AddGalleryComponent } from './components/front/add-gallery/add-gallery.component';
import { AddVideoComponent } from './components/front/add-video/add-video.component';
import { WatchVideoComponent } from './components/front/watch-video/watch-video.component';
// import { InterpretFormRespService } from './services/interpret-form-resp.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { VideosComponent } from './components/front/videos/videos.component';
import { GallerryComponent } from './components/front/gallerry/gallerry.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    MyAccountComponent,
    MyShoppingComponent,
    MySalesComponent,
    MySalesImagesComponent,
    AddGalleryComponent,
    AddVideoComponent,
    WatchVideoComponent,
    VideosComponent,
    GallerryComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    ToastrModule.forRoot({maxOpened:2,closeButton:true,autoDismiss:true, enableHtml: true,timeOut: 6000,positionClass: 'toast-top-center'}),
    HttpClientModule,
    BrowserAnimationsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxIntlTelInputModule,
    NgSelectModule
  ],
  providers: [
    ValidationsMessagePipe,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


