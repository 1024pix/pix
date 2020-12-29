import Controller from '@ember/controller';
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

export default class TargetProfileController extends Controller {
  @service notifications;

  @tracked isEditMode = false;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
  }

  get isPublic() {
    return this.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.model.outdated ? 'Oui' : 'Non';
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this._initForm();
  }

  @action
  async updateProfileName(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    this.model.name = this.form.name.trim();
    this.isEditMode = false;

    return this.model.save()
      .then(() => {
        this.notifications.success('Le nom a bien été modifée.');
      })
      .catch(() => {
        this.model.rollbackAttributes();
        this.notifications.error('Une erreur est survenue.');
      });
  }

  @action
  cancel() {
    this.isEditMode = false;
    this._initForm();
  }

  _initForm() {
    this.form.name = this.model.name;
  }
}
