import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Gallery } from 'src/app/models/gallery.model';
import { AuthService } from 'src/app/services/front/auth.service';
import { GalleryService } from 'src/app/services/front/gallery.service';
import { User } from '../../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { HttpEventType, HttpResponse, HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
@Component({
  selector: 'app-add-gallery',
  templateUrl: './add-gallery.component.html',
  styleUrls: ['./add-gallery.component.css']
})

export class AddGalleryComponent implements OnInit {
  loading = true;
  sending = false;
  userAuth: User;
  gallery: Gallery;
  images:any = [];
  form: FormGroup;
  idEdit:any;
  // upload
  processing = false;
  cardUploads = false;
  progressInfos: any = [];
  selectedFiles:any;
  constructor(private galleryS: GalleryService,
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private validationsM:ValidationsMessagePipe,
    private router:Router,
    private location:Location,
    private activatedRoute:ActivatedRoute,


  ) { }

  ngOnInit(): void {
    this.userAuth = this.auth.getAuth();
    this.idEdit = this.activatedRoute.snapshot.paramMap.get("id");
    console.log(this.idEdit);
    if(this.idEdit != null){
      this.editGallery();
    }else{
      this.newGallery();
    }
  }

  newGallery() {
    let id;
    if (this.userAuth?.id) {
      id = this.userAuth.id;
    }
    this.galleryS.newGallery(id).subscribe((data: any) => {
      this.gallery = data.gallery;
      this.images = data.images;
      this.formCreate();
    });
  }

  editGallery() {
    this.galleryS.editGallery(this.idEdit).subscribe((data: any) => {
      this.gallery = data.gallery;
      this.images = data.images;
      this.formCreate();
    });
  }

  formCreate() {

    this.form = this.formBuilder.group({
      id:[this.gallery.id, [Validators.required]],
      nombre: [this.gallery.nombre, [Validators.required, Validators.minLength(4)]],
      estatus: [this.gallery.estatus, [Validators.required]],
      user_id: [this.gallery.user_id, [Validators.required]],
    })

    this.loading = false;
  }

  addUpdateGallery() {
    this.sending = true;
    if (this.form.status == 'INVALID') {
      this.form.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.galleryS.addUpdateGallery(this.form.value,this.idEdit).subscribe((resp: any) => {
      if (resp?.result == "ok") {
        this.toastr.success(resp.message);
         this.location.back();
      } else if (resp.result == "error-validation") {
        let texterrors = '';
        for (let campo in this.form.controls) {
          if (resp.errors[campo]) {
            texterrors = texterrors + '<div>' + resp.errors[campo] + '</div>';
          }
        }
        this.toastr.warning('<div style="list-style: none;">' + texterrors + '</div>');
      } else {
        this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
      }
      this.sending = false;
    }, err => {
      this.sending = false;
      if (err?.error && err.error?.errors) {
        let texterrors = '';
        for (let campo in this.form.controls) {
          if (err.error.errors[campo]) {
            texterrors = texterrors + '<div>' + err.error.errors[campo] + '</div>';
          }
        }
        this.toastr.warning('<div style="list-style: none;">' + texterrors + '</div>');
      } else {
        this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
      }
    });
  }

  // inicio de sesion
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

  // Subir imagenes

  selectFiles(event: any) {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    this.uploadFiles();
  }

  uploadFiles() {
    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.upload(i, this.selectedFiles[i]);
    }
  }

  upload(idx: number, file: any) {
    this.sending = true;
    this.cardUploads = true;
    console.log(file.name);
    let regex = new RegExp("(.*?)\.(jpeg|png|jpg|gif|svg|webp)$"); //add or remove required extensions here
    let regexTest = regex.test(file.name);
    // verficar q sea csv
    if (!regexTest) {
      this.progressInfos[idx] = { percentage: 0, name: file.name, error: "No es una imagen.", completed: true, success: false };
      this.processingFiles();
      return;
    }

    this.progressInfos[idx] = { name: file.name, error: "", completed: false, success: false };
    this.galleryS.uploadImg(file,this.gallery.id).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          let total = 0;
          if (event?.total) {
            total = event.total;
          }
          this.progressInfos[idx].percentage = Math.round(100 * event.loaded / total);
        } else if (event instanceof HttpResponse) {
          console.log(event);
          if (event.body.result == 'error') {

            this.progressInfos[idx].percentage = 0;
            this.progressInfos[idx].error = event.body.message;
          } else if (event.body.result == "error-csv") {
            this.progressInfos[idx].percentage = 0;
            this.progressInfos[idx].error = event.body.message;
          } else if (event.body.result == "ok") {
            this.progressInfos[idx].success = true;
          }
          this.progressInfos[idx].completed = true;
          this.processingFiles();
        }
      },
      err => {
        console.log(err);
        this.progressInfos[idx].completed = true;
        this.progressInfos[idx].percentage = 0;
        this.progressInfos[idx].error = "Fallo la subida de este archivo.";
        this.processingFiles();
      });
  }

  processingFiles() {
    console.log("processingFiles");

    let length = this.progressInfos.length;
    let allCompleted = 0;
    let success = "no";
    if (length != 0) {
      this.progressInfos.forEach((prog:any, index:any) => {
        if (prog.completed == true) {
          allCompleted = allCompleted + 1;
        }
      });
      if(length ==  allCompleted){
        this.sending = false;
        this.refreshList();
      }
    } else {
      this.sending = false;
      this.refreshList();
    }
  }

  refreshList(){
    this.galleryS.images_gallery(this.gallery.id).subscribe( (data:any)=>{
      this.images = data;
    });
  }
}
