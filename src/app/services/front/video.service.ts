import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpRequest } from 'aws-sdk';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/AppConfig';
import { Video } from 'src/app/models/video.model';


@Injectable({
  providedIn: 'root'
})
export class VideoService {
  ENDPOINT = AppConfig.ENDPOINT;
  urlVideos = 'videos';
  urlVideosUser = 'videos-user';
  urlGetVideo = 'get-video';
  urlUpdateInfo = 'update-info-video';
  urlNewVideo = 'new-video';
  urlAddVideo = 'add-video';
  urleditVideo = 'edit-video';
  urlUpdateVideo = 'update-video';
  urlDeleteVideo = 'delete-video';
  // urlUploadLocationInfo = 'upload-location-info';
  urlSaveUpdateVideo = 'save-update-video';
  constructor(private http: HttpClient) {

  }

  videos(typeFilter:string,search:any,limit:any=""){
    if(!search?.length){
      search = "";
    }
    return this.http.get(this.ENDPOINT + this.urlVideos+"?"+typeFilter+"="+search+"&limit="+limit);
  }

  getVideo(id:any){
    return this.http.get(this.ENDPOINT + this.urlGetVideo+"?id="+id);
  }

  videosUser(user_id:number){
    return this.http.get(this.ENDPOINT + this.urlVideosUser+"?user_id="+user_id);
  }

  new(user_id: any) {
    return this.http.post(this.ENDPOINT + this.urlNewVideo, { id: user_id });
  }

  edit(id: any) {
    return this.http.get(this.ENDPOINT + this.urleditVideo + "/" + id);
  }

  addUpdateInfo(video:Video){
    return this.http.post(this.ENDPOINT + this.urlUpdateInfo,video);
  }

  addUpdate(video:Video,idedit:any) {
    if(idedit?.length){
      return this.http.post(this.ENDPOINT + this.urlUpdateVideo,video);
    }
    return this.http.post(this.ENDPOINT + this.urlAddVideo,video);
  }

  // uploadLocationInfo(video:Video){

  //   return this.http.post(this.ENDPOINT + this.urlUploadLocationInfo,video);
  // }

  save_update_video(video:Video){
    return this.http.post(this.ENDPOINT + this.urlSaveUpdateVideo,video);
  }


  // uploadImg(file: File, id:any): Observable<HttpEvent<any>> {
  //   const formData: FormData = new FormData();
  //   formData.append('file', file);
  //   formData.append('Video_id', id);

  //   const req = new HttpRequest('POST', this.ENDPOINT+'upload-image', formData, {
  //     reportProgress: true,
  //     responseType: 'json'
  //   });

  //   return this.http.request(req);
  // }

  // images_Video(Video_id:any){
  //   return this.http.post(this.ENDPOINT + this.urlImagesVideo,{id:Video_id});
  // }

  // galleries(Video_id:any){
  //   return this.http.get(this.ENDPOINT + this.urlGalleries+"?id="+Video_id);
  // }
}
