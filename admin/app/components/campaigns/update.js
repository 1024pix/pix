import Component from '@glimmer/component';
import Object, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

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

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked title;
  @tracked customLandingPageText;
  @tracked customResultPageText;
  @tracked customResultPageButtonText;
  @tracked customResultPageButtonUrl;
}

export default class Update extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
    this.form.name = this.args.campaign.name;
    this.form.title = this.args.campaign.title;
    this.form.customLandingPageText = this.args.campaign.customLandingPageText;
    this.form.customResultPageText = this.args.campaign.customResultPageText;
    this.form.customResultPageButtonText = this.args.campaign.customResultPageButtonText;
    this.form.customResultPageButtonUrl = this.args.campaign.customResultPageButtonUrl;
  }

  async _checkFormValidation() {
    console.log(this.form.customResultPageButtonUrl);
    const { validations } = await this.form.validate();
    return validations.isValid;
  }

  async _update() {
    const campaign = this.args.campaign;
    campaign.name = this.form.name.trim();
    const titleTrim = this.form.title?.trim();
    const customLandingPageTextTrim = this.form.customLandingPageText?.trim();
    const customResultPageTextTrim = this.form.customResultPageText?.trim();
    const customResultPageButtonTextTrim = this.form.customResultPageButtonText?.trim();
    const customResultPageButtonUrlTrim = this.form.customResultPageButtonUrl?.trim();

    campaign.title = titleTrim || null;
    campaign.customLandingPageText = customLandingPageTextTrim || null;
    campaign.customResultPageText = customResultPageTextTrim || null;
    campaign.customResultPageButtonText = customResultPageButtonTextTrim || null;
    campaign.customResultPageButtonUrl = customResultPageButtonUrlTrim || null;

    try {
      await campaign.save();
      await this.notifications.success('Les modifications ont bien été enregistrées.');
      this.args.onExit();
    } catch (errorResponse) {
      campaign.rollbackAttributes();
      const errors = errorResponse.errors;
      if (!errors) {
        return this.notifications.error('Une erreur est survenue.');
      }
      return errorResponse.errors.forEach((error) => {
        if (error.status === '422') {
          return this.notifications.error(error.detail);
        }
        return this.notifications.error('Une erreur est survenue.');
      });
    }
  }

  @action
  async update(event) {
    event.preventDefault();
    if (await this._checkFormValidation()) {
      await this._update();
    }
  }
}
