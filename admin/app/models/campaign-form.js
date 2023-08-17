import Model, { attr } from '@ember-data/model';
import { buildValidations, validator } from 'ember-cp-validations';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        message: 'Le nom ne peut pas être vide',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  title: {
    validators: [
      validator('length', {
        min: 0,
        max: 50,
        message: 'La longueur du titre ne doit pas excéder 50 caractères',
      }),
    ],
  },
  customLandingPageText: {
    validators: [
      validator('length', {
        min: 0,
        max: 5000,
        message: "La longueur du texte de la page d'accueil ne doit pas excéder 5000 caractères",
      }),
    ],
  },
  customResultPageText: {
    validators: [
      validator('length', {
        min: 0,
        max: 5000,
        message: 'La longueur du texte de la page de résultat ne doit pas excéder 5000 caractères',
      }),
    ],
  },
  customResultPageButtonText: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du texte ne doit pas excéder 255 caractères',
      }),
    ],
  },
  customResultPageButtonUrl: {
    validators: [
      validator('format', {
        type: 'url',
        allowBlank: true,
        message: 'Ce champ doit être une URL complète et valide',
      }),
    ],
  },
});

export default class CampaignForm extends Model.extend(Validations) {
  @attr('string') name;
  @attr('string') title;
  @attr('text') customLandingPageText;
  @attr('text') customResultPageText;
  @attr('string') customResultPageButtonText;
  @attr('string') customResultPageButtonUrl;
  @attr('boolean') multipleSendings;
}
