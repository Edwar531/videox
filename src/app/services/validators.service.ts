import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';


@Injectable({
  providedIn: 'root'
})

export class ValidatorsService {

  constructor() { }

  only_letters_numbers_underscore(control: FormControl){
    if (control?.value) {
      let url = control.value;
      var regExp = /^[a-zA-Z0-9ZñÑáéíóúÁÉÍÓÚ_]*$/;
      if (url.match(regExp)) {
        return true;
      }else{
        return { only_letters_numbers_underscore: true };
      }
    }
    return {
      only_letters_numbers_underscore: true
    };
  }

  urlYoutube(control: any) {

    // if (control?.value) {
    //   let url = control.value;
    //   var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    //   if (url.match(regExp)) {
    //     return true;
    //   }
    // }
    // return {
    //   urlyoutube: true
    // };
  }

}
