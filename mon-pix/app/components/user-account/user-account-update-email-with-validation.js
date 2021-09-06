import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../../utils/email-validator';
import isEmpty from 'lodash/isEmpty';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
};

const ERROR_INPUT_MESSAGE_MAP = {
  invalidEmail: 'pages.user-account.account-update-email-with-validation.fields.errors.invalid-email',
  emptyPassword: 'pages.user-account.account-update-email-with-validation.fields.errors.empty-password',
};

class PasswordValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class UserAccountUpdateEmailWithValidation extends Component {

  @service intl;
  @tracked newEmail = '';
  @tracked password = '';
  @tracked newEmailValidationMessage = null;

  @tracked passwordValidation = new PasswordValidation();

  @action
  validateNewEmail(event) {
    this.newEmail = event.target.value;
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidationMessage = null;

    if (isInvalidInput) {
      this.newEmailValidationMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['invalidEmail']);
    }
  }

  @action
  validatePassword() {
    const isInvalidInput = isEmpty(this.password);

    this.passwordValidation.status = STATUS_MAP['defaultStatus'];
    this.passwordValidation.message = null;

    if (isInvalidInput) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
    }
  }
}
