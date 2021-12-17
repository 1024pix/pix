// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import Object, { action, computed } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';

import ENV from 'pix-admin/config/environment';

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
        disabled: computed.none('model.email'),
      }),
      validator('length', {
        max: 255,
        message: "La longueur de l'adresse e-mail ne doit pas excéder 255 caractères.",
        disabled: computed.none('model.email'),
      }),
      validator('format', {
        ignoreBlank: true,
        type: 'email',
        message: "L'adresee e-mail n'a pas le bon format.",
        disabled: computed.none('model.email'),
      }),
    ],
  },
  username: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: "L'identifiant ne peut pas être vide.",
        disabled: computed.none('model.username'),
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères.',
        disabled: computed.none('model.username'),
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked firstName;
  @tracked lastName;
  @tracked email;
  @tracked username;
}

export default class UserOverview extends Component {
  @tracked isEditionMode = false;

  @service notifications;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.USER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.user.id;
  }

  get canModifyEmail() {
    return !!(this.args.user.email || this.args.user.username);
  }

  _initForm() {
    this.form.firstName = this.args.user.firstName;
    this.form.lastName = this.args.user.lastName;
    this.form.email = this.args.user.email;
    this.form.username = this.args.user.username;
  }

  @action
  changeEditionMode(event) {
    event.preventDefault();
    this._initForm();
    this.isEditionMode = !this.isEditionMode;
  }

  @action
  cancelEdit() {
    this._initForm();
    this.isEditionMode = false;
  }

  @action
  async updateUserDetails(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    this.args.user.firstName = this.form.firstName.trim();
    this.args.user.lastName = this.form.lastName.trim();
    this.args.user.email = !this.form.email ? null : this.form.email.trim();
    this.args.user.username = !this.form.username ? null : this.form.username.trim();

    try {
      await this.args.user.save();
      this.notifications.success('L’utilisateur a été mis à jour avec succès.');
      this.isEditionMode = false;
    } catch (response) {
      this.args.user.rollbackAttributes();
      const messageValidationError =
        response.errors[0].detail || "une erreur est survenue, vos modifications n'ont pas été enregistrées";
      this.notifications.error(messageValidationError);
    }
  }
}
