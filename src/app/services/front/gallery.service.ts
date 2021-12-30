import { Injectable } from '@angular/core';
import { AppConfig } from 'src/app/AppConfig';
import { HttpClient, HttpEvent, HttpRequest} from '@angular/common/http';
import { Gallery } from '../../models/gallery.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  ENDPOINT = AppConfig.ENDPOINT;
  urlGalleriesUser = 'galleries-user';
  urlGalleries = 'galleries';

  urlNewGallery = 'new-gallery';
  urlAddGallery = 'add-gallery';
  urleditGallery = 'edit-gallery';
  urlUpdateGallery = 'update-gallery';
  urlDeleteGallery = 'delete-gallery';
  urlAddImage = 'add-image';
  urlUpdateImage = 'update-image';
  urlDeleteImage = 'delete-image';
  urlImagesGallery = 'images-gallery';
  url_get_gallery = 'url-get-gallery';
  constructor(private http:HttpClient) {

  }

  newGallery(id:any) {
    return this.http.post(this.ENDPOINT + this.urlNewGallery,{id:id});
  }
  editGallery(id:any) {
    return this.http.get(this.ENDPOINT + this.urleditGallery+"/"+id);
  }

  addUpdateGallery(gallery:Gallery,idedit:any) {
    if(idedit?.length){
      return this.http.post(this.ENDPOINT + this.urlUpdateGallery,gallery);
    }
    return this.http.post(this.ENDPOINT + this.urlAddGallery,gallery);
  }

  // addGallery(gallery:Gallery){
  //   return this.http.post(this.ENDPOINT + this.urlAddGallery,gallery);
  // }


  uploadImg(file: File, id:any): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    formData.append('gallery_id', id);


    const req = new HttpRequest('POST', this.ENDPOINT+'upload-image', formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  images_gallery(gallery_id:any){
    return this.http.post(this.ENDPOINT + this.urlImagesGallery,{id:gallery_id});
  }

  galleriesUser(gallery_id:any){
    return this.http.get(this.ENDPOINT + this.urlGalleriesUser+"?id="+gallery_id);
  }

  galleries(limit="",search:any){
    return this.http.get(this.ENDPOINT + this.urlGalleries+"?search="+search+"&limit="+limit);
  }
  
  getGallery(slug:string){
    return this.http.post(this.ENDPOINT + this.url_get_gallery,{slug:slug});
  }


}
