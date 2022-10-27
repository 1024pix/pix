import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isEmpty from 'lodash/isEmpty';
import isEmailValid from '../../utils/email-validator';
import isPasswordValid from '../../utils/password-validator';

export default class RegisterForm extends Component {
  @service intl;
  @service url;

  @tracked isLoading = false;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;
  @tracked password = null;
  @tracked passwordValidationMessage = null;
  @tracked emailValidationMessage = null;
  @tracked firstNameValidationMessage = null;
  @tracked lastNameValidationMessage = null;
  @tracked cguValidationMessage = null;
  @tracked errorMessage = null;

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  @action
  async register(event) {
    event.preventDefault();
    if (!this._isFormValid()) {
      return;
    }
    this.isLoading = true;
  }

  @action
  validatePassword(event) {
    this.passwordValidationMessage = null;
    this.password = event.target.value;
    const isInvalidInput = !isPasswordValid(this.password);

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.password.error');
    }
  }

  @action
  validateEmail(event) {
    this.emailValidationMessage = null;
    this.email = event.target.value?.trim().toLowerCase();
    const isInvalidInput = !isEmailValid(this.email);

    if (isInvalidInput) {
      this.emailValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.email.error');
    }
  }

  @action
  validateFirstName(event) {
    this.firstNameValidationMessage = null;
    this.firstName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.firstName);

    if (isInvalidInput) {
      this.firstNameValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.first-name.error');
    }
  }

  @action
  validateLastName(event) {
    this.lastNameValidationMessage = null;
    this.lastName = event.target.value?.trim();
    const isInvalidInput = isEmpty(this.lastName);

    if (isInvalidInput) {
      this.lastNameValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.last-name.error');
    }
  }

  @action
  validateCgu() {
    this.cguValidationMessage = null;
    const isInputChecked = Boolean(this.cgu);

    if (!isInputChecked) {
      this.cguValidationMessage = this.intl.t('pages.login-or-register.register-form.fields.cgu.error');
    }
  }

  _isFormValid() {
    return (
      !isEmpty(this.lastName) &&
      !isEmpty(this.firstName) &&
      isEmailValid(this.email) &&
      isPasswordValid(this.password) &&
      Boolean(this.cgu)
    );
  }
}
