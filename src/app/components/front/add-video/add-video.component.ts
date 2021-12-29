import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadAwsService } from 'src/app/services/front/upload-aws.service';
import { Video } from 'src/app/models/video.model';
import { InterpretFormRespService } from 'src/app/services/interpret-form-resp.service';
import { VideoService } from '../../../services/front/video.service';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/front/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import * as AWS from 'node_modules/aws-sdk/global';
import * as S3 from 'node_modules/aws-sdk/clients/s3';
import { ToastrService } from 'ngx-toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-add-video',
  templateUrl: './add-video.component.html',
  styleUrls: ['./add-video.component.css']
})

export class AddVideoComponent implements OnInit {
  fileName;
  userAuth: User;
  idEdit: any = false;
  urlvideo;
  step = 1;
  vista_previa_64;
  form: FormGroup;
  request;
  selectedFiles: FileList;
  progress = 0;
  progressT = 0;
  uploaded_video = false;
  bucket: any = new S3(
    {
      accessKeyId: 'AKIAUEGUSGNGMAAIUDBI',
      secretAccessKey: '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',
      region: 'us-east-1'
    }
  );

  video: Video;
  uploading_video = false;
  sending = false;
  loading = true;
  videoDuration = 0;

  dropdownList:any[] = [];
  selectedItems:any[] = [];
  tags:any[];
  selected_tags:any[];
  dropdownSettings:IDropdownSettings = {};
  constructor(
    private uploadAwsS: UploadAwsService,
    private formBuilder: FormBuilder,
    private interpretRespS: InterpretFormRespService,
    private videoS: VideoService,
    private auth: AuthService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private validationsM: ValidationsMessagePipe,
    private InterpretResp: InterpretFormRespService,
    private toastrS: ToastrService,
    private router: Router


  ) { }

  ngOnInit(): void {
    this.userAuth = this.auth.getAuth();
    this.idEdit = this.activatedRoute.snapshot.paramMap.get("id");
    if (this.idEdit != null) {
      this.editVideo();
    } else {
      this.newVideo();
    }

  }

  newVideo() {
    let user_id;
    if (this.userAuth?.id) {
      user_id = this.userAuth.id;
    }
    this.videoS.new(user_id).subscribe((data: any) => {
      if(data.result == "redirect"){
        this.router.navigateByUrl("/completar-datos");
      }else{
        this.video = data.video;
        this.tags = data.tags;
        this.createForm();
      }
     
    });
  }

  editVideo() {
    this.videoS.edit(this.idEdit).subscribe((data: any) => {
      if(data.result == "redirect"){
        this.router.navigateByUrl("/completar-datos");
      }else{
        this.video = data.video;
        this.uploaded_video = true;
        this.vista_previa_64 = this.video.vista_previa;
        this.tags = data.tags;
        this.selected_tags = data.selected_tags;
        this.createForm();
      }
    });
  }

  // FORM INFO
  createForm() {
    this.form = this.formBuilder.group({
      id: [this.video.id, [Validators.required]],
      nombre: [this.video.nombre, Validators.required],
      etiquetas: [this.selected_tags],
      descripcion: [this.video.descripcion,]
    })
    this.loading = false;
    this.createDropdown();
  }

