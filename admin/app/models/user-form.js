import Model, { attr } from '@ember-data/model';
import { buildValidations, validator } from 'ember-cp-validations';

const Validations = buildValidations({
  firstName: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le prénom ne peut pas être vide.',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du prénom ne doit pas excéder 255 caractères.',
      }),
    ],
  },
  lastName: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide.',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères.',
      }),
    ],
  },
  email: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        allowNone: true,
        message: "L'adresse e-mail ne peut pas être vide.",
      }),
      validator('length', {
        max: 255,
        allowNone: true,
        message: "La longueur de l'adresse e-mail ne doit pas excéder 255 caractères.",
      }),
      validator('format', {
        type: 'email',
        allowBlank: true,
        message: "L'adresse e-mail n'a pas le bon format.",
      }),
    ],
  },
  username: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        allowNone: true,
        message: "L'identifiant ne peut pas être vide.",
      }),
      validator('length', {
        min: 1,
        max: 255,
        allowNone: true,
        message: 'La longueur du nom ne doit pas excéder 255 caractères.',
      }),
    ],
  },
});

export default class UserForm extends Model.extend(Validations) {
  @attr() firstName;
  @attr() lastName;
  @attr() email;
  @attr() username;
  @attr() lang;
  @attr() locale;
}
