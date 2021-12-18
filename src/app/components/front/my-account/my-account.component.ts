import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/front/auth.service';
import { AppConfig } from '../../../AppConfig';
import { UserService } from '../../../services/front/user.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { InterpretFormRespService } from 'src/app/services/interpret-form-resp.service';
import { ValidatorsService } from '../../../services/validators.service';


@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})

export class MyAccountComponent implements OnInit {
  sending = true;
  userAuth: User;
  user: User;
  countries: any;
  file: any;
  cardUpload = false;
  progressInfo = { porcentage: 0, name: "", error: "", completed: false };
  // forms
  formAlias: FormGroup;
  formEmail: FormGroup;
  form_email: FormGroup;

  @ViewChild('modal_alias') modal_alias: any;
  @ViewChild('modal_delete_img') modal_delete_img: any;
  @ViewChild('modal_email') modal_email: any;


  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private userS: UserService,
    private formBuilder: FormBuilder,
    private modalS: NgbModal,
    private validationsM: ValidationsMessagePipe,
    private interpretResp: InterpretFormRespService,
    private validatorsS: ValidatorsService,

  ) { }

  ngOnInit(): void {
    this.userAuth = this.authS.getAuth();
    if (!this.userAuth?.id) {
      this.authS.logout();
    }
    this.getUser();
  }

  getUser() {
    this.userS.getUser(this.userAuth?.id).subscribe((data: any) => {
      this.user = data.user;
      this.countries = data.countries;
      this.sending = false;
    });
  }
  // Change Image
  changeImage(event) {
    console.log(event.target.files[0]);
    this.upload(0, event.target.files[0]);
  }

  upload(idx: number, file: any) {
    this.sending = true;
    this.cardUpload = true;

    let regex = new RegExp("(.*?)\.(jpeg|png|jpg|gif|svg|webp)$"); //add or remove required extensions here
    let regexTest = regex.test(file.name);
    // verficar q sea imagen
    if (!regexTest) {
      this.progressInfo = { porcentage: 0, name: file.name, error: "No es un archivo de imagen soportado.", completed: true };
      this.sending = false;
      return;
    }
    this.progressInfo = { porcentage: 0, name: file.name, error: "", completed: false };

    this.userS.uploadImg(file, this.userAuth?.id).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          let total = 0;
          if (event?.total) {
            total = event.total;
          }
          this.progressInfo.porcentage = Math.round(100 * event.loaded / total);
        } else if (event instanceof HttpResponse) {
          console.log(event);
          if (event.body.result == 'error') {
            this.progressInfo.error = event.body.message;
          } else if (event.body.result == "ok") {
            this.progressInfo.completed = true;
            this.sending = false;
            this.user.imagen_de_perfil = event.body.location;
            this.cardUpload = false;
          }
        }
      },
      err => {
        console.log(err);
        this.progressInfo.completed = true;
        this.progressInfo.porcentage = 0;
        this.progressInfo.error = "Fallo la subida de este archivo.";
        this.sending = false;
      });
  }
  // SENDS FORMS

  saveAlias() {
    this.sending = true;
    this.userS.updateAlias(this.formAlias.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.formAlias);
      console.log(resp);
      if (resp.result == "ok") {
        this.user.alias = resp.alias;
        this.modalS.dismissAll();
      } else {
        console.log(resp);
      }
      this.sending = false;
    }, err => {
      console.log(err);
      // this.interpretResp.error(err, this.formAlias);
      this.sending = false;
    });
  }

  // DELETE IMG
  showModalDeleteImg() {
    this.createformAlias();
    this.modalS.open(this.modal_delete_img, { centered: true, backdrop: 'static', size: 'md', keyboard: false }).result.then((result) => {
      if (result != !"cancel") {
        this.delete_img()
      }
      // this.modalS.dismissAll();
      // return;
    }).catch((err) => {
      // return;
    });
  }

  delete_img() {
    this.userS.delete_img(this.formAlias.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.formAlias);
      console.log(resp);
      if (resp.result == "ok") {
        this.user.imagen_de_perfil = "";
        this.modalS.dismissAll();
      } else {
        console.log(resp);
      }
      this.sending = false;
    }, err => {
      console.log(err);
      this.sending = false;
    });
  }

  // UPDATE ALIAS
  showmodal_alias() {
    this.createformAlias();
    this.modalS.open(this.modal_alias, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
    }).catch((err) => {
    });
  }
  // FORM ALIAS
  createformAlias() {
    this.formAlias = this.formBuilder.group({
      id: [this.user.id, [Validators.required]],
      alias: [this.user.alias, [Validators.required, Validators.minLength(3), this.validatorsS.only_letters_numbers_underscore]],
    })
  }

  validateFormAlias(name: string) {
    let campo: any = this.formAlias.get(name);
    if (campo) {
      if (campo.touched && campo.status == 'INVALID') {
        let err = this.validationsM.transform(campo.errors);
        return { 'valid': true, 'error': err };
      }
    }
    return { 'valid': false, 'error': '' };
  }

  // UPDATE EMAIL
  showModalEmail() {
    this.createFormEmail();
    this.modalS.open(this.modal_email, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
    }).catch((err) => {
    });
  }

  createFormEmail() {
    this.form_email = this.formBuilder.group({
      id: [this.user.id, [Validators.required]],
      contraseña: ["", [Validators.required, Validators.minLength(8)]],
      correo: ["", [Validators.required, Validators.email]],
    })
  }

  change_email() {
    this.sending = true;
    if (this.form_email.status == 'INVALID') {
      this.form_email.markAllAsTouched();
      this.sending = false;
      return;
    }
    this.userS.generateTokenUpdateEmail(this.form_email.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_email);
      console.log(resp);
      if (resp.result == "ok") {
      } else {
        console.log(resp);
      }
      this.sending = false;
    }, err => {
      console.log(err);
      this.sending = false;
    });
  }

  validateFormEmail(name: string) {
    let campo: any = this.form_email.get(name);
    if (campo) {
      if (campo.touched && campo.status == 'INVALID') {
        let err = this.validationsM.transform(campo.errors);
        return { 'valid': true, 'error': err };
      }
    }
    return { 'valid': false, 'error': '' };
  }

  validateForms(name: string, form) {
    let campo: any = form.get(name);
    if (campo) {
      if (campo.touched && campo.status == 'INVALID') {
        let err = this.validationsM.transform(campo.errors);
        return { 'valid': true, 'error': err };
      }
    }
    return { 'valid': false, 'error': '' };
  }
}
