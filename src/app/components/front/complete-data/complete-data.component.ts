import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ValidationsMessagePipe } from 'src/app/pipes/validations-message.pipe';
import { AuthService } from 'src/app/services/front/auth.service';
import { UserService } from 'src/app/services/front/user.service';
import { InterpretFormRespService } from 'src/app/services/interpret-form-resp.service';
import { ValidatorsService } from '../../../services/validators.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-complete-data',
  templateUrl: './complete-data.component.html',
  styleUrls: ['./complete-data.component.css']
})

export class CompleteDataComponent implements OnInit {
  sending = true;
  step:number = 3;
  dateNow:any;
  dateNowSub100:any;
  form_data_personal: FormGroup;
  form_document: FormGroup;
  form_contact: FormGroup;
  user:User;
  whatsapp:any;
  phone:any;
  countries:any = [];
  states:any = [];
  cities:any = [];
 // number input
 separateDialCode = false;
 SearchCountryField = SearchCountryField;
 CountryISO = CountryISO;
 PhoneNumberFormat = PhoneNumberFormat;
 preferredCountries: CountryISO[] = [CountryISO.Ecuador, CountryISO.Colombia, CountryISO.Venezuela, CountryISO.Argentina, CountryISO.Chile, CountryISO.Peru];
  // @ViewChild('selectPais') selectPais: any;
  @ViewChild('selectState') selectState: any;
  @ViewChild('selectCity') selectCity: any;
  constructor(private formBuilder:FormBuilder,
    private ValidatorsS:ValidatorsService,
    private userS:UserService,
    private interpretResp:InterpretFormRespService,
    private validationsM:ValidationsMessagePipe,
    private authS: AuthService,

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
      this.interpretResp.success(resp, this.form_data_personal);
      if (resp.result == "ok") {
        this.user = resp.user;
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
      this.interpretResp.success(resp, this.form_document);
      if (resp.result == "ok") {
        this.user = resp.user;
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
        statesCount: [0],
        citiesCount: [0]
      }, { validator: [this.stateRequired, this.ciryRequired] });
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
          
          // this.phone = JSON.parse(this.phone);
        }
        this.sending = false;
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
}
