import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/front/auth.service';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  @ViewChild('modalLogin') modalLogin: any;
  @ViewChild('modalRegister') modalRegister: any;
  form: FormGroup;
  formR: FormGroup;
  formS: FormGroup;
  sending = false;
  userAuth: User;
  accountConfirm = "";
  typeSearch: string;
  url: any;
  constructor(
    private activatedR: ActivatedRoute,
    private formBuilder: FormBuilder,
    private modalS: NgbModal,
    private validationsM: ValidationsMessagePipe,
    private toastr: ToastrService,
    private authS: AuthService,
    private router: Router,
    private location: Location,

  ) { }

  ngOnInit(): void {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        this.formS.reset();
      }
    });

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      let index = event.url.indexOf("?");
      this.url = event.url;
      if (index != -1)
        this.url = event.url.substr(0, index);
      if (this.url == "/galeria-de-fotos") {
        this.typeSearch = "FOTOS";
      } else {
        this.typeSearch = "VIDEOS";
      }
    });

    this.userAuth = this.authS.getAuth();
    this.router.events.subscribe((val: any) => {
      this.userAuth = this.authS.getAuth();
    });

    if (!this.userAuth?.token) {
      this.formLogin();
      this.formRegister();
    }
    this.formSearch();
  }

  search() {
    if (this.formS.value.search?.length) {
      if (this.typeSearch == "FOTOS") {
        this.router.navigateByUrl("/galeria-de-fotos?search=" + this.formS.value.search);
      } else {
        this.router.navigateByUrl("/videos?search=" + this.formS.value.search);
      }
    }
  }

  formSearch() {
    this.formS = this.formBuilder.group({
      search: ["", Validators.required],
    })
  }

  formLogin() {
    this.form = this.formBuilder.group({
      usuarioOcorreo: ["", Validators.required],
      clave: ["", Validators.required]
    })
  }

  formRegister() {
    this.formR = this.formBuilder.group({
      alias: ["", [Validators.required, Validators.minLength(4)]],
      correo: ["", [Validators.required, Validators.email]],
      nombres: ["", [Validators.required, Validators.minLength(3)]],
      apellidos: ["", [Validators.required, Validators.minLength(3)]],
      clave: [, [Validators.required, Validators.minLength(8)]],
      confirmar_clave: [, [Validators.required, Validators.minLength(8)]],
    }, { validator: this.passwordCompare })

    this.activatedR.queryParams.subscribe(params => {
      this.accountConfirm = params['account'];
      if (this.accountConfirm == "confirmed") {
        setTimeout(() => {
          this.modalS.open(this.modalLogin, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
            this.modalS.dismissAll();
          });
          this.location.replaceState("/");
        }, 1000)
      }
    });
  }

  ngAfterViewInit(): void {

  }

  // inicio de sesion
  login() {
    this.sending = true;
    if (this.form.status == 'INVALID') {
      this.form.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.authS.login(this.form.value).subscribe((resp: any) => {
      console.log(resp);
      if (resp?.token) {
        this.authS.saveAuth(resp);
        this.router.navigate([this.router.url]);
        window.location.reload();
        return;
      } else {
        this.toastr.warning(resp.error);
        console.log(resp);
        this.sending = false;
        return;
      }
      this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
    }, err => {
      console.log(err);
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

  logout() {
    this.authS.logout();
    window.location.reload();
  }

  showModalLogin() {
    this.form.reset();
    this.modalS.open(this.modalLogin, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
      return;
    });
  }
  // registro
  showModalRegister() {
    this.formR.reset();
    this.modalS.open(this.modalRegister, { centered: true, backdrop: 'static', size: 'md', keyboard: false }).result.then((result) => {
      return;
    });
  }

  hideMLShowMR() {
    this.modalS.dismissAll();
    this.showModalRegister();
  }

  hideMRShowML() {
    this.modalS.dismissAll();
    this.showModalLogin();
  }

  register() {
    this.sending = true;
    if (this.formR.status == 'INVALID') {
      console.log("INVALID");
      this.formR.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.authS.register(this.formR.value).subscribe((resp: any) => {
      this.sending = false;
      console.log(resp);
      if (resp?.result == "ok") {
        this.toastr.success(resp.message);
        this.modalS.dismissAll();
      } else if (resp?.errors) {
        let texterrors = '';
        for (let campo in this.formR.controls) {
          if (resp.errors[campo]) {
            texterrors = texterrors + '<div>' + resp.errors[campo] + '</div>';
          }
        }
        this.toastr.warning('<div style="list-style: none;">' + texterrors + '</div>');
      } else if (resp?.error) {
        this.toastr.warning(resp.error)
      } else {
        this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
      }
    }, err => {
      this.sending = false;
      if (err?.error && err.error?.errors) {
        let texterrors = '';
        for (let campo in this.formR.controls) {
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

  // validaciones formularios
  passwordCompare(frm: FormGroup) {
    if (frm.controls['clave'].value == frm.controls['confirmar_clave'].value) {
      return;
    } else {
      return { 'PasswordsNotEqual': true };
    }
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

  validateR(name: string) {
    let campo: any = this.formR.get(name);
    if (campo) {
      if (campo.touched && campo.status == 'INVALID') {
        let err = this.validationsM.transform(campo.errors);
        return { 'valid': true, 'error': err };
      }
    }
    return { 'valid': false, 'error': '' };
  }

}