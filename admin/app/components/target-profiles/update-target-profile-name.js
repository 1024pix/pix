import Object, { action } from '@ember/object';
import { buildValidations, validator } from 'ember-cp-validations';
import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

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
});

class Form extends Object.extend(Validations) {
  @tracked name;
}

export default class UpdateTargetProfileName extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
    this.form.name = this.args.model.name;
  }

  async _checkFormValidation() {

    const { validations } = await this.form.validate();
    return validations.isValid;

  }

  async _updateTargetProfile() {
    const model = this.args.model;
    model.name = this.form.name.trim();
    try {
      await model.save();
      await this.notifications.success('Le nom a bien été modifée.');
      this.args.toggleEditMode();
    } catch (error) {
      model.rollbackAttributes();
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async updateProfileName(event) {
    event.preventDefault();
    if (await this._checkFormValidation()) {
      await this._updateTargetProfile();
    }
  }

}
