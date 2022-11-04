import { action } from '@ember/object';
import isEmpty from 'lodash/isEmpty';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../../utils/email-validator';

export default class LoginForm extends Component {
  @service intl;
  @service url;

  @tracked errorMessage = null;
  @tracked isErrorMessagePresent = false;
  @tracked isLoading = false;
  @tracked password = null;
  @tracked email = null;
  @tracked passwordValidationMessage = null;
  @tracked emailValidationMessage = null;

  @action
  async authenticate(event) {
    event.preventDefault();
    this.isLoading = true;

    if (!this.isFormValid) {
      this.isLoading = false;
      return;
    }
    // TODO
  }

  @action
  validatePassword(event) {
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);
    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t('pages.login-or-register.login-form.fields.password.error');
    }
  }

  @action
  validateEmail(event) {
    this.email = event.target.value?.trim();
    const isInvalidInput = !isEmailValid(this.email);

    this.emailValidationMessage = null;

    if (isInvalidInput) {
      this.emailValidationMessage = this.intl.t('pages.login-or-register.login-form.fields.email.error');
    }
  }

  @action
  updateEmail(event) {
    this.email = event.target.value?.trim();
  }

  get isFormValid() {
    return isEmailValid(this.email) && !isEmpty(this.password);
  }

  get forgottenPasswordUrl() {
    return this.url.forgottenPasswordUrl;
  }
}
