import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/front/auth.service';
import { AppConfig } from '../../../AppConfig';
import { UserService } from '../../../services/front/user.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { InterpretFormRespService } from 'src/app/services/interpret-form-resp.service';
import { ValidatorsService } from '../../../services/validators.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css']
})

export class MyAccountComponent implements OnInit {
  sending = true;
  userAuth: User;
  user: User;
  countries: any[] = [];
  states: any[] = [];

  cities: any[] = [];
  file: any;
  cardUpload = false;
  progressInfo = { porcentage: 0, name: "", error: "", completed: false };
  // forms
  formAlias: FormGroup;
  formEmail: FormGroup;
  form_email: FormGroup;
  form_email_confirm: FormGroup;
  form_password: FormGroup;
  form_document: FormGroup;
  form_contact: FormGroup;
  form_data_personal: FormGroup;
  form_paypal: FormGroup;
  form_bank: FormGroup;
  edit_bank: any = "";
  newEmail: string;
  emailStep: any;
  whatsapp: any;
  phone: any;
  dateNowSub100: any;
  dateNow: any;
  // number input
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Ecuador, CountryISO.Colombia, CountryISO.Venezuela, CountryISO.Argentina, CountryISO.Chile, CountryISO.Peru];
  // phoneForm = new FormGroup({
  // 	phone: new FormControl(undefined, [Validators.required])
  // });
  selectedCar: number;
  delete_bank_id:number;
  cars = [
    { id: 1, name: 'Volvo' },
    { id: 2, name: 'Saab' },
    { id: 3, name: 'Opel' },
    { id: 4, name: 'Audi' },
  ];

  @ViewChild('modal_alias') modal_alias: any;
  @ViewChild('modal_delete_img') modal_delete_img: any;
  @ViewChild('modal_email') modal_email: any;
  @ViewChild('modal_password') modal_password: any;
  @ViewChild('modal_contact') modal_contact: any;
  @ViewChild('modal_data_personal') modal_data_personal: any;
  @ViewChild('modal_document') modal_document: any;
  @ViewChild('modal_paypal') modal_paypal: any;
  @ViewChild('modal_bank') modal_bank: any;
  @ViewChild('modal_delete_bank') modal_delete_bank: any;

  @ViewChild('selectPais') selectPais: any;
  @ViewChild('selectState') selectState: any;
  @ViewChild('selectCity') selectCity: any;

  constructor(
    private http: HttpClient,
    private authS: AuthService,
    private userS: UserService,
    private formBuilder: FormBuilder,
    private modalS: NgbModal,
    private validationsM: ValidationsMessagePipe,
    private interpretResp: InterpretFormRespService,
    private validatorsS: ValidatorsService,
    private toastrS: ToastrService,


  ) { }

  changePreferredCountries() {
    this.preferredCountries = [CountryISO.India, CountryISO.Canada];
  }

  ngOnInit(): void {
    this.userAuth = this.authS.getAuth();
    if (!this.userAuth?.id) {
      this.authS.logout();
    } else {
      this.getUser();
    }
  }

  getUser() {
    this.userS.getUser(this.userAuth?.id).subscribe((data: any) => {
      this.user = data.user;
      this.user.banks = data.banks;
      this.whatsapp = this.user.whatsapp;
      this.whatsapp = JSON.parse(this.whatsapp);
      this.phone = this.user.phone;
      this.phone = JSON.parse(this.phone);
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
      } else if (resp.result == "error") {
        this.interpretResp.error(resp.message, this.formAlias);
      }
      this.sending = false;
    }, err => {
      console.log(err);
      this.interpretResp.error(err, this.formAlias);
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

  // UPDATE EMAIL
  showModalEmail() {
    this.emailStep = 1;
    this.createFormEmail();
    this.modalS.open(this.modal_email, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
    }).catch((err) => {
    });
  }

  createFormEmail() {
    this.form_email = this.formBuilder.group({
      id: [this.user.id, [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      email: ["", [Validators.required, Validators.email]],
    })
  }

  create_form_email_confirm() {
    this.form_email_confirm = this.formBuilder.group({
      code: ["", [Validators.required]],
    })
  }

  change_email_step_1() {
    this.sending = true;
    if (this.form_email.status == 'INVALID') {
      this.form_email.markAllAsTouched();
      this.sending = false;
      return;
    }
    this.userS.generateTokenUpdateEmail(this.form_email.value).subscribe((resp: any) => {
      if (resp.result == "ok") {
        this.emailStep = 2;
        this.newEmail = resp.newEmail;
        this.create_form_email_confirm();
      } else {
        this.interpretResp.success(resp, this.form_email);
      }
      this.sending = false;
    });
  }

  change_email_step_2() {
    this.sending = true;
    if (this.form_email_confirm.status == 'INVALID') {
      this.form_email_confirm.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.confirm_update_email(this.form_email_confirm.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_email_confirm);
      if (resp.result == "ok") {
        this.emailStep = 1;
        this.user.email = resp.email;
        this.modalS.dismissAll();
      }
      this.sending = false;
    });
  }


  // UPDATE PASSWORD
  show_modal_password() {
    this.createFormPassword();
    this.modalS.open(this.modal_password, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {
    }).catch((err) => {

    });
  }

  change_password() {
    this.sending = true;
    if (this.form_password.status == 'INVALID') {
      this.form_password.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.change_password(this.form_password.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_password);
      if (resp.result == "ok") {
        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });
  }

  createFormPassword() {
    this.form_password = this.formBuilder.group({
      password: ["", [Validators.required, Validators.minLength(8)]],
      new_password: ["", [Validators.required, Validators.minLength(8)]],
      repeat_new_password: ["", [Validators.required, Validators.minLength(8)]],
    }, { validator: this.passwordCompare })
  }


  passwordCompare(frm: FormGroup) {
    if (frm.controls['new_password'].value == frm.controls['repeat_new_password'].value) {
      return;
    } else {
      return { 'PasswordsNotEqual': true };
    }
  }

  //DATA PERSONAL
  show_modal_data_personal() {
    this.createFormDataPersonal();
    this.modalS.open(this.modal_data_personal, { centered: true, backdrop: 'static', size: 'lg', keyboard: false }).result.then((result) => {
    }).catch((err) => {

    });
  }

  createFormDataPersonal() {
    let dateN = new Date();
    let dateSub18 = dateN.getUTCFullYear() - 18;
    this.dateNow = dateSub18 + "-" + dateN.getMonth() + "-" + dateN.getDay();
    this.dateNow = new Date(this.dateNow);
    this.dateNow = this.dateNow.toISOString().split('T')[0];
    let dateSub100 = dateN.getUTCFullYear() - 100;
    this.dateNowSub100 = dateSub100 + "-" + dateN.getMonth() + "-" + dateN.getDay();
    this.dateNowSub100 = new Date(this.dateNowSub100);
    this.dateNowSub100 = this.dateNowSub100.toISOString().split('T')[0];

    this.form_data_personal = this.formBuilder.group({
      name: [this.user.name, [Validators.required, Validators.minLength(3)]],
      last_name: [this.user.last_name, [Validators.required, Validators.minLength(3)]],
      date_of_birth: [this.user.date_of_birth, [this.validatorsS.date]],
    })


  }

  update_data_personal() {


    this.sending = true;
    if (this.form_data_personal.status == 'INVALID') {
      this.form_data_personal.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.update_data_personal(this.form_data_personal.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_data_personal);
      if (resp.result == "ok") {
        this.user = resp.user;

        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });
  }

  // DOCUMENTS

  show_modal_documents() {


    this.create_form_document();
    this.modalS.open(this.modal_document, { centered: true, backdrop: 'static', size: 'lg', keyboard: false }).result.then((result) => {

    }).catch((err) => {

    });
  }

  create_form_document() {
    this.form_document = this.formBuilder.group({
      document_type: [this.user.document_type, [Validators.required]],
      document_number: [this.user.document_number, [Validators.required]],
      nationality: [this.user.nationality, [Validators.required]],
    })
  }

  update_document_data() {

    this.sending = true;
    if (this.form_document.status == 'INVALID') {
      this.form_document.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.update_document_data(this.form_document.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_document);
      if (resp.result == "ok") {
        this.user = resp.user;
        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });
  }


  //PAYMENT METHOD
  //PAYPAL

  show_modal_paypal() {
    this.create_form_paypal();
    this.modalS.open(this.modal_paypal, { centered: true, backdrop: 'static', size: 'sm', keyboard: false }).result.then((result) => {

    }).catch((err) => {

    });
  }

  create_form_paypal() {
    this.form_paypal = this.formBuilder.group({
      paypal: [this.user.paypal, [this.validatorsS.email]],
    })
  }

  update_paypal() {

    this.sending = true;
    if (this.form_paypal.status == 'INVALID') {
      this.form_paypal.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.update_paypal(this.form_paypal.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_paypal);
      if (resp.result == "ok") {
        this.user.paypal = resp.paypal;
        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });
  }

  // BANKS
  show_modal_bank(edit = "", edit_bank_select = "") {
      this.sending = true;
      this.userS.getDataContact().subscribe((data: any) => {
      this.sending = false;
      this.countries = data.countries;

      if (edit == "edit") {
        this.edit_bank = edit_bank_select;
      } else {
        this.edit_bank = { country: "", country_id: this.user.country_id, name_bank: "", number: "", type: "", owner: "", identification_owner: "" };
      }

      this.create_form_bank();
      this.modalS.open(this.modal_bank, { centered: true, backdrop: 'static', size: 'lg', keyboard: false }).result.then((result) => {

      }).catch((err) => {

      });
    });
  }

  create_form_bank() {
    this.form_bank = this.formBuilder.group({
      id: [this.edit_bank.id],
      country_id: [this.edit_bank.country_id, [Validators.required]],
      name_bank: [this.edit_bank.name_bank, [Validators.required, Validators.max(60)]],
      number: [this.edit_bank.number, [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.max(999999999999999999999999999999999999999999999999999999999999)]],
      type: [this.edit_bank.type, [Validators.required]],
      owner: [this.edit_bank.owner, [Validators.required, Validators.max(60)]],
      identification_owner: [this.edit_bank.identification_owner, [Validators.required, Validators.max(999999999999999)]],
    })
  }

  update_bank() {
    this.sending = true;
    if (this.form_bank.status == 'INVALID') {
      this.form_bank.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.update_bank(this.form_bank.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_bank);
      console.log(resp);

      if (resp.result == "ok") {
        this.user.banks = resp.banks;
        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });

  }

  show_modal_delete_bank(id){
    this.delete_bank_id = id;
    this.modalS.open(this.modal_delete_bank, { centered: true, backdrop: 'static', size: 'lg', keyboard: false }).result.then((result) => {
      console.log(result);
      if(result == "acept"){
        this.userS.delete_bank(this.delete_bank_id).subscribe((resp: any) => {
          this.interpretResp.success(resp, this.form_bank);

          if (resp.result == "ok") {
            this.user.banks = resp.banks;
            this.modalS.dismissAll();
            // this.phone = JSON.parse(this.phone);
          }
          this.sending = false;
        });
      }
    }).catch((err) => {

    });
  }

  // CONTACTO
  getStates(event) {

    if (!event?.id) {
      return;
    }
    this.sending = true;
    this.userS.getStates(event.id).subscribe((data: any) => {
      this.sending = false;
      this.form_contact.value.state = "";
      this.states = data.states;
      this.form_contact.controls.statesCount.setValue(data.states.length);
      this.form_contact.controls.citiesCount.setValue(0);
      this.cities = [];

      if (this.selectState != undefined) {
        this.selectState.handleClearClick();
      }
    });
  }

  getCities(event) {

    if (!event?.id) {
      return;
    }

    this.sending = true;
    this.userS.getCities(event.id).subscribe((data: any) => {
      this.sending = false;
      this.form_contact.value.state = "";
      this.cities = data.cities;
      this.form_contact.controls.citiesCount.setValue(this.cities.length);
      if (this.selectCity != undefined) {
        this.selectCity.handleClearClick();
      }
    });
  }

  getDataContact() {
    this.sending = true;
    this.userS.getDataContact().subscribe((data: any) => {
      this.countries = data.countries;
      this.states = data.states;
      // this.form_contact.controls.statesCount.setValue(this.states.length);
      this.cities = data.cities;
      // this.form_contact.controls.citiesCount.setValue(this.cities.length);

      this.createFormContact();
      this.showModalContact();
    });

  }

  showModalContact() {

    this.modalS.open(this.modal_contact, { centered: true, backdrop: 'static', size: 'lg', keyboard: false }).result.then((result) => {
    }).catch((err) => {

    });
    this.sending = false;
  }

  createFormContact() {

    this.form_contact = this.formBuilder.group({
      whatsapp: [this.whatsapp?.number],
      phone: [this.phone?.number,],
      country_id: [this.user.country_id, [Validators.required]],
      state_id: [this.user.state_id,],
      city_id: [this.user.city_id,],
      municipality: [this.user.municipality],
      address: [this.user.address],
      statesCount: [0],
      citiesCount: [0]
    }, { validator: [this.stateRequired, this.ciryRequired] });
  }

  // validaciones formularios
  stateRequired(frm: FormGroup) {
    if (frm.controls['statesCount'].value != 0) {
      if (frm.controls['state_id'].value == "" || frm.controls['state_id'].value == null) {
        return { 'stateRequired': true };
      }
      return;
    } else {
      return;
    }
  }

  ciryRequired(frm: FormGroup) {
    if (frm.controls['citiesCount'].value != 0) {
      if (frm.controls['city_id'].value == "" || frm.controls['city_id'].value == null) {
        return { 'cityRequired': true };
      }
      return;
    } else {
      return;
    }
  }

  save_data_contact() {
    this.sending = true;
    if (this.form_contact.status == 'INVALID') {
      this.form_contact.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.updateContactInformation(this.form_contact.value).subscribe((resp: any) => {
      this.interpretResp.success(resp, this.form_contact);
      if (resp.result == "ok") {
        this.user = resp.user;
        this.whatsapp = this.user.whatsapp;
        this.phone = this.user.phone;
        this.modalS.dismissAll();
        // this.phone = JSON.parse(this.phone);
      }
      this.sending = false;
    });
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
