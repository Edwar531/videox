import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/AppConfig';


import { AppComponent } from 'src/app/app.component';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {
  user:User;
  ENDPOINT = AppConfig.ENDPOINT;
  urlGetUser = "user";
  url_changue_image_user = 'change-image-user';
  url_delete_img = 'delete-image-user';
  urlUpdateAlias = "update-alias";
  urlUpdateEmail = "update-email";
  urlEditPassword = "edit-password-profile";
  urlUpdatePersonalInfo = "update-personal-info";
  urlUpdateDocumentData = "update-document-data";
  urlUpdateContactInformation = "update-contact-information";
  urlTokenUpdateEmail = "generate-token-update-email";

  constructor(
    private http:HttpClient
  ) { }

  getUser(id:any) {
    return this.http.post(this.ENDPOINT + this.urlGetUser,{id:id});
  }

  uploadImg(file: File, id:any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('user_id', id);
    const req = new HttpRequest('POST', this.ENDPOINT+this.url_changue_image_user, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);
  }

  delete_img(id:number) {
    return this.http.post(this.ENDPOINT + this.url_delete_img,{id:id});
  }

  updateAlias(user:User) {
    return this.http.post(this.ENDPOINT + this.urlUpdateAlias,user);
  }

  generateTokenUpdateEmail(data:any){
    return this.http.post(this.ENDPOINT + this.urlTokenUpdateEmail,{id:data.id, correo:data.correo,contraseña:data.contraseña});
  }

  updateEmail(user:User){
    return this.http.post(this.ENDPOINT + this.urlUpdateEmail,user);
  }

  EditPassword(user:User){
    return this.http.post(this.ENDPOINT + this.urlEditPassword,user);
  }

  UpdatePersonalInfo(user:User){
    return this.http.post(this.ENDPOINT + this.urlUpdatePersonalInfo,user);
  }

  UpdateDocumentData(user:User){
    return this.http.post(this.ENDPOINT + this.urlUpdateDocumentData,user);
  }

  updateContactInformation(user:User){
    return this.http.post(this.ENDPOINT + this.urlUpdateContactInformation,user);
  }

}
