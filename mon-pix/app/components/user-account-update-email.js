import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../utils/email-validator';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

const STATUS_MAP = {
  defaultStatus: 'default',
  errorStatus: 'error',
  successStatus: 'success',
};

const ERROR_INPUT_MESSAGE_MAP = {
  wrongEmailFormat: 'pages.user-account.account-update-email.fields.errors.wrong-email-format',
  mismatchingEmail: 'pages.user-account.account-update-email.fields.errors.mismatching-email',
  emptyPassword: 'pages.user-account.account-update-email.fields.errors.empty-password',
  invalidPassword: 'pages.user-account.account-update-email.fields.errors.invalid-password',
  unknownError: 'pages.user-account.account-update-email.fields.errors.unknown-error',
};

class NewEmailValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

class NewEmailConfirmationValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

class PasswordValidation {
  @tracked status = STATUS_MAP['defaultStatus'];
  @tracked message = null;
}

export default class UserAccountUpdateEmail extends Component {

  @service intl;
  @tracked newEmail = '';
  @tracked newEmailConfirmation = '';
  @tracked password = '';
  @tracked errorMessage = null;

  @tracked newEmailValidation = new NewEmailValidation();
  @tracked newEmailConfirmationValidation = new NewEmailConfirmationValidation();
  @tracked passwordValidation = new PasswordValidation();

  get isFormValid() {
    return this.newEmail === this.newEmailConfirmation && isEmailValid(this.newEmail) && !isEmpty(this.password);
  }

  @action
  validateNewEmail() {
    const isInvalidInput = !isEmailValid(this.newEmail);

    this.newEmailValidation.status = STATUS_MAP['successStatus'];
    this.newEmailValidation.message = null;

    if (isInvalidInput) {
      this.newEmailValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
    }
  }

  @action
  validateNewEmailConfirmation() {
    const isInvalidInput = !isEmailValid(this.newEmailConfirmation);

    this.newEmailConfirmationValidation.status = STATUS_MAP['successStatus'];
    this.newEmailConfirmationValidation.message = null;

    if (isInvalidInput) {
      this.newEmailConfirmationValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailConfirmationValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
    } else if (this.newEmail !== this.newEmailConfirmation) {
      this.newEmailConfirmationValidation.status = STATUS_MAP['errorStatus'];
      this.newEmailConfirmationValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['mismatchingEmail']);
    }
  }

  @action
  validatePassword() {
    const isInvalidInput = isEmpty(this.password);

    this.passwordValidation.status = STATUS_MAP['successStatus'];
    this.passwordValidation.message = null;

    if (isInvalidInput) {
      this.passwordValidation.status = STATUS_MAP['errorStatus'];
      this.passwordValidation.message = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
    }
  }

  @action
  async onSubmit(event) {
    event && event.preventDefault();
    this.errorMessage = null;
    if (this.isFormValid) {
      try {
        await this.args.saveNewEmail(this.newEmail, this.password);
      } catch (response) {
        const status = get(response, 'errors[0].status');

        if (status === '422') {
          const pointer = get(response, 'errors[0].source.pointer');
          if (pointer.endsWith('email')) {
            this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['wrongEmailFormat']);
          }
          if (pointer.endsWith('password')) {
            this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['emptyPassword']);
          }
        } else if (status === '400' || status === '403') {
          this.errorMessage = get(response, 'errors[0].detail');
        } else {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']);
        }
      }
    }
  }
}
