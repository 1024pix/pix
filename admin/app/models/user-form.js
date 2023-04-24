import { buildValidations, validator } from 'ember-cp-validations';
import Model, { attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { none } from '@ember/object/computed';

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
        message: "L'adresse e-mail ne peut pas être vide.",
        disabled: none('model.email'),
      }),
      validator('length', {
        max: 255,
        message: "La longueur de l'adresse e-mail ne doit pas excéder 255 caractères.",
        disabled: none('model.email'),
      }),
      validator('format', {
        ignoreBlank: true,
        type: 'email',
        message: "L'adresee e-mail n'a pas le bon format.",
        disabled: none('model.email'),
      }),
    ],
  },
  username: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: "L'identifiant ne peut pas être vide.",
        disabled: none('model.username'),
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères.',
        disabled: none('model.username'),
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
}
