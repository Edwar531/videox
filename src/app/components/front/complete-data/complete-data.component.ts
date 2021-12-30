import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { AuthService } from 'src/app/services/front/auth.service';
import { UserService } from 'src/app/services/front/user.service';
import { InterpretFormRespService } from 'src/app/services/interpret-form-resp.service';
import { ValidatorsService } from '../../../services/validators.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-complete-data',
  templateUrl: './complete-data.component.html',
  styleUrls: ['./complete-data.component.css']
})

export class CompleteDataComponent implements OnInit {
  sending = true;
  step:number = 4;
  dateNow:any;
  dateNowSub100:any;
  form_data_personal: FormGroup;
  form_document: FormGroup;
  form_contact: FormGroup;
  form_bank: FormGroup;
  form_paypal:FormGroup;
  user:User;
  whatsapp:any;
  phone:any;
  countries:any = [];
  states:any = [];
  cities:any = [];
  edit_bank: any = "";
  delete_bank_id
 // number input
  separateDialCode = false;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Ecuador, CountryISO.Colombia, CountryISO.Venezuela, CountryISO.Argentina, CountryISO.Chile, CountryISO.Peru];
  // @ViewChild('selectPais') selectPais: any;
  @ViewChild('selectState') selectState: any;
  @ViewChild('selectCity') selectCity: any;
  @ViewChild('modal_bank') modal_bank: any;
  @ViewChild('modal_delete_bank') modal_delete_bank: any;
  @ViewChild('modal_paypal') modal_paypal: any;

  constructor(private formBuilder:FormBuilder,
    private ValidatorsS:ValidatorsService,
    private userS:UserService,
    private interpretResp:InterpretFormRespService,
    private validationsM:ValidationsMessagePipe,
    private authS: AuthService,
    private modalS: NgbModal,
    private validatorsS: ValidatorsService,
    private router: Router,
    private toastr: ToastrService,

    
    ) { }

  ngOnInit(): void {
    let userAuth = this.authS.getAuth();
    console.log(userAuth);
    
    if (!userAuth?.id) {
      this.authS.logout();
    } else {
      this.getUser(userAuth.id);
    }
  }

  getUser(user_id) {
    this.userS.getUser(user_id).subscribe((data: any) => {
      this.countries = data.countries;
      this.states = data.states;
      this.cities = data.cities;
      this.user = data.user;
      this.user.banks = data.banks;
      this.whatsapp = this.user.whatsapp;
      this.whatsapp = JSON.parse(this.whatsapp);
      this.phone = this.user.phone;
      this.phone = JSON.parse(this.phone);
      this.sending = false;
    
      this.createFormDataPersonal();
      this.create_form_document();
      this.createFormContact();

      this.sending = false;
    });
   
  }

  // DATA PERSONAL
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
      name: [ this.user.name, [Validators.required, Validators.minLength(3)]],
      last_name: [this.user.last_name, [Validators.required, Validators.minLength(3)]],
      date_of_birth: [this.user.date_of_birth, [this.ValidatorsS.date]],
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
      this.interpretResp.successNotMsgSuccess(resp, this.form_data_personal);
      if (resp.result == "ok") {
        this.user = resp.user;
        this.user.banks = resp.banks;
        this.step = 2;
      }
      this.sending = false;
    });
  }
  
   // IDENTIFICATION
  create_form_document() {
    this.form_document = this.formBuilder.group({
      document_type: [this.user.document_type, [Validators.required]],
      document_number: [this.user.document_number, [Validators.required]],
      nationality: [this.user.nationality, [Validators.required]],
    });
  }

  update_document_data() {
    this.sending = true;
    if (this.form_document.status == 'INVALID') {
      this.form_document.markAllAsTouched();
      this.sending = false;
      return;
    }

    this.userS.update_document_data(this.form_document.value).subscribe((resp: any) => {
      this.interpretResp.successNotMsgSuccess(resp, this.form_document);
      if (resp.result == "ok") {
        this.user = resp.user;
        this.user.banks = resp.banks;

        this.step = 3;
      }
      this.sending = false;
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
        this.cities = data.cities;
        this.createFormContact();
      });
  
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
        statesCount: [this.states],
        citiesCount: [this.cities]
      }, { validator: [this.stateRequired, this.cityRequired] });
    }
    
    save_data_contact() {
      this.sending = true;
      if (this.form_contact.status == 'INVALID') {
        this.form_contact.markAllAsTouched();
        this.sending = false;
        return;
      }
  
      this.userS.updateContactInformation(this.form_contact.value).subscribe((resp: any) => {
        this.interpretResp.successNotMsgSuccess(resp, this.form_contact);
        if (resp.result == "ok") {
          this.user = resp.user;
          this.user.banks = resp.banks;

          this.whatsapp = this.user.whatsapp;
          this.phone = this.user.phone;
          this.step = 4;
          // this.phone = JSON.parse(this.phone);
        }
        this.sending = false;
      });
    }


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
      this.interpretResp.successNotMsgSuccess(resp, this.form_paypal);
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
      this.edit_bank = { country: "", country_id: this.user.country_id, name_bank: "", number: "", type: "", owner: this.user.name+" "+this.user.last_name, identification_owner: "" };
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
    this.interpretResp.successNotMsgSuccess(resp, this.form_bank);
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
        this.interpretResp.successNotMsgSuccess(resp, this.form_bank);

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
  // VALIDATIONS
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

  stateRequired(frm: FormGroup) {
    
    
    if (frm.controls['statesCount'].value != 0) {
      console.log("stateRequired");
      console.log("statesCount");
      
      if (frm.controls['state_id'].value == "" || frm.controls['state_id'].value == null) {
        return { 'stateRequired': true };
      }
      return;
    } else {
      return;
    }
  }

  cityRequired(frm: FormGroup) {
    if (frm.controls['citiesCount'].value != 0) {
      if (frm.controls['city_id'].value == "" || frm.controls['city_id'].value == null) {
        return { 'cityRequired': true };
      }
      return;
    } else {
      return;
    }
  }

  finalize(){

    let complete_data: any = localStorage.getItem('redirect-complete-data');
    this.toastr.success('Tus datos han sido completados con exito.');
    if(complete_data != null){
      
      this.router.navigateByUrl(complete_data);
    }else{
      this.router.navigateByUrl('/');
    }
  }

}
