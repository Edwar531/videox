import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class InterpretFormRespService {

  constructor(
    private toastr: ToastrService
  ) { }

  success(resp: any, form: any) {
    console.log(resp);
    if (resp?.result == "ok" && resp?.message) {
      if(resp.message != "no-message"){
        this.toastr.success(resp.message);
      }
    } else if (resp?.errors) {
      let texterrors = '';
      for (let campo in form.controls) {
        if (resp.errors[campo]) {
          texterrors = texterrors + '<div>' + resp.errors[campo] + '</div>';
        }
      }
      this.toastr.warning('<div style="list-style: none;">' + texterrors + '</div>');
    } else if (resp?.error) {
      this.toastr.warning(resp.message)
    } else {
      this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
    }
  }

  error(err, form) {
    if (err?.error && err.error?.errors) {
      let texterrors = '';
      for (let campo in form.controls) {
        if (err.error.errors[campo]) {
          texterrors = texterrors + '<div>' + err.error.errors[campo] + '</div>';
        }
      }
      this.toastr.warning('<div style="list-style: none;">' + texterrors + '</div>');
    } else {
      if (err.status != 401) {
          this.toastr.warning("Hubo un error al hacer la petición al servidor, verifique su conexión de internet.")
        }
    }
  }
}