  saveInfo() {
    this.sending = true;
    if (this.form.status == 'INVALID') {
      this.form.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.videoS.addUpdateInfo(this.form.value).subscribe((resp: any) => {
      this.InterpretResp.success(resp, this.form);
      console.log(resp);

      if (resp.result == "ok") {
        if(!this.idEdit){
          this.step = 2;
          this.video.nombre = this.form.value.nombre;
          this.video.descripcion = this.form.value.descripcion;
        } else{
          this.toastrS.success("Los cambios han sido guardados con éxito.");
        }
      }else{
        console.log(resp);
      }
      this.sending = false;
    }, err => {
      console.log(err);

      this.InterpretResp.error(err, this.form);
      this.sending = false;
    });
  }

  // UPLOAD VIDEO
  selectFile(event: any) {
    this.uploading_video = true;
    this.uploaded_video = false;
    const file = event.target.files && event.target.files[0];
    if (file && file.type.indexOf('video') > -1) {
      this.fileName = file.name;
      this.selectedFiles = event.target.files;
      this.getThumbnail(file);
    } else {
      this.uploading_video = false;
      this.toastrS.warning("Formato de video no soportado.");
    }
  }

  getThumbnail(file) {
    let self = this;
    var fileReader: any = new FileReader();
    fileReader.onload = function () {
      var blob = new Blob([fileReader.result], { type: file.type });
      var url = URL.createObjectURL(blob);
      var video = document.createElement('video');


      var timeupdate = function () {
        if (snapImage()) {
          video.removeEventListener('timeupdate', timeupdate);
          video.pause();
        }
      };

      video.addEventListener('loadeddata', function () {
        self.videoDuration = video.duration;
        console.log(video.duration);

        if (snapImage()) {
          video.removeEventListener('timeupdate', timeupdate);
        }
      });

      // let videoMduration = 0.5;

      //   if( self.videoDuration > 2){
      //     console.log("MAYOOOOORRRRRRR");

      //     let videoMduration = Number(video.duration) / 2;
      //   }
      //   video.currentTime = videoMduration;

      var snapImage = function () {
        var canvas: any = document.createElement('canvas');
        if(Number(video.duration) > 2){
          video.currentTime =  Number(video.duration) / 2;
        }

        canvas.width = video.videoWidth /2;
        canvas.height = video.videoHeight /2;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        var image = canvas.toDataURL();
        var success = image.length > 100000;
        if (success) {
          var img = document.createElement('img');


          img.src = image;
          // document.getElementsByClassName('.thumbnail')[0].appendChild(img);
          img.src

          URL.revokeObjectURL(url);
          self.vista_previa_64 = img.src;
          var fileImage = self.convertB64toImageFile(img.src,self.video.id+'.png');
          self.uploadFile(file,fileImage);
        }
        return success;
      };

      video.addEventListener('timeupdate', timeupdate);
      video.preload = 'metadata';
      video.src = url;
      // Load video in Safari / IE11
      video.muted = true;
      video.playsInline = true;
      video.play();
    };
    fileReader.readAsArrayBuffer(file);
  }

  convertB64toImageFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
}

//Usage example:


  uploadFile(file,thumbnail) {
    this.progressT = 0;
    this.progress = 0;
    // upload thumbnail
   let self = this;
   const contentTypeT = thumbnail.type;
   const paramsT = {
     Bucket: 'onlyfetixx2',
     Key: "videos/" + this.userAuth.id + "/vista_previa/" + thumbnail.name,
     Body: thumbnail,
     ACL: 'public-read',
     ContentType: contentTypeT
   };

  this.bucket.upload(paramsT).on('httpUploadProgress', function (evt) {
     self.progressT = Math.round(100 * evt.loaded / evt.total);
   }).send(function (err, data) {
     if (err) {
       console.log('hubo un error al subir la vista previa del archivo.', err);
       self.toastrS.warning("Hubo un error al subir la vista previa del archivo, verifique su conexión a internet.");
       return false;
     }
      // save loation view
      self.video.vista_previa = data.Location;
     return true;
   });
    // upload video

    const contentType = file.type;
    const params = {
      Bucket: 'onlyfetixx2',
      Key: "videos/" + this.userAuth.id + "/" + file.name,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType
    };

    this.request = this.bucket.upload(params).on('httpUploadProgress', function (evt) {
      self.progress = Math.round(100 * evt.loaded / evt.total);
    }).send(function (err, data) {
      if (err) {
        console.log('hubo un error al subir el archivo', err);
        self.toastrS.warning("Hubo un error al subir el archivo, verifique su conexión a internet.");
        return false;
      }
      console.log(data);
      self.uploadLocationInfo(data);
      return true;
    });
  }

  uploadLocationInfo(info) {
    this.video.location = info.Location;
    this.video.bucket = info.Bucket;
    this.video.key = info.Key;
    this.uploaded_video = true;
    this.uploading_video = false;
  }

  cancelUpload(): void {
    this.request.abort();
  }

  back() {
    this.location.back();
  }

  validate(name: string) {
    let campo: any = this.form.get(name);
    if (campo) {
      if (campo.touched && campo.status == 'INVALID') {
        let err = this.validationsM.transform(campo.errors);
        return { 'valid': true, 'error': err };
      }
    }
    return { 'valid': false, 'error': '' };
  }

  save_update_video() {
    this.sending = true;
    this.videoS.save_update_video(this.video).subscribe((resp: any) => {
      this.InterpretResp.success(resp, this.form);
      if (resp.result == "ok") {
        this.location.back();
      }

    }, err => {
      this.InterpretResp.success(err, this.form);
      this.sending = false;
    });
  }


  // DROPDOWN LABELS
  createDropdown(){
    this.dropdownList =  this.tags;


    this.selectedItems = [
      { item_id: 3, item_text: 'Pune' },
      { item_id: 4, item_text: 'Navsari' }
    ];

    this.dropdownSettings = {

      searchPlaceholderText: "Buscar",
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      selectAllText: 'Seleccionar todas',
      unSelectAllText: 'Quitar todas',
      itemsShowLimit: 4,
      allowSearchFilter: true,
      limitSelection:4,

    };
  }

  onItemSelect(item: any) {
    console.log(item);
  }

  onSelectAll(items: any) {
    console.log(items);
  }

}




