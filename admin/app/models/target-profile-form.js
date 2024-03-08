import Model, { attr } from '@ember-data/model';
import { buildValidations, validator } from 'ember-cp-validations';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  description: {
    validators: [
      validator('length', {
        max: 500,
        message: 'La longueur de la description ne doit pas excéder 500 caractères',
      }),
    ],
  },
  comment: {
    validators: [
      validator('length', {
        max: 500,
        message: 'La longueur du commentaire ne doit pas excéder 500 caractères',
      }),
    ],
  },
  category: {
    validators: [
      validator('presence', {
        presence: true,
      }),
    ],
  },
});

export default class TargetProfileForm extends Model.extend(Validations) {
  @attr('string') name;
  @attr('string') description;
  @attr('string') comment;
  @attr('string') category;
}
