import Component from '@glimmer/component';
import Object, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

const Validations = buildValidations({
  prescriberTitle: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  prescriberDescription: {
    validators: [
      validator('length', {
        min: 0,
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked prescriberTitle;
  @tracked prescriberDescription;
}

export default class UpdateStage extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
    this.form.prescriberTitle = this.args.model.prescriberTitle;
    this.form.prescriberDescription = this.args.model.prescriberDescription;
  }

  async _checkFormValidation() {

    const { validations } = await this.form.validate();
    return validations.isValid;

  }

  async _updateStage() {
    const model = this.args.model;
    model.prescriberTitle = this.form.prescriberTitle ? this.form.prescriberTitle.trim() : null;
    model.prescriberDescription = this.form.prescriberDescription ? this.form.prescriberDescription.trim() : null;
    try {
      await model.save();
      await this.notifications.success('Les modifications ont bien été enregistrées.');
      this.args.toggleEditMode();
    } catch (error) {
      model.rollbackAttributes();
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async updateStage(event) {
    event.preventDefault();
    if (await this._checkFormValidation()) {
      await this._updateStage();
    }
  }
}
