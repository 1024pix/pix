import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const ERROR_INPUT_MESSAGE_MAP = {
  wrongEmailFormat: 'pages.user-account.account-update-email-validation.fields.errors.wrong-email-format',
  emptyPassword: 'pages.user-account.account-update-email-validation.fields.errors.empty-password',
};

export default class UserAccountUpdateEmailWithValidation extends Component {

  @service intl;
  @tracked newEmail = '';
  @tracked password = '';
  @tracked isPasswordVisible = false;
  @tracked newEmailValidationMessage = null;
  @tracked passwordValidationMessage = null;

  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  @action
  validateNewEmail(event) {
    this.newEmail = event.target.value;
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidationMessage = null;

    if (isInvalidInput) {
      this.newEmailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
    }
  }

  @action
  validatePassword(event) {
    this.password = event.target.value;
    const isInvalidInput = isEmpty(this.password);

    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
    }
  }
}
