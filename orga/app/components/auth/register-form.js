import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import InputValidator from '../../utils/input-validator';

import isEmailValid from '../../utils/email-validator';
import isPasswordValid from '../../utils/password-validator';

const isStringValid = (value) => Boolean(value.trim());

export default class RegisterForm extends Component {

  @service session;
  @service store;
  @service intl;

  validation = {
    firstName: new InputValidator(isStringValid, this.intl.t('pages.login-or-register.register-form.fields.first-name.error')),
    lastName: new InputValidator(isStringValid, this.intl.t('pages.login-or-register.register-form.fields.last-name.error')),
    email: new InputValidator(isEmailValid, this.intl.t('pages.login-or-register.register-form.fields.email.error')),
    password: new InputValidator(isPasswordValid, this.intl.t('pages.login-or-register.register-form.fields.password.error')),
    cgu: new InputValidator(Boolean, this.intl.t('pages.login-or-register.register-form.fields.cgu.error')),
  };

  user = null;
  @tracked isLoading = false;
  @tracked isPasswordVisible = false;

  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  constructor() {
    super(...arguments);
    this.user = this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false,
    });
  }

  @action
  async register(event) {
    event.preventDefault();
    if (this._isFormInvalid()) {
      return;
    }
    this.isLoading = true;
    try {
      await this.user.save();
    } catch (e) {
      this.isLoading = false;
      return this._updateInputsStatus();
    }

    await this._acceptOrganizationInvitation(this.args.organizationInvitationId, this.args.organizationInvitationCode, this.user.email);
    await this._authenticate(this.user.email, this.user.password);

    this.user.password = null;
    this.isLoading = false;
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  @action
  validateInput(key, value) {
    this.validation[key].validate({ value, resetServerMessage: true });
  }

  _updateInputsStatus() {
    const errors = this.user.errors;
    errors.forEach(({ attribute, message }) => this._setError(attribute, message));
  }

  _isFormInvalid() {
    this._processFromValidation();
    return Object.values(this.validation).some((value) => value.hasError);
  }

  _setError(attribute, message) {
    this.validation[attribute].hasError = true;
    this.validation[attribute].serverMessage = message;
  }

  _processFromValidation() {
    Object.keys(this.validation)
      .forEach((input) => this.validation[input].validate({ value: this.user[input] }));
  }

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, createdUserEmail) {
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      email: createdUserEmail,
    }).save({ adapterOptions: { organizationInvitationId } });
  }

  _authenticate(email, password) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope);
  }

  willDestroy() {
    this.user.unloadRecord();
    super.willDestroy(...arguments);
  }
}
