import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class Update extends Component {
  @service notifications;
  @service store;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('campaign-form');
    this.form.name = this.args.campaign.name;
    this.form.title = this.args.campaign.title;
    this.form.customLandingPageText = this.args.campaign.customLandingPageText;
    this.form.customResultPageText = this.args.campaign.customResultPageText;
    this.form.customResultPageButtonText = this.args.campaign.customResultPageButtonText;
    this.form.customResultPageButtonUrl = this.args.campaign.customResultPageButtonUrl;
    this.form.multipleSendings = this.args.campaign.multipleSendings;
  }

  @action
  updateFormValue(key, event) {
    this.form[key] = event.target.value;
  }

  get nameError() {
    if (this.form.get('validations.attrs.name').isInvalid) {
      return { message: this.form.get('validations.attrs.name').message, state: 'error' };
    }
    return null;
  }

  get titleError() {
    if (this.form.get('validations.attrs.title').isInvalid) {
      return { message: this.form.get('validations.attrs.title').message, state: 'error' };
    }
    return null;
  }

  get customLandingPageTextError() {
    if (this.form.get('validations.attrs.customLandingPageText').isInvalid) {
      return { message: this.form.get('validations.attrs.customLandingPageText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageTextError() {
    if (this.form.get('validations.attrs.customResultPageText').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageButtonTextError() {
    if (this.form.get('validations.attrs.customResultPageButtonText').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageButtonText').message, state: 'error' };
    }
    return null;
  }

  get customResultPageButtonUrlError() {
    if (this.form.get('validations.attrs.customResultPageButtonUrl').isInvalid) {
      return { message: this.form.get('validations.attrs.customResultPageButtonUrl').message, state: 'error' };
    }
    return null;
  }

  async _checkFormValidation() {
    const { validations } = await this.form.validate();
    return validations.isValid;
  }

  async _update() {
    const campaign = this.args.campaign;
    campaign.name = this.form.name;
    campaign.title = this.form.title;
    campaign.customLandingPageText = this.form.customLandingPageText;
    campaign.customResultPageText = this.form.customResultPageText;
    campaign.customResultPageButtonText = this.form.customResultPageButtonText;
    campaign.customResultPageButtonUrl = this.form.customResultPageButtonUrl;
    campaign.multipleSendings = this.form.multipleSendings;

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
