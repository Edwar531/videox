import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'validationsMessage'
})

export class ValidationsMessagePipe implements PipeTransform {

  transform(error: any): string {
    if (error?.required) {
      return 'Este campo es requerido.';
    } else if (error?.boolean) {
      return 'Este campo debe ser verdadero o falso.';
    } else if (error?.file) {
      return 'Este campo debe ser un archivo.';
    } else if (error?.image) {
      return 'Este campo debe ser una imagen.';
    } else if (error?.min) {
      return 'Este campo debe tener un valor mínimo de: ' + error.min.min;
    } else if (error?.max) {
      return 'Este campo debe tener un valor máximo de: ' + error.max.max;
    } else if (error?.maxlength) {
      return 'arreglar';
    } else if (error?.minlength) {
      return 'Este campo debe tener al menos: ' + error?.minlength.requiredLength + ' caracateres.';
    } else if (error?.number) {
      return 'Este campo debe ser un número.';
    } else if (error?.email) {
      return 'La dirección de correo es invalida.';
    } else if (error?.urlyoutube) {
      return 'La dirección url de Youtube es incorrecta.';
    } else if (error?.whitespace) {
      return 'Este campo no debe incluir espacios.';
    } else if (error?.only_letters_numbers_underscore) {
      return 'Este campo debe incluir solo letras, números y guion bajo.';
    } else if (error?.validatePhoneNumber) {
      return 'Formato de número inválido para este campo.';
    } else {
      return 'Formato de texto inválido para este campo.';
    }
  }

}
