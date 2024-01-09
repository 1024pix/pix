import { buildValidations, validator } from 'ember-cp-validations';
import Model, { attr, hasMany } from '@ember-data/model';

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
  type: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le type ne peut pas être vide',
      }),
    ],
  },
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
      }),
    ],
  },
  dataProtectionOfficerFirstName: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du prénom du DPO ne doit pas excéder 255 caractères',
      }),
    ],
  },
  dataProtectionOfficerLastName: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du nom du DPO ne doit pas excéder 255 caractères',
      }),
    ],
  },
  dataProtectionOfficerEmail: {
    validators: [
      validator('length', {
        max: 255,
        message: "La longueur de l'adresse e-mail du DPO ne doit pas excéder 255 caractères.",
      }),
      validator('format', {
        allowBlank: true,
        type: 'email',
        message: "L'adresse e-mail du DPO n'a pas le bon format.",
      }),
    ],
  },
});

export default class CertificationCenterFrom extends Model.extend(Validations) {
  @attr() name;
  @attr() type;
  @attr() externalId;
  @attr() dataProtectionOfficerFirstName;
  @attr() dataProtectionOfficerLastName;
  @attr() dataProtectionOfficerEmail;
  @attr() isV3Pilot;

  @hasMany('complementary-certification') habilitations;
}
