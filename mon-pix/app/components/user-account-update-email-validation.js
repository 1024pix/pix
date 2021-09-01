import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const ERROR_INPUT_MESSAGE_MAP = {
  wrongEmailFormat: 'pages.user-account.account-update-email-validation.fields.errors.wrong-email-format',
  emptyPassword: 'pages.user-account.account-update-email-validation.fields.errors.empty-password',
};

export default class UserAccountUpdateEmailValidation extends Component {

  @service intl;
  @tracked newEmail = '';
  @tracked password = '';

  @tracked newEmailValidationMessage = null;
  @tracked passwordValidationMessage = null;

  @action
  validateNewEmail() {
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidationMessage = null;

    if (isInvalidInput) {
      this.newEmailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
    }
  }

  @action
  validatePassword() {
    const isInvalidInput = isEmpty(this.password);

    this.passwordValidationMessage = null;

    if (isInvalidInput) {
      this.passwordValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
    }
  }
}
