import Object, { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { none } from '@ember/object/computed';
import { validator, buildValidations } from 'ember-cp-validations';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { inject as service } from '@ember/service';
import dayjs from 'dayjs';

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

class Form extends Object.extend(Validations) {
  @tracked firstName;
  @tracked lastName;
  @tracked email;
  @tracked username;
  @tracked lang;
}

export default class UserOverview extends Component {
  languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'Anglais' },
  ];

  @tracked isEditionMode = false;
  @tracked displayAnonymizeModal = false;

  @service notifications;
  @service accessControl;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.USER_DASHBOARD_URL;
    return urlDashboardPrefix && urlDashboardPrefix + this.args.user.id;
  }

  get anonymisationMessage() {
    return this.args.user.anonymisedByFullName
      ? `Utilisateur anonymisé par ${this.args.user.anonymisedByFullName}.`
      : 'Utilisateur anonymisé.';
  }

  get canModifyEmail() {
    return !!(this.args.user.email || this.args.user.username);
  }

  get shouldDisplayTemporaryBlockedDate() {
    const userIsTemporaryBlockedUntilDate = this.args.user?.userLogin?.get('temporaryBlockedUntil');
    if (userIsTemporaryBlockedUntilDate) {
      return dayjs().isBefore(dayjs(userIsTemporaryBlockedUntilDate));
    }
    return false;
  }

  get userHasValidatePixAppTermsOfService() {
    return this._formatValidatedTermsOfServiceText(this.args.user.lastTermsOfServiceValidatedAt, this.args.user.cgu);
  }

  get userHasValidatePixOrgaTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.user.lastPixOrgaTermsOfServiceValidatedAt,
      this.args.user.pixOrgaTermsOfServiceAccepted
    );
  }

  get userHasValidatePixCertifTermsOfService() {
    return this._formatValidatedTermsOfServiceText(
      this.args.user.lastPixCertifTermsOfServiceValidatedAt,
      this.args.user.pixCertifTermsOfServiceAccepted
    );
  }

  get languageOptions() {
    return this.languages;
  }

  _formatValidatedTermsOfServiceText(date, hasValidatedTermsOfService) {
    const formattedDateText = date ? `, le ${dayjs(date).format('DD/MM/YYYY')}` : '';
    return hasValidatedTermsOfService ? `OUI${formattedDateText}` : 'NON';
  }

  _initForm() {
    this.form.firstName = this.args.user.firstName;
    this.form.lastName = this.args.user.lastName;
    this.form.email = this.args.user.email;
    this.form.username = this.args.user.username;
    this.form.lang = this.args.user.lang;
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
    this.args.user.lang = this.form.lang;

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

  @action
  toggleDisplayAnonymizeModal() {
    this.displayAnonymizeModal = !this.displayAnonymizeModal;
  }

  @action
  async anonymizeUser() {
    await this.args.user.save({ adapterOptions: { anonymizeUser: true } });
    this.args.user.organizationMemberships = [];
    this.args.user.certificationCenterMemberships = [];
    this.args.user.organizationLearners = [];

    this.toggleDisplayAnonymizeModal();
  }

  @action
  async unblockUserAccount() {
    const userLogin = await this.args.user.userLogin;
    await userLogin.save({ adapterOptions: { unblockUserAccount: true, userId: this.args.user.id } });
  }

  @action
  onChangeLanguage(language) {
    this.form.lang = language;
  }
}
